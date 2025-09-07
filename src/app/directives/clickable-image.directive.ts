import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { Subject } from 'rxjs';

export interface ImageClickEvent {
  src: string;
  alt: string;
}

@Directive({
  selector: '[appClickableImage]',
  standalone: true,
  exportAs: 'clickableImage'
})
export class ClickableImageDirective {
  // A static subject that all instances of the directive can access
  static readonly imageClicked = new Subject<ImageClickEvent>();

  constructor(private el: ElementRef<HTMLImageElement>) {
    // Make the cursor a pointer to indicate clickability
    this.el.nativeElement.style.cursor = 'pointer';
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    // Check if we're inside an anchor tag - if so, don't open the modal
    if (this.isInsideAnchor(event.target as HTMLElement)) {
      return;
    }

    const imgElement = this.el.nativeElement;
    ClickableImageDirective.imageClicked.next({
      src: imgElement.src,
      alt: imgElement.alt || ''
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
