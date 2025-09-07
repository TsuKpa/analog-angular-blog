import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export interface BlogPostingStructuredData {
  headline: string;
  description: string;
  image?: string;
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
  url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StructuredDataService {
  private readonly document = inject(DOCUMENT);

  /**
   * Adds JSON-LD structured data to the page for a blog post
   * @param data BlogPostingStructuredData object containing the blog post information
   */
  addBlogPostingStructuredData(data: BlogPostingStructuredData): void {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: data.headline,
      description: data.description,
      image: data.image || '',
      datePublished: data.datePublished,
      dateModified: data.dateModified || data.datePublished,
      author: {
        '@type': 'Person',
        name: data.author.name,
        url: data.author.url || ''
      },
      publisher: data.publisher ? {
        '@type': 'Organization',
        name: data.publisher.name,
        logo: data.publisher.logo ? {
          '@type': 'ImageObject',
          url: data.publisher.logo
        } : undefined
      } : undefined,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': data.url || ''
      }
    };

    this.addStructuredData(jsonLd);
  }

  /**
   * Adds JSON-LD structured data for a website/homepage
   * @param name Website name
   * @param description Website description
   * @param url Website URL
   * @param logoUrl Optional logo URL
   */
  addWebsiteStructuredData(name: string, description: string, url: string, logoUrl?: string): void {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name,
      description,
      url,
      potentialAction: {
        '@type': 'SearchAction',
        'target': {
          '@type': 'EntryPoint',
          'urlTemplate': `${url}/search?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    };

    if (logoUrl) {
      (jsonLd as any).logo = logoUrl;
    }

    this.addStructuredData(jsonLd);
  }

  /**
   * Adds JSON-LD structured data for a person (author)
   * @param name Person's name
   * @param url Person's URL/profile
   * @param imageUrl Optional profile image URL
   * @param description Optional description/bio
   * @param sameAsLinks Optional array of social media profile URLs
   */
  addPersonStructuredData(
    name: string,
    url: string,
    imageUrl?: string,
    description?: string,
    sameAsLinks?: string[]
  ): void {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name,
      url,
      description
    };

    if (imageUrl) {
      (jsonLd as any).image = imageUrl;
    }

    if (sameAsLinks && sameAsLinks.length > 0) {
      (jsonLd as any).sameAs = sameAsLinks;
    }

    this.addStructuredData(jsonLd);
  }

  /**
   * Helper method that adds structured data to the document head
   * @param data The structured data object
   */
  private addStructuredData(data: Record<string, any>): void {
    // First remove any existing structured data with the same @type to avoid duplicates
    this.removeStructuredData(data['@type']);

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    script.setAttribute('data-schema-type', data['@type']);
    this.document.head.appendChild(script);
  }

  /**
   * Helper method to remove structured data by type
   * @param type The @type value of the structured data to remove
   */
  private removeStructuredData(type: string): void {
    const existingScripts = this.document.head.querySelectorAll(
      `script[type="application/ld+json"][data-schema-type="${type}"]`
    );
    existingScripts.forEach(script => script.remove());
  }

  /**
   * Removes all structured data from the document
   */
  removeAllStructuredData(): void {
    const existingScripts = this.document.head.querySelectorAll(
      'script[type="application/ld+json"]'
    );
    existingScripts.forEach(script => script.remove());
  }
}
