import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type Language = 'en' | 'ar';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly STORAGE_KEY = 'shefaa.lang';
  currentLang = signal<Language>(this.detectInitial());

  constructor(private translate: TranslateService) {
    this.translate.addLangs(['en', 'ar']);
    this.translate.setDefaultLang('ar');
    this.apply(this.currentLang());
  }

  private detectInitial(): Language {
    const saved = localStorage.getItem(this.STORAGE_KEY) as Language | null;
    if (saved === 'en' || saved === 'ar') return saved;
    // Default to Arabic as primary application language when no saved preference
    return 'ar';
  }

  setLanguage(lang: Language) {
    this.currentLang.set(lang);
    localStorage.setItem(this.STORAGE_KEY, lang);
    this.apply(lang);
  }

  toggle() {
    this.setLanguage(this.currentLang() === 'en' ? 'ar' : 'en');
  }

  private apply(lang: Language) {
    this.translate.use(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }
}