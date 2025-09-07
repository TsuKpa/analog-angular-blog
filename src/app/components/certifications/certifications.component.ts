import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { getDefaultCdnImageUrl } from '../../utils/cdn-helper';
import { CERTIFICATES, Certificate } from './data/certifications.data';

@Component({
  selector: 'app-certifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="certs">
      <div class="flex min-h-0 flex-col gap-y-3">
        <div *ngFor="let cert of certificates" class="opacity-100">
          <a class="block cursor-pointer group/card" target="_blank" rel="noopener noreferrer" [href]="cert.credentialUrl">
            <div class="rounded-lg bg-card text-card-foreground flex">
              <div class="flex-none">
                <span class="relative flex shrink-0 overflow-hidden rounded-full border border-gray-200 size-12 m-auto bg-muted-background dark:bg-foreground">
                  <img *ngIf="cert.imageUrl" class="aspect-square h-full w-full object-contain" [alt]="cert.name" [src]="cert.imageUrl" (error)="onImgError($event)">
                  <span *ngIf="!cert.imageUrl" class="flex h-full w-full items-center justify-center rounded-full bg-muted">{{ cert.name.charAt(0) }}</span>
                </span>
              </div>
              <div class="grow ml-4 items-center flex-col">
                <div class="flex flex-col">
                  <div class="flex items-center justify-between gap-x-2 text-base">
                    <h3 class="inline-flex items-center justify-center font-semibold leading-none text-xs sm:text-sm">{{ cert.name }}
                      <svg *ngIf="cert.credentialUrl" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link size-4 items-baseline align-bottom translate-x-0 transform opacity-0 transition-all duration-300 ease-out group-hover/card:translate-x-1 group-hover/card:opacity-100">
                        <path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      </svg>
                    </h3>
                    <div class="text-xs tabular-nums text-gray-500 text-right hidden sm:block">Issued {{ cert.issueDate }}</div>
                  </div>
                  <div class="text-xs tabular-nums text-gray-500 text-left block sm:hidden mb-1">Issued {{ cert.issueDate }}</div>
                  <div class="font-sans text-xs inline-flex items-center gap-1">{{ cert.issuer }}</div>
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
    .animate-fade-in {
      animation: fadeIn 0.3s;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    `
  ]
})
export class CertificationsComponent {
  certificates: Certificate[] = CERTIFICATES;
  onImgError(event: Event) {
    (event.target as HTMLImageElement).src = getDefaultCdnImageUrl();
  }
}
