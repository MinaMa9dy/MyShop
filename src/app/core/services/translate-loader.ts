import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export class CustomTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<TranslationObject> {
    // Use absolute path from root
    const translationPath = `/assets/i18n/${lang}.json`;
    console.log(`Loading translations from: ${translationPath}`);
    
    return this.http.get<TranslationObject>(translationPath).pipe(
      map((translations) => {
        console.log(`Translations loaded successfully for language: ${lang}`);
        console.log(`Available cart translations:`, translations['cart']);
        return translations;
      }),
      catchError((error) => {
        console.error(`Error loading translations for language: ${lang}`, error);
        console.error(`Translation path: ${translationPath}`);
        // Return empty object to prevent app crash
        return of({});
      })
    );
  }
}
