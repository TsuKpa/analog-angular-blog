// This file helps ensure the environment variables are properly used in Vite environment

// TypeScript interface for environment variables
interface ImportMetaEnv {
  readonly VITE_PRODUCTION: string;
  // Add more env variables as needed
}

// Make sure import.meta.env has the correct type
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Helper function to get the current environment
export function isProduction(): boolean {
  // Check both the Angular environment system and Vite's environment system
  return import.meta.env.MODE === 'production' || import.meta.env['VITE_PRODUCTION'] === 'true';
}
