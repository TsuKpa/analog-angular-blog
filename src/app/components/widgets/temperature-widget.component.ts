import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

interface Candidate {
  label: string;
  /** Probability at temperature 1; logit = ln(p). */
  p: number;
}

const CANDIDATES: Candidate[] = [
  { label: 'Hà', p: 0.9 },
  { label: 'thành', p: 0.04 },
  { label: 'một', p: 0.03 },
  { label: 'TP', p: 0.015 },
  { label: 'Sài', p: 0.01 },
  { label: 'nơi', p: 0.005 },
];

@Component({
  selector: 'app-temperature-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="not-prose my-6 rounded-xl border border-gray-200 bg-white p-4 text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 sm:p-5">
      <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h4 class="m-0 text-base font-semibold text-gray-900 dark:text-gray-100">
          Đoán token tiếp theo sau: <span class="font-mono">"{{ prompt() }}"</span>
        </h4>
        <span class="text-xs font-semibold uppercase tracking-wide text-black dark:text-white">tương tác · số liệu minh họa</span>
      </div>

      <div class="mb-4 flex flex-wrap items-start gap-x-6 gap-y-3">
        <label class="flex min-w-[220px] flex-col gap-1 text-sm font-medium">
          <span>Temperature: <b class="font-mono">{{ temperature().toFixed(1) }}</b></span>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            class="w-full accent-black dark:accent-white"
            [value]="temperature()"
            (input)="onInput($event)"
          />
        </label>
        <p class="m-0 max-w-[44ch] text-sm text-gray-600 dark:text-gray-400">
          Kéo về 0: luôn chọn token xác suất cao nhất, câu trả lời ổn định, lặp lại được. Kéo lên 2: các lựa chọn hiếm có cơ hội hơn, sáng tạo hơn nhưng dễ lạc đề.
        </p>
      </div>

      <div class="flex flex-col gap-1.5">
        @for (b of bars(); track b.label) {
          <div class="grid grid-cols-[4.5rem_1fr_3.5rem] items-center gap-2 text-sm">
            <span class="truncate font-mono">"{{ b.label }}"</span>
            <div class="h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div class="h-full rounded-full bg-black transition-[width] duration-150 dark:bg-white" [style.width.%]="b.pct"></div>
            </div>
            <span class="text-right font-mono tabular-nums">{{ b.pct.toFixed(1) }}%</span>
          </div>
        }
      </div>
    </div>
  `,
})
export class TemperatureWidgetComponent {
  readonly prompt = input('Thủ đô của Việt Nam là');
  readonly temperature = signal(1);

  readonly bars = computed(() => {
    const t = this.temperature();
    let ps: number[];
    if (t < 0.05) {
      ps = CANDIDATES.map((_, i) => (i === 0 ? 1 : 0));
    } else {
      // softmax(logit / T) with logit = ln(p)  ==  p^(1/T) normalised
      const raw = CANDIDATES.map((c) => Math.pow(c.p, 1 / t));
      const sum = raw.reduce((a, b) => a + b, 0);
      ps = raw.map((r) => r / sum);
    }
    return CANDIDATES.map((c, i) => ({ label: c.label, pct: ps[i] * 100 }));
  });

  onInput(e: Event) {
    this.temperature.set(+(e.target as HTMLInputElement).value);
  }
}
