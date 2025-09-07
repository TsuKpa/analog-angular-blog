import { Component, inject, OnInit } from '@angular/core';
import { UrlService } from '../services/url.service';
import { RouterLink } from '@angular/router';
import { MetaTagService } from '../services/meta.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex flex-col items-center justify-center min-h-[60vh] w-full py-8">
      <div class="flex flex-col items-center justify-center w-full">
        <img
          [src]="notFoundImageUrl"
          alt="Page not found"
          class="w-full max-w-full md:max-w-[80%] lg:max-w-[70%] h-auto object-contain"
        />

        <a
          routerLink="/"
          class="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 transition-colors"
        >
          <svg
            class="mr-2 w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 17l-5-5m0 0l5-5m-5 5h12"
            />
          </svg>
          Return to Home
        </a>
      </div>
    </div>
  `,
})
export default class NotFoundPage implements OnInit {
  private urlService = inject(UrlService);
  private metaTagService = inject(MetaTagService);
  notFoundImageUrl = this.urlService.getNotFoundImageUrl();

  ngOnInit() {
    const homeUrl = this.metaTagService.siteUrl;

    // For 404 pages, canonical URL should point to homepage
    this.metaTagService.updateMetaTags({
      title: '404 - Page Not Found',
      description: 'The page you are looking for does not exist or has been moved.',
      url: `${homeUrl}/404`,
      canonical: homeUrl, // Set canonical URL to homepage
      type: 'website',
    });
  }
}
