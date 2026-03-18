import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Result } from '../models/result.model';
import { CouponResponse } from '../models/coupon.models';

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Coupon`;

  // Apply a coupon during checkout
  applyCoupon(couponCode: string): Observable<CouponResponse> {
    return this.http.post<CouponResponse>(`${this.apiUrl}/Apply/${couponCode}`, {});
  }
}
