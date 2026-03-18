import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CartService } from '../../core/services/cart.service';
import { LanguageService } from '../../core/services/language.service';
import { CouponService } from '../../core/services/coupon.service';
import { CouponResponse, Coupon } from '../../core/models/coupon.models';
import { FormsModule } from '@angular/forms';
import { extractErrorMessage } from '../../core/models/result.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  private cartService = inject(CartService);
  private languageService = inject(LanguageService);
  private couponService = inject(CouponService);
  private router = inject(Router);

  couponInput = '';
  couponError = '';
  isApplying = false;

  // Placeholder image URL
  placeholder = 'assets/images/placeholder.svg';

  // Track image errors to prevent infinite loops
  private imageErrors = new Set<string>();

  // Expose signals to template
  items = this.cartService.items;
  isOpen = this.cartService.isOpen;
  totalItems = this.cartService.totalItems;
  totalPrice = this.cartService.totalPrice;
  appliedCoupon = this.cartService.appliedCoupon;
  originalTotalPrice = this.cartService.originalTotalPrice;
  discountAmount = this.cartService.discountAmount;

  // Computed property for RTL
  isRtl = computed(() => this.languageService.currentLanguage() === 'ar');

  get currentLang(): string {
    return this.languageService.currentLanguage();
  }

  closeCart(): void {
    this.cartService.close();
  }

  increaseQuantity(item: any): void {
    // Use POST (addToCart) to increase quantity
    this.cartService.addToCart(item.productId, 1).subscribe({
      next: () => console.log('Quantity increased'),
      error: (error: any) => console.error('Error increasing quantity:', error)
    });
  }

  decreaseQuantity(item: any): void {
    if (item.quantity > 1) {
      // Use DELETE to remove one item (quantity = 1)
      this.cartService.removeFromCart(item.productId, 1).subscribe({
        next: (response) => {
          console.log('Quantity decreased', response);
          // The service now handles the response and updates local state
        },
        error: (error: any) => {
          console.error('Error decreasing quantity:', error);
          // Optionally show error message to user
        }
      });
    } else {
      this.removeFromCart(item);
    }
  }

  removeFromCart(item: any): void {
    // Use productId and full quantity for API call
    if (item.productId) {
      this.cartService.removeFromCart(item.productId, item.quantity).subscribe({
        next: (response) => {
          console.log('Item removed from cart', response);
          // The service now handles the response and updates local state
        },
        error: (error: any) => {
          console.error('Error removing item:', error);
          // Optionally show error message to user
        }
      });
    }
  }

  handleImageError(event: Event, item: any): void {
    // Prevent infinite loop by tracking which items have had errors
    if (!this.imageErrors.has(item.productId)) {
      this.imageErrors.add(item.productId);
      const img = event.target as HTMLImageElement;
      img.src = this.placeholder;
    }
  }
  
  goToProductDetail(item: any): void {
    // Close cart and navigate to product detail page
    this.cartService.close();
    this.router.navigate(['/' + this.currentLang + '/products/' + item.productId]);
  }

  proceedToCheckout(): void {
    // Close cart and navigate to order confirmation page
    this.cartService.close();
    // Navigate to order confirmation page
    this.router.navigate(['/' + this.currentLang + '/orders/confirm']);
  }

  removeCoupon(): void {
    this.cartService.clearCoupon();
  }

  isItemDiscounted(productId: string | undefined): boolean {
    if (!productId) return false;
    const coupon = this.appliedCoupon();
    if (!coupon || !coupon.itemPrices) return false;
    
    // An item is discounted if its itemPrice is different from original productPrice
    const item = this.items().find(i => i.productId === productId);
    if (!item) return false;
    
    const discountedPrice = coupon.itemPrices[productId];
    return discountedPrice !== undefined && discountedPrice < (item.productPrice || 0);
  }

  getItemDiscountedPrice(item: any): number {
    return this.cartService.getItemDiscountedValue(item);
  }

  getItemSubtotal(item: any): number {
    return this.getItemDiscountedPrice(item) * item.quantity;
  }

  private normalizeCouponData(data: any): any {
    if (!data) return null;
    
    // Extract base properties (either camelCase or PascalCase)
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
    
    // Normalize characters of the coupon object
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
