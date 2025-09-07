import { Component, EventEmitter, Input, Output, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn" (click)="close()">
      <div class="modal-image-wrapper">
        <!-- This is only the image container and will not stop click propagation -->
        <div class="relative animate-scaleIn">
          <button
            (click)="close()"
            class="absolute top-4 right-4 z-10 bg-black/60 hover:bg-black/90 rounded-full p-3 text-white transition-all hover:rotate-90 transform duration-300 cursor-pointer"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Only the img element itself will stop propagation -->
          <div class="modal-image-container">
            <img
              [src]="imageUrl"
              [alt]="imageAlt"
              class="max-h-[80vh] max-w-[90%] md:max-w-[85%] lg:max-w-[80%] object-contain shadow-2xl rounded"
              [ngClass]="{'error-image': isErrorImage}"
              (click)="$event.stopPropagation()"
            />
          </div>
        </div>
      </div>
    </div>
  `,  styles: [`
    :host {
      display: block;
    }

    .modal-image-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }

    img {
      max-height: 80vh;
      max-width: 100%;
      width: auto;
      height: auto;
      margin: 0 auto;
      display: block;
    }

    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }

    .animate-scaleIn {
      animation: scaleIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes scaleIn {
      from {
        transform: scale(0.95);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }

    /* Styles for error images */
    .error-image {
      min-width: 700px !important;
      border: 2px dashed #e0e0e0 !important;
      padding: 1rem !important;
      background-color: #f8f8f8 !important;
    }

    .modal-image-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* Responsive styles for error images on mobile */
    @media (max-width: 768px) {
      .error-image {
        min-width: 375px !important;
      }
    }
  `]
})
export class ImageModalComponent implements OnDestroy {
  @Input() set isOpen(value: boolean) {
    this._isOpen = value;
    // Reset error status when modal is opened
    if (value) {
      this.isErrorImage = false;
    }
  }
  get isOpen(): boolean {
    return this._isOpen;
  }
  private _isOpen = false;

  @Input() set isErrorImage(value: boolean) {
    this._isErrorImage = value;
  }
  get isErrorImage(): boolean {
    return this._isErrorImage;
  }
  private _isErrorImage = false;

  @Input() set imageUrl(value: string) {
    this._imageUrl = value;
    // Reset error status when image URL changes
    this.isErrorImage = false;
  }
  get imageUrl(): string {
    return this._imageUrl;
  }
  private _imageUrl = '';

  @Input() imageAlt = '';
  @Output() closed = new EventEmitter<void>();

  constructor() {
    // Add event listener for Escape key
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  ngOnDestroy() {
    // Clean up event listener
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (this.isOpen && event.key === 'Escape') {
      this.close();
    }
  }

  close(): void {
    this.isOpen = false;
    this.closed.emit();
  }
}
