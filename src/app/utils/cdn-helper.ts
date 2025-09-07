/**
 * Helper function to generate CDN URLs for use in static data files
 * @param path The image path relative to the CDN base URL
 * @returns The full CDN URL
 */
export function getCdnImageUrl(path: string): string {
  const CDN_BASE_URL = 'https://d9akteslg4v3w.cloudfront.net/blog/images/';
  return `${CDN_BASE_URL}${path}`;
}
