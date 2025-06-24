import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WORK_EXPERIENCES, WorkExperience } from './data/work-experience.data';

@Component({
  selector: 'app-work-experience',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngFor="let exp of experiences; let i = index" class="flex gap-2 items-start mb-4">
      <img [src]="exp.logoUrl" [alt]="exp.company" class="rounded-full border border-gray-200 w-12 h-12 object-contain mt-1 me-3" />
      <div class="flex-1">
        <div (click)="toggleDetail(i)" class="flex items-center gap-1 cursor-pointer group select-none flex-wrap">
          <span class="text-base font-bold">{{ exp.company }}</span>
          <span *ngIf="exp.current" class="bg-green-100 text-green-700 text-[10px] font-semibold rounded px-2 py-0.5 ml-1">Current</span>
          <button type="button" (click)="$event.stopPropagation(); toggleDetail(i)" class="ml-1 w-5 h-5 p-0.5 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors flex items-center justify-center focus:outline-none">
            <svg [ngClass]="{'rotate-180': expanded[i]}" class="transition-transform duration-300 w-3 h-3 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <span class="ml-auto text-gray-500 text-xs hidden sm:inline">{{ exp.period }}</span>
        </div>
        <div class="block sm:hidden text-gray-500 text-xs mt-0.5 mb-1">{{ exp.period }}</div>
        <div class="flex items-center gap-1 mt-0.5">
          <svg class="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            <rect width="20" height="14" x="2" y="6" rx="2" />
          </svg>
          <span class="text-gray-700 text-xs">{{ exp.role }}</span>
        </div>
        <div class="flex items-center gap-1 mt-0.5">
          <span class="text-gray-700 text-xs">{{ exp.description }}</span>
        </div>
        <div *ngIf="expanded[i]" class="overflow-hidden animate-fade-in mt-1">
          <ul class="ml-4 list-disc space-y-1 text-sm">
            <li *ngFor="let detail of exp.details">{{ detail }}</li>
          </ul>
          <div class="flex flex-wrap gap-1 mt-2">
            <span *ngFor="let skill of exp.skills" class="bg-black text-white px-1.5 py-0.5 rounded text-[10px] font-semibold shadow">
              {{ skill }}
            </span>
          </div>
          <div class="mt-2 flex">
            <a target="_blank" rel="noopener noreferrer"
              class="flex items-center justify-center gap-1 border border-gray-300 bg-white rounded px-2 py-1 text-[11px] font-medium shadow hover:bg-gray-50 transition-colors"
              [href]="exp.companyUrl" (click)="$event.stopPropagation()">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-building2 mr-1 w-3 h-3">
                <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path>
                <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
                <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path>
                <path d="M10 6h4"></path>
                <path d="M10 10h4"></path>
                <path d="M10 14h4"></path>
                <path d="M10 18h4"></path>
              </svg>
              Visit Company Site
            </a>
          </div>
        </div>
        <div *ngIf="!expanded[i]" (click)="toggleDetail(i)" class="text-gray-500 italic text-xs mt-1 cursor-pointer underline">Click to see details</div>
      </div>
    </div>
  `,
  styles: [
    `
    .animate-fade-in {
      animation: fadeIn 0.3s;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    `
  ]
})
export class WorkExperienceComponent {
  experiences: WorkExperience[] = WORK_EXPERIENCES;
  expanded: boolean[] = [true];

  toggleDetail(index: number) {
    this.expanded[index] = !this.expanded[index];
  }
}
