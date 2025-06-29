import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface MetaTagConfig {
  title: string;
  description: string;
  image?: string;
  type?: string;
  url?: string;
  twitterCard?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MetaTagService {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly defaultImage = 'https://d9akteslg4v3w.cloudfront.net/blog/images/background.png';
  private readonly defaultType = 'website';
  private readonly defaultTwitterCard = 'summary_large_image';
  private readonly siteUrl = 'https://v2.tsukpa.blog';

  updateMetaTags(config: MetaTagConfig): void {
    // Basic meta tags
    this.title.setTitle(config.title);
    this.meta.updateTag({ name: 'description', content: config.description });

    // Open Graph meta tags
    this.meta.updateTag({ property: 'og:title', content: config.title });
    this.meta.updateTag({ property: 'og:description', content: config.description });
    this.meta.updateTag({ property: 'og:image', content: config.image || this.defaultImage });
    this.meta.updateTag({ property: 'og:type', content: config.type || this.defaultType });
    this.meta.updateTag({ property: 'og:url', content: config.url || this.siteUrl });

    // Twitter meta tags
    this.meta.updateTag({ name: 'twitter:card', content: config.twitterCard || this.defaultTwitterCard });
    this.meta.updateTag({ name: 'twitter:title', content: config.title });
    this.meta.updateTag({ name: 'twitter:description', content: config.description });
    this.meta.updateTag({ name: 'twitter:image', content: config.image || this.defaultImage });
  }
}
