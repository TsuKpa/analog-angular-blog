/// <reference types="vitest" />

import { defineConfig } from 'vite';
import analog, { PrerenderContentFile } from '@analogjs/platform';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env =
    mode === 'production' ? { production: true } : { production: false };

  return {
    build: {
      target: ['es2020'],
      minify: mode === 'production' ? 'terser' : false,
      terserOptions:
        mode === 'production'
          ? {
              compress: {
                passes: 2,
                drop_console: true,
              },
            }
          : undefined,
      rollupOptions:
        mode === 'production'
          ? {
              output: {
                manualChunks: {
                  vendor: [
                    '@angular/core',
                    '@angular/common',
                    '@angular/router',
                  ],
                },
              },
            }
          : undefined,
    },
    resolve: {
      mainFields: ['module'],
    },
    plugins: [
      analog({
        content: {
          highlighter: 'prism',
        },
        prerender: {
          routes: async () => [
            '/blog',
            {
              contentDir: 'src/content',
              transform: (file: PrerenderContentFile) => {
                // do not include files marked as draft in frontmatter
                if (file.attributes['draft']) {
                  return false;
                }
                // use the slug from frontmatter if defined, otherwise use the files basename
                const slug = file.attributes['slug'] || file.name;
                return `/blog/${slug}`;
              },
            },
          ],
          sitemap: {
            host: 'https://v2.tsukpa.blog', // Don't forget to update your domain!
          },
        },
      }),
      tailwindcss(),
    ],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['src/test-setup.ts'],
      include: ['**/*.spec.ts'],
      reporters: ['default'],
    },
    define: {
      'import.meta.vitest': mode !== 'production',
      // This is the key part that ensures environment variables are properly replaced
      'process.env.NODE_ENV': JSON.stringify(mode),
      'environment.production': mode === 'production',
      // Replace environment variables in your app
      environment:
        mode === 'production'
          ? JSON.stringify({ production: true })
          : JSON.stringify({ production: false }),
    },
  };
});
