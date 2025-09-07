import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageModalComponent } from '../image-modal/image-modal.component';
import { UrlService } from '../../services/url.service';

@Component({
  selector: 'app-blog-image',
  standalone: true,
  imports: [CommonModule, ImageModalComponent],
  template: `
    <div class="blog-image-container mb-8 mt-4">
      <div
        class="relative overflow-hidden rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-300"
        (click)="openModal()"
      >
        <div class="aspect-w-16 aspect-h-9 md:aspect-h-7 image-container">
          <img
            [src]="src"
            [alt]="alt"
            class="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            (error)="onImageError($event)"
            loading="lazy"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end">
            <div class="p-4 w-full text-center">
              <span class="text-white text-sm bg-black/50 px-3 py-1 rounded-full">Click to enlarge</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <app-image-modal
      [isOpen]="isModalOpen"
      [imageUrl]="src"
      [imageAlt]="alt"
      (closed)="isModalOpen = false"
    ></app-image-modal>
  `,
  styles: [`
    .blog-image-container {
      max-width: 700px;
      margin-left: auto;
      margin-right: auto;
    }

    /* Aspect ratio fallback for browsers that don't support it */
    .aspect-w-16 {
      position: relative;
      padding-bottom: 56.25%; /* 16:9 ratio */
      max-height: 500px; /* Maximum height for all blog images */
      overflow: hidden;
    }

    .aspect-h-9, .aspect-h-7 {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      height: 100%;
      width: 100%;
      object-fit: contain; /* Changed from cover to contain to avoid cropping */
    }

    img {
      max-height: 500px;
      object-position: center;
    }

    @media (min-width: 768px) {
      .md\\:aspect-h-7 {
        padding-bottom: 43.75%; /* 16:7 ratio for wider screens */
        max-height: 450px;
      }
    }

    @media (max-width: 767px) {
      .blog-image-container {
        max-width: 100%;
      }

      .aspect-w-16 {
        max-height: 400px;
      }

      img {
        max-height: 400px;
      }
    }
  `]
})
export class BlogImageComponent {
  @Input() src = '';
  @Input() alt = '';
  isModalOpen = false;

  private urlService = inject(UrlService);

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = this.urlService.getNoImageUrl();
  }

  openModal(): void {
    this.isModalOpen = true;
  }
}
