import { AfterContentChecked, Directive, ElementRef, HostListener, Renderer2, inject } from '@angular/core';
import { ClickableImageDirective, ImageClickEvent } from './clickable-image.directive';
import { UrlService } from '../services/url.service';

@Directive({
  selector: '[appMarkdownImage]',
  standalone: true
})
export class MarkdownImageDirective implements AfterContentChecked {
  private processedImages: Set<HTMLImageElement> = new Set();
  private readonly urlService = inject(UrlService);

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterContentChecked() {
    // Find all images in the content
    const images = this.el.nativeElement.querySelectorAll('img');

    images.forEach((img: HTMLImageElement) => {
      // Skip already processed images
      if (this.processedImages.has(img)) {
        return;
      }

      // Add pointer cursor
      this.renderer.setStyle(img, 'cursor', 'pointer');

      // Add hover effect styles
      this.renderer.addClass(img, 'transition-all');
      this.renderer.addClass(img, 'duration-300');
      this.renderer.addClass(img, 'hover:shadow-lg');

      // Store original source for reference
      const originalSrc = img.src;

      // First check if image is already in an error state (complete but no dimensions)
      if (img.complete && (img.naturalWidth === 0 || img.naturalHeight === 0)) {
        // Store the original URL as a data attribute for modal use
        img.setAttribute('data-original-src', originalSrc);
        img.setAttribute('data-error-image', 'true');
        img.src = this.urlService.getNoImageUrl();
        this.renderer.addClass(img, 'error-image');
      }

      // Add click event listener
      this.renderer.listen(img, 'click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        // Check if inside an anchor
        if (!this.isInsideAnchor(img)) {
          // Get the source URL - use original source if available (for error images)
          const isErrorImage = img.hasAttribute('data-error-image');
          const originalSrc = img.getAttribute('data-original-src');

          // For error images, we'll use the fallback image but pass additional info
          const imageSource = isErrorImage && originalSrc ? img.src : img.src;
          const imageAlt = img.alt || (isErrorImage ? 'Image failed to load' : '');

          ClickableImageDirective.imageClicked.next({
            src: imageSource,
            alt: imageAlt,
            isError: isErrorImage
          });
        }
      });

      // Trigger image load check manually for images that might be cached but broken
      if (img.src) {
        // Try to force a reload to trigger onerror for bad images
        const tempSrc = img.src;
        // Use setTimeout to ensure our error handler is attached first
        setTimeout(() => {
          // Only reload if it's still the same image (could have been replaced by error handler)
          if (img.src === tempSrc) {
            // Force browser to check the image again
            const forceReload = tempSrc.indexOf('?') > -1 ? '&' : '?';
            img.src = tempSrc + forceReload + '_ts=' + new Date().getTime();
          }
        }, 0);
      }

      // Mark as processed
      this.processedImages.add(img);
    });
  }

  // Utility method to check if an element is inside an anchor tag
  private isInsideAnchor(element: HTMLElement | null): boolean {
    let currentElement = element;
    while (currentElement) {
      if (currentElement.tagName?.toLowerCase() === 'a') {
        return true;
      }
      currentElement = currentElement.parentElement;
    }
    return false;
  }
}
