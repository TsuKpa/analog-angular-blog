import { HighlightService } from './../../services/highlight.service';
import { UtterancesDirective } from './utterances.directive';
import { Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { injectContent, MarkdownComponent } from '@analogjs/content';
import PostAttributes from './data/post-attributes';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { isProduction } from '../../../environments/vite-env';
import { MetaTagService } from '../../services/meta.service';

@Component({
  selector: 'app-blog-post',
  imports: [AsyncPipe, DatePipe, RouterLink, MarkdownComponent, UtterancesDirective],
  template: `
    @if (post$ | async; as post) {
    <div class="py-8">
      <article>
        <!-- Tags and date header -->
        <div class="flex justify-between items-center mb-4">
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

        <analog-markdown [content]="post.content" />
        <div [appUtterances]="isProd"></div>
      </article>
    </div>
    }
  `,
  styleUrl: './index.page.scss',
})
export default class BlogPostComponent {
  private readonly metaTagService = inject(MetaTagService);
  isProd = false;

  ngOnInit() {
    // Use both the environment.production flag and our helper function
    this.isProd = environment.production || isProduction();
    // Only log in development mode
    if (!this.isProd) {
      console.log('Environment:', environment);
      console.log('Is Production (vite):', isProduction());
    }
  }

  ngAfterViewChecked() {
    this.highlightService.highlightAll();
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
        url: `https://v2.tsukpa.blog/blog/${slug}`
      });
    })
  );
}
