import {
  AfterContentChecked,
  Directive,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  inject,
  isDevMode,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GLOSSARY } from '../data/glossary';

const MARGIN = 12;
const GAP = 8;
let tipCounter = 0;

/**
 * Hover dictionary. Put on a container of rendered markdown; any
 * `.term[data-term]` inside gets a floating tooltip from GLOSSARY.
 * Uses event delegation, so content re-rendered later keeps working.
 */
@Directive({
  selector: '[appGlossaryTooltip]',
  standalone: true,
})
export class GlossaryTooltipDirective implements AfterContentChecked, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly seen = new WeakSet<Element>();
  private tip: HTMLElement | null = null;
  private tipFor: HTMLElement | null = null;
  private lastPointer: string = 'mouse';
  private bound = false;
  private readonly tipId = `glossary-tip-${++tipCounter}`;

  ngAfterContentChecked(): void {
    if (!this.isBrowser) return;
    if (!this.bound) this.bind();
    this.scan();
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;
    this.hide();
    this.host.removeEventListener('mouseover', this.onOver);
    this.host.removeEventListener('mouseout', this.onOut);
    this.host.removeEventListener('focusin', this.onFocusIn);
    this.host.removeEventListener('focusout', this.onFocusOut);
    this.host.removeEventListener('pointerdown', this.onPointerDown);
    this.host.removeEventListener('click', this.onClick);
    document.removeEventListener('click', this.onDocClick);
    document.removeEventListener('keydown', this.onKey);
    window.removeEventListener('resize', this.hide);
    this.tip?.remove();
    this.tip = null;
  }

  private bind(): void {
    this.bound = true;
    this.host.addEventListener('mouseover', this.onOver);
    this.host.addEventListener('mouseout', this.onOut);
    this.host.addEventListener('focusin', this.onFocusIn);
    this.host.addEventListener('focusout', this.onFocusOut);
    this.host.addEventListener('pointerdown', this.onPointerDown);
    this.host.addEventListener('click', this.onClick);
    document.addEventListener('click', this.onDocClick);
    document.addEventListener('keydown', this.onKey);
    window.addEventListener('resize', this.hide);
  }

  /** Mark unknown terms and make known ones focusable. Runs once per element. */
  private scan(): void {
    this.host.querySelectorAll<HTMLElement>('.term[data-term]').forEach((el) => {
      if (this.seen.has(el)) return;
      this.seen.add(el);
      const id = el.dataset['term'] ?? '';
      if (!GLOSSARY[id]) {
        el.classList.add('term--unknown');
        el.removeAttribute('tabindex');
        if (isDevMode()) console.warn(`[glossary] unknown term "${id}"`);
        return;
      }
      if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
    });
  }

  private termOf(target: EventTarget | null): HTMLElement | null {
    const el = (target as Element | null)?.closest?.('.term[data-term]') as HTMLElement | null;
    return el && this.host.contains(el) && !el.classList.contains('term--unknown') ? el : null;
  }

  private readonly onOver = (e: MouseEvent) => {
    const t = this.termOf(e.target);
    if (t && t !== this.tipFor) this.show(t);
  };

  private readonly onOut = (e: MouseEvent) => {
    const t = this.termOf(e.target);
    if (!t || t.contains(e.relatedTarget as Node | null)) return;
    if (t === this.tipFor && document.activeElement !== t) this.hide();
  };

  private readonly onFocusIn = (e: FocusEvent) => {
    const t = this.termOf(e.target);
    if (t) this.show(t);
  };

  private readonly onFocusOut = (e: FocusEvent) => {
    if (this.termOf(e.target)) this.hide();
  };

  private readonly onPointerDown = (e: PointerEvent) => {
    this.lastPointer = e.pointerType;
  };

  private readonly onClick = (e: MouseEvent) => {
    const t = this.termOf(e.target);
    if (!t) return;
    // Mouse users already see it on hover; only touch/pen toggles on tap.
    if (this.lastPointer === 'mouse' && e.detail > 0) {
      if (this.tipFor !== t) this.show(t);
      return;
    }
    if (this.tipFor === t) this.hide();
    else this.show(t);
  };

  private readonly onDocClick = (e: MouseEvent) => {
    if (!this.tipFor) return;
    if (this.termOf(e.target) === this.tipFor || this.tip?.contains(e.target as Node)) return;
    this.hide();
  };

  private readonly onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this.hide();
  };

  private ensureTip(): HTMLElement {
    if (this.tip) return this.tip;
    const tip = document.createElement('div');
    tip.id = this.tipId;
    tip.className = 'glossary-tip';
    tip.setAttribute('role', 'tooltip');
    tip.hidden = true;
    document.body.appendChild(tip);
    return (this.tip = tip);
  }

  private show(term: HTMLElement): void {
    const entry = GLOSSARY[term.dataset['term'] ?? ''];
    if (!entry) return;
    this.clearDescribedBy();
    const tip = this.ensureTip();
    tip.replaceChildren();
    tip.classList.remove('is-visible');

    const title = document.createElement('strong');
    title.className = 'glossary-tip__title';
    title.textContent = entry.title;
    const def = document.createElement('p');
    def.className = 'glossary-tip__def';
    def.textContent = entry.definition;
    tip.append(title, def);
    if (entry.example) {
      const ex = document.createElement('p');
      ex.className = 'glossary-tip__example';
      ex.textContent = `Ví dụ: ${entry.example}`;
      tip.appendChild(ex);
    }

    tip.hidden = false;
    this.tipFor = term;
    term.setAttribute('aria-describedby', this.tipId);
    this.position(term, tip);
    requestAnimationFrame(() => {
      if (this.tipFor === term) tip.classList.add('is-visible');
    });
  }

  private position(term: HTMLElement, tip: HTMLElement): void {
    tip.style.left = '0px';
    tip.style.top = '0px';
    const r = term.getBoundingClientRect();
    const tw = tip.offsetWidth;
    const th = tip.offsetHeight;
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const left = Math.max(MARGIN, Math.min(vw - tw - MARGIN, r.left + r.width / 2 - tw / 2));
    let top = r.bottom + GAP;
    const flip = top + th > vh - MARGIN && r.top - th - GAP >= MARGIN;
    if (flip) top = r.top - th - GAP;
    tip.classList.toggle('is-above', flip);
    tip.style.left = `${left + window.scrollX}px`;
    tip.style.top = `${top + window.scrollY}px`;
  }

  private clearDescribedBy(): void {
    this.tipFor?.removeAttribute('aria-describedby');
  }

  private readonly hide = (): void => {
    this.clearDescribedBy();
    this.tipFor = null;
    if (this.tip) {
      this.tip.hidden = true;
      this.tip.classList.remove('is-visible');
    }
  };
}
