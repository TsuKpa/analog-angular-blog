import { AfterContentChecked, Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { ClickableImageDirective, ImageClickEvent } from './clickable-image.directive';

@Directive({
  selector: '[appMarkdownImage]',
  standalone: true
})
export class MarkdownImageDirective implements AfterContentChecked {
  private processedImages: Set<HTMLImageElement> = new Set();

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

      // Add click event listener
      this.renderer.listen(img, 'click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        // Check if inside an anchor
        if (!this.isInsideAnchor(img)) {
          ClickableImageDirective.imageClicked.next({
            src: img.src,
            alt: img.alt || ''
          });
        }
      });

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
