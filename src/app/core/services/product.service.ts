import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Product, 
  AddProductDto, 
  UpdateProductDto, 
  ProductFilter,
  ProductResponse 
} from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Products`;
  
  getAll(pageNumber: number = 1, pageSize: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('PageNumber', pageNumber.toString())
      .set('PageSize', pageSize.toString())
      .set('Includes', 'ProductPhotos');
      
    return this.http.get<any>(this.apiUrl, { params });
  }
  
  getById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`, {
      params: { Includes: 'ProductPhotos' }
    });
  }
  
  getFiltered(filter: ProductFilter): Observable<any> {
    let params = new HttpParams()
      .set('PageNumber', (filter.page || 1).toString())
      .set('PageSize', (filter.pageSize || 10).toString());
    
    if (filter.categoryId) {
      params = params.set('CategoryId', filter.categoryId);
    }
    if (filter.minPrice) {
      params = params.set('MinPrice', filter.minPrice.toString());
    }
    if (filter.maxPrice) {
      params = params.set('MaxPrice', filter.maxPrice.toString());
    }
    if (filter.searchTerm) {
      params = params.set('SearchTerm', filter.searchTerm);
    }
    if (filter.isOnSale !== undefined && filter.isOnSale !== null) {
      params = params.set('IsOnSale', filter.isOnSale.toString());
    }
    if (filter.sortBy) {
      params = params.set('SortBy', filter.sortBy);
    }
    if (filter.sortOrder) {
      params = params.set('SortOrder', filter.sortOrder);
    }
    
    return this.http.get<any>(this.apiUrl, { params });
  }
  
  create(product: AddProductDto): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }
  
  update(product: UpdateProductDto): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${product.id}`, product);
  }
  
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
  getHotestProducts(numberOfProducts: number = 8): Observable<any> {
    let params = new HttpParams()
      .set('numberOfProducts', numberOfProducts.toString())
      .set('Includes', 'ProductPhotos');
    
    return this.http.get<any>(`${this.apiUrl}/GetHotestProducts`, { params });
  }
}
