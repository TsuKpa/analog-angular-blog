import {
  AfterContentChecked,
  ApplicationRef,
  ComponentRef,
  Directive,
  ElementRef,
  EnvironmentInjector,
  OnDestroy,
  PLATFORM_ID,
  createComponent,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { WIDGET_REGISTRY } from '../components/widgets/widget-registry';

/**
 * Mounts Angular widgets into raw-HTML placeholders rendered from markdown:
 *   <div data-widget="temperature" data-prompt="..."></div>
 *   <div class="chips" data-chips="V|ì|·sao" data-chip-ids="53|24076|48301"></div>
 * Browser-only; the placeholder's inner HTML stays as the SSR/no-JS fallback.
 */
@Directive({
  selector: '[appMarkdownWidgets]',
  standalone: true,
})
export class MarkdownWidgetsDirective implements AfterContentChecked, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(EnvironmentInjector);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly seen = new WeakSet<Element>();
  private readonly refs: ComponentRef<unknown>[] = [];

  ngAfterContentChecked() {
    if (!this.isBrowser) return;

    this.host.querySelectorAll<HTMLElement>('[data-widget]').forEach((el) => {
      if (this.seen.has(el)) return;
      this.seen.add(el);
      this.mountWidget(el);
    });

    this.host.querySelectorAll<HTMLElement>('[data-chips]:not([data-widget])').forEach((el) => {
      if (this.seen.has(el)) return;
      this.seen.add(el);
      this.renderChips(el);
    });
  }

  ngOnDestroy() {
    this.refs.forEach((ref) => ref.destroy());
    this.refs.length = 0;
  }

  private mountWidget(el: HTMLElement) {
    const name = el.dataset['widget'] ?? '';
    const type = WIDGET_REGISTRY[name];
    if (!type) {
      console.warn(`[appMarkdownWidgets] unknown widget "${name}"`);
      return;
    }

    const ref = createComponent(type, { environmentInjector: this.injector, hostElement: el });
    for (const [key, value] of Object.entries(el.dataset)) {
      if (key === 'widget' || value === undefined) continue;
      try {
        ref.setInput(key, value);
      } catch {
        console.warn(`[appMarkdownWidgets] widget "${name}" has no input "${key}"`);
      }
    }
    this.appRef.attachView(ref.hostView);
    ref.changeDetectorRef.detectChanges();
    this.refs.push(ref);
  }

  private renderChips(el: HTMLElement) {
    const parts = (el.dataset['chips'] ?? '').split('|');
    const ids = el.dataset['chipIds']?.split('|');
    el.textContent = '';
    parts.forEach((p, i) => {
      const chip = document.createElement('span');
      chip.className = 'chip';
      const b = document.createElement('b');
      b.textContent = p.replace(/·/g, ' ');
      chip.appendChild(b);
      if (ids?.[i]) {
        const id = document.createElement('i');
        id.textContent = ids[i];
        chip.appendChild(id);
      }
      el.appendChild(chip);
    });
  }
}
