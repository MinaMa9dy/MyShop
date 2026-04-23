import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AddProductDto } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class AdminProductService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Products`;

  // Add a new product - uses POST api/Products
  addProduct(product: AddProductDto): Observable<any> {
    const formData = new FormData();
    for (const key in product) {
      if ((product as any)[key] !== null && (product as any)[key] !== undefined) {
        if (key === 'Photos' && Array.isArray(product.Photos)) {
          product.Photos.forEach(file => formData.append('Photos', file, file.name));
        } else {
          formData.append(key, (product as any)[key]);
        }
      }
    }
    return this.http.post(this.apiUrl, formData);
  }
}
