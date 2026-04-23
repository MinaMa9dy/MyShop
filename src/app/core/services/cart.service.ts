import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CartItem } from '../models/cart.model';
import { TokenService } from './token.service';
import { CouponResponse, Coupon } from '../models/coupon.models';

// Helper function to get main photo URL from product
function getProductMainPhoto(product: any): string {
  if (!product) return 'assets/images/placeholder.svg';
  
  // Support both 'product' and 'productDto' nested objects
  const p = product.productDto || product;
  
  if (!p || !p.productPhotos || !Array.isArray(p.productPhotos) || p.productPhotos.length === 0) {
    return 'assets/images/placeholder.svg';
  }
  const mainPhoto = p.productPhotos.find((photo: any) => photo.isMain);
  if (mainPhoto && mainPhoto.fileName) {
    return `${environment.apiUrl}/Photo/ProductPhoto/${mainPhoto.fileName}`;
  }
  return 'assets/images/placeholder.svg';
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private cartsUrl = `${environment.apiUrl}/Carts`;
  private cartItemsUrl = `${environment.apiUrl}/CartItems`;

  // State using Signals
  private _items = signal<CartItem[]>([]);
  private _isOpen = signal<boolean>(false);
  private _appliedCoupon = signal<CouponResponse | null>(null);

  // Public signals
  items = this._items.asReadonly();
  isOpen = this._isOpen.asReadonly();
  appliedCoupon = this._appliedCoupon.asReadonly();

  // Computed values
  totalItems = computed(() => this._items().reduce((sum, item) => sum + item.quantity, 0));
  
  // Original Total (before any discounts)
  originalTotalPrice = computed(() => this._items().reduce((sum, item) => sum + (item.productPrice || 0) * item.quantity, 0));

  // The Final Deal Price Calculation
  totalPrice = computed(() => {
    const couponData = this._appliedCoupon();
    if (couponData && couponData.finalSubtotal !== undefined) {
      return couponData.finalSubtotal;
    }
    return this.originalTotalPrice();
  });

  getItemDiscountedValue(item: CartItem): number {
    const original = item.productPrice || 0;
    const couponData = this._appliedCoupon();
    
    if (!couponData || !couponData.itemPrices) return original;

    // Use pre-calculated value from backend mapping
    // We handle both Guid and string keys since JSON serialization might vary
    const price = couponData.itemPrices[item.productId];
    return price !== undefined ? price : original;
  }

  // Exported so UI knows exactly how much was saved
  discountAmount = computed(() => {
    const couponData = this._appliedCoupon();
    return couponData ? (couponData.totalDiscount || 0) : 0;
  });

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

  // Set the active coupon (called from Component after API validation)
  setCoupon(couponResult: CouponResponse): void {
    this._appliedCoupon.set(couponResult);
    this.saveToStorage();
  }

  // Remove the active coupon
  clearCoupon(): void {
    this._appliedCoupon.set(null);
    this.saveToStorage();
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
  addToCart(productId: string, quantity: number = 1, productData?: any): Observable<any> {
    const customerId = this.getCurrentUserId();
    const previousItems = [...this._items()];
    
    // Perform optimistic update
    const existingItem = this.findItem(productId);
    if (existingItem) {
      this._items.update(items =>
        items.map(i =>
          i.productId === productId
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      );
    } else if (productData) {
      this._items.update(items => [...items, {
        productId: productId,
        customerId: customerId,
        quantity: quantity,
        productName: productData.name || productData.productName || '',
        productPrice: productData.newPrice || productData.price || productData.productPrice || 0,
        productImage: productData.productImage || (productData.productPhotos ? getProductMainPhoto(productData) : '')
      }]);
    } else {
      this._items.update(items => [...items, {
        productId: productId,
        customerId: customerId,
        quantity: quantity,
        productName: '...',
        productPrice: 0
      }]);
    }
    
    this.saveToStorage();
    this.open();

    const dto = {
      productId: productId,
      quantity: quantity
    };

    return this.http.post<any>(this.cartItemsUrl, dto).pipe(
      tap((response: any) => {
        const item = response || response?.data;
        if (item) {
          this._items.update(items =>
            items.map(i =>
              i.productId === productId
                ? {
                    ...i,
                    productName: item.productDto?.name || item.product?.name || item.productName || i.productName,
                    productPrice: item.productDto?.newPrice || item.product?.newPrice || item.productDto?.price || item.product?.price || item.productPrice || i.productPrice,
                    productImage: getProductMainPhoto(item.productDto || item.product) || item.productImage || i.productImage,
                    quantity: item.quantity || i.quantity
                  }
                : i
            )
          );
          this.saveToStorage();
        }
      }),
      catchError(error => {
        console.error('Optimistic Add to Cart failed, rolling back:', error);
        this._items.set(previousItems);
        this.saveToStorage();
        return throwError(() => error);
      })
    );
  }

  // Update item quantity - uses PUT api/CartItems
  updateQuantity(productId: string, quantity: number): Observable<any> {
    const customerId = this.getCurrentUserId();
    const previousItems = [...this._items()];
    
    // Perform optimistic update
    this._items.update(items =>
      items.map(i =>
        i.productId === productId
          ? { ...i, quantity: quantity }
          : i
      )
    );
    this.saveToStorage();

    const dto = {
      productId: productId,
      quantity: quantity
    };

    return this.http.put<any>(this.cartItemsUrl, dto).pipe(
      tap((response: any) => {
        const item = response || response?.data;
        if (item) {
          this._items.update(items =>
            items.map(i =>
              i.productId === productId
                ? {
                    ...i,
                    quantity: item.quantity || i.quantity
                  }
                : i
            )
          );
          this.saveToStorage();
        }
      }),
      catchError(error => {
        console.error('Update Quantity failed, rolling back:', error);
        this._items.set(previousItems);
        this.saveToStorage();
        return throwError(() => error);
      })
    );
  }

  // Remove item from cart - uses DELETE api/Cart (body instead of query params)
  removeFromCart(productId: string, quantityToRemove: number = 0): Observable<any> {
    const customerId = this.getCurrentUserId();
    const previousItems = [...this._items()];
    
    // Perform optimistic update
    const existingItem = this.findItem(productId);
    if (existingItem) {
      if (quantityToRemove === 0 || existingItem.quantity <= quantityToRemove) {
        this._items.update(items => items.filter(item => item.productId !== productId));
      } else {
        this._items.update(items =>
          items.map(item =>
            item.productId === productId
              ? { ...item, quantity: item.quantity - quantityToRemove }
              : item
          )
        );
      }
      this.saveToStorage();
    }

    return this.http.delete<any>(`${this.cartItemsUrl}?cartItemId=${productId}`).pipe(
      tap((response: any) => {
        const isSuccess = response?.isSuccess || response?.data !== undefined;
        if (isSuccess && response?.data) {
          const updatedItem = response.data;
          if (!updatedItem.quantity || updatedItem.quantity === 0) {
            this._items.update(items => items.filter(item => item.productId !== productId));
          } else {
            this._items.update(items =>
              items.map(item =>
                item.productId === productId
                  ? { ...item, quantity: updatedItem.quantity }
                  : item
              )
            );
          }
          this.saveToStorage();
        }
      }),
      catchError(error => {
        console.error('Optimistic Remove from Cart failed, rolling back:', error);
        this._items.set(previousItems);
        this.saveToStorage();
        return throwError(() => error);
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
    const customerId = this.getCurrentUserId();
    if (!customerId) {
      console.log('CartService - No customerId found, returning empty cart.');
      this._items.set([]);
      return throwError(() => new Error('No customer ID'));
    }
    
    console.log('Getting cart - GET api/Carts/my-cart');
    
    return this.http.get<any>(`${this.cartsUrl}/my-cart`).pipe(
      tap((response: any) => {
        console.log('Get cart response:', response);
        
        let rawItems: any[] = [];
        
        if (response?.data) {
          if (response.data.items && Array.isArray(response.data.items)) {
            rawItems = response.data.items;
          } else {
            rawItems = Array.isArray(response.data) ? response.data : [response.data];
          }
        } else if (response?.items && Array.isArray(response.items)) {
          rawItems = response.items;
        } else if (Array.isArray(response)) {
          rawItems = response;
        }
        
        console.log('Raw cart items:', rawItems);
        
        const items = rawItems.map(item => {
          const product = item.productDto || item.product;
          return {
            productId: item.productId,
            customerId: item.customerId || customerId,
            quantity: item.quantity,
            productName: product?.name || item.productName || '',
            productPrice: product?.newPrice || product?.price || item.productPrice || 0,
            productImage: getProductMainPhoto(product) || item.productImage || ''
          };
        });
        
        console.log('Mapped cart items with prices and photos:', items);
        this._items.set(items);
        this.saveToStorage();
      }),
      catchError((error: any) => {
        // Handle 401 Unauthorized gracefully for unauthenticated users
        if (error.status === 401) {
          console.log('CartService - 401 received, user is not authenticated. Keeping local cart data.');
          // Don't update cart items - keep the local cart data
          // This allows unauthenticated users to keep their local cart
          return throwError(() => error);
        }
        
        // For other errors, log and re-throw
        console.error('CartService - Error fetching cart:', error);
        return throwError(() => error);
      })
    );
  }

  // Clear cart (local only)
  clear(): void {
    const customerId = this.getCurrentUserId();
    if (customerId) {
      this.http.delete(`${this.cartsUrl}/clear`).subscribe();
    }
    this._items.set([]);
    localStorage.removeItem('cart');
  }

  // Sync cart from local storage (for guest users)
  loadFromStorage(): void {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Supports legacy carts array directly, or new object with {items, coupon}
        if (Array.isArray(parsed)) {
          console.log('Loaded cart items from storage:', parsed);
          this._items.set(parsed);
        } else if (parsed && parsed.items) {
          console.log('Loaded cart data from storage:', parsed);
          this._items.set(parsed.items);
          if (parsed.coupon) {
            this._appliedCoupon.set(parsed.coupon);
          }
        }
      } catch (e) {
        console.error('Error loading cart from storage:', e);
      }
    }
  }

  // Save cart to local storage
  private saveToStorage(): void {
    const dataToSave = {
      items: this._items(),
      coupon: this._appliedCoupon()
    };
    localStorage.setItem('cart', JSON.stringify(dataToSave));
  }
}
