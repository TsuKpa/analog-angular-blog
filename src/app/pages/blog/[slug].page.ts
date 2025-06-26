import { HighlightService } from './../../services/highlight.service';
import { UtterancesDirective } from './utterances.directive';
import { Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { injectContent, MarkdownComponent } from '@analogjs/content';
import PostAttributes from './data/post-attributes';
import { Meta, Title } from '@angular/platform-browser';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';

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

        <img class="post__image" [src]="post.attributes.coverImage" />
        <analog-markdown [content]="post.content" />
        <div [appUtterances]="isProd"></div>
      </article>
    </div>
    }
  `,
  styleUrl: './index.page.scss',
})
export default class BlogPostComponent {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  isProd = false;

  ngOnInit() {
    this.isProd = environment.production;
  }

  ngAfterViewChecked() {
    this.highlightService.highlightAll();
  }

  constructor(private highlightService: HighlightService) {}

  // No custom tag color methods needed

  readonly post$ = injectContent<PostAttributes>('slug').pipe(
    tap(({ attributes: { title, description, coverImage } }) => {
      this.title.setTitle(title);
      this.meta.updateTag({ name: 'description', content: description });
      this.meta.updateTag({ name: 'og:description', content: description });
      this.meta.updateTag({ name: 'og:image', content: coverImage! });
      this.meta.updateTag({ name: 'og:title', content: title });
    })
  );
}
