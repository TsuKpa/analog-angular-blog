import { HighlightService } from './../../services/highlight.service';
import { UtterancesDirective } from './utterances.directive';
import { Component, OnInit, OnDestroy, inject, AfterViewChecked } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { injectContent, MarkdownComponent } from '@analogjs/content';
import PostAttributes from './data/post-attributes';
import { tap, Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { isProduction } from '../../../environments/vite-env';
import { MetaTagService } from '../../services/meta.service';
import { ImageModalComponent } from '../../components/image-modal/image-modal.component';
import { ImageClickEvent } from '../../directives/clickable-image.directive';
import { MarkdownImageDirective } from '../../directives/markdown-image.directive';

@Component({
  selector: 'app-blog-post',
  imports: [AsyncPipe, DatePipe, RouterLink, MarkdownComponent, UtterancesDirective, ImageModalComponent, MarkdownImageDirective],
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
export default class BlogPostComponent implements OnInit, AfterViewChecked, OnDestroy {
  private readonly metaTagService = inject(MetaTagService);
  isProd = false;

  // Image modal variables
  modalIsOpen = false;
  modalImageSrc = '';
  modalImageAlt = '';
  modalIsErrorImage = false;
  private imageClickSubscription?: Subscription;

  getCoverImage(post: any): string {
    return post?.attributes?.coverImage || '';
  }

  ngOnInit() {
    // Use both the environment.production flag and our helper function
    this.isProd = environment.production || isProduction();
    // Only log in development mode
    if (!this.isProd) {
      console.log('Environment:', environment);
      console.log('Is Production (vite):', isProduction());
    }

    // Import the static subject directly from the directive
    import('../../directives/clickable-image.directive').then(module => {
      // Subscribe to image click events from the clickable image directive
      this.imageClickSubscription = module.ClickableImageDirective.imageClicked.subscribe(
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
  }

  closeModal() {
    this.modalIsOpen = false;
  }

  constructor(private highlightService: HighlightService) {}

  // No custom tag color methods needed

  readonly post$ = injectContent<PostAttributes>('slug').pipe(
    tap(({ attributes: { title, description, coverImage, slug } }) => {
      this.metaTagService.updateMetaTags({
        title: title,
        description: description,
        image: coverImage || undefined,
        type: 'article',
        url: `${this.metaTagService.siteUrl}/blog/${slug}`
      });
    })
  );
}
