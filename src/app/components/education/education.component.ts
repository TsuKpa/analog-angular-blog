import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EDUCATION, Education } from './data/education.data';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="education">
      <div class="flex min-h-0 flex-col gap-y-3">
        <div *ngFor="let edu of education" class="opacity-100">
          <a class="block cursor-pointer group/card" target="_blank" rel="noopener noreferrer" [href]="edu.schoolUrl">
            <div class="rounded-lg bg-card text-card-foreground flex">
              <div class="flex-none">
                <span class="relative flex shrink-0 overflow-hidden rounded-full border border-gray-200 size-12 m-auto bg-muted-background dark:bg-foreground">
                  <img class="aspect-square h-full w-full object-contain" [alt]="edu.school" [src]="edu.logoUrl">
                </span>
              </div>
              <div class="grow ml-4 items-center flex-col">
                <div class="flex flex-col">
                  <div class="flex items-center justify-between gap-x-2 text-base">
                    <h3 class="inline-flex items-center justify-center font-semibold leading-none text-xs sm:text-sm">{{ edu.school }}
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link size-4 items-baseline align-bottom translate-x-0 transform opacity-0 transition-all duration-300 ease-out group-hover/card:translate-x-1 group-hover/card:opacity-100">
                        <path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      </svg>
                    </h3>
                    <div class="text-xs tabular-nums text-gray-500 text-right">{{ edu.period }}</div>
                  </div>
                  <div class="font-sans text-xs inline-flex items-center gap-1">{{ edu.degree }}</div>
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  `
})
export class EducationComponent {
  education: Education[] = EDUCATION;
}
