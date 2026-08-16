import { Injectable, PLATFORM_ID, effect, inject, signal } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

/**
 * Signal-based light/dark theme store.
 *
 * Toggles a `dark` class on <html> (see the `dark` custom-variant wired up in
 * styles.css) and persists the user's explicit choice to localStorage. When
 * nothing is stored we follow the OS `prefers-color-scheme`, and keep tracking
 * it live until the user makes a choice.
 *
 * SSR-safe: on the server every browser API is guarded, so the store simply
 * resolves to 'light' and applies nothing.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /** Whether the current theme came from an explicit user choice. */
  private explicit = false;

  readonly theme = signal<Theme>(this.initialTheme());

  constructor() {
    // Reflect the current theme onto <html> whenever it changes.
    effect(() => this.apply(this.theme()));

    if (this.isBrowser) {
      // Follow the OS until the user makes an explicit choice.
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      media.addEventListener('change', (e) => {
        if (!this.explicit) this.theme.set(e.matches ? 'dark' : 'light');
      });
    }
  }

  toggle(): void {
    this.set(this.theme() === 'dark' ? 'light' : 'dark');
  }

  set(theme: Theme): void {
    this.explicit = true;
    this.theme.set(theme);
    // Apply synchronously too: the effect flushes on the next CD tick, which
    // lags a mid-drag pull. Writing the class now makes the toggle instant.
    this.apply(theme);
    if (this.isBrowser) {
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch {
        /* storage may be unavailable (private mode) — non-fatal */
      }
    }
  }

  private initialTheme(): Theme {
    if (!this.isBrowser) return 'light';

    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    if (stored === 'light' || stored === 'dark') {
      this.explicit = true;
      return stored;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  private apply(theme: Theme): void {
    if (!this.isBrowser) return;
    const root = this.document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
  }
}
