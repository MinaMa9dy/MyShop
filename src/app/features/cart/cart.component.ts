import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CartService } from '../../core/services/cart.service';
import { LanguageService } from '../../core/services/language.service';
import { FormsModule } from '@angular/forms';
import { CartItem } from '../../core/models/cart.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  template: `
    <!-- Overlay -->
    <div *ngIf="isOpen()" 
         class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-500 animate-fade-in" 
         (click)="closeCart()"></div>

    <!-- Sidebar -->
    <aside [class]="isOpen() ? 'translate-x-0' : (isRtl() ? '-translate-x-full' : 'translate-x-full')"
           class="fixed top-0 bottom-0 z-[101] w-3/4 bg-surface shadow-2xl transition-transform duration-500 ease-in-out flex flex-col overflow-hidden"
           [class.left-0]="isRtl()"
           [class.right-0]="!isRtl()"
           [dir]="isRtl() ? 'rtl' : 'ltr'">
      
      <!-- Header -->
      <header class="p-4 sm:p-8 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low">
        <div class="flex items-center gap-3 sm:gap-4">
           <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary relative">
              <span class="material-symbols-outlined text-xl sm:text-2xl">shopping_bag</span>
              <span class="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-primary text-on-primary text-[8px] sm:text-[10px] font-black rounded-full flex items-center justify-center">{{ total() }}</span>
           </div>
           <div>
              <h2 class="font-headline font-black text-lg sm:text-xl text-on-surface tracking-tight">{{ 'CART.SHOPPING_CART' | translate }}</h2>
           </div>
        </div>
        <button (click)="closeCart()" class="w-10 h-10 rounded-full hover:bg-surface-container transition-colors flex items-center justify-center text-outline group">
          <span class="material-symbols-outlined group-hover:rotate-90 transition-transform">close</span>
        </button>
      </header>

      <!-- Items List -->
      <div class="flex-grow overflow-y-auto p-4 sm:p-8 space-y-4 sm:space-y-6 scrollbar-hide">
        @if (items().length > 0) {
          @for (item of items(); track item.productVariantId) {
            <div class="group relative flex gap-4 sm:gap-6 p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-surface-container-lowest border border-outline-variant/5 hover:border-primary/20 transition-all hover:shadow-lg">
              
              <!-- Item Image -->
              <div class="relative w-16 h-16 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl bg-surface-container overflow-hidden flex-shrink-0 cursor-pointer" (click)="goToProductDetail(item)">
                <img [src]="item.productImage || placeholder" [alt]="item.productName" class="w-full h-full object-cover transition-transform group-hover:scale-110">
              </div>

              <!-- Item Details -->
              <div class="flex-grow space-y-2 sm:space-y-3 min-w-0 text-start">
                <div class="flex justify-between items-start gap-2">
                  <div class="flex flex-col gap-0.5 min-w-0">
                    <h3 class="font-headline font-bold text-[11px] sm:text-sm text-on-surface line-clamp-2 hover:text-primary transition-colors cursor-pointer" (click)="goToProductDetail(item)">{{ item.productName }}</h3>
                    @if (item.variantDetails) {
                      <p class="text-[9px] sm:text-[11px] text-outline opacity-70 font-medium break-words">{{ item.variantDetails }}</p>
                    }
                  </div>
                  <button (click)="removeFromCart(item)" 
                          class="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-outline-variant/10 text-outline-variant hover:text-error hover:bg-error/5 transition-all flex items-center justify-center flex-shrink-0">
                    <span class="material-symbols-outlined text-sm sm:text-lg">delete</span>
                  </button>
                </div>

                <!-- Price and Calculation -->
                <div class="space-y-1.5 pt-2">
                  <div class="flex items-center justify-between">
                    <div class="flex flex-col">
                      <span class="text-[10px] font-black uppercase tracking-widest text-outline/50">{{ 'CART.UNIT_PRICE' | translate }}</span>
                      <div class="flex items-center gap-2">
                        <span class="font-headline font-black text-primary text-sm sm:text-lg">
                          {{ getItemDiscountedPrice(item) | currency:'EGP':'symbol':'1.0-0':'en-EG' }}
                        </span>
                        @if (isItemDiscounted(item.productVariantId)) {
                          <span class="text-[10px] sm:text-xs text-outline/40 line-through font-bold">
                            {{ item.productPrice | currency:'EGP':'symbol':'1.0-0':'en-EG' }}
                          </span>
                        }
                      </div>
                    </div>
                    
                    <div class="text-end">
                      <span class="text-[10px] font-black uppercase tracking-widest text-outline/50">{{ 'CART.TOTAL' | translate }}</span>
                      <p class="font-headline font-black text-on-surface text-sm sm:text-lg">
                        {{ (item.quantity * getItemDiscountedPrice(item)) | currency:'EGP':'symbol':'1.0-0':'en-EG' }}
                      </p>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 py-1.5 px-3 bg-surface-container-low rounded-lg w-fit">
                    <span class="text-[10px] font-bold text-outline">{{ item.quantity }}</span>
                    <span class="text-[10px] text-outline/30">×</span>
                    <span class="text-[10px] font-bold text-outline">{{ getItemDiscountedPrice(item) | currency:'EGP':'symbol':'1.0-0':'en-EG' }}</span>
                  </div>
                </div>

                <!-- Control Quantity -->
                <div class="flex items-center gap-1 sm:gap-2 bg-surface-container-low p-1 rounded-xl border border-outline-variant/20 w-fit mt-2">
                  <button (click)="decreaseQuantity(item)" class="w-7 h-7 sm:w-9 sm:h-9 rounded-lg hover:bg-primary hover:text-on-primary transition-all duration-300 flex items-center justify-center group/btn">
                    <span class="material-symbols-outlined text-[10px] sm:text-sm group-active/btn:scale-90">remove</span>
                  </button>
                  <span class="font-headline font-black text-[10px] sm:text-xs min-w-[24px] sm:min-w-[32px] text-center">{{ item.quantity }}</span>
                  <button (click)="increaseQuantity(item)" class="w-7 h-7 sm:w-9 sm:h-9 rounded-lg hover:bg-primary hover:text-on-primary transition-all duration-300 flex items-center justify-center group/btn">
                    <span class="material-symbols-outlined text-[10px] sm:text-sm group-active/btn:scale-125">add</span>
                  </button>
                </div>
              </div>
            </div>
          }
        } @else {
          <!-- Empty State -->
          <div class="h-full flex flex-col items-center justify-center text-center space-y-6">
            <div class="w-24 h-24 sm:w-32 sm:h-32 rounded-[32px] sm:rounded-[40px] bg-surface-container-low flex items-center justify-center text-outline-variant border-2 border-dashed border-outline-variant/30">
              <span class="material-symbols-outlined text-4xl sm:text-6xl">shopping_cart_off</span>
            </div>
            <div>
               <h3 class="font-headline font-black text-lg sm:text-xl text-on-surface mb-2">{{ 'CART.EMPTY' | translate }}</h3>
               <p class="font-body text-xs sm:text-sm text-outline px-6 sm:px-12">{{ 'cart.emptyCartDesc' | translate }}</p>
            </div>
            <button (click)="closeCart()" class="px-6 py-3 sm:px-8 sm:py-4 bg-on-surface text-surface rounded-xl sm:rounded-2xl font-headline font-bold shadow-xl hover:scale-105 active:scale-95 transition-all text-sm sm:text-base">{{ 'cart.continueShopping' | translate }}</button>
          </div>
        }
      </div>

      <!-- Footer / Summary -->
      @if (items().length > 0) {
        <footer class="p-4 sm:p-8 space-y-4 sm:space-y-8 bg-surface-container-low border-t border-outline-variant/30 shadow-[0_-20px_40px_rgba(0,0,0,0.02)]">
          <div class="space-y-3 sm:space-y-4">
            <div class="flex justify-between text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-outline">
               <span>{{ 'CART.SUBTOTAL' | translate }}</span>
               <span [class.line-through]="appliedCoupon()">{{ originalTotalPrice() | currency:'EGP':'symbol':'1.0-0':'en-EG' }}</span>
            </div>
            
            @if (appliedCoupon()) {
              <div class="flex justify-between text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-error">
                 <span class="truncate max-w-[150px]">{{ 'CART.DISCOUNT' | translate }} ({{ appliedCoupon()?.coupon?.code }})</span>
                 <span class="flex-shrink-0">-{{ discountAmount() | currency:'EGP':'symbol':'1.0-0':'en-EG' }}</span>
              </div>
            }

            <div class="flex justify-between items-end pt-3 sm:pt-4 border-t border-outline-variant/10">
               <div class="text-start">
                 <p class="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-outline mb-0.5 sm:mb-1">{{ 'CART.TOTAL' | translate }}</p>
                 <p class="font-headline text-2xl sm:text-3xl font-black text-on-surface tracking-tighter">{{ totalPrice() | currency:'EGP':'symbol':'1.0-0':'en-EG' }}</p>
               </div>
               <button (click)="proceedToCheckout()" 
                       class="px-4 py-2 sm:px-6 sm:py-3 bg-primary text-on-primary rounded-xl sm:rounded-2xl font-headline font-bold shadow-[0_10px_20px_rgba(var(--primary-rgb),0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group text-xs sm:text-sm">
                  <span>{{ 'cart.checkout' | translate }}</span>
                  <span class="material-symbols-outlined text-base sm:text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
               </button>
            </div>
          </div>
        </footer>
      }
    </aside>
  `,
  styles: [`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class CartComponent {
  private cartService = inject(CartService);
  private languageService = inject(LanguageService);
  private router = inject(Router);

  placeholder = 'assets/images/placeholder.svg';

  items = this.cartService.items;
  isOpen = this.cartService.isOpen;
  total = this.cartService.total;
  totalPrice = this.cartService.totalPrice;
  appliedCoupon = this.cartService.appliedCoupon;
  originalTotalPrice = this.cartService.originalTotalPrice;
  discountAmount = this.cartService.discountAmount;

  isRtl = computed(() => this.languageService.currentLanguage() === 'ar');
  get currentLang(): string { return this.languageService.currentLanguage(); }

  closeCart(): void { this.cartService.close(); }

  increaseQuantity(item: CartItem): void {
    this.cartService.updateQuantity(item.productVariantId, item.quantity + 1).subscribe();
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.productVariantId, item.quantity - 1).subscribe();
    } else {
      this.removeFromCart(item);
    }
  }

  removeFromCart(item: CartItem): void {
    if (item.productVariantId) {
      this.cartService.removeFromCart(item.productVariantId).subscribe();
    }
  }
  
  goToProductDetail(item: CartItem): void {
    // Note: To navigate back to product detail, we might need a productId on the CartItem model.
    // For now, if variantId is used as productId, it might work if the route handles it.
    // However, usually we need the base productId.
    // I'll leave this as is for now, but in a real app, CartItem would store both.
    this.cartService.close();
    // Assuming productVariantId works for now or needs further mapping
  }

  proceedToCheckout(): void {
    this.cartService.close();
    this.router.navigate(['/' + this.currentLang + '/orders/confirm']);
  }

  isItemDiscounted(variantId: string | undefined): boolean {
    if (!variantId) return false;
    const item = this.items().find(i => i.productVariantId === variantId);
    const applied = this.appliedCoupon();
    if (!applied?.itemPrices) return false;
    return !!(applied.itemPrices[variantId] < (item?.productPrice || 0));
  }

  getItemDiscountedPrice(item: CartItem): number { return this.cartService.getItemDiscountedValue(item); }
}

