import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
  signal,
  viewChild,
} from '@angular/core';

const PATCH = 28;

@Component({
  selector: 'app-image-token-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="not-prose my-6 rounded-xl border border-gray-200 bg-white p-4 text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 sm:p-5">
      <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h4 class="m-0 text-base font-semibold text-gray-900 dark:text-gray-100">Máy tính token cho ảnh (công thức Claude)</h4>
        <span class="text-xs font-semibold uppercase tracking-wide text-black dark:text-white">tương tác</span>
      </div>

      <div class="mb-4 flex flex-wrap items-end gap-3">
        <label class="flex flex-col gap-1 text-sm font-medium">
          Rộng (px)
          <input type="number" min="1" max="20000" class="w-28 rounded-md border border-gray-300 bg-white px-2 py-1 font-mono dark:border-gray-600 dark:bg-gray-900" [value]="width()" (input)="width.set(num($event))" />
        </label>
        <label class="flex flex-col gap-1 text-sm font-medium">
          Cao (px)
          <input type="number" min="1" max="20000" class="w-28 rounded-md border border-gray-300 bg-white px-2 py-1 font-mono dark:border-gray-600 dark:bg-gray-900" [value]="height()" (input)="height.set(num($event))" />
        </label>
        <label class="flex flex-col gap-1 text-sm font-medium">
          Chế độ
          <select class="rounded-md border border-gray-300 bg-white px-2 py-1 dark:border-gray-600 dark:bg-gray-900" (change)="hi.set($any($event.target).value === 'hi')">
            <option value="std" [selected]="!hi()">Chuẩn (tối đa 1.568 token)</option>
            <option value="hi" [selected]="hi()">Độ phân giải cao, Claude 4.7+ (tối đa 4.784)</option>
          </select>
        </label>
        <div class="flex flex-wrap gap-1.5">
          @for (p of presets; track p.label) {
            <button
              type="button"
              class="rounded-md border border-gray-300 px-2.5 py-1 text-sm hover:border-blue-600 hover:text-blue-600 dark:border-gray-600 dark:hover:border-blue-400 dark:hover:text-blue-400"
              (click)="preset(p.w, p.h)"
            >{{ p.label }}</button>
          }
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-4">
        <canvas #cv width="300" height="200" class="max-w-full rounded-md border border-gray-200 dark:border-gray-700" aria-label="Lưới ô 28 pixel phủ lên ảnh"></canvas>
        <dl class="m-0 grid min-w-[220px] flex-1 grid-cols-2 gap-3">
          <div><dt class="text-xs text-gray-500 dark:text-gray-400">Sau khi thu nhỏ</dt><dd class="m-0 font-mono text-lg font-semibold">{{ calc().W }}×{{ calc().H }}</dd></div>
          <div><dt class="text-xs text-gray-500 dark:text-gray-400">Số ô (ngang × dọc)</dt><dd class="m-0 font-mono text-lg font-semibold">{{ calc().cx }} × {{ calc().cy }}</dd></div>
          <div><dt class="text-xs text-gray-500 dark:text-gray-400">Token</dt><dd class="m-0 font-mono text-lg font-semibold">{{ tokensText() }}</dd></div>
          <div><dt class="text-xs text-gray-500 dark:text-gray-400">Chi phí đọc 1 ảnh (\${{ pricePerMtok() }}/MTok)</dt><dd class="m-0 font-mono text-lg font-semibold">{{ costText() }}</dd></div>
        </dl>
      </div>

      <p class="mb-0 mt-4 text-sm text-gray-600 dark:text-gray-400">
        Công thức: token = ⌈rộng/28⌉ × ⌈cao/28⌉, sau khi thu nhỏ cho vừa giới hạn. Ảnh cũng được gửi lại mỗi lượt như chữ, nên dán 10 screenshot vào một hội thoại dài là tốn rất nhanh.
      </p>
    </div>
  `,
})
export class ImageTokenWidgetComponent {
  readonly pricePerMtok = input(2, { transform: numberAttribute });

  readonly width = signal(1920);
  readonly height = signal(1080);
  readonly hi = signal(false);
  readonly dark = signal(false);

  readonly presets = [
    { label: 'Screenshot FHD', w: 1920, h: 1080 },
    { label: 'Ảnh iPhone', w: 1179, h: 2556 },
    { label: 'Avatar', w: 400, h: 400 },
  ];

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('cv');

  readonly calc = computed(() => {
    const w = Math.max(1, this.width() || 1);
    const h = Math.max(1, this.height() || 1);
    const hi = this.hi();
    const maxEdge = hi ? 2576 : 1568;
    const cap = hi ? 4784 : 1568;
    let s = Math.min(1, maxEdge / Math.max(w, h));
    const tiles = (sc: number) => Math.ceil((w * sc) / PATCH) * Math.ceil((h * sc) / PATCH);
    let guard = 0;
    while (tiles(s) > cap && guard < 2000) {
      s *= 0.997;
      guard++;
    }
    const W = Math.max(1, Math.round(w * s));
    const H = Math.max(1, Math.round(h * s));
    const cx = Math.ceil(W / PATCH);
    const cy = Math.ceil(H / PATCH);
    return { W, H, cx, cy, tok: cx * cy };
  });

  readonly tokensText = computed(() => Math.round(this.calc().tok).toLocaleString('vi-VN'));
  readonly costText = computed(() => '$' + ((this.calc().tok * this.pricePerMtok()) / 1e6).toFixed(4));

  constructor() {
    const root = document.documentElement;
    const sync = () => this.dark.set(root.classList.contains('dark'));
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(root, { attributes: true, attributeFilter: ['class'] });
    inject(DestroyRef).onDestroy(() => mo.disconnect());

    effect(() => this.draw(this.calc(), this.dark()));
  }

  num(e: Event): number {
    return +(e.target as HTMLInputElement).value;
  }

  preset(w: number, h: number) {
    this.width.set(w);
    this.height.set(h);
  }

  private draw(c: { W: number; H: number; cx: number; cy: number }, dark: boolean) {
    const cv = this.canvas().nativeElement;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const cw = cv.width;
    const ch = cv.height;
    ctx.clearRect(0, 0, cw, ch);
    const sc = Math.min((cw - 10) / c.W, (ch - 10) / c.H);
    const dw = c.W * sc;
    const dh = c.H * sc;
    const ox = (cw - dw) / 2;
    const oy = (ch - dh) / 2;
    ctx.fillStyle = dark ? '#374151' : '#e5e7eb'; // gray-700 / gray-200
    ctx.fillRect(ox, oy, dw, dh);
    ctx.strokeStyle = dark ? '#60a5fa' : '#2563eb'; // blue-400 / blue-600
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 0.6;
    const step = PATCH * sc;
    ctx.beginPath();
    for (let x = 0; x <= c.cx; x++) {
      const px = ox + Math.min(x * step, dw);
      ctx.moveTo(px, oy);
      ctx.lineTo(px, oy + dh);
    }
    for (let y = 0; y <= c.cy; y++) {
      const py = oy + Math.min(y * step, dh);
      ctx.moveTo(ox, py);
      ctx.lineTo(ox + dw, py);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}
