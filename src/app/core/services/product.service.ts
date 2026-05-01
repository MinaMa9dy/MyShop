import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Result, PageResult } from '../models/result.model';
import { 
  Product, 
  AddProductDto, 
  UpdateProductDto, 
  ProductFilter,
  ProductPhoto,
  ProductVariant,
  AddProductVariantDto
} from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Products`;
  
  // Core CRUD
  getAll(filter: ProductFilter = {}): Observable<Result<PageResult<Product>>> {
    let params = new HttpParams();
    
    if (filter.pageNumber) params = params.set('PageNumber', filter.pageNumber.toString());
    if (filter.pageSize) params = params.set('PageSize', filter.pageSize.toString());
    if (filter.searchTerm) params = params.set('SearchTerm', filter.searchTerm);
    if (filter.categoryId) params = params.set('CategoryId', filter.categoryId);
    if (filter.minPrice) params = params.set('MinPrice', filter.minPrice.toString());
    if (filter.maxPrice) params = params.set('MaxPrice', filter.maxPrice.toString());
    if (filter.haveSale !== undefined) params = params.set('HaveSale', filter.haveSale.toString());
    if (filter.isFasting !== undefined) params = params.set('IsFasting', filter.isFasting.toString());
      
    return this.http.get<Result<PageResult<Product>>>(this.apiUrl, { params });
  }
  
  getById(id: string): Observable<Result<Product>> {
    return this.http.get<Result<Product>>(`${this.apiUrl}/${id}`);
  }
  
  getHotProducts(n: number = 8): Observable<Result<PageResult<Product>>> {
    let params = new HttpParams().set('numberOfProducts', n.toString());
    return this.http.get<Result<PageResult<Product>>>(`${this.apiUrl}/hot`, { params });
  }

  getProductsBySeller(sellerId: string, filter: ProductFilter = {}): Observable<Result<PageResult<Product>>> {
    let params = new HttpParams();
    if (filter.pageNumber) params = params.set('PageNumber', filter.pageNumber.toString());
    if (filter.pageSize) params = params.set('PageSize', filter.pageSize.toString());
    if (filter.searchTerm) params = params.set('SearchTerm', filter.searchTerm);
    if (filter.categoryId) params = params.set('CategoryId', filter.categoryId);

    return this.http.get<Result<PageResult<Product>>>(`${this.apiUrl}/seller/${sellerId}`, { params });
  }
  
  create(product: AddProductDto): Observable<Result<Product>> {
    const formData = this.toFormData(product);
    return this.http.post<Result<Product>>(this.apiUrl, formData);
  }
  
  update(id: string, product: UpdateProductDto): Observable<Result<Product>> {
    const formData = this.toFormData(product);
    return this.http.put<Result<Product>>(`${this.apiUrl}/${id}`, formData);
  }

  delete(id: string): Observable<Result<boolean>> {
    return this.http.delete<Result<boolean>>(`${this.apiUrl}/${id}`);
  }

  // Photo Management
  uploadPhotos(productId: string, files: File[]): Observable<Result<ProductPhoto[]>> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file, file.name));
    return this.http.post<Result<ProductPhoto[]>>(`${this.apiUrl}/${productId}/photos`, formData);
  }

  deletePhoto(productId: string, photoId: string): Observable<Result<boolean>> {
    return this.http.delete<Result<boolean>>(`${this.apiUrl}/${productId}/photos/${photoId}`);
  }

  setMainPhoto(productId: string, photoId: string): Observable<Result<ProductPhoto>> {
    return this.http.patch<Result<ProductPhoto>>(`${this.apiUrl}/${productId}/photos/${photoId}/set-main`, {});
  }

  // Variant Management
  addVariant(productId: string, variant: AddProductVariantDto): Observable<Result<ProductVariant>> {
    return this.http.post<Result<ProductVariant>>(`${this.apiUrl}/${productId}/variants`, variant);
  }

  updateVariant(productId: string, variantId: string, variant: AddProductVariantDto): Observable<Result<ProductVariant>> {
    return this.http.put<Result<ProductVariant>>(`${this.apiUrl}/${productId}/variants/${variantId}`, variant);
  }

  deleteVariant(productId: string, variantId: string): Observable<Result<boolean>> {
    return this.http.delete<Result<boolean>>(`${this.apiUrl}/${productId}/variants/${variantId}`);
  }

  
  getCities(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/Cities`);
  }

  private toFormData(obj: any): FormData {
    const formData = new FormData();
    for (const key in obj) {
      if (obj[key] === null || obj[key] === undefined) continue;
      
      if (Array.isArray(obj[key])) {
        obj[key].forEach((item: any) => {
          if (item instanceof File) {
            formData.append(key, item, item.name);
          } else if (typeof item === 'object') {
            formData.append(key, JSON.stringify(item));
          } else {
            formData.append(key, item);
          }
        });
      } else if (obj[key] instanceof File) {
        formData.append(key, obj[key], obj[key].name);
      } else {
        formData.append(key, obj[key]);
      }
    }
    return formData;
  }
}
