import { Injectable, signal, effect } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { DOCUMENT } from '@angular/common';
import { Inject, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

export type Language = 'en' | 'ar';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private translate = inject(TranslateService);
  private doc = inject(DOCUMENT);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  currentLanguage = signal<Language>('en');
  
  constructor() {
    // Initialize translations
    this.translate.setDefaultLang('en');
    
    // Get language from URL or localStorage or default
    this.initLanguageFromUrl();
    
    // Listen for language changes
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.currentLanguage.set(event.lang as Language);
      this.updateDirection(event.lang as Language);
    });
  }
  
  private initLanguageFromUrl(): void {
    // Try to get language from URL
    const urlLang = this.getLanguageFromUrl();
    if (urlLang) {
      this.setLanguage(urlLang, false);
    } else {
      // Try localStorage or default
      const savedLang = localStorage.getItem('language') as Language;
      const lang = savedLang || 'en';
      this.setLanguage(lang, true);
    }
  }
  
  private getLanguageFromUrl(): Language | null {
    const urlSegments = this.router.url.split('/').filter(Boolean);
    const firstSegment = urlSegments[0];
    if (firstSegment === 'en' || firstSegment === 'ar') {
      return firstSegment;
    }
    return null;
  }
  
  setLanguage(lang: Language, navigate: boolean = true): void {
    this.translate.use(lang).subscribe(() => {
      this.currentLanguage.set(lang);
      this.updateDirection(lang);
      localStorage.setItem('language', lang);
      
      if (navigate) {
        this.navigateWithLanguage(lang);
      }
    });
  }
  
  private navigateWithLanguage(lang: Language): void {
    const currentUrl = this.router.url;
    const urlSegments = currentUrl.split('/').filter(Boolean);
    
    // Remove old language segment if present
    if (urlSegments[0] === 'en' || urlSegments[0] === 'ar') {
      urlSegments.shift();
    }
    
    // Add new language segment
    const newUrl = `/${lang}/${urlSegments.join('/')}`;
    this.router.navigateByUrl(newUrl);
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
  
  toggleLanguage(): void {
    const newLang = this.currentLanguage() === 'en' ? 'ar' : 'en';
    this.setLanguage(newLang);
  }
  
  getCurrentLanguage(): Language {
    return this.currentLanguage();
  }
  
  getDirection(): 'rtl' | 'ltr' {
    return this.currentLanguage() === 'ar' ? 'rtl' : 'ltr';
  }
  
  // Get the current URL without language prefix
  getCurrentPath(): string {
    const urlSegments = this.router.url.split('/').filter(Boolean);
    if (urlSegments[0] === 'en' || urlSegments[0] === 'ar') {
      urlSegments.shift();
    }
    return '/' + urlSegments.join('/');
  }
}
