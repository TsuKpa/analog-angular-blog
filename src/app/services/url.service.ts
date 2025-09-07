import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UrlService {
  private readonly cdnBaseUrl = 'https://d9akteslg4v3w.cloudfront.net/blog/images/';

  // Default images
  private readonly defaultImage = 'background.png';
  private readonly noImage = '404.svg';

  /**
   * Get a full CDN URL for an image
   * @param path The image path relative to the CDN base URL
   * @returns The full CDN URL
   */
  getImageUrl(path?: string): string {
    if (!path) {
      return this.getCdnUrl(this.defaultImage);
    }

    // If it's already a full URL, return it as is
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
      return path;
    }

    // Otherwise append to the CDN base URL
    return this.getCdnUrl(path);
  }

  /**
   * Get the default fallback image URL for error cases
   * @returns The fallback image URL
   */
  getNoImageUrl(): string {
    return this.getCdnUrl(this.noImage);
  }

  /**
   * Get a CDN URL with the given path
   * @param path The path relative to the CDN base URL
   * @returns The full CDN URL
   */
  private getCdnUrl(path: string): string {
    return `${this.cdnBaseUrl}${path}`;
  }
}
