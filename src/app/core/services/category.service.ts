import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category, AddCategoryDto, UpdateCategoryDto } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/category`;
  
  getAll(): Observable<Category[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((response: any) => {
        let categories: any[] = [];
        if (Array.isArray(response)) {
          categories = response;
        } else if (response && Array.isArray(response.data)) {
          categories = response.data;
        } else if (response && response.items && Array.isArray(response.items)) {
          categories = response.items;
        }
        return categories;
      })
    );
  }
  
  getById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }
  
  getTree(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/tree`);
  }
  
  create(category: AddCategoryDto): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category);
  }
  
  update(category: UpdateCategoryDto): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${category.id}`, category);
  }
  
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
