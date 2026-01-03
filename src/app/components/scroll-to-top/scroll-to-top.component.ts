import { Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-scroll-to-top',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      *ngIf="showButton()"
      (click)="scrollToTop()"
      class="scroll-to-top-btn"
      aria-label="Scroll to top"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  `,
  styles: [`
    .scroll-to-top-btn {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      padding: 0.75rem;
      border-radius: 9999px;
      background-color: #1f2937;
      color: white;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
      z-index: 40;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s ease-in-out;
      width: 48px;
      height: 48px;
      min-width: 48px;
      min-height: 48px;
    }

    .scroll-to-top-btn:hover {
      background-color: #374151;
      transform: translateY(-2px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    .scroll-to-top-btn:active {
      transform: translateY(0);
    }

    .scroll-to-top-btn:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.5);
    }

    .scroll-to-top-btn svg {
      width: 1.25rem;
      height: 1.25rem;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px) scale(0.9);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* Tablet adjustments */
    @media (max-width: 1024px) {
      .scroll-to-top-btn {
        bottom: 1.25rem;
        right: 1.25rem;
      }
    }

    /* Mobile adjustments */
    @media (max-width: 768px) {
      .scroll-to-top-btn {
        bottom: 5rem;
        right: 1rem;
        width: 44px;
        height: 44px;
        min-width: 44px;
        min-height: 44px;
        padding: 0.625rem;
      }

      .scroll-to-top-btn svg {
        width: 1.125rem;
        height: 1.125rem;
      }
    }

    /* Small mobile adjustments */
    @media (max-width: 640px) {
      .scroll-to-top-btn {
        bottom: 4.5rem;
        right: 0.75rem;
        width: 40px;
        height: 40px;
        min-width: 40px;
        min-height: 40px;
        padding: 0.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }

      .scroll-to-top-btn svg {
        width: 1rem;
        height: 1rem;
      }

      .scroll-to-top-btn:hover {
        transform: translateY(-1px);
      }
    }

    /* Extra small screens */
    @media (max-width: 480px) {
      .scroll-to-top-btn {
        bottom: 4rem;
        right: 0.5rem;
      }
    }

    /* Ensure button doesn't overlap with footer on small screens */
    @media (max-height: 600px) {
      .scroll-to-top-btn {
        bottom: 4rem;
      }
    }

    /* Landscape mobile phones */
    @media (max-height: 500px) and (orientation: landscape) {
      .scroll-to-top-btn {
        bottom: 0.5rem;
        right: 0.5rem;
        width: 36px;
        height: 36px;
        min-width: 36px;
        min-height: 36px;
      }

      .scroll-to-top-btn svg {
        width: 0.875rem;
        height: 0.875rem;
      }
    }
  `]
})
export class ScrollToTopComponent {
  private document = inject(DOCUMENT);
  showButton = signal(false);

  @HostListener('window:scroll')
  onWindowScroll(): void {
    // Show button when page is scrolled more than 300px
    const scrollPosition = window.scrollY || this.document.documentElement.scrollTop || this.document.body.scrollTop || 0;
    this.showButton.set(scrollPosition > 300);
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
