import { Component, OnInit, signal, computed, inject, DOCUMENT } from '@angular/core';
import { RouterLink } from '@angular/router';
import { injectContentFiles } from '@analogjs/content';

import PostAttributes from './data/post-attributes';
import { BlogPostCardComponent } from '../../components/blog-post-card/blog-post-card.component';
import { MetaTagService } from '../../services/meta.service';
import { getCdnImageUrl } from '../../utils/cdn-helper';

@Component({
  selector: 'app-blog',
  imports: [RouterLink, BlogPostCardComponent],
  template: `
    <div class="py-8">
      <div class="text-center mb-12">
        <span
          class="inline-block bg-black text-white px-4 py-2 rounded-full text-sm font-semibold mb-4"
          >Blog</span
        >
        <h1 class="text-5xl font-bold text-gray-900 mb-4">All Blog Posts</h1>
        <p class="text-lg text-gray-600 max-w-xl mx-auto">
          Explore all my blog posts about web development, AWS, and various
          technical topics.
        </p>
      </div>

      <!-- Filter Controls -->
      <div class="flex justify-start items-center mb-8">
        <div class="flex items-center flex-col gap-4">
          @if(availableTags().length > 0) {
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-700">Tags:</span>
            <div class="flex flex-wrap gap-2">
              @for(tag of availableTags(); track tag) {
              <button
                (click)="filterByTag(tag)"
                class="inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {{ tag }}
              </button>
              }
            </div>
          </div>
          } @if(activeTag()) {
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">Filtered by:</span>
            <span
              class="inline-flex items-center rounded-md bg-black text-white px-3 py-1 text-sm font-medium"
            >
              {{ activeTag() }}
              <button
                (click)="clearTagFilter()"
                class="ml-2 text-white hover:text-gray-300 transition-colors"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>
          </div>
          }
        </div>
      </div>

      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
      >
        @for (post of sortedPosts(); track post.attributes.title) {
        <app-blog-post-card [post]="post" />
        }
      </div>

      <div class="text-center mt-12 pt-8 border-t border-gray-200">
        <p class="text-gray-600 mb-4">
          Found {{ sortedPosts().length }} blog posts
        </p>
        <a
          [routerLink]="['/']"
          class="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <svg
            class="mr-2 -ml-1 w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Home
        </a>
      </div>
    </div>
  `,
  styles: [],
})
export default class BlogComponent implements OnInit {
  private readonly metaTagService = inject(MetaTagService);
  private readonly document = inject(DOCUMENT);

  ngOnInit() {
    const blogUrl = `${this.metaTagService.siteUrl}/blog`;

    this.metaTagService.updateMetaTags({
      title: 'Blog - Articles on Web Development, AWS, and Technical Tutorials',
      description:
        'Explore articles on web development, AWS cloud services, and various technical topics.',
      url: blogUrl,
      canonical: blogUrl, // Set canonical URL
      type: 'website',
    });

    // Add Blog Collection structured data (CollectionPage)
    this.renderCollectionSchema();

    // Add author structured data
    this.metaTagService.addAuthorStructuredData(
      'NQNam',
      `${this.metaTagService.siteUrl}/about`,
      getCdnImageUrl('avatar-blog.jpg'),
      'Software Engineer, AWS Certified, Technical Writer',
      [
        'https://fb.com/tsukpa',
        'https://github.com/TsuKpa',
        'https://linkedin.com/in/nqnamfe1996',
      ]
    );
  }
  readonly posts = injectContentFiles<PostAttributes>().filter(
    (post) => post.attributes.publish
  );
  activeTag = signal<string | null>(null);

  readonly availableTags = computed(() => {
    const allTags = this.posts.flatMap((post) => post.attributes.tags || []);
    return [...new Set(allTags)].sort();
  });

  readonly filteredPosts = computed(() => {
    if (!this.activeTag()) {
      return this.posts;
    }
    return this.posts.filter((post) =>
      post.attributes.tags?.includes(this.activeTag()!)
    );
  });

  readonly sortedPosts = computed(() => {
    return this.sortPosts(this.filteredPosts(), 'newest');
  });

  renderCollectionSchema() {
    const id = 'blog-collection-schema';
    if (!this.document.getElementById(id)) {
      const script = this.document.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      script.text = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Blog - Articles on Web Development, AWS, and Technical Tutorials',
        description:
          'Explore articles on web development, AWS cloud services, and various technical topics.',
        url: `${this.metaTagService.siteUrl}/blog`,
        publisher: {
          '@type': 'Person',
          name: 'NQNam',
          url: `${this.metaTagService.siteUrl}/about`,
        },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: this.posts.map((post, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${this.metaTagService.siteUrl}/blog/${post.slug}`,
            name: post.attributes.title,
            description: post.attributes.description,
          })),
        },
      });
      this.document.head.appendChild(script);
    }
  }

  filterByTag(tag: string) {
    this.activeTag.set(tag);
  }

  clearTagFilter() {
    this.activeTag.set(null);
  }

  private sortPosts(posts: any[], option: string) {
    return [...posts].sort((a, b) => {
      const dateA = new Date(
        a.attributes.createdDate || a.attributes.date || 0
      );
      const dateB = new Date(
        b.attributes.createdDate || b.attributes.date || 0
      );
      return dateB.getTime() - dateA.getTime(); // Always sort by newest first
    });
  }
}
