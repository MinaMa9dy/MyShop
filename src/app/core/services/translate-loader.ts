import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { Observable, from } from 'rxjs';

/**
 * Loads translations via static dynamic imports so they are bundled into
 * the JavaScript output rather than served as public static assets.
 * This prevents direct URL access to /assets/i18n/*.json.
 */
export class StaticTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<TranslationObject> {
    switch (lang) {
      case 'ar':
        return from(
          import('../../../assets/i18n/ar.json').then((m) => m as TranslationObject)
        );
      case 'en':
      default:
        return from(
          import('../../../assets/i18n/en.json').then((m) => m as TranslationObject)
        );
    }
  }
}
