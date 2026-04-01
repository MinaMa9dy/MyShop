import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { OrderService } from '../../../core/services/order.service';
import { CartService } from '../../../core/services/cart.service';
import { LanguageService } from '../../../core/services/language.service';
import { TokenService } from '../../../core/services/token.service';
import { PhotoService } from '../../../core/services/photo.service';
import { CouponService } from '../../../core/services/coupon.service';
import { extractErrorMessage } from '../../../core/models/result.model';
import { AddOrderDto, CityOption, CITIES } from '../../../core/models/order.model';

@Component({
  selector: 'app-order-confirm',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <main class="min-h-screen bg-surface pb-20" [dir]="currentLang === 'ar' ? 'rtl' : 'ltr'">
      <!-- Hero Area -->
      <section class="bg-surface-container-low pt-24 pb-16 border-b border-outline-variant/30">
        <div class="max-w-7xl mx-auto px-6">
          <div class="flex flex-col md:flex-row justify-between items-end gap-8">
            <div class="text-start">
               <h1 class="font-headline text-5xl font-black tracking-tighter text-on-surface mb-2">{{ 'orderConfirm.finalizeAcquisition' | translate }}</h1>
               <p class="font-body text-on-surface-variant opacity-70">{{ 'orderConfirm.confirmOrder' | translate }}</p>
            </div>

          </div>
        </div>
      </section>

      <div class="max-w-7xl mx-auto px-6 py-16">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          <!-- Shipping Form (7 cols) -->
          <div class="lg:col-span-7 space-y-10 animate-slide-up">
            <div class="p-6 md:p-10 bg-surface-container-lowest rounded-[48px] shadow-2xl border border-outline-variant/10">
               <div class="flex items-center gap-4 mb-10">
                  <div class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <span class="material-symbols-outlined">local_shipping</span>
                  </div>
                  <h2 class="font-headline text-2xl font-black tracking-tight text-on-surface">{{ 'orderConfirm.destinationDetails' | translate }}</h2>
               </div>

               <form (ngSubmit)="placeOrder()" class="space-y-8">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <!-- City Selection -->
                     <div class="space-y-3">
                        <label class="text-[10px] font-black uppercase tracking-widest text-outline px-2 text-start block">{{ 'orderConfirm.deploymentSector' | translate }}</label>
                        <div class="relative group">
                          <select [(ngModel)]="selectedCity" name="city" required
                                  class="w-full bg-surface-container-low px-6 py-5 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-body text-sm text-on-surface transition-all appearance-none cursor-pointer rtl:pr-6 rtl:pl-12 ltr:px-6">
                            <option value="" disabled>{{ 'orderConfirm.selectCity' | translate }}</option>
                            @for (city of cities; track city) {
                              <option [value]="city">{{ city }}</option>
                            }
                          </select>
                          <span class="material-symbols-outlined absolute end-6 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:rotate-180 transition-transform">expand_more</span>
                        </div>
                     </div>

                     <!-- Phone Number -->
                     <div class="space-y-3 text-start">
                        <label class="text-[10px] font-black uppercase tracking-widest text-outline px-2 text-start block">{{ 'orderConfirm.communicationLink' | translate }}</label>
                        <input type="tel" [(ngModel)]="phoneNumber" name="phoneNumber" required
                               class="w-full bg-surface-container-low px-6 py-5 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-body text-sm text-on-surface transition-all"
                               [placeholder]="'orderConfirm.phoneNumberPlaceholder' | translate">
                     </div>
                  </div>

                  <!-- Street Address -->
                  <div class="space-y-3 text-start">
                    <label class="text-[10px] font-black uppercase tracking-widest text-outline px-2 text-start block">{{ 'orderConfirm.specificCoordinates' | translate }}</label>
                    <input type="text" [(ngModel)]="street" name="street" required
                           class="w-full bg-surface-container-low px-6 py-5 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-body text-sm text-on-surface transition-all"
                           [placeholder]="'orderConfirm.streetPlaceholder' | translate">
                  </div>

                  <!-- Comment -->
                  <div class="space-y-3 text-start">
                    <label class="text-[10px] font-black uppercase tracking-widest text-outline px-2 text-start block">{{ 'orderConfirm.additionalInstructions' | translate }}</label>
                    <textarea [(ngModel)]="comment" name="comment" rows="4"
                              class="w-full bg-surface-container-low px-6 py-5 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-body text-sm text-on-surface transition-all resize-none"
                              [placeholder]="'orderConfirm.commentPlaceholder' | translate"></textarea>
                  </div>

                  @if (error()) {
                    <div class="p-6 bg-error/10 text-error rounded-3xl border border-error/20 flex items-start gap-4">
                       <span class="material-symbols-outlined">report</span>
                       <p class="text-xs font-black uppercase tracking-widest">{{ error() }}</p>
                    </div>
                  }

                  <button type="submit" [disabled]="!isFormValid() || submitting()"
                     class="w-full py-6 bg-primary text-on-primary rounded-[32px] font-headline font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:scale-100 group">
                     @if (submitting()) {
                       <span class="w-6 h-6 border-4 border-on-primary/30 border-t-white rounded-full animate-spin"></span>
                       <span>{{ 'orderConfirm.placingOrder' | translate }}</span>
                     } @else {
                       <span class="material-symbols-outlined group-hover:rotate-12 transition-transform">verified_user</span>
                       <span>{{ 'orderConfirm.authorizeAcquisition' | translate }}</span>
                     }
                  </button>
               </form>
            </div>
          </div>

          <!-- Summary Sidebar (5 cols) -->
          <div class="lg:col-span-5 space-y-10 animate-slide-up" style="animation-delay: 100ms">
            <div class="p-6 md:p-10 bg-surface-container rounded-[48px] border border-outline-variant/10 sticky top-24">
               <div class="mb-4">
                  <h3 class="font-headline font-black text-on-surface">{{ 'orderConfirm.inventoryValuation' | translate }}</h3>
               </div>

               <!-- Cart Items -->
               <div class="space-y-6 mb-10 max-h-96 overflow-y-auto pe-4 scrollbar-hide">
                 @for (item of cartItems(); track item.productId) {
                   <div class="flex items-center gap-5 p-4 bg-surface-container-low rounded-3xl border border-outline-variant/5">
                      <div class="w-16 h-16 bg-surface-container-lowest rounded-2xl overflow-hidden flex-shrink-0 border border-outline-variant/10 p-1">
                        <img [src]="photoService.getPhotoUrlFromPath(item.productImage || '')" 
                             class="w-full h-full object-contain"
                             (error)="handleImageError($event)">
                      </div>
                      <div class="flex-grow min-w-0 text-start">
                        <h4 class="font-headline font-bold text-xs text-on-surface truncate">{{ item.productName }}</h4>
                        <p class="text-[10px] font-black uppercase tracking-widest text-outline pt-1">{{ 'orderConfirm.qty' | translate }}: {{ item.quantity }}</p>
                      </div>
                      <div class="text-end">
                        <p class="font-headline font-black text-sm text-on-surface">
                           {{ getItemSubtotal(item) | currency:'EGP':'symbol':'1.0-0':'en-EG' }}
                        </p>
                      </div>
                   </div>
                 }
               </div>

               <!-- Coupon Control -->
               <div class="mb-10 p-6 bg-primary/5 rounded-[32px] border border-primary/10">
                  <p class="text-[10px] font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-sm">confirmation_number</span>
                    {{ 'orderConfirm.promoCode' | translate }}
                  </p>
                  
                  @if (appliedCoupon()) {
                    <div class="flex items-center justify-between bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-primary/20">
                       <div>
                          <p class="font-headline font-black text-xs text-primary">{{ appliedCoupon()?.coupon?.couponCode }}</p>
                          <p class="text-[8px] font-black uppercase text-outline">{{ 'orderConfirm.verifiedReduction' | translate:{'value': (appliedCoupon()?.coupon?.discountValue + (appliedCoupon()?.coupon?.discountType == 1 ? '%' : ' EGP'))} }}</p>
                       </div>
                       <button (click)="removeCoupon()" class="text-outline-variant hover:text-error transition-colors">
                          <span class="material-symbols-outlined">cancel</span>
                       </button>
                    </div>
                  } @else {
                    <div class="flex flex-col sm:flex-row gap-4">
                       <input type="text" [(ngModel)]="couponInput" 
                              class="flex-grow w-full bg-white px-6 py-4 rounded-2xl border border-outline-variant/20 focus:border-primary/30 shadow-inner outline-none font-body text-sm text-on-surface uppercase tracking-widest transition-all"
                              [placeholder]="'orderConfirm.codePlaceholder' | translate">
                       <button (click)="applyCoupon()" [disabled]="isApplyingCoupon || !couponInput.trim()"
                               class="px-8 py-4 bg-primary text-on-primary rounded-2xl font-headline font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all text-center">
                          {{ 'CART.APPLY' | translate }}
                       </button>
                    </div>
                    @if (couponError) {
                      <p class="text-[8px] font-black uppercase text-error mt-2 px-2">{{ couponError }}</p>
                    }
                  }
               </div>

               <!-- Final Accounting -->
                <div class="space-y-4 pt-4 border-t border-outline-variant/10">
                   <div class="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span class="text-outline">{{ 'orderConfirm.alphaValuation' | translate }}</span>
                      <span class="text-on-surface" [class.line-through]="appliedCoupon()">{{ originalTotalPrice() | currency:'EGP':'symbol':'1.0-0':'en-EG' }}</span>
                   </div>
                   @if (discountAmount() > 0) {
                      <div class="flex justify-between text-[10px] font-black uppercase tracking-widest text-error">
                         <span>{{ 'orderConfirm.discount' | translate }}</span>
                         <span>-{{ discountAmount() | currency:'EGP':'symbol':'1.0-0':'en-EG' }}</span>
                      </div>
                   }
                   <div class="flex justify-between text-[10px] font-black uppercase tracking-widest text-outline">
                      <span>{{ 'orderConfirm.logistics' | translate }}</span>
                      <span class="text-primary font-black animate-pulse">{{ 'orderConfirm.freeOfCharge' | translate }}</span>
                   </div>
                </div>

                <div class="mt-12 pt-8 border-t-2 border-dashed border-outline-variant/30 text-end">
                   <p class="text-[10px] font-black uppercase tracking-[0.4em] text-outline mb-1">{{ 'orderConfirm.finalValuation' | translate }}</p>
                   <p class="font-headline text-4xl font-black text-on-surface leading-none">{{ totalPrice() | currency:'EGP':'symbol':'1.0-0':'en-EG' }}</p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class OrderConfirmComponent implements OnInit {
  private orderService = inject(OrderService);
  private cartService = inject(CartService);
  private languageService = inject(LanguageService);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  private couponService = inject(CouponService);
  photoService = inject(PhotoService);

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

  submitting = signal(false);
  error = signal<string | null>(null);
  cartItems = this.cartService.items;
  cities = CITIES;

  private imageErrors = new Set<string>();

  getItemSubtotal(item: any): number { return this.getItemDiscountedPrice(item) * item.quantity; }
  get currentLang(): string { return this.languageService.currentLanguage(); }

  ngOnInit(): void {
    if (this.cartItems().length === 0) this.router.navigate(['/' + this.currentLang + '/products']);
  }

  isFormValid(): boolean { return !!this.selectedCity && this.street.trim().length > 0 && this.phoneNumber.trim().length > 0; }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrToAN7K9bxCYHNmah4SPbCguXNVlpK-DeQWeEBnHb8hhrK_YwTkoUXoEOh-RgjYVbFZj2ZzFPFjqLgEqS81zBG3mBRaFpNCTpPthaRKkjbY6cN5ywiH6wrgPH-fov4huJ80NbYSMgUyawNMMrAIHqttsqobdz8M4Yk_ERm3md8eXwLlW4PLs3aIXrOye6hD6Mc0OtdU9LpkjMLI7eeChndSjrvjUUdPvpHGIlYDvLm3UBFRbdvqH0krtaLiZxlv72URSOjaoPfUbP';
  }

  placeOrder(): void {
    if (!this.isFormValid()) { this.error.set('Data fields incomplete.'); return; }
    this.submitting.set(true); this.error.set(null);
    const userId = this.tokenService.getUserId() || '';

    this.orderService.createOrder({
      customerId: userId, city: this.selectedCity, street: this.street.trim(),
      phoneNumber: this.phoneNumber.trim(), comment: this.comment.trim() || undefined,
      couponCode: this.appliedCoupon()?.coupon?.couponCode || undefined
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.cartService.clear();
        this.cartService.clearCoupon();
        this.router.navigate(['/' + this.currentLang + '/orders']);
      },
      error: (err) => { this.submitting.set(false); this.error.set(extractErrorMessage(err) || 'Execution failed.'); }
    });
  }

  applyCoupon(): void {
    if (!this.couponInput.trim()) return;
    this.isApplyingCoupon = true; this.couponError = '';
    this.couponService.applyCoupon(this.couponInput).subscribe({
      next: (data: any) => {
        const responseData = this.normalizeCouponData(data);
        if (responseData?.coupon) { this.cartService.setCoupon(responseData); this.couponInput = ''; }
        else { this.couponError = 'Invalid response.'; }
        this.isApplyingCoupon = false;
      },
      error: (err) => { this.couponError = extractErrorMessage(err) || 'Validation failed.'; this.isApplyingCoupon = false; }
    });
  }

  removeCoupon(): void { this.cartService.clearCoupon(); }
  getItemDiscountedPrice(item: any): number { return this.cartService.getItemDiscountedValue(item); }

  private normalizeCouponData(data: any): any {
    if (!data) return null;
    const rawCoupon = data.coupon || data.Coupon;
    if (!rawCoupon) return null;
    let type = rawCoupon.discountType ?? rawCoupon.DiscountType;
    if (typeof type === 'string') {
      const l = type.toLowerCase();
      type = l === 'percentage' ? 1 : l === 'fixedamount' ? 2 : Number(type);
    }
    return {
      coupon: {
        couponCode: rawCoupon.couponCode || rawCoupon.CouponCode,
        discountType: type,
        discountValue: Number(rawCoupon.discountValue ?? rawCoupon.DiscountValue),
        couponName: rawCoupon.couponName || rawCoupon.CouponName,
      },
      totalDiscount: data.totalDiscount ?? data.TotalDiscount,
      finalSubtotal: data.finalSubtotal ?? data.FinalSubtotal,
      itemPrices: data.itemPrices || data.ItemPrices || {}
    };
  }
}
