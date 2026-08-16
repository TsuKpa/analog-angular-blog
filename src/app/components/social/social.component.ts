import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-social',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="social">
      <div class="max-w-2xl mx-auto w-full mt-7">
        <div class="flex justify-center gap-6 mt-4 text-gray-700 dark:text-gray-200">
          <a href="https://fb.com/kampasite" target="_blank" rel="noopener noreferrer" aria-label="Facebook" class="hover:scale-110 hover:text-black dark:hover:text-white transition-all">
            <svg class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <a href="https://github.com/TsuKpa" target="_blank" rel="noopener noreferrer" aria-label="GitHub" class="hover:scale-110 hover:text-black dark:hover:text-white transition-all">
            <svg class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12z"/></svg>
          </a>
          <a href="https://www.linkedin.com/in/nqnam1996" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" class="hover:scale-110 hover:text-black dark:hover:text-white transition-all">
            <svg class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
          <a href="https://tsukpa.blogspot.com/" target="_blank" rel="noopener noreferrer" aria-label="Blogspot" class="hover:scale-110 hover:text-black dark:hover:text-white transition-all">
            <svg class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.976 24H2.026C.9 24 0 23.1 0 21.976V2.026C0 .9.9 0 2.025 0h19.95C23.1 0 24 .9 24 2.025v19.95C24 23.1 23.1 24 21.976 24zM12.28 5.638H9.7c-2.244 0-4.086 1.842-4.086 4.086v4.552c0 2.244 1.842 4.086 4.086 4.086h4.599c2.244 0 4.086-1.842 4.086-4.086v-2.782a1.09 1.09 0 00-1.09-1.09h-.68v-.68a2.635 2.635 0 00-2.635-2.635h-.786a1.09 1.09 0 01.086-1.451zm-2.53 3.822h2.297a1.09 1.09 0 010 2.18H9.75a1.09 1.09 0 010-2.18zm0 3.998h4.48a1.09 1.09 0 010 2.18H9.75a1.09 1.09 0 010-2.18z"/></svg>
          </a>
        </div>
      </div>
    </section>
  `
})
export class SocialComponent {}
