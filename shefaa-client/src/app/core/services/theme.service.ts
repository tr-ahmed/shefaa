import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private readonly STORAGE_KEY = 'shefaa-theme';

  isDark = signal(false);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;

    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      this.isDark.set(saved === 'dark');
    } else {
      this.isDark.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }

    this.apply(this.isDark());

    effect(() => {
      const dark = this.isDark();
      this.apply(dark);
      localStorage.setItem(this.STORAGE_KEY, dark ? 'dark' : 'light');
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(this.STORAGE_KEY)) {
        this.isDark.set(e.matches);
      }
    });
  }

  toggle(): void {
    this.isDark.update(v => !v);
  }

  private apply(dark: boolean): void {
    const html = document.documentElement;
    if (dark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }
}
