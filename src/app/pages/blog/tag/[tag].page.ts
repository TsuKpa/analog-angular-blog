import { Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { injectContentFiles } from '@analogjs/content';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

import PostAttributes from '../data/post-attributes';
import { BlogPostCardComponent } from '../../../components/blog-post-card/blog-post-card.component';
import { MetaTagService } from '../../../services/meta.service';

@Component({
  selector: 'app-blog-tag',
  imports: [RouterLink, BlogPostCardComponent],
  template: `
    <div class="py-8">
      <div class="text-center mb-12">
        <span class="inline-block bg-black text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">Blog</span>
        <h1 class="text-5xl font-bold text-gray-900 mb-4">Posts Tagged "{{ tagName() }}"</h1>
        <p class="text-lg text-gray-600 max-w-xl mx-auto">Showing all posts with the tag #{{ tagName() }}</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        @for (post of filteredPosts(); track post.attributes.title) {
          <app-blog-post-card [post]="post" />
        }
        @if (filteredPosts().length === 0) {
          <div class="col-span-full text-center py-12">
            <p class="text-gray-500 text-xl">No posts found with this tag.</p>
          </div>
        }
      </div>

      <div class="text-center mt-12 pt-8 border-t border-gray-200">
        <p class="text-gray-600 mb-4">Found {{ filteredPosts().length }} blog posts with tag #{{ tagName() }}</p>
        <a [routerLink]="['/blog']" class="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
          <svg class="mr-2 -ml-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Back to All Posts
        </a>
      </div>
    </div>
  `,
  styles: [],
})
export default class BlogTagComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private metaTagService = inject(MetaTagService);
  readonly posts = injectContentFiles<PostAttributes>().filter(post => post.attributes.publish);

  ngOnInit() {
    // Create an effect that updates meta tags when tag changes
    effect(() => {
      const currentTag = this.tagName();
      if (currentTag) {
        this.metaTagService.updateMetaTags({
          title: `Posts Tagged "${currentTag}" - Tsukpa's Blog`,
          description: `Browse all blog posts tagged with #${currentTag} on Tsukpa's Blog.`,
          url: `https://v2.tsukpa.blog/blog/tag/${currentTag}`,
          type: 'website'
        });
      }
    });
  }

  readonly tagName = toSignal(
    this.route.params.pipe(
      map(params => params['tag'])
    )
  );

  readonly filteredPosts = computed(() => {
    const currentTag = this.tagName();
    if (!currentTag) {
      return this.posts;
    }

    const filtered = this.posts.filter(post =>
      post.attributes.tags?.includes(currentTag)
    );

    return this.sortPosts(filtered);
  });

  private sortPosts(posts: any[]) {
    return [...posts].sort((a, b) => {
      const dateA = new Date(a.attributes.createdDate || a.attributes.date || 0);
      const dateB = new Date(b.attributes.createdDate || b.attributes.date || 0);
      return dateB.getTime() - dateA.getTime(); // Sort by newest first
    });
  }
}
