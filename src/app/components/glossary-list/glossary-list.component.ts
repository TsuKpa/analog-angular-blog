import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { GLOSSARY } from '../../data/glossary';

interface Group {
  category: string;
  items: { id: string; title: string; definition: string; example?: string }[];
}

const normalize = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').toLowerCase();

@Component({
  selector: 'app-glossary-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="my-6">
      <label for="glossary-search" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Tìm thuật ngữ
      </label>
      <input
        id="glossary-search"
        type="search"
        placeholder="ví dụ: cache, LoRA, MCP…"
        class="w-full max-w-md rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        [value]="query()"
        (input)="query.set($any($event.target).value)"
      />
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400" aria-live="polite">{{ count() }} thuật ngữ</p>
    </div>

    @for (group of groups(); track group.category) {
      <h3 class="mt-8 mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">{{ group.category }}</h3>
      <dl class="divide-y divide-gray-200 dark:divide-gray-700">
        @for (item of group.items; track item.id) {
          <div [id]="'g-' + item.id" class="py-3 scroll-mt-24 target:bg-blue-50 dark:target:bg-blue-950/30">
            <dt class="font-semibold text-gray-900 dark:text-gray-100">{{ item.title }}</dt>
            <dd class="mt-1 text-gray-700 dark:text-gray-300">
              {{ item.definition }}
              @if (item.example) {
                <span class="block mt-1 text-sm text-gray-500 dark:text-gray-400">Ví dụ: {{ item.example }}</span>
              }
            </dd>
          </div>
        }
      </dl>
    } @empty {
      <p class="text-gray-500 dark:text-gray-400">Không tìm thấy thuật ngữ nào.</p>
    }
  `,
})
export class GlossaryListComponent {
  readonly query = signal('');

  private readonly all: Group[] = (() => {
    const map = new Map<string, Group>();
    for (const [id, e] of Object.entries(GLOSSARY)) {
      let g = map.get(e.category);
      if (!g) map.set(e.category, (g = { category: e.category, items: [] }));
      g.items.push({ id, title: e.title, definition: e.definition, example: e.example });
    }
    return [...map.values()];
  })();

  readonly groups = computed(() => {
    const q = normalize(this.query().trim());
    if (!q) return this.all;
    return this.all
      .map((g) => ({
        ...g,
        items: g.items.filter((i) =>
          normalize(`${i.id} ${i.title} ${i.definition} ${i.example ?? ''}`).includes(q),
        ),
      }))
      .filter((g) => g.items.length);
  });

  readonly count = computed(() => this.groups().reduce((n, g) => n + g.items.length, 0));
}
