import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader, MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { CustomTranslateLoader } from './core/services/translate-loader';
import { CurrencyPipe, DatePipe, registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localeAr from '@angular/common/locales/ar';

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

export function HttpLoaderFactory(http: HttpClient) {
  return new CustomTranslateLoader(http);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    importProvidersFrom(
      TranslateModule.forRoot({
        fallbackLang: 'en',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        },
        missingTranslationHandler: {
          provide: MissingTranslationHandler,
          useClass: CustomMissingTranslationHandler
        }
      })
    )
  ]
};
