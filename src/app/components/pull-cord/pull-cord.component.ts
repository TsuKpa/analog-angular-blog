import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/** Physics feel knobs for the rope. Ported 1:1 from pullcord's config.ts. */
export interface PullCordConfig {
  /** Hang tension / fall speed. Up = taut + fast; down = floaty. */
  gravity: number;
  /** Fraction of speed kept each frame. Up = snappier retract + more swing. */
  damping: number;
  /** Constraint solver passes per frame. Up = stiff rope; down = loose/whippy. */
  iterations: number;
  /** How far the knob can be pulled past rest. Deeper pull = bigger fly-up. */
  stretchMax: number;
  /** Pull depth at which onPull fires; always kept below stretchMax. */
  stretchToggle: number;
  /** Caps release speed so a hard fling cannot launch the knob. */
  maxVelocity: number;
  /** Speed below which the rope stops simulating and rests. */
  sleepVelocity: number;
}

export const DEFAULT_CONFIG: PullCordConfig = {
  gravity: 1250,
  damping: 0.94,
  iterations: 20,
  stretchMax: 26,
  stretchToggle: 20,
  maxVelocity: 22,
  sleepVelocity: 0.15,
};

// Geometry (matches the original component).
const W = 64;
const ANCHOR_X = W / 2;
const REST_Y = 176;
const SVG_H = 340;
const SEGMENTS = 16;
const REST_SEG = REST_Y / SEGMENTS;
const KNOB_R = 6.5;
const HIT = 46;

interface Node {
  x: number;
  y: number;
  ox: number;
  oy: number;
  fixed: boolean;
}

function makeNodes(): Node[] {
  const arr: Node[] = [];
  for (let i = 0; i <= SEGMENTS; i++) {
    const y = REST_SEG * i;
    arr.push({ x: ANCHOR_X, y, ox: ANCHOR_X, oy: y, fixed: i === 0 });
  }
  return arr;
}

function buildPath(p: Node[]): string {
  let d = `M ${p[0].x.toFixed(1)} ${p[0].y.toFixed(1)}`;
  for (let i = 1; i < p.length - 1; i++) {
    const xc = (p[i].x + p[i + 1].x) / 2;
    const yc = (p[i].y + p[i + 1].y) / 2;
    d += ` Q ${p[i].x.toFixed(1)} ${p[i].y.toFixed(1)} ${xc.toFixed(1)} ${yc.toFixed(1)}`;
  }
  const n = p.length - 1;
  d += ` L ${p[n].x.toFixed(1)} ${p[n].y.toFixed(1)}`;
  return d;
}

const INITIAL_PATH = buildPath(makeNodes());

/**
 * A ceiling pull-cord with a real verlet-simulated rope, ported from the React
 * `pullcord` library (MIT). The physics is hand-rolled; the only framework
 * dependency in the original was Framer Motion's pan gesture, which we replace
 * with native Pointer Events here.
 *
 * `pull` (EventEmitter equivalent handled by @Input callback `onPull`) fires the
 * moment the pull crosses the detent depth — like a real pull-chain clicking
 * mid-pull — and on click / Enter / Space.
 */
@Component({
  selector: 'app-pull-cord',
  standalone: true,
  template: `
    <div #wrapper class="pullcord" [class]="className">
      <div
        #inner
        class="pullcord-inner"
        [class.pullcord-inner--drop]="drop"
        (animationend)="onDropEnd($event)"
      >
        <svg
          [attr.viewBox]="viewBox"
          [attr.width]="W"
          [attr.height]="SVG_H"
          aria-hidden="true"
          style="overflow: visible"
        >
          <defs>
            <linearGradient id="pc-knob" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#ffffff" />
              <stop offset="100%" stop-color="#e7e7ec" />
            </linearGradient>
            <filter id="pc-knob-sh" x="-70%" y="-70%" width="240%" height="240%">
              <feDropShadow dx="0" dy="1.4" stdDeviation="1.5" flood-color="rgba(0,0,0,0.32)" />
            </filter>
          </defs>
          <path
            #cord
            [attr.d]="INITIAL_PATH"
            stroke="var(--pullcord-ink, rgba(127, 127, 127, 0.45))"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none"
            vector-effect="non-scaling-stroke"
          />
          <g #group>
            <g filter="url(#pc-knob-sh)">
              <circle
                [attr.cx]="ANCHOR_X"
                [attr.cy]="REST_Y"
                [attr.r]="KNOB_R"
                fill="url(#pc-knob)"
                stroke="rgba(0,0,0,0.10)"
                stroke-width="0.5"
              />
            </g>
          </g>
        </svg>
        <button
          #knob
          type="button"
          class="pullcord-knob"
          [attr.aria-label]="ariaLabel"
          [attr.aria-pressed]="pulled"
          [attr.title]="ariaLabel"
          [style.left.px]="knobLeft"
          [style.top.px]="knobTop"
          [style.width.px]="HIT"
          [style.height.px]="HIT"
          (pointerdown)="onPointerDown($event)"
          (click)="onClick($event)"
          (keydown)="onKeyDown($event)"
        ></button>
      </div>
    </div>
  `,
  styleUrl: './pull-cord.component.scss',
})
export class PullCordComponent implements AfterViewInit, OnDestroy {
  /** Called once per pull, the moment the pull crosses the detent depth. */
  @Input() onPull?: () => void;
  /** Reflected as aria-pressed on the knob (e.g. true when the light is on). */
  @Input() pulled = false;
  /** Accessible name for the knob button. */
  @Input() ariaLabel = 'Pull the cord';
  /** Skip the drop-in entrance and start at rest. */
  @Input() set noEntrance(v: boolean) {
    this._noEntrance = v;
    this.drop = !v;
  }
  /** Partial physics overrides, merged over the defaults. */
  @Input() set config(v: Partial<PullCordConfig> | undefined) {
    this.cfg = { ...DEFAULT_CONFIG, ...(v ?? {}) };
  }
  /** Extra class on the fixed wrapper (position via --pullcord-* vars). */
  @Input() className = '';

