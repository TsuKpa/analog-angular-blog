import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

type Kind = 'sys' | 'mem' | 'user' | 'model' | 'tool';

interface LoopStep {
  who: string;
  txt: string;
  add: number;
  k: Kind;
  call?: boolean;
}

const STEPS: LoopStep[] = [
  { who: 'Harness', txt: 'Nạp system prompt + định nghĩa tool', add: 14000, k: 'sys' },
  { who: 'Harness', txt: 'Nạp CLAUDE.md của dự án', add: 2000, k: 'mem' },
  { who: 'Bạn', txt: '"Trang /checkout lỗi 500, sửa giúp"', add: 50, k: 'user' },
  { who: 'Model', txt: 'Nghĩ, rồi gọi grep "checkout"', add: 300, k: 'model', call: true },
  { who: 'Tool', txt: 'Kết quả grep: 40 dòng', add: 1200, k: 'tool' },
  { who: 'Model', txt: 'Gọi read_file page.tsx', add: 150, k: 'model', call: true },
  { who: 'Tool', txt: 'Nội dung page.tsx, 300 dòng', add: 4500, k: 'tool' },
  { who: 'Model', txt: 'Gọi read_file lib/payment.ts', add: 150, k: 'model', call: true },
  { who: 'Tool', txt: 'Nội dung payment.ts', add: 3800, k: 'tool' },
  { who: 'Model', txt: 'Sửa file: xử lý coupon rỗng', add: 900, k: 'model', call: true },
  { who: 'Tool', txt: 'Sửa thành công', add: 100, k: 'tool' },
  { who: 'Model', txt: 'Chạy npm test', add: 120, k: 'model', call: true },
  { who: 'Tool', txt: 'Test fail: log 200 dòng', add: 6000, k: 'tool' },
  { who: 'Model', txt: 'Đọc lỗi, sửa tiếp', add: 700, k: 'model', call: true },
  { who: 'Tool', txt: 'Sửa thành công', add: 100, k: 'tool' },
  { who: 'Model', txt: 'Chạy lại npm test', add: 120, k: 'model', call: true },
  { who: 'Tool', txt: 'Test pass', add: 400, k: 'tool' },
  { who: 'Model', txt: 'Trả lời: đã sửa, giải thích nguyên nhân', add: 350, k: 'model', call: true },
];

const MAX_CTX = STEPS.reduce((a, s) => a + s.add, 0);

const SEG_CLASS: Record<Kind, string> = {
  sys: 'bg-gray-400 dark:bg-gray-500',
  mem: 'bg-gray-300 dark:bg-gray-600',
  user: 'bg-blue-300 dark:bg-blue-800',
  model: 'bg-blue-600 dark:bg-blue-400',
  tool: 'bg-gray-600 dark:bg-gray-300',
};

const LEGEND: { k: Kind; label: string }[] = [
  { k: 'sys', label: 'system + tool' },
  { k: 'mem', label: 'CLAUDE.md' },
  { k: 'user', label: 'bạn' },
  { k: 'model', label: 'model viết' },
  { k: 'tool', label: 'kết quả tool' },
];

const BTN =
  'rounded-md border border-gray-300 px-3 py-1 text-sm hover:border-blue-600 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-300 disabled:hover:text-inherit dark:border-gray-600 dark:hover:border-blue-400 dark:hover:text-blue-400 dark:disabled:hover:border-gray-600';

