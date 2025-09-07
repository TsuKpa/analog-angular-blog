import { HighlightService } from './../../services/highlight.service';
import { UtterancesDirective } from './utterances.directive';
import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  AfterViewChecked,
  Injector,
} from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import {
  injectContent,
  injectContentFiles,
  MarkdownComponent,
} from '@analogjs/content';
import { runInInjectionContext } from '@angular/core';
import PostAttributes from './data/post-attributes';
import { tap, Subscription, map, switchMap, of, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { isProduction } from '../../../environments/vite-env';
import { MetaTagService, BlogPostMetaConfig } from '../../services/meta.service';
import { ImageModalComponent } from '../../components/image-modal/image-modal.component';
import { ImageClickEvent } from '../../directives/clickable-image.directive';
import { MarkdownImageDirective } from '../../directives/markdown-image.directive';
import { getCdnImageUrl } from '../../utils/cdn-helper';

@Component({
  selector: 'app-blog-post',
  imports: [
    AsyncPipe,
    DatePipe,
    RouterLink,
    MarkdownComponent,
    UtterancesDirective,
    ImageModalComponent,
    MarkdownImageDirective,
  ],
  template: `
    @if (post$ | async; as post) {
    <div class="py-8">
      <article>
        <!-- Tags and date header -->
        <div class="flex justify-between items-center mb-6">
          <div class="flex flex-wrap gap-2">
            @for (tag of post.attributes.tags; track tag) {
            <a
              [routerLink]="['/blog/tag', tag]"
              class="text-xs bg-gray-200 text-gray-800 hover:bg-gray-300 px-2 py-1 rounded transition-colors"
              >#{{ tag }}</a
            >
            }
          </div>
          <div class="text-sm text-gray-600">
            {{ post.attributes.createdDate | date : 'mediumDate' }}
          </div>
        </div>

        <div class="blog-content" appMarkdownImage>
          <analog-markdown [content]="post.content" />
        </div>
        <div [appUtterances]="isProd"></div>
      </article>
    </div>

    <!-- Global image modal for all images in blog content -->
    <app-image-modal
      [isOpen]="modalIsOpen"
      [imageUrl]="modalImageSrc"
      [imageAlt]="modalImageAlt"
      [isErrorImage]="modalIsErrorImage"
      (closed)="closeModal()"
    ></app-image-modal>
    }
  `,
  styleUrl: './index.page.scss',
})
export default class BlogPostComponent
  implements OnInit, AfterViewChecked, OnDestroy
{
  private readonly metaTagService = inject(MetaTagService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly injector = inject(Injector);
  isProd = false;

  // Will store all available blog posts from content files
  private allPosts: Array<{ slug: string; attributes: PostAttributes }> = [];

  // Image modal variables
  modalIsOpen = false;
  modalImageSrc = '';
  modalImageAlt = '';
  modalIsErrorImage = false;
  private imageClickSubscription?: Subscription;
  private postSubscription?: Subscription;

  getCoverImage(post: any): string {
    return post?.attributes?.coverImage || '';
  }

  ngOnInit() {
    // Use both the environment.production flag and our helper function
    this.isProd = environment.production || isProduction();

    // Get all available content files using runInInjectionContext to ensure proper injection context
    runInInjectionContext(this.injector, () => {
      this.allPosts = injectContentFiles<PostAttributes>();
    });

    // Initialize the post$ observable after allPosts is loaded
    this.initPostObservable();

    // Import the static subject directly from the directive
    import('../../directives/clickable-image.directive').then((module) => {
      // Subscribe to image click events from the clickable image directive
      this.imageClickSubscription =
        module.ClickableImageDirective.imageClicked.subscribe(
          (event: ImageClickEvent) => {
            this.modalImageSrc = event.src;
            this.modalImageAlt = event.alt;
            this.modalIsErrorImage = event.isError;
            this.modalIsOpen = true;
          }
        );
    });
  }

  ngAfterViewChecked() {
    this.highlightService.highlightAll();
  }

  ngOnDestroy() {
    if (this.imageClickSubscription) {
      this.imageClickSubscription.unsubscribe();
    }
    if (this.postSubscription) {
      this.postSubscription.unsubscribe();
    }
  }

  closeModal() {
    this.modalIsOpen = false;
  }

  constructor(private highlightService: HighlightService) {}

  // No custom tag color methods needed

  // Define the post$ observable - will be properly initialized in ngOnInit
  post$ = of(null as any);

  // Set up the post$ observable in ngOnInit after we have the allPosts data
  private initPostObservable() {
    this.post$ = this.route.paramMap.pipe(
      map((params) => params.get('slug')),
      switchMap((currentSlug) => {
        if (!currentSlug) {
          console.warn('No slug parameter in URL, redirecting to 404');
          this.router.navigate(['/404']);
          return of(null);
        }

        // We now have allPosts loaded, so check if the requested slug exists
        const postExists = this.allPosts.some(
          (post) => post.slug === currentSlug
        );

        if (!postExists) {
          console.warn(
            `Post with slug "${currentSlug}" not found, redirecting to 404`
          );
          this.router.navigate(['/404']);
          return of(null);
        }

        // Use runInInjectionContext to ensure proper injection context for injectContent
        return runInInjectionContext(this.injector, () => {
          // With Analog.js content routing, injectContent() will use the current route params
          // so we don't need to explicitly provide the slug
          return injectContent<PostAttributes>();
        }).pipe(
          tap((post) => {
            if (!post) {
              console.error(
                'Post was found in content files but could not be loaded'
              );
              this.router.navigate(['/404']);
              return;
            }

            const {
              attributes: { 
                title, 
                description, 
                coverImage,
                photo,  // Add photo field as another possible image source
                createdDate, 
                lastmod, 
                authors, 
                tags, 
                canonical_url 
              },
            } = post;

            // Determine canonical URL
            // If post has canonical_url field, use that (for posts syndicated from other sources)
            // Otherwise use the current URL as canonical
            const postUrl = `${this.metaTagService.siteUrl}/blog/${currentSlug}`;
            const canonicalUrl = canonical_url || postUrl;
            
            // Try to find an image for the blog post, with fallbacks
            const postImage = coverImage || photo;
            
            // Default logo for publisher
            const publisherLogo = getCdnImageUrl('background.png');

            // Create blog post meta config with structured data information
            const blogPostMeta: BlogPostMetaConfig = {
              title: title,
              description: description,
              image: postImage, // This could be undefined, but our service now handles that
              type: 'article',
              url: postUrl,
              canonical: canonicalUrl, // Set canonical URL
              // Use createdDate as the published date, falling back to current date if not available
              datePublished: createdDate || new Date().toISOString(),
              // Use lastmod as the modified date if available, otherwise use createdDate
              dateModified: lastmod || createdDate || new Date().toISOString(),
              // Author information
              author: {
                name: authors && authors.length > 0 ? authors[0] : 'Tsukpa Blog',
                url: this.metaTagService.siteUrl
              },
              // Publisher information
              publisher: {
                name: 'Tsukpa Blog',
                logo: publisherLogo
              }
            };

            // Update meta tags with structured data
            this.metaTagService.updateBlogPostMeta(blogPostMeta);

            // Add author structured data
            if (authors && authors.length > 0) {
              this.metaTagService.addAuthorStructuredData(
                authors[0],
                `${this.metaTagService.siteUrl}/about`,
                undefined,
                `Author of ${title}`,
                [
                  'https://fb.com/tsukpa',
                  'https://github.com/TsuKpa',
                  'https://linkedin.com/in/nqnamfe1996',
                ]
              );
            }
          }),
          catchError((error) => {
            console.error('Error loading blog post:', error);
            this.router.navigate(['/404']);
            return of(null);
          })
        );
      })
    );
  }
}
