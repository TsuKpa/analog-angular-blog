import { ContactComponent } from './../components/contact/contact.component';
import { Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { injectContentFiles } from '@analogjs/content';
import PostAttributes from './blog/data/post-attributes';
import { workshops, type WorkShop } from './aws-workshops/data/workshop-data';
import {
  BlogPostCardComponent,
  type BlogPost,
} from '../components/blog-post-card/blog-post-card.component';
import { WorkshopCardComponent } from '../components/workshop-card/workshop-card.component';
import { getRandomQuote, type Quote } from './quotes-data';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, BlogPostCardComponent, WorkshopCardComponent, ContactComponent],
  template: `
    <div class="py-8">
      <div class="text-center mb-12">
        <span
          class="inline-block bg-black text-white px-4 py-2 rounded-full text-sm font-semibold mb-4"
          >Latest Blog Posts</span
        >
        <h1 class="text-5xl font-bold text-gray-900 mb-4">
          Check out my latest work
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          I've worked on a variety of projects, from simple websites to complex
          web applications. Here are my latest blog posts.
        </p>
      </div>
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        @for (post of latestPosts; track post.filename) {
        <app-blog-post-card [post]="post" />
        }
      </div>

      <div class="text-center mt-8">
        <a
          [routerLink]="['/blog']"
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 transition-colors"
        >
          View All Posts
          <svg
            class="ml-2 -mr-1 w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </a>
      </div>

      <!-- Divider -->
      <div class="my-12 border-t border-gray-200"></div>

      <!-- Quote Section -->
      <div class="my-16 py-12 bg-gray-50 rounded-lg">
        <div class="max-w-4xl mx-auto px-6 text-center">
          <svg
            class="w-12 h-12 text-black-900 mx-auto mb-6"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"
            />
          </svg>
          <blockquote
            class="text-2xl font-medium text-gray-900 mb-4 leading-relaxed"
          >
            "{{ randomQuote.text }}"
          </blockquote>
          <cite class="text-lg text-gray-600 font-medium">
            — {{ randomQuote.author
            }}{{ randomQuote.profession ? ', ' + randomQuote.profession : '' }}
          </cite>
        </div>
      </div>

      <div class="text-center my-12 pt-8 border-t border-gray-200">
        <span
          class="inline-block bg-black text-white px-4 py-2 rounded-full text-sm font-semibold mb-4"
          >AWS Workshops</span
        >
        <h1 class="text-5xl font-bold text-gray-900 mb-4">
          Explore Hands-On Labs
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Deepen your cloud skills with practical workshops on various AWS
          services and real-world scenarios.
        </p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (workshop of latestWorkshops(); track workshop.id) {
        <app-workshop-card [workshop]="workshop" />
        }
      </div>

      <div class="text-center mt-8">
        <a
          [routerLink]="['/aws-workshops']"
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 transition-colors"
        >
          View All Workshops
          <svg
            class="ml-2 -mr-1 w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </a>
      </div>
    </div>

    <!-- Divider -->
    <div class="my-12 border-t border-gray-200"></div>

    <div class="max-w-2xl mx-auto w-full mt-12">
      <app-contact></app-contact>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export default class HomeComponent {
  readonly posts = injectContentFiles<PostAttributes>().filter(
    (post) => post.attributes.publish
  );
  readonly latestPosts = this.posts
    .sort((a, b) => {
      const dateA = new Date(
        a.attributes.createdDate || a.attributes.date || 0
      );
      const dateB = new Date(
        b.attributes.createdDate || b.attributes.date || 0
      );
      return dateB.getTime() - dateA.getTime(); // Sort in descending order (newest first)
    })
    .slice(0, 4);

  readonly latestWorkshops = computed(() => {
    return [...workshops]
      .sort(
        (a, b) =>
          new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
      )
      .slice(0, 3);
  });

  readonly randomQuote = getRandomQuote();
}
