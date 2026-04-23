import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category, AddCategoryDto, UpdateCategoryDto } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Categories`;

  // Cache the categories response — replayed to all subscribers with no extra HTTP call
  private categories$ = this.http.get<any>(this.apiUrl).pipe(
    map((response: any) => {
      let categories: any[] = [];
      if (Array.isArray(response)) {
        categories = response;
      } else if (response && Array.isArray(response.data)) {
        categories = response.data;
      } else if (response && response.items && Array.isArray(response.items)) {
        categories = response.items;
      }
      return categories as Category[];
    }),
    shareReplay(1)
  );

  getAll(): Observable<Category[]> {
    return this.categories$;
  }
  
  create(category: AddCategoryDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/AddCategory`, category);
  }
}
