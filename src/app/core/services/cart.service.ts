import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CartItem } from '../models/cart.model';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private apiUrl = `${environment.apiUrl}/Cart`;

  // State using Signals
  private _items = signal<CartItem[]>([]);
  private _isOpen = signal<boolean>(false);

  // Public signals
  items = this._items.asReadonly();
  isOpen = this._isOpen.asReadonly();

  // Computed values
  totalItems = computed(() => this._items().reduce((sum, item) => sum + item.quantity, 0));
  totalPrice = computed(() => this._items().reduce((sum, item) => sum + (item.productPrice || 0) * item.quantity, 0));

  // Toggle cart sidebar
  toggle(): void {
    this._isOpen.update(v => !v);
  }

  open(): void {
    this._isOpen.set(true);
  }

  close(): void {
    this._isOpen.set(false);
  }

  // Get userId from JWT token
  private getCurrentUserId(): string {
    const userId = this.tokenService.getUserId();
    return userId || '';
  }

  // Check if item exists in cart
  private findItem(productId: string): CartItem | undefined {
    return this._items().find(i => i.productId === productId);
  }

  // Add item to cart - uses POST api/Cart
  addToCart(productId: string, quantity: number = 1): Observable<any> {
    const userId = this.getCurrentUserId();
    
    const dto = {
      productId: productId,
      userId: userId,
      quantity: quantity
    };

    console.log('Adding to cart - POST api/Cart:', dto);

    return this.http.post<any>(this.apiUrl, dto).pipe(
      tap((response: any) => {
        console.log('Add to cart response:', response);
        
        const item = response || response?.data;
        
        if (item) {
          // Always increase quantity locally if item exists
          const existingItem = this.findItem(productId);
          if (existingItem) {
            this._items.update(items =>
              items.map(i =>
                i.productId === productId
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              )
            );
          } else {
            // Add new item
            this._items.update(items => [...items, {
              productId: item.productId || productId,
              userId: item.userId || userId,
              quantity: item.quantity || quantity,
              productName: item.product?.name || item.productName || '',
              productPrice: item.product?.price || item.productPrice || 0,
              productImage: item.product?.image || item.productImage || ''
            }]);
          }
        }
        
        this.open();
        this.saveToStorage();
      })
    );
  }

  // Remove item from cart - uses DELETE api/Cart (body instead of query params)
  removeFromCart(productId: string, quantityToRemove: number = 0): Observable<any> {
    const userId = this.getCurrentUserId();
    
    const dto = {
      productId: productId,
      userId: userId,
      quantity: quantityToRemove
    };

    console.log('Removing from cart - DELETE api/Cart:', dto);
    
    return this.http.delete<any>(this.apiUrl, { body: dto }).pipe(
      tap((response: any) => {
        console.log('Remove cart response:', response);
        
        // Check if the backend operation was successful
        const isSuccess = response?.isSuccess || response?.data !== undefined;
        
        if (isSuccess && response?.data) {
          const updatedItem = response.data;
          
          // If quantity returned is 0 or null, remove the item completely
          if (!updatedItem.quantity || updatedItem.quantity === 0) {
            this._items.update(items => items.filter(item => item.productId !== productId));
            console.log('Item completely removed from cart');
          } else {
            // Update the quantity based on backend response
            this._items.update(items =>
              items.map(item =>
                item.productId === productId
                  ? { ...item, quantity: updatedItem.quantity }
                  : item
              )
            );
            console.log('Item quantity updated to:', updatedItem.quantity);
          }
          this.saveToStorage();
        } else if (!isSuccess) {
          console.error('Failed to remove item from cart:', response?.error || response);
        }
      })
    );
  }

  // Remove item (local only, for immediate UI update)
  removeItem(productId: string): void {
    this._items.update(items => items.filter(item => item.productId !== productId));
    this.saveToStorage();
  }

  // Get cart items for user - uses GET api/Cart
  getCartItems(): Observable<any> {
    const userId = this.getCurrentUserId();
    console.log('Getting cart - GET api/Cart for userId:', userId);
    
    return this.http.get<any>(`${this.apiUrl}?userId=${userId}`).pipe(
      tap((response: any) => {
        console.log('Get cart response:', response);
        
        let rawItems: any[] = [];
        
        if (response?.data) {
          rawItems = Array.isArray(response.data) ? response.data : [response.data];
        } else if (Array.isArray(response)) {
          rawItems = response;
        } else if (response?.items && Array.isArray(response.items)) {
          rawItems = response.items;
        }
        
        const items = rawItems.map(item => ({
          productId: item.productId,
          userId: item.userId || userId,
          quantity: item.quantity,
          productName: item.product?.name || item.productName || '',
          productPrice: item.product?.price || item.productPrice || 0,
          productImage: item.product?.image || item.productImage || ''
        }));
        
        console.log('Mapped cart items:', items);
        this._items.set(items);
        this.saveToStorage();
      })
    );
  }

  // Clear cart (local only)
  clear(): void {
    this._items.set([]);
    localStorage.removeItem('cart');
  }

  // Sync cart from local storage (for guest users)
  loadFromStorage(): void {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        const items = JSON.parse(saved);
        console.log('Loaded cart from storage:', items);
        this._items.set(items);
      } catch (e) {
        console.error('Error loading cart from storage:', e);
      }
    }
  }

  // Save cart to local storage
  private saveToStorage(): void {
    localStorage.setItem('cart', JSON.stringify(this._items()));
  }
}