@Component({
  selector: 'app-agent-loop-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="not-prose my-6 rounded-xl border border-gray-200 bg-white p-4 text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 sm:p-5">
      <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h4 class="m-0 text-base font-semibold text-gray-900 dark:text-gray-100">"Trang /checkout lỗi 500, sửa giúp"</h4>
        <span class="text-xs font-semibold uppercase tracking-wide text-black dark:text-white">tương tác · số token ước lượng</span>
      </div>

      <div class="mb-3 flex flex-wrap gap-2">
        <button type="button" class="${BTN}" [disabled]="cur() < 0" (click)="prev()">← Lùi</button>
        <button type="button" class="rounded-md border border-blue-600 bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600" [disabled]="cur() >= last" (click)="next()">Bước tiếp →</button>
        <button type="button" class="${BTN}" (click)="cur.set(last)">Chạy hết</button>
        <button type="button" class="${BTN}" (click)="cur.set(-1)">Làm lại</button>
      </div>

      <div class="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <ol class="m-0 grid list-none gap-1.5 p-0 text-sm">
          @for (s of steps; track $index) {
            <li
              class="m-0 grid grid-cols-[4.6rem_1fr_auto] items-baseline gap-2 rounded-md bg-gray-50 px-2.5 py-1.5 dark:bg-gray-900"
              [class]="liCls($index)"
            >
              <span class="text-[0.68rem] uppercase tracking-wider" [class]="s.call ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'">{{ s.call ? 'Model ▸' : s.who }}</span>
              <span>{{ s.txt }}</span>
              <span class="whitespace-nowrap font-mono text-xs tabular-nums text-gray-500 dark:text-gray-400">+{{ fmt(s.add) }}</span>
            </li>
          }
        </ol>

        <div>
          <div class="mb-1.5 text-xs text-gray-500 dark:text-gray-400">Context gửi lên ở lượt hiện tại</div>
          <div class="flex min-h-[220px] flex-col-reverse justify-start gap-0.5">
            @for (seg of segments(); track $index) {
              <div class="rounded-sm" [class]="seg.cls" [style.height.px]="seg.h" [attr.title]="seg.title"></div>
            }
          </div>
          <div class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
            @for (l of legend; track l.k) {
              <span class="inline-flex items-center gap-1"><i class="inline-block h-2.5 w-2.5 rounded-sm" [class]="segClass[l.k]"></i>{{ l.label }}</span>
            }
          </div>
          <dl class="m-0 mt-3 grid grid-cols-3 gap-2">
            <div class="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900"><dt class="text-xs text-gray-500 dark:text-gray-400">Lượt gọi model</dt><dd class="m-0 font-mono text-lg font-semibold tabular-nums">{{ stats().calls }}</dd></div>
            <div class="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900"><dt class="text-xs text-gray-500 dark:text-gray-400">Context hiện tại</dt><dd class="m-0 font-mono text-lg font-semibold tabular-nums">{{ fmt(stats().ctx) }}</dd></div>
            <div class="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900"><dt class="text-xs text-gray-500 dark:text-gray-400">Tổng input đã xử lý</dt><dd class="m-0 font-mono text-lg font-semibold tabular-nums">{{ fmt(stats().total) }}</dd></div>
          </dl>
        </div>
      </div>

      <p class="mb-0 mt-4 text-sm text-gray-600 dark:text-gray-400">
        Một câu hỏi của bạn, 8 lượt gọi model. Lượt nào cũng gửi lại toàn bộ context, nên tổng input đã xử lý lớn hơn rất nhiều so với context cuối cùng. Nếu phần đầu trúng cache thì phần lớn số này được tính giá rẻ (xem mục 6 bên dưới).
      </p>
    </div>
  `,
})
export class AgentLoopWidgetComponent {
  readonly steps = STEPS;
  readonly legend = LEGEND;
  readonly segClass = SEG_CLASS;
  readonly last = STEPS.length - 1;
  readonly cur = signal(3);

  readonly stats = computed(() => {
    let ctx = 0;
    let calls = 0;
    let total = 0;
    for (let i = 0; i <= this.cur(); i++) {
      const s = STEPS[i];
      if (s.call) {
        calls++;
        total += ctx;
      }
      ctx += s.add;
    }
    return { calls, ctx, total };
  });

  readonly segments = computed(() =>
    STEPS.slice(0, this.cur() + 1).map((s) => ({
      cls: SEG_CLASS[s.k],
      h: Math.max(3, (s.add / MAX_CTX) * 220),
      title: `${s.txt} (${this.fmt(s.add)} token)`,
    })),
  );

  liCls(i: number): string {
    const c = this.cur();
    if (i === c) return 'ring-2 ring-blue-600 dark:ring-blue-400';
    return i > c ? 'opacity-40' : '';
  }

  fmt(n: number): string {
    return Math.round(n).toLocaleString('vi-VN');
  }

  next() {
    this.cur.update((c) => Math.min(this.last, c + 1));
  }

  prev() {
    this.cur.update((c) => Math.max(-1, c - 1));
  }
}
