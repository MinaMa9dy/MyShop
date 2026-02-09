import { Injectable, signal } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export type Language = 'en' | 'ar';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private translate = inject(TranslateService);
  private doc = inject(DOCUMENT);
  private router = inject(Router);
  
  currentLanguage = signal<Language>('en');
  private initialized = false;
  
  constructor() {
    // Initialize translations with default language
    this.translate.setDefaultLang('en');
    
    // Load initial translations for English
    this.translate.use('en').subscribe({
      next: () => {
        console.log('Initial translations loaded for English');
        this.currentLanguage.set('en');
        this.updateDirection('en');
      },
      error: (error) => {
        console.error('Error loading English translations:', error);
      }
    });
    
    // Listen for language changes
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      console.log('onLangChange - new lang:', event.lang);
      this.currentLanguage.set(event.lang as Language);
      this.updateDirection(event.lang as Language);
    });
    
    // Listen to router events to detect language from URL
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      console.log('NavigationEnd event:', event.urlAfterRedirects);
      this.detectLanguageFromUrl(event.urlAfterRedirects);
    });
  }
  
  private detectLanguageFromUrl(url: string): void {
    console.log('detectLanguageFromUrl - URL:', url, 'currentLanguage:', this.currentLanguage(), 'initialized:', this.initialized);
    const urlSegments = url.split('/').filter(Boolean);
    const firstSegment = urlSegments[0];
    
    if (firstSegment === 'en' || firstSegment === 'ar') {
      console.log('detectLanguageFromUrl - Found language in URL:', firstSegment);
      this.setLanguage(firstSegment as Language, false);
    } else if (!this.initialized) {
      // No language in URL and not initialized yet - use localStorage or default
      const savedLang = localStorage.getItem('language') as Language;
      const lang = savedLang || 'ar';
      console.log('detectLanguageFromUrl - No language in URL, using saved/default:', lang);
      this.setLanguage(lang, true);
      this.initialized = true;
    }
  }
  
  setLanguage(lang: Language, navigate: boolean = true): void {
    console.log('setLanguage called - lang:', lang, 'navigate:', navigate, 'currentLanguage:', this.currentLanguage());
    
    // Don't re-navigate if language is already set and navigate is false
    if (!navigate && this.currentLanguage() === lang) {
      console.log('setLanguage - Language already set, skipping');
      return;
    }
    
    this.translate.use(lang).subscribe(() => {
      console.log('translate.use completed - lang:', lang);
      this.currentLanguage.set(lang);
      this.updateDirection(lang);
      localStorage.setItem('language', lang);
      this.initialized = true;
      
      if (navigate) {
        this.navigateWithLanguage(lang);
      }
    });
  }
  
  private navigateWithLanguage(lang: Language): void {
    const currentUrl = this.router.url;
    console.log('navigateWithLanguage - currentUrl:', currentUrl, 'new lang:', lang);
    const urlSegments = currentUrl.split('/').filter(Boolean);
    console.log('navigateWithLanguage - urlSegments:', urlSegments);
    
    // Remove old language segment if present
    if (urlSegments[0] === 'en' || urlSegments[0] === 'ar') {
      urlSegments.shift();
    }
    
    console.log('navigateWithLanguage - urlSegments after shift:', urlSegments);
    
    // Add new language segment
    const path = urlSegments.join('/');
    const newUrl = path ? `/${lang}/${path}` : `/${lang}`;
    console.log('navigateWithLanguage - newUrl:', newUrl);
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
