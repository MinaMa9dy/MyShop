import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Wish, AddWishDto } from '../models/wish.model';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class WishService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private apiUrl = `${environment.apiUrl}/wish`;

  private getCurrentUserId(): string {
    const userId = this.tokenService.getUserId();
    return userId || '';
  }

  // Get all wishes for a user - uses GET api/Wish?userId={userId}
  getWishes(userId?: string): Observable<Wish[]> {
    const id = userId || this.getCurrentUserId();
    return this.http.get<Wish[]>(`${this.apiUrl}?userId=${id}`);
  }

  // Add a wish - uses POST api/Wish
  addWish(wish: AddWishDto): Observable<Wish> {
    return this.http.post<Wish>(this.apiUrl, wish);
  }

  // Remove a wish - uses DELETE api/Wish?userId={userId}&productId={productId}
  removeWish(userId: string, productId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}?userId=${userId}&productId=${productId}`);
  }
}
