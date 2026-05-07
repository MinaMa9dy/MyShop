import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Wish, WishDto } from '../models/wish.model';
import { TokenService } from './token.service';
import { Result } from '../models/result.model';

@Injectable({
  providedIn: 'root'
})
export class WishService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private apiUrl = `${environment.apiUrl}/WishList`;

  // State
  private _items = signal<Wish[]>([]);
  items = this._items.asReadonly();
  count = computed(() => this._items().length);

  private getCurrentUserId(): string {
    const userId = this.tokenService.getUserId();
    return userId || '';
  }

  // Get all wishes for current user
  getWishes(): Observable<Result<Wish[]>> {
    return this.http.get<Result<Wish[]>>(this.apiUrl).pipe(
      tap(res => {
        if (res.success && res.data) {
          this._items.set(res.data);
        }
      })
    );
  }

  // Add a wish
  addWish(wish: WishDto): Observable<Result<Wish>> {
    return this.http.post<Result<Wish>>(this.apiUrl, wish).pipe(
      tap(res => {
        if (res.success && res.data) {
          this._items.update(items => [...items, res.data!]);
        }
      })
    );
  }

  // Remove a wish
  removeWish(productId: string): Observable<Result<boolean>> {
    return this.http.delete<Result<boolean>>(`${this.apiUrl}/${productId}`).pipe(
      tap(res => {
        if (res.success) {
          this._items.update(items => items.filter(i => i.productId !== productId));
        }
      })
    );
  }
}
