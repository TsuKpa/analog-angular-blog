export default interface PostAttributes {
  title: string;
  description: string;
  slug: string;
  // New fields from blog posts
  createdDate?: string;
  lastmod?: string;
  date?: string; // Keep for old posts
  tags: string[];
  photo?: string;
  coverImage?: string; // Keep for old posts
  imageAlt?: string; // Alt text for the cover image
  source?: string;
  website?: string;
  authors?: string[];
  topics?: string[];
  tweet?: string;
  format?: string;
  canonical_url?: string;
  draft?: boolean;   // Flag for draft status
  seo?: {
    metadescription?: string;
    metatitle?: string;
  };
  publish?: boolean;
}
