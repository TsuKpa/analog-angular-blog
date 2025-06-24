import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { programmingLanguages, frontend, backend, devops, others, Skill } from './data/skills.data';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="skills">
      <div class="flex min-h-0 flex-col">
        <div class="opacity-100">
          <div>
            <h2 class="text-l font-bold mb-2">Programming Languages</h2>
            <div class="flex flex-row flex-wrap gap-2 max-w-[800px]">
              <button *ngFor="let skill of programmingLanguages" data-state="closed" class="relative group">
                <img [alt]="skill.name" width="48" height="48" class="object-contain" [src]="skill.iconUrl">
                <span class="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 whitespace-nowrap">{{ skill.name }}</span>
              </button>
            </div>
          </div>
          <div>
            <h2 class="text-l font-bold mt-4 mb-2">Frontend</h2>
            <div class="flex flex-row flex-wrap gap-2 max-w-[800px]">
              <button *ngFor="let skill of frontend" data-state="closed" class="relative group">
                <img [alt]="skill.name" width="48" height="48" class="object-contain" [src]="skill.iconUrl">
                <span class="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 whitespace-nowrap">{{ skill.name }}</span>
              </button>
            </div>
          </div>
          <div>
            <h2 class="text-l font-bold mt-4 mb-2">Backend</h2>
            <div class="flex flex-row flex-wrap gap-2 max-w-[800px]">
              <button *ngFor="let skill of backend" data-state="closed" class="relative group">
                <img [alt]="skill.name" width="48" height="48" class="object-contain" [src]="skill.iconUrl">
                <span class="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 whitespace-nowrap">{{ skill.name }}</span>
              </button>
            </div>
          </div>
          <div>
            <h2 class="text-l font-bold mt-4 mb-2">DevOps</h2>
            <div class="flex flex-row flex-wrap gap-2 max-w-[800px]">
              <button *ngFor="let skill of devops" data-state="closed" class="relative group">
                <img [alt]="skill.name" width="48" height="48" class="object-contain" [src]="skill.iconUrl">
                <span class="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 whitespace-nowrap">{{ skill.name }}</span>
              </button>
            </div>
          </div>
          <div>
            <h2 class="text-l font-bold mt-4 mb-2">Databases & Others</h2>
            <div class="flex flex-row flex-wrap gap-2 max-w-[800px]">
              <button *ngFor="let skill of others" data-state="closed" class="relative group">
                <img [alt]="skill.name" width="48" height="48" class="object-contain" [src]="skill.iconUrl">
                <span class="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 whitespace-nowrap">{{ skill.name }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class SkillsComponent {
  programmingLanguages = programmingLanguages;
  frontend = frontend;
  backend = backend;
  devops = devops;
  others = others;
}
