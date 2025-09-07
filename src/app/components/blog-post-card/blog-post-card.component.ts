import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UrlService } from '../../services/url.service';

export interface BlogPost {
  slug: string;
  attributes: {
    title: string;
    description: string;
    createdDate?: string;
    date?: string;
    photo?: string;
    coverImage?: string;
    tags?: string[];
  };
}

@Component({
  selector: 'app-blog-post-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a [routerLink]="['/blog', post.slug]" class="rounded-lg bg-white text-gray-900 flex flex-col overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 ease-out h-full">
      <div class="relative h-48 w-full overflow-hidden">
        <img
          [src]="getImageUrl(post.attributes.photo || post.attributes.coverImage)"
          [alt]="post.attributes.title"
          class="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
          (error)="handleImageError($event)"
        >
      </div>
      <div class="flex flex-col px-3 pt-3 pb-0 flex-grow">
        <div>
          <h3
            class="font-semibold tracking-tight text-lg line-clamp-2 mb-1"
            [title]="cleanText(post.attributes.title)"
          >{{ post.attributes.title }}</h3>
          <time class="font-sans text-sm text-gray-500 mb-1 block">{{ post.attributes.createdDate || post.attributes.date }}</time>
          <div class="prose max-w-full text-pretty font-sans text-sm text-gray-600">
            <p
              class="line-clamp-3"
              [title]="cleanText(post.attributes.description)"
            >{{ post.attributes.description }}</p>
          </div>
        </div>
      </div>

      <div class="text-pretty font-sans text-sm text-gray-500 mt-auto flex flex-col p-3 pt-0">
        @if(post.attributes.tags?.length) {
          <div class="mt-4 flex flex-wrap gap-2">
            @for(tag of post.attributes.tags; track tag) {
              <span class="inline-flex items-center rounded-md font-semibold bg-gray-100 text-gray-800 px-2 py-1 text-xs">{{ tag }}</span>
            }
          </div>
        }
      </div>
    </a>
  `,
  styles: [],
})
export class BlogPostCardComponent {
  @Input({ required: true }) post!: BlogPost;

  private urlService = inject(UrlService);

  cleanText(text: string): string {
    return text?.replace(/\s+/g, ' ').trim() || '';
  }

  getImageUrl(path?: string): string {
    return this.urlService.getImageUrl(path);
  }

  // Method to handle image loading errors
  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = this.urlService.getImageUrl();
  }
}
