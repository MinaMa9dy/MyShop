import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CartItem, CartItemCreateDto, CartItemUpdateDto } from '../models/cart.model';
import { TokenService } from './token.service';
import { CouponResponseDto, Coupon } from '../models/coupon.model';
import { CouponService } from './coupon.service';
import { PhotoService } from './photo.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private couponService = inject(CouponService);
  private photoService = inject(PhotoService);
  private cartsUrl = `${environment.apiUrl}/Carts`;
  private cartItemsUrl = `${environment.apiUrl}/CartItems`;

  // Helper function to get main photo URL from product/variant (Legacy support)
  private getProductMainPhoto(data: any): string {
    if (!data) return 'assets/images/placeholder.svg';
    
    // If it's already a PhotoUrl from the new DTO
    if (data.photoUrl) return this.photoService.getPhotoUrl(data.photoUrl);

    // Legacy mapping logic
    const variant = data.productVariant || data.productDto || data.ProductDto;
    const product = variant?.product || variant?.productDto || data.product || data;
    
    const photos = product.productPhotos || product.ProductPhotos || product.productphotos;
    
    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return 'assets/images/placeholder.svg';
    }
    
    const mainPhoto = photos.find((photo: any) => photo.isMain || photo.IsMain) || photos[0];
    const fileName = mainPhoto.url || mainPhoto.Url || mainPhoto.fileName || mainPhoto.FileName;
    
    return this.photoService.getPhotoUrl(fileName);
  }

  // Helper to format variant attributes into a display string
  private formatVariantDetails(variant: any): string {
    if (!variant) return '';
    const attrs = variant.attributes || variant.Attributes || [];
    if (attrs.length === 0) return '';
    
    return attrs
      .map((a: any) => `${a.attributeName || a.AttributeName}: ${a.value || a.Value}`)
      .join(', ');
  }

  // State using Signals
  private _items = signal<CartItem[]>([]);
  private _isOpen = signal<boolean>(false);
  private _appliedCoupon = signal<CouponResponseDto | null>(null);

  // Public signals
  items = this._items.asReadonly();
  isOpen = this._isOpen.asReadonly();
  appliedCoupon = this._appliedCoupon.asReadonly();

  // Computed values
  total = computed(() => this._items().reduce((sum, item) => sum + item.quantity, 0));
  originalTotalPrice = computed(() => this._items().reduce((sum, item) => sum + (item.productPrice || 0) * item.quantity, 0));

  totalPrice = computed(() => {
    const couponData = this._appliedCoupon();
    if (couponData && couponData.finalSubtotal !== undefined) {
      return couponData.finalSubtotal;
    }
    return this.originalTotalPrice();
  });

  // Saving calculations
  discountAmount = computed(() => {
    const couponData = this._appliedCoupon();
    return couponData ? (couponData.totalDiscount || 0) : 0;
  });

  // State Management
  toggle(): void { this._isOpen.update(v => !v); }
  open(): void { this._isOpen.set(true); }
  close(): void { this._isOpen.set(false); }

  setCoupon(couponResult: CouponResponseDto): void {
    this._appliedCoupon.set(couponResult);
    this.saveToStorage();
  }

  clearCoupon(): void {
    this._appliedCoupon.set(null);
    this.saveToStorage();
  }

  private getCurrentUserId(): string {
    return this.tokenService.getUserId() || '';
  }

  private findItem(variantId: string): CartItem | undefined {
    return this._items().find(i => i.productVariantId === variantId);
  }

  // --- AUTO VALIDATION ---

  private validationTimeout: any;

  private autoValidateCoupon(): void {
    const currentCoupon = this._appliedCoupon();
    if (!currentCoupon) return;

    // Debounce to prevent rapid multiple calls (e.g. clicking + quantity button fast)
    if (this.validationTimeout) clearTimeout(this.validationTimeout);
    
    this.validationTimeout = setTimeout(() => {
      this.couponService.validate(currentCoupon.coupon.code).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.setCoupon(res.data);
          } else {
            // Coupon no longer valid for this cart state
            this.clearCoupon();
          }
        },
        error: () => this.clearCoupon()
      });
    }, 500); // 500ms debounce
  }

  // --- CORE CART OPERATIONS ---

  addToCart(variantId: string, quantity: number = 1, productData?: any): Observable<any> {
    const customerId = this.getCurrentUserId();
    const previousItems = [...this._items()];
    
    // Optimistic Update
    const existingItem = this.findItem(variantId);
    if (existingItem) {
      this._items.update(items =>
        items.map(i => i.productVariantId === variantId ? { ...i, quantity: i.quantity + quantity } : i)
      );
    } else {
      this._items.update(items => [...items, {
        productVariantId: variantId,
        customerId: customerId,
        quantity: quantity,
        productName: productData?.name || productData?.productName || '...',
        sku: productData?.sku || productData?.SKU || '',
        price: productData?.newPrice || productData?.price || 0,
        photoUrl: productData?.photoUrl || '',
        productPrice: productData?.newPrice || productData?.price || 0,
        productImage: this.getProductMainPhoto(productData),
        variantDetails: productData?.variantDetails || this.formatVariantDetails(productData)
      }]);
    }
    
    this.saveToStorage();
    this.open();
    this.autoValidateCoupon();

    const dto: CartItemCreateDto = { productVariantId: variantId, quantity };

    return this.http.post<any>(this.cartItemsUrl, dto).pipe(
      tap((response: any) => {
        const item = response?.data || response;
        if (item) {
          this.syncItemWithResponse(variantId, item);
          // Real sync might have changed subtotals, re-validate
          this.autoValidateCoupon();
        }
      }),
      catchError(error => {
        this._items.set(previousItems);
        this.saveToStorage();
        this.autoValidateCoupon();
        return throwError(() => error);
      })
    );
  }

  updateQuantity(variantId: string, quantity: number): Observable<any> {
    const previousItems = [...this._items()];
    
    this._items.update(items =>
      items.map(i => i.productVariantId === variantId ? { ...i, quantity } : i)
    );
    this.saveToStorage();
    this.autoValidateCoupon();

    const dto: CartItemUpdateDto = { productVariantId: variantId, quantity };

    return this.http.put<any>(this.cartItemsUrl, dto).pipe(
      tap((response: any) => {
        const item = response?.data || response;
        if (item) {
          this.syncItemWithResponse(variantId, item);
          this.autoValidateCoupon();
        }
      }),
      catchError(error => {
        this._items.set(previousItems);
        this.saveToStorage();
        this.autoValidateCoupon();
        return throwError(() => error);
      })
    );
  }

  removeFromCart(variantId: string): Observable<any> {
    const previousItems = [...this._items()];
    this._items.update(items => items.filter(i => i.productVariantId !== variantId));
    this.saveToStorage();
    this.autoValidateCoupon();

    return this.http.delete<any>(`${this.cartItemsUrl}?cartItemId=${variantId}`).pipe(
      catchError(error => {
        this._items.set(previousItems);
        this.saveToStorage();
        this.autoValidateCoupon();
        return throwError(() => error);
      })
    );
  }

  getCartItems(): Observable<any> {
    const customerId = this.getCurrentUserId();
    if (!customerId) {
      this._items.set([]);
      return throwError(() => new Error('No user logged in'));
    }
    
    return this.http.get<any>(`${this.cartsUrl}/my-cart`).pipe(
      tap((response: any) => {
        // Robust response parsing: handle Result<CartDto> or Result<CartItem[]> or raw array
        const data = response?.data || response;
        let rawItems = [];
        
        if (Array.isArray(data)) {
          rawItems = data;
        } else if (data && Array.isArray(data.items)) {
          rawItems = data.items;
        } else if (data && Array.isArray(data.cartItems)) {
          rawItems = data.cartItems;
        } else if (response && Array.isArray(response.items)) {
          rawItems = response.items;
        }

        const items = rawItems.map((item: any) => this.mapResponseToCartItem(item));
        this._items.set(items);
        this.saveToStorage();
        this.autoValidateCoupon();
      })
    );
  }

  private mapResponseToCartItem(item: any): CartItem {
    // Handle nested variant/product objects often found in complex backend DTOs
    const v = item.productVariant || item.ProductVariant || item.variant || item.Variant || {};
    const p = v.product || v.Product || item.product || item.Product || {};
    
    // Support multiple naming conventions and deep nesting
    const variantId = item.productVariantId || item.ProductVariantId || v.id || v.Id || item.variantId || item.VariantId;
    const price = item.price || item.Price || item.unitPrice || item.UnitPrice || v.price || v.Price || v.newPrice || v.NewPrice || 0;
    const photo = item.photoUrl || item.PhotoUrl || v.photoUrl || v.PhotoUrl || p.mainPhotoUrl || p.photoUrl || item.imageUrl || '';
    const name = item.productName || item.ProductName || p.name || p.Name || item.name || item.Name || 'Unknown Product';
    const quantity = item.quantity || item.Quantity || 0;
    
    return {
      productVariantId: variantId,
      productName: name,
      sku: item.sku || item.SKU || v.sku || v.SKU || '',
      price: price,
      photoUrl: photo,
      quantity: quantity,
      
      // Aliases for compatibility with existing UI components
      productPrice: price,
      productImage: photo ? this.photoService.getPhotoUrl(photo) : 'assets/images/placeholder.svg',
      variantDetails: item.variantDetails || item.VariantDetails || this.formatVariantDetails(v) || (item.sku || item.SKU ? `SKU: ${item.sku || item.SKU}` : '')
    };
  }

  private syncItemWithResponse(variantId: string, item: any): void {
    const mapped = this.mapResponseToCartItem(item);
    this._items.update(items =>
      items.map(i => i.productVariantId === variantId ? { ...i, ...mapped } : i)
    );
    this.saveToStorage();
  }

  getItemDiscountedValue(item: CartItem): number {
    const original = item.productPrice || 0;
    const couponData = this._appliedCoupon();
    
    if (!couponData || !couponData.itemPrices) return original;

    // Use variant ID for price lookup if it exists in the coupon response
    const price = couponData.itemPrices[item.productVariantId];
    return price !== undefined ? price : original;
  }

  // --- STORAGE & SYNC ---

  loadFromStorage(): void {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this._items.set(parsed.items || []);
        if (parsed.coupon) {
          this._appliedCoupon.set(parsed.coupon);
          this.autoValidateCoupon();
        }
      } catch (e) {
        console.error('Error loading cart from storage:', e);
      }
    }
  }

  private saveToStorage(): void {
    localStorage.setItem('cart', JSON.stringify({
      items: this._items(),
      coupon: this._appliedCoupon()
    }));
  }

  clear(): void {
    if (this.getCurrentUserId()) {
      this.http.delete(`${this.cartsUrl}/clear`).subscribe();
    }
    this._items.set([]);
    localStorage.removeItem('cart');
  }
}

