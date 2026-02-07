import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { CustomTranslateLoader } from './core/services/translate-loader';
import { CurrencyPipe, DatePipe, registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localeAr from '@angular/common/locales/ar';

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
        defaultLanguage: 'en',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      })
    )
  ]
};
