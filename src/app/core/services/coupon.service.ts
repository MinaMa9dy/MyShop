import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Coupon, 
  CreateCouponDto, 
  UpdateCouponDto, 
  UserCouponDto, 
  AssignCouponDto, 
  BulkAssignCouponDto, 
  BulkAssignResultDto, 
  CouponResponseDto 
} from '../models/coupon.model';
import { Product } from '../models/product.model';
import { Result } from '../models/result.model';

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Coupons`;

  // Admin Actions
  getAll(): Observable<Result<Coupon[]>> {
    return this.http.get<Result<Coupon[]>>(`${this.apiUrl}/GetAll`);
  }

  getActive(): Observable<Result<Coupon[]>> {
    return this.http.get<Result<Coupon[]>>(`${this.apiUrl}/Active`);
  }

  getById(id: string): Observable<Result<Coupon>> {
    return this.http.get<Result<Coupon>>(`${this.apiUrl}/${id}`);
  }

  getByCode(code: string): Observable<Result<Coupon>> {
    return this.http.get<Result<Coupon>>(`${this.apiUrl}/ByCode/${code}`);
  }

  create(coupon: CreateCouponDto): Observable<Result<Coupon>> {
    return this.http.post<Result<Coupon>>(`${this.apiUrl}/Create`, coupon);
  }

  update(id: string, coupon: UpdateCouponDto): Observable<Result<Coupon>> {
    return this.http.put<Result<Coupon>>(`${this.apiUrl}/Update/${id}`, coupon);
  }

  delete(id: string): Observable<Result<boolean>> {
    return this.http.delete<Result<boolean>>(`${this.apiUrl}/Delete/${id}`);
  }

  assignToUser(dto: AssignCouponDto): Observable<Result<boolean>> {
    return this.http.post<Result<boolean>>(`${this.apiUrl}/AssignToUser`, dto);
  }

  removeFromUser(couponId: string, userId: string): Observable<Result<boolean>> {
    return this.http.delete<Result<boolean>>(`${this.apiUrl}/RemoveFromUser/${couponId}/${userId}`);
  }

  bulkAssign(dto: BulkAssignCouponDto): Observable<Result<BulkAssignResultDto>> {
    return this.http.post<Result<BulkAssignResultDto>>(`${this.apiUrl}/BulkAssign`, dto);
  }

  getCouponUsers(couponId: string): Observable<Result<UserCouponDto[]>> {
    return this.http.get<Result<UserCouponDto[]>>(`${this.apiUrl}/Users/${couponId}`);
  }

  // User Actions
  getMyCoupons(): Observable<Result<UserCouponDto[]>> {
    return this.http.get<Result<UserCouponDto[]>>(`${this.apiUrl}/MyCoupons`);
  }

  validate(code: string): Observable<Result<CouponResponseDto>> {
    return this.http.post<Result<CouponResponseDto>>(`${this.apiUrl}/Validate/${code}`, {});
  }

  // Product Actions
  getAssignedProducts(couponId: string): Observable<Result<Product[]>> {
    return this.http.get<Result<Product[]>>(`${this.apiUrl}/GetAssignedProducts/${couponId}`);
  }

  assignProducts(couponId: string, productIds: string[]): Observable<Result<boolean>> {
    return this.http.post<Result<boolean>>(`${this.apiUrl}/AssignProducts/${couponId}`, productIds);
  }

  removeProducts(couponId: string, productIds: string[]): Observable<Result<boolean>> {
    return this.http.post<Result<boolean>>(`${this.apiUrl}/RemoveProducts/${couponId}`, productIds);
  }
}
