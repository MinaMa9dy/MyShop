import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withComponentInputBinding, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TranslateModule, TranslateLoader, TranslateService, MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { StaticTranslateLoader } from './core/services/translate-loader';
import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localeAr from '@angular/common/locales/ar';
import { firstValueFrom } from 'rxjs';

// Custom missing translation handler for debugging
class CustomMissingTranslationHandler implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams): string {
    console.warn(`Missing translation key: "${params.key}"`);
    // Return the key with CART prefix if it's a cart-related translation
    if (params.key.startsWith('CART.')) {
      const cartKey = params.key.replace('CART.', '');
      return cartKey.replace(/_/g, ' ');
    }
    return params.key;
  }
}

// Register locale data for Egyptian Pound (EGP) currency formatting
registerLocaleData(localeEn, 'en-EG');
registerLocaleData(localeAr, 'ar-EG');

export function createTranslateLoader() {
  return new StaticTranslateLoader();
}

/** Preload translations before the app renders to avoid missing-key warnings */
export function initTranslations(translate: TranslateService) {
  return () => {
    const savedLang = (localStorage.getItem('language') as 'en' | 'ar') || 'ar';
    translate.setDefaultLang('en');
    return firstValueFrom(translate.use(savedLang));
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding(), withPreloading(PreloadAllModules)),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader
        },
        missingTranslationHandler: {
          provide: MissingTranslationHandler,
          useClass: CustomMissingTranslationHandler
        }
      })
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: initTranslations,
      deps: [TranslateService],
      multi: true
    }
  ]
};
