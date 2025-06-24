import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="contact">
      <div class="text-center mb-12">
        <span
          class="inline-block bg-black text-white px-4 py-2 rounded-full text-sm font-semibold mb-4"
          >Contact</span
        >
        <h1 class="text-5xl font-bold text-gray-900 mb-4">Get in Touch</h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
          Want to chat? Just send me an
          <a
            class="text-blue-700 hover:underline"
            href="mailto:nqnamfe1996@gmail.com"
            >email</a
          >
          and I'll respond whenever I can.
        </p>
        <div class="flex justify-center">
          <a target="_blank" href="#">
            <button
              class="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black-300 border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-100 hover:text-white-600 active:bg-gray-200 active:text-white-700 h-9 px-4 py-2 gap-2 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:hover:text-white-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-file-text h-4 w-4"
              >
                <path
                  d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
                ></path>
                <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                <path d="M10 9H8"></path>
                <path d="M16 13H8"></path>
                <path d="M16 17H8"></path>
              </svg>
              View Resume
            </button>
          </a>
        </div>
      </div>
    </section>
  `,
})
export class ContactComponent {}
