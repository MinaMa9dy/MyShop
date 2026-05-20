import { Injectable, signal } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';

export type Language = 'en' | 'ar';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private translate = inject(TranslateService);
  private doc = inject(DOCUMENT);

  // Initialise from localStorage so the signal has the right value immediately
  currentLanguage = signal<Language>(
    (localStorage.getItem('language') as Language) || 'ar'
  );

  constructor() {
    // Sync signal whenever ngx-translate changes language
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.currentLanguage.set(event.lang as Language);
      this.updateDirection(event.lang as Language);
    });

    // Apply direction for the initial language (before the first onLangChange)
    this.updateDirection(this.currentLanguage());
  }

  setLanguage(lang: Language): void {
    if (this.currentLanguage() === lang) return;

    this.translate.use(lang).subscribe(() => {
      this.currentLanguage.set(lang);
      this.updateDirection(lang);
      localStorage.setItem('language', lang);
    });
  }

  toggleLanguage(): void {
    this.setLanguage(this.currentLanguage() === 'en' ? 'ar' : 'en');
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage();
  }

  getDirection(): 'rtl' | 'ltr' {
    return this.currentLanguage() === 'ar' ? 'rtl' : 'ltr';
  }

  private updateDirection(lang: Language): void {
    if (lang === 'ar') {
      this.doc.documentElement.dir = 'rtl';
      this.doc.documentElement.lang = 'ar';
    } else {
      this.doc.documentElement.dir = 'ltr';
      this.doc.documentElement.lang = 'en';
    }
  }
}
