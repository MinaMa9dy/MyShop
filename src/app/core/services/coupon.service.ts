import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Coupon, CreateCouponDto, UpdateCouponDto } from '../models/coupon.model';
import { GetProductDto } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Coupon`;

  getAll(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(`${this.apiUrl}/GetAll`);
  }

  getById(id: string): Observable<Coupon> {
    return this.http.get<Coupon>(`${this.apiUrl}/${id}`);
  }

  create(coupon: CreateCouponDto): Observable<Coupon> {
    return this.http.post<Coupon>(`${this.apiUrl}/Create`, coupon);
  }

  update(id: string, coupon: UpdateCouponDto): Observable<Coupon> {
    return this.http.put<Coupon>(`${this.apiUrl}/Update/${id}`, coupon);
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Delete/${id}`);
  }

  getAssignedProducts(couponCode: string): Observable<GetProductDto[]> {
    return this.http.get<GetProductDto[]>(`${this.apiUrl}/GetAssignedProducts/${couponCode}`);
  }

  assignProducts(couponCode: string, productIds: string[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/AssignProducts/${couponCode}`, productIds);
  }

  removeProducts(couponCode: string, productIds: string[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/RemoveProducts/${couponCode}`, productIds);
  }

  applyCoupon(couponCode: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Apply/${couponCode}`, {});
  }
}
