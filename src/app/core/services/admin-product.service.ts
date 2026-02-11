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
  private apiUrl = `${environment.apiUrl}/products`;

  // Add a new product - uses POST api/Product/AddProduct
  addProduct(product: AddProductDto): Observable<any> {
    console.log('Adding product - POST api/Product/AddProduct:', product);
    
    return this.http.post(`${this.apiUrl}/AddProduct`, product);
  }
}
