import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { UrlService } from './url.service';
import { StructuredDataService } from './structured-data.service';

export interface MetaTagConfig {
  title: string;
  description: string;
  image?: string;
  type?: string;
  url?: string;
  twitterCard?: string;
  canonical?: string; // New canonical URL property
}

export interface BlogPostMetaConfig extends MetaTagConfig {
  datePublished: string;
  dateModified?: string;
  author: {
    name: string;
    url?: string;
  };
  publisher?: {
    name: string;
    logo?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class MetaTagService {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly urlService = inject(UrlService);
  private readonly structuredDataService = inject(StructuredDataService);
  private readonly document = inject(DOCUMENT);
  private readonly defaultType = 'website';
  private readonly defaultTwitterCard = 'summary_large_image';
  private readonly window = inject(DOCUMENT).defaultView as Window | null;
  public get siteUrl(): string {
    return this.window?.location?.origin || 'https://v2.tsukpa.blog';
  }

  updateMetaTags(config: MetaTagConfig): void {
    // Basic meta tags
    this.title.setTitle(config.title);
    this.meta.updateTag({ name: 'description', content: config.description });

    // Open Graph meta tags
    this.meta.updateTag({ property: 'og:title', content: config.title });
    this.meta.updateTag({ property: 'og:description', content: config.description });
    this.meta.updateTag({ property: 'og:image', content: config.image ? this.urlService.getImageUrl(config.image) : this.urlService.getImageUrl() });
    this.meta.updateTag({ property: 'og:type', content: config.type || this.defaultType });
    this.meta.updateTag({ property: 'og:url', content: config.url || this.siteUrl });

    // Twitter meta tags
    this.meta.updateTag({ name: 'twitter:card', content: config.twitterCard || this.defaultTwitterCard });
    this.meta.updateTag({ name: 'twitter:title', content: config.title });
    this.meta.updateTag({ name: 'twitter:description', content: config.description });
    this.meta.updateTag({ name: 'twitter:image', content: config.image ? this.urlService.getImageUrl(config.image) : this.urlService.getImageUrl() });

    // Set canonical URL
    this.setCanonicalUrl(config.canonical || config.url || this.window?.location?.href || this.siteUrl);

    // Add WebSite structured data for non-blog pages
    if (config.type === 'website' || !config.type) {
      this.structuredDataService.addWebsiteStructuredData(
        config.title,
        config.description,
        config.url || this.siteUrl,
        config.image ? this.urlService.getImageUrl(config.image) : undefined
      );
    }
  }

  /**
   * Sets the canonical URL for the current page
   * @param url The canonical URL to set
   */
  setCanonicalUrl(url: string): void {
    // Remove any existing canonical links
    const existingCanonical = this.document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Add the new canonical link
    const link = this.document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', url);
    this.document.head.appendChild(link);
  }

  /**
   * Updates meta tags and adds structured data for blog posts
   * @param config BlogPostMetaConfig containing blog post information
   */
  updateBlogPostMeta(config: BlogPostMetaConfig): void {
    // Set standard meta tags
    this.updateMetaTags({
      ...config,
      type: 'article'
    });

    // Add structured data for blog post
    this.structuredDataService.addBlogPostingStructuredData({
      headline: config.title,
      description: config.description,
      image: config.image ? this.urlService.getImageUrl(config.image) : undefined,
      datePublished: config.datePublished,
      dateModified: config.dateModified,
      author: config.author,
      publisher: config.publisher,
      url: config.url || this.window?.location?.href || undefined
    });
  }

  /**
   * Adds author structured data to the page
   * @param name Author name
   * @param url Author URL/profile
   * @param imageUrl Optional author image URL
   * @param description Optional author bio
   * @param socialUrls Optional array of social media profile URLs
   */
  addAuthorStructuredData(
    name: string,
    url: string,
    imageUrl?: string,
    description?: string,
    socialUrls?: string[]
  ): void {
    this.structuredDataService.addPersonStructuredData(
      name,
      url,
      imageUrl ? this.urlService.getImageUrl(imageUrl) : undefined,
      description,
      socialUrls
    );
  }

  /**
   * Removes all structured data from the page
   */
  clearStructuredData(): void {
    this.structuredDataService.removeAllStructuredData();
  }
}
