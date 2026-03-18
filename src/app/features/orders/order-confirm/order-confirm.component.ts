import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { OrderService } from '../../../core/services/order.service';
import { CartService } from '../../../core/services/cart.service';
import { LanguageService } from '../../../core/services/language.service';
import { TokenService } from '../../../core/services/token.service';
import { PhotoService } from '../../../core/services/photo.service';
import { CouponService } from '../../../core/services/coupon.service';
import { CouponResponse } from '../../../core/models/coupon.models';
import { extractErrorMessage } from '../../../core/models/result.model';
import { AddOrderDto, CityOption, CITIES } from '../../../core/models/order.model';

@Component({
  selector: 'app-order-confirm',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule],
  template: `
    <div class="order-confirm-page min-h-screen bg-gray-50 py-8">
      <div class="max-w-4xl mx-auto px-4">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">{{ 'orderConfirm.title' | translate }}</h1>
          <p class="text-gray-500">{{ 'orderConfirm.subtitle' | translate }}</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Shipping Form -->
          <div class="card bg-white rounded-xl shadow-sm p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">{{ 'orderConfirm.shippingInfo' | translate }}</h2>
            
            <form (ngSubmit)="placeOrder()">
              <!-- City Selection -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ 'orderConfirm.city' | translate }}</label>
                <select 
                  [(ngModel)]="selectedCity" 
                  name="city" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required>
                  <option value="" disabled>{{ 'orderConfirm.selectCity' | translate }}</option>
                  @for (city of cities; track city) {
                    <option [value]="city">{{ city }}</option>
                  }
                </select>
              </div>

              <!-- Street Address -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ 'orderConfirm.street' | translate }}</label>
                <input 
                  type="text" 
                  [(ngModel)]="street" 
                  name="street" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  [placeholder]="'orderConfirm.streetPlaceholder' | translate"
                  required>
              </div>

              <!-- Phone Number -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ 'orderConfirm.phoneNumber' | translate }}</label>
                <input 
                  type="tel" 
                  [(ngModel)]="phoneNumber" 
                  name="phoneNumber" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  [placeholder]="'orderConfirm.phoneNumberPlaceholder' | translate"
                  required>
              </div>

              <!-- Comment -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ 'orderConfirm.comment' | translate }}</label>
                <textarea 
                  [(ngModel)]="comment" 
                  name="comment" 
                  rows="3" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  [placeholder]="'orderConfirm.commentPlaceholder' | translate">
                </textarea>
              </div>

              <!-- Error Message -->
              @if (error()) {
                <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p class="text-red-600 text-sm">{{ error() }}</p>
                </div>
              }

              <!-- Submit Button -->
              <button 
                type="submit" 
                [disabled]="!isFormValid() || submitting()"
                class="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                @if (submitting()) {
                  <span class="flex items-center justify-center gap-2">
                    <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    {{ 'orderConfirm.placingOrder' | translate }}
                  </span>
                } @else {
                  {{ 'orderConfirm.confirmOrder' | translate }}
                }
              </button>
            </form>
          </div>

          <!-- Order Summary -->
          <div class="card bg-white rounded-xl shadow-sm p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">{{ 'orderConfirm.orderSummary' | translate }}</h2>

            @if (cartItems().length === 0) {
              <div class="text-center py-8">
                <div class="text-5xl mb-4">🛒</div>
                <p class="text-gray-500">{{ 'cart.emptyCart' | translate }}</p>
                <a 
                  [routerLink]="'/' + getCurrentLang() + '/products'" 
                  class="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {{ 'home.shopNow' | translate }}
                </a>
              </div>
            } @else {
              <!-- Cart Items -->
              <div class="space-y-4 mb-6 max-h-80 overflow-y-auto">
                @for (item of cartItems(); track item.productId) {
                  <div class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <!-- Product Image -->
                    <div class="w-14 h-14 bg-white rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                      @if (item.productImage) {
                        <img 
                          [src]="photoService.getPhotoUrlFromPath(item.productImage)" 
                          [alt]="item.productName"
                          class="w-full h-full object-cover"
                          (error)="handleImageError($event)">
                      } @else {
                        <span class="text-2xl">📦</span>
                      }
                    </div>
                    
                    <!-- Product Info -->
                    <div class="flex-1 min-w-0">
                      <h4 class="font-medium text-gray-800 truncate text-sm">{{ item.productName }}</h4>
                      <p class="text-sm text-gray-500">
                        <del *ngIf="isItemDiscounted(item.productId) && getItemDiscountedPrice(item) < (item.productPrice || 0)" class="text-xs mr-1 opacity-70">
                          {{ item.productPrice | currency:'EGP':'symbol':'1.2-2':'en-EG' }}
                        </del>
                        <span [class.text-green-600]="isItemDiscounted(item.productId)">
                          {{ getItemDiscountedPrice(item) | currency:'EGP':'symbol':'1.2-2':'en-EG' }}
                        </span>
                        × {{ item.quantity }}
                      </p>
                    </div>
                    
                    <!-- Item Total -->
                    <div class="text-right">
                      <span class="font-bold text-gray-800">{{ getItemSubtotal(item) | currency:'EGP':'symbol':'1.2-2':'en-EG' }}</span>
                    </div>
                  </div>
                }
              </div>

              <!-- Coupon Section -->
              <div class="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <label class="block text-sm font-semibold text-blue-800 mb-2">Have a coupon?</label>
                
                @if (appliedCoupon()) {
                  <div class="flex items-center justify-between bg-white p-2 px-3 rounded-lg border border-blue-200">
                    <div class="flex items-center gap-2">
                      <span class="text-lg">🏷️</span>
                      <div>
                        <span class="font-bold text-blue-700 text-sm">{{ appliedCoupon()?.coupon?.couponName }}</span>
                        <span class="text-xs text-blue-500 ml-1">
                          (-{{ appliedCoupon()?.coupon?.discountType == 1 ? (appliedCoupon()?.coupon?.discountValue + '%') : (appliedCoupon()?.coupon?.discountValue | currency:'EGP':'symbol':'1.2-2':'en-EG') }})
                        </span>
                      </div>
                    </div>
                    <button type="button" (click)="removeCoupon()" class="text-gray-400 hover:text-red-500 transition-colors">✕</button>
                  </div>
                } @else {
                  <div class="flex gap-2">
                    <input 
                      type="text" 
                      [(ngModel)]="couponInput" 
                      name="couponCode"
                      class="flex-1 px-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter code (e.g. Guid)">
                    <button 
                      type="button"
                      (click)="applyCoupon()"
                      [disabled]="isApplyingCoupon || !couponInput.trim()"
                      class="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                      Apply
                    </button>
                  </div>
                  @if (couponError) {
                    <p class="text-red-500 text-xs mt-2">{{ couponError }}</p>
                  }
                }
              </div>

              <!-- Totals -->
              <div class="border-t border-gray-200 pt-4">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-gray-600">{{ 'cart.subtotal' | translate }}</span>
                  <span class="font-medium" [class.line-through]="appliedCoupon()" [class.text-gray-400]="appliedCoupon()">
                    {{ originalTotalPrice() | currency:'EGP':'symbol':'1.2-2':'en-EG' }}
                  </span>
                </div>
                
                <div *ngIf="appliedCoupon()" class="flex justify-between items-center mb-2 text-green-600 font-medium">
                  <span>{{ 'CART.DISCOUNT' | translate }}</span>
                  <span>
                    -{{ appliedCoupon()?.coupon?.discountType == 1 ? (appliedCoupon()?.coupon?.discountValue + '%') : (discountAmount() | currency:'EGP':'symbol':'1.2-2':'en-EG') }}
                  </span>
                </div>

                <div class="flex justify-between items-center mb-2">
                  <span class="text-gray-600">{{ 'cart.shipping' | translate }}</span>
                  <span class="font-medium text-green-600">{{ 'cart.free' | translate }}</span>
                </div>
                
                <div class="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span class="text-lg font-semibold text-gray-800">{{ 'cart.total' | translate }}</span>
                  <span class="text-xl font-bold text-blue-600">{{ totalPrice() | currency:'EGP':'symbol':'1.2-2':'en-EG' }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class OrderConfirmComponent implements OnInit {
  private orderService = inject(OrderService);
  private cartService = inject(CartService);
  private languageService = inject(LanguageService);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  private couponService = inject(CouponService);
  photoService = inject(PhotoService);

  // Coupon state
  couponInput = '';
  couponError = '';
  isApplyingCoupon = false;
  appliedCoupon = this.cartService.appliedCoupon;
  totalPrice = this.cartService.totalPrice;
  originalTotalPrice = this.cartService.originalTotalPrice;
  discountAmount = this.cartService.discountAmount;
  selectedCity: CityOption = '' as CityOption;
  street = '';
  phoneNumber = '';
  comment = '';

  // States
  submitting = signal(false);
  error = signal<string | null>(null);

  // Cart data
  cartItems = this.cartService.items;

  // Cities from enum
  cities = CITIES;

  // Track image errors
  private imageErrors = new Set<string>();

  getItemSubtotal(item: any): number {
    return this.getItemDiscountedPrice(item) * item.quantity;
  }

  getCurrentLang(): string {
    return this.languageService.currentLanguage();
  }

  ngOnInit(): void {
    // Redirect if cart is empty
    if (this.cartItems().length === 0) {
      this.router.navigate(['/' + this.getCurrentLang() + '/products']);
    }
  }

  isFormValid(): boolean {
    return !!this.selectedCity && this.street.trim().length > 0 && this.phoneNumber.trim().length > 0;
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.src && !this.imageErrors.has(img.src)) {
      this.imageErrors.add(img.src);
      img.src = 'assets/images/placeholder.svg';
    }
  }

  placeOrder(): void {
    if (!this.isFormValid()) {
      this.error.set('Please fill in all required fields');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    // Get customer ID from token
    const userId = this.tokenService.getUserId() || '';

    // Create order DTO
    const orderDto: AddOrderDto = {
      customerId: userId,
      city: this.selectedCity,
      street: this.street.trim(),
      phoneNumber: this.phoneNumber.trim(),
      comment: this.comment.trim() || undefined,
      couponCode: this.appliedCoupon()?.coupon?.couponCode || undefined
    };

    this.orderService.createOrder(orderDto).subscribe({
      next: (order) => {
        console.log('Order created successfully:', order);
        this.submitting.set(false);
        
        // Clear the cart and coupon after successful order
        this.cartService.clear();
        this.cartService.clearCoupon();
        
        // Navigate to orders page
        this.router.navigate(['/' + this.getCurrentLang() + '/orders']);
      },
      error: (error) => {
        console.error('Error creating order:', error);
        this.submitting.set(false);
        
        // Try to extract error message from different response formats
        const errorMessage = 
          error.error?.message || 
          error.error?.error ||
          error.message ||
          (typeof error.error === 'string' ? error.error : 'Failed to place order. Please try again.');
        
        this.error.set(errorMessage);
      }
    });
  }

  applyCoupon(): void {
    if (!this.couponInput.trim()) return;

    this.isApplyingCoupon = true;
    this.couponError = '';

    this.couponService.applyCoupon(this.couponInput).subscribe({
      next: (data: any) => {
        const responseData = this.normalizeCouponData(data);
        
        if (responseData && responseData.coupon) {
          this.cartService.setCoupon(responseData);
          this.couponInput = '';
          this.couponError = '';
        } else {
          this.couponError = 'Invalid coupon data received.';
        }
        this.isApplyingCoupon = false;
      },
      error: (err) => {
        console.error('Error applying coupon:', err);
        this.couponError = extractErrorMessage(err) || 'Failed to apply coupon.';
        this.isApplyingCoupon = false;
      }
    });
  }

  removeCoupon(): void {
    this.cartService.clearCoupon();
  }

  isItemDiscounted(productId: string): boolean {
    const coupon = this.appliedCoupon();
    if (!coupon || !coupon.itemPrices) return false;
    
    const item = this.cartItems().find(i => i.productId === productId);
    if (!item) return false;

    const discountedPrice = coupon.itemPrices[productId];
    return discountedPrice !== undefined && discountedPrice < (item.productPrice || 0);
  }

  getItemDiscountedPrice(item: any): number {
    return this.cartService.getItemDiscountedValue(item);
  }

  private normalizeCouponData(data: any): any {
    if (!data) return null;
    const rawCoupon = data.coupon || data.Coupon;
    const rawProductIds = data.discountedProductIds || data.DiscountedProductIds;
    if (!rawCoupon) return null;

    let parsedDiscountType = 0;
    const rawDiscountType = rawCoupon.discountType !== undefined ? rawCoupon.discountType : rawCoupon.DiscountType;
    if (typeof rawDiscountType === 'string') {
      const lower = rawDiscountType.toLowerCase();
      if (lower === 'percentage') parsedDiscountType = 1;
      else if (lower === 'fixedamount') parsedDiscountType = 2;
      else parsedDiscountType = Number(rawDiscountType);
    } else {
      parsedDiscountType = Number(rawDiscountType);
    }

    return {
      coupon: {
        couponCode: rawCoupon.couponCode || rawCoupon.CouponCode,
        discountType: parsedDiscountType,
        discountValue: Number(rawCoupon.discountValue !== undefined ? rawCoupon.discountValue : rawCoupon.DiscountValue),
        couponName: rawCoupon.couponName || rawCoupon.CouponName,
        couponDescription: rawCoupon.couponDescription || rawCoupon.CouponDescription,
        minAmount: Number(rawCoupon.minAmount !== undefined ? rawCoupon.minAmount : rawCoupon.MinAmount),
        isActive: rawCoupon.isActive !== undefined ? rawCoupon.isActive : rawCoupon.IsActive,
        createdDate: rawCoupon.createdDate || rawCoupon.CreatedDate,
        expirationDate: rawCoupon.expirationDate || rawCoupon.ExpirationDate
      },
      totalDiscount: data.totalDiscount !== undefined ? data.totalDiscount : data.TotalDiscount,
      finalSubtotal: data.finalSubtotal !== undefined ? data.finalSubtotal : data.FinalSubtotal,
      itemPrices: data.itemPrices || data.ItemPrices || {}
    };
  }
}
