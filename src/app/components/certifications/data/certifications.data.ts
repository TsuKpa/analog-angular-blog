export interface Certificate {
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
  imageUrl?: string;
}

export const CERTIFICATES: Certificate[] = [
  {
    name: 'AWS Certified Solutions Architect – Associate',
    issuer: 'Amazon Web Services (AWS)',
    issueDate: 'March 2024',
    credentialUrl: 'https://www.credly.com/badges/638aaf4c-4e81-4321-b7ba-c7bf05d3cc46',
    imageUrl: 'https://images.credly.com/images/0e284c3f-5164-4b21-8660-0d84737941bc/image.png',
  },
  {
    name: 'AWS Certified Cloud Practitioner',
    issuer: 'Amazon Web Services (AWS)',
    issueDate: 'December 2023',
    credentialUrl: 'https://www.credly.com/badges/d9242435-6fc9-42b1-9847-1b972f95a481',
    imageUrl: 'https://images.credly.com/size/680x680/images/00634f82-b07f-4bbd-a6bb-53de397fc3a6/image.png',
  },
];
