import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { injectContent, MarkdownComponent } from '@analogjs/content';
import PostAttributes from './data/post-attributes';

@Component({
  selector: 'app-blog-post',
  imports: [AsyncPipe, MarkdownComponent],
  template: `
    @if (post$ | async; as post) {
    <div class="py-8">
      <article>
        <img class="post__image" [src]="post.attributes.coverImage" />
        <analog-markdown [content]="post.content" />
      </article>
    </div>
    }
  `,
  styles: `
    .post__image {
      max-height: 40vh;
    }
  `,
})
export default class BlogPostComponent {
  readonly post$ = injectContent<PostAttributes>('slug');
}
