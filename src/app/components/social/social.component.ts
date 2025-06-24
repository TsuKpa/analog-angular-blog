import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-social',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="social">
      <div class="max-w-2xl mx-auto w-full mt-7">
        <div class="flex justify-center gap-6 mt-4">
          <a href="https://fb.com/kampasite" target="_blank" rel="noopener noreferrer" aria-label="Facebook" class="hover:scale-110 transition-transform">
            <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/facebook.svg" alt="Facebook" class="w-8 h-8" />
          </a>
          <a href="https://github.com/TsuKpa" target="_blank" rel="noopener noreferrer" aria-label="GitHub" class="hover:scale-110 transition-transform">
            <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/github.svg" alt="GitHub" class="w-8 h-8" />
          </a>
          <a href="https://www.linkedin.com/in/nqnam1996" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" class="hover:scale-110 transition-transform">
            <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/linkedin.svg" alt="LinkedIn" class="w-8 h-8" />
          </a>
          <a href="https://tsukpa.blogspot.com/" target="_blank" rel="noopener noreferrer" aria-label="Blogspot" class="hover:scale-110 transition-transform">
            <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/blogger.svg" alt="Blogspot" class="w-8 h-8" />
          </a>
        </div>
      </div>
    </section>
  `
})
export class SocialComponent {}
