import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CartItem, AddToCartDto, UpdateCartDto } from '../models/cart.model';
import { LanguageService } from './language.service';

// Fallback UUID generator for browsers without crypto.randomUUID
function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private languageService = inject(LanguageService);
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

  // Add item to cart - uses POST api/Cart
  addToCart(productId: string, userId: string, quantity: number = 1): Observable<any> {
    const dto = {
      productId: productId,
      userId: userId,
      quantity: quantity
    };

    console.log('Adding to cart - POST api/Cart:', dto);

    return this.http.post<any>(this.apiUrl, dto).pipe(
      tap((response: any) => {
        console.log('Add to cart response:', response);
        
        // Backend returns CartItemResponse directly (not wrapped in data)
        const item = response || response?.data;
        
        if (item) {
          // Map backend response to frontend CartItem
          this.addItemWithDetails({
            id: item.id || generateUuid(),
            productId: item.productId || productId,
            userId: item.userId || userId,
            quantity: item.quantity || quantity,
            // Flatten Product properties
            productName: item.product?.name || item.productName || '',
            productPrice: item.product?.price || item.productPrice || 0,
            productImage: item.product?.image || item.productImage || ''
          });
        }
        
        // Open cart to show the added item
        this.open();
        this.saveToStorage();
      })
    );
  }

  // Update cart item - uses PUT api/Cart
  updateCartItem(id: string, productId: string, userId: string, quantity: number): Observable<any> {
    const dto = {
      id: id,
      productId: productId,
      userId: userId,
      quantity: quantity
    };

    console.log('Updating cart - PUT api/Cart:', dto);

    return this.http.put<any>(this.apiUrl, dto).pipe(
      tap(response => {
        console.log('Update cart response:', response);
        this._items.update(items =>
          items.map(item =>
            item.id === id ? { ...item, quantity } : item
          )
        );
        this.saveToStorage();
      })
    );
  }

  // Remove item from cart - uses DELETE api/Cart
  removeFromCart(cartItemId: string): Observable<any> {
    console.log('Removing from cart - DELETE api/Cart:', cartItemId);
    
    return this.http.delete<any>(`${this.apiUrl}?cartItemId=${cartItemId}`).pipe(
      tap(response => {
        console.log('Remove cart response:', response);
        this._items.update(items => items.filter(item => item.id !== cartItemId));
        this.saveToStorage();
      })
    );
  }

  // Remove item (local only, for immediate UI update)
  removeItem(productId: string): void {
    this._items.update(items => items.filter(item => item.productId !== productId));
    this.saveToStorage();
  }

  // Get cart items for user - uses GET api/Cart
  getCartItems(userId: string): Observable<any> {
    console.log('Getting cart - GET api/Cart:', userId);
    
    return this.http.get<any>(`${this.apiUrl}?userId=${userId}`).pipe(
      tap((response: any) => {
        console.log('Get cart response:', response);
        
        // Handle different response formats
        let rawItems: any[] = [];
        
        if (response?.data) {
          // Response has data wrapper
          rawItems = Array.isArray(response.data) ? response.data : [response.data];
        } else if (Array.isArray(response)) {
          // Response is directly an array
          rawItems = response;
        } else if (response?.items && Array.isArray(response.items)) {
          // Response has items wrapper
          rawItems = response.items;
        }
        
        // Map backend CartItemResponse to frontend CartItem (flatten Product object)
        const items = rawItems.map(item => ({
          id: item.id || undefined,
          productId: item.productId,
          userId: item.userId,
          quantity: item.quantity,
          // Flatten Product properties
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

  // Add item with product details (for immediate display)
  addItemWithDetails(item: CartItem): void {
    console.log('Adding item with details:', item);
    const existingItem = this._items().find(i => i.productId === item.productId);
    if (existingItem) {
      this._items.update(items =>
        items.map(i =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      );
    } else {
      this._items.update(items => [...items, item]);
    }
    console.log('Current cart items:', this._items());
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
  saveToStorage(): void {
    localStorage.setItem('cart', JSON.stringify(this._items()));
    console.log('Saved cart to storage:', this._items());
  }
}