  @ViewChild('wrapper') wrapperRef!: ElementRef<HTMLDivElement>;
  @ViewChild('cord') cordRef!: ElementRef<SVGPathElement>;
  @ViewChild('group') groupRef!: ElementRef<SVGGElement>;
  @ViewChild('inner') innerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('knob') knobRef!: ElementRef<HTMLButtonElement>;

  // Template-exposed constants.
  readonly W = W;
  readonly SVG_H = SVG_H;
  readonly ANCHOR_X = ANCHOR_X;
  readonly REST_Y = REST_Y;
  readonly KNOB_R = KNOB_R;
  readonly HIT = HIT;
  readonly INITIAL_PATH = INITIAL_PATH;
  readonly viewBox = `0 0 ${W} ${SVG_H}`;
  readonly knobLeft = ANCHOR_X - HIT / 2;
  readonly knobTop = REST_Y - HIT / 2;

  private readonly zone = inject(NgZone);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly reduce =
    this.isBrowser &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  private cfg: PullCordConfig = { ...DEFAULT_CONFIG };
  private _noEntrance = false;
  drop = true;

  private nodes = makeNodes();
  private dragging = false;
  private didDrag = false;
  private clicked = false;
  private target = { x: ANCHOR_X, y: REST_Y };

  // rAF loop state.
  private raf = 0;
  private running = false;
  private prevT = 0;
  private prevDt = 0;

  // Pointer drag tracking (Framer Motion's pan offset, done by hand).
  private pointerId = -1;
  private startX = 0;
  private startY = 0;
  private dropDone = false;
  private dropFallback = 0;

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    if (this._noEntrance) this.dropDone = true;

    this.render();
    // Fallback in case animationend never fires.
    if (!this._noEntrance) {
      this.dropFallback = window.setTimeout(() => this.endDrop(), 1700);
    }

    // Shorten the rope once the page is scrolled (see CSS .pullcord--scrolled).
    // Passive listener, out of Angular's zone; only writes a class.
    this.zone.runOutsideAngular(() => {
      this.onScroll();
      window.addEventListener('scroll', this.onScroll, { passive: true });
    });
  }

  ngOnDestroy(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this.dropFallback) clearTimeout(this.dropFallback);
    if (this.isBrowser) window.removeEventListener('scroll', this.onScroll);
  }

  private onScroll = (): void => {
    const scrolled = window.scrollY > 40;
    this.wrapperRef?.nativeElement.classList.toggle('pullcord--scrolled', scrolled);
  };

  // ── simulation ────────────────────────────────────────────────────────────

  private render = (): void => {
    const pts = this.nodes;
    const last = pts.length - 1;
    this.cordRef?.nativeElement.setAttribute('d', buildPath(pts));
    this.groupRef?.nativeElement.setAttribute(
      'transform',
      `translate(${(pts[last].x - ANCHOR_X).toFixed(2)} ${(pts[last].y - REST_Y).toFixed(2)})`,
    );
  };

  private step = (now: number): void => {
    const pts = this.nodes;
    const last = pts.length - 1;
    const { gravity, damping, iterations, sleepVelocity } = this.cfg;

    const dt = this.prevT
      ? Math.min(0.04, Math.max(0.004, (now - this.prevT) / 1000))
      : 1 / 60;
    this.prevT = now;
    const tc = this.prevDt > 0 ? dt / this.prevDt : 1;
    const velCoef = tc * Math.pow(damping, dt * 60);
    const accCoef = dt * dt;

    pts[last].fixed = this.dragging;

    // Verlet integration.
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i];
      if (p.fixed) continue;
      const vx = p.x - p.ox;
      const vy = p.y - p.oy;
      p.ox = p.x;
      p.oy = p.y;
      p.x += vx * velCoef;
      p.y += vy * velCoef + gravity * accCoef;
    }

    // Pin the anchor.
    pts[0].x = ANCHOR_X;
    pts[0].y = 0;

    if (this.dragging) {
      pts[last].ox = pts[last].x;
      pts[last].oy = pts[last].y;
      pts[last].x = this.target.x;
      pts[last].y = this.target.y;
    }

    // Distance-constraint solver.
    for (let k = 0; k < iterations; k++) {
      for (let i = 0; i < last; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 1e-4;
        const diff = ((REST_SEG - dist) / dist) * 0.5;
        const ox = dx * diff;
        const oy = dy * diff;
        if (!a.fixed) {
          a.x -= ox;
          a.y -= oy;
        }
        if (!b.fixed) {
          b.x += ox;
          b.y += oy;
        }
      }
    }

    this.prevDt = dt;
    this.render();

    // Sleep when settled.
    let speed = 0;
    for (let i = 1; i < pts.length; i++) {
      speed += Math.abs(pts[i].x - pts[i].ox) + Math.abs(pts[i].y - pts[i].oy);
    }
    if (!this.dragging && speed < sleepVelocity * dt * 60) {
      this.render();
      this.running = false;
      return;
    }
    this.raf = requestAnimationFrame(this.step);
  };

  private wake(): void {
    if (this.running) return;
    this.running = true;
    this.prevT = 0;
    this.prevDt = 0;
    // Keep the rAF loop out of Angular's zone — it's pure DOM writes via refs.
    this.zone.runOutsideAngular(() => {
      this.raf = requestAnimationFrame(this.step);
    });
  }

  // ── interaction ───────────────────────────────────────────────────────────

  private doToggle(): void {
    this.onPull?.();
  }

  private scriptedPull(): void {
    this.doToggle();
    if (this.reduce) return;
    const pts = this.nodes;
    pts[pts.length - 1].oy -= 22;
    this.wake();
  }

  onPointerDown(e: PointerEvent): void {
    if (this.reduce) return;
    // Only left button / touch / pen.
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    this.pointerId = e.pointerId;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.dragging = true;
    this.didDrag = true;
    this.clicked = false;
    this.knobRef.nativeElement.setPointerCapture(e.pointerId);

    // Bind move/up outside Angular; they only write refs.
    this.zone.runOutsideAngular(() => {
      this.knobRef.nativeElement.addEventListener('pointermove', this.onPointerMove);
      this.knobRef.nativeElement.addEventListener('pointerup', this.onPointerUp);
      this.knobRef.nativeElement.addEventListener('pointercancel', this.onPointerUp);
    });
    this.wake();
  }

  private onPointerMove = (e: PointerEvent): void => {
    if (!this.dragging || e.pointerId !== this.pointerId) return;
    const { stretchMax, stretchToggle } = this.cfg;
    // Framer Motion's info.offset == delta since pan start.
    const rx = e.clientX - this.startX;
    const ry = REST_Y + (e.clientY - this.startY);
    const dist = Math.hypot(rx, ry) || 1e-4;
    const maxD = REST_Y + stretchMax;
    const k = dist > maxD ? maxD / dist : 1;
    this.target = { x: ANCHOR_X + rx * k, y: ry * k };

    const clickAt = Math.min(stretchToggle, stretchMax - 1);
    if (!this.clicked && dist - REST_Y >= clickAt) {
      this.clicked = true;
      // Toggle touches app state — run inside Angular.
      this.zone.run(() => this.doToggle());
    }
  };

  private onPointerUp = (e: PointerEvent): void => {
    if (e.pointerId !== this.pointerId) return;
    const { maxVelocity } = this.cfg;
    this.dragging = false;
    this.pointerId = -1;
    this.knobRef.nativeElement.removeEventListener('pointermove', this.onPointerMove);
    this.knobRef.nativeElement.removeEventListener('pointerup', this.onPointerUp);
    this.knobRef.nativeElement.removeEventListener('pointercancel', this.onPointerUp);

    const pts = this.nodes;
    const p = pts[pts.length - 1];
    const vx = p.x - p.ox;
    const vy = p.y - p.oy;
    const v = Math.hypot(vx, vy);
    if (v > maxVelocity) {
      const k = maxVelocity / v;
      p.ox = p.x - vx * k;
      p.oy = p.y - vy * k;
    }
    this.wake();
    requestAnimationFrame(() => {
      this.didDrag = false;
    });
  };

  onClick(e: MouseEvent): void {
    if (this.didDrag) return;
    // detail === 0 means a synthetic/keyboard-driven click; ignore (keydown handles it).
    if (e.detail === 0) return;
    this.scriptedPull();
  }

  onKeyDown(e: KeyboardEvent): void {
    if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
      e.preventDefault();
      this.scriptedPull();
    }
  }

  // ── entrance ──────────────────────────────────────────────────────────────

  private endDrop(): void {
    if (this.dropDone) return;
    this.dropDone = true;
    this.zone.run(() => (this.drop = false));
    if (this.dropFallback) {
      clearTimeout(this.dropFallback);
      this.dropFallback = 0;
    }
    if (this.reduce) return;
    const pts = this.nodes;
    // Hand the fall's momentum to the physics for one continuous settle.
    pts[pts.length - 1].oy -= 13;
    pts[pts.length - 1].ox -= 6;
    this.wake();
  }

  onDropEnd(e: AnimationEvent): void {
    if (e.animationName !== 'pullcord-drop') return;
    this.endDrop();
  }
}
