import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CartService } from '../../core/services/cart.service';
import { LanguageService } from '../../core/services/language.service';
import { CouponService } from '../../core/services/coupon.service';
import { FormsModule } from '@angular/forms';

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
           class="fixed top-0 bottom-0 z-[101] w-full max-w-md bg-surface shadow-2xl transition-transform duration-500 ease-in-out flex flex-col overflow-hidden"
           [class.left-0]="isRtl()"
           [class.right-0]="!isRtl()"
           [dir]="isRtl() ? 'rtl' : 'ltr'">
      
      <!-- Header -->
      <header class="p-8 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low">
        <div class="flex items-center gap-4">
           <div class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary relative">
              <span class="material-symbols-outlined">shopping_bag</span>
              <span class="absolute -top-1 -right-1 w-5 h-5 bg-primary text-on-primary text-[10px] font-black rounded-full flex items-center justify-center">{{ totalItems() }}</span>
           </div>
           <div>
              <h2 class="font-headline font-black text-xl text-on-surface tracking-tight">{{ 'CART.SHOPPING_CART' | translate }}</h2>
           </div>
        </div>
        <button (click)="closeCart()" class="w-10 h-10 rounded-full hover:bg-surface-container transition-colors flex items-center justify-center text-outline group">
          <span class="material-symbols-outlined group-hover:rotate-90 transition-transform">close</span>
        </button>
      </header>

      <!-- Multi-step Progress (Visual) -->
      <div class="px-8 py-4 bg-surface-container-lowest border-b border-outline-variant/10 flex gap-1">
         <div class="h-1 flex-grow rounded-full bg-primary"></div>
         <div class="h-1 flex-grow rounded-full bg-outline-variant/20"></div>
         <div class="h-1 flex-grow rounded-full bg-outline-variant/20"></div>
      </div>

      <!-- Items List -->
      <div class="flex-grow overflow-y-auto p-8 space-y-6 scrollbar-hide">
        @if (items().length > 0) {
          @for (item of items(); track item.productId) {
            <div class="group relative flex gap-6 p-4 rounded-3xl bg-surface-container-lowest border border-outline-variant/5 hover:border-primary/20 transition-all hover:shadow-lg">
              
              <!-- Item Image -->
              <div class="relative w-24 h-24 rounded-2xl bg-surface-container overflow-hidden flex-shrink-0 cursor-pointer" (click)="goToProductDetail(item)">
                <img [src]="item.productImage || placeholder" [alt]="item.productName" class="w-full h-full object-cover transition-transform group-hover:scale-110">
                @if (isItemDiscounted(item.productId)) {
                  <div class="absolute top-1 left-1 bg-error/90 backdrop-blur-md text-on-error text-[8px] font-black uppercase px-2 py-1 rounded-lg shadow-lg border border-white/20">Save</div>
                }
              </div>

              <!-- Item Details -->
              <div class="flex-grow space-y-3 min-w-0">
                <div class="flex justify-between items-start gap-3">
                  <h3 class="font-headline font-bold text-sm text-on-surface line-clamp-2 hover:text-primary transition-colors cursor-pointer flex-grow" (click)="goToProductDetail(item)">{{ item.productName }}</h3>
                  <button (click)="removeFromCart(item)" 
                          class="w-8 h-8 rounded-full border border-outline-variant/10 text-outline-variant hover:text-error hover:bg-error/5 transition-all flex items-center justify-center flex-shrink-0">
                    <span class="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex flex-col">
                    <span class="font-headline font-black text-primary">
                      {{ getItemDiscountedPrice(item) | currency:'EGP':'symbol':'1.0-0':'en-EG' }}
                    </span>
                    @if (isItemDiscounted(item.productId)) {
                      <span class="text-[10px] text-outline line-through opacity-50">
                        {{ item.productPrice | currency:'EGP':'symbol':'1.0-0':'en-EG' }}
                      </span>
                    }
                  </div>

                  <!-- Control Quantity -->
                  <div class="flex items-center gap-3 bg-surface p-1 rounded-xl border border-outline-variant/30">
                    <button (click)="decreaseQuantity(item)" class="w-8 h-8 rounded-lg hover:bg-surface-container transition-colors flex items-center justify-center">
                      <span class="material-symbols-outlined text-sm">remove</span>
                    </button>
                    <span class="font-headline font-black text-xs min-w-[12px] text-center">{{ item.quantity }}</span>
                    <button (click)="increaseQuantity(item)" class="w-8 h-8 rounded-lg hover:bg-surface-container transition-colors flex items-center justify-center">
                      <span class="material-symbols-outlined text-sm">add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
        } @else {
          <!-- Empty State -->
          <div class="h-full flex flex-col items-center justify-center text-center space-y-6">
            <div class="w-32 h-32 rounded-[40px] bg-surface-container-low flex items-center justify-center text-outline-variant border-2 border-dashed border-outline-variant/30">
              <span class="material-symbols-outlined text-6xl">shopping_cart_off</span>
            </div>
            <div>
               <h3 class="font-headline font-black text-xl text-on-surface mb-2">{{ 'CART.EMPTY' | translate }}</h3>
               <p class="font-body text-sm text-outline px-12">Your architectural inventory is currently null. Begin curation to populate.</p>
            </div>
            <button (click)="closeCart()" class="px-8 py-4 bg-on-surface text-surface rounded-2xl font-headline font-bold shadow-xl hover:scale-105 active:scale-95 transition-all">Start Curator Mode</button>
          </div>
        }
      </div>

      <!-- Footer / Summary -->
      @if (items().length > 0) {
        <footer class="p-8 space-y-8 bg-surface-container-low border-t border-outline-variant/30 shadow-[0_-20px_40px_rgba(0,0,0,0.02)]">
          <div class="space-y-4">
            <div class="flex justify-between text-[10px] font-black uppercase tracking-widest text-outline">
               <span>{{ 'orderConfirm.alphaValuation' | translate }}</span>
               <span [class.line-through]="appliedCoupon()">{{ originalTotalPrice() | currency:'EGP':'symbol':'1.0-0':'en-EG' }}</span>
            </div>
            
            @if (appliedCoupon()) {
              <div class="flex justify-between text-[10px] font-black uppercase tracking-widest text-error">
                 <span>Discount ({{ appliedCoupon()?.coupon?.couponCode }})</span>
                 <span>-{{ discountAmount() | currency:'EGP':'symbol':'1.0-0':'en-EG' }}</span>
              </div>
            }

            <div class="flex justify-between items-end pt-4 border-t border-outline-variant/10">
               <div>
                 <p class="text-[10px] font-black uppercase tracking-[0.2em] text-outline mb-1">{{ 'orderConfirm.finalValuation' | translate }}</p>
                 <p class="font-headline text-3xl font-black text-on-surface tracking-tighter">{{ totalPrice() | currency:'EGP':'symbol':'1.0-0':'en-EG' }}</p>
               </div>
               <button (click)="proceedToCheckout()" 
                       class="px-10 py-5 bg-primary text-on-primary rounded-2xl font-headline font-bold shadow-[0_15px_30px_rgba(var(--primary-rgb),0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group">
                  <span>Checkout</span>
                  <span class="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
               </button>
            </div>
          </div>

          <div class="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-outline justify-center opacity-40">
             <span class="material-symbols-outlined text-xs">verified_user</span>
             <span>Secure Transaction Environment</span>
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

  placeholder = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrToAN7K9bxCYHNmah4SPbCguXNVlpK-DeQWeEBnHb8hhrK_YwTkoUXoEOh-RgjYVbFZj2ZzFPFjqLgEqS81zBG3mBRaFpNCTpPthaRKkjbY6cN5ywiH6wrgPH-fov4huJ80NbYSMgUyawNMMrAIHqttsqobdz8M4Yk_ERm3md8eXwLlW4PLs3aIXrOye6hD6Mc0OtdU9LpkjMLI7eeChndSjrvjUUdPvpHGIlYDvLm3UBFRbdvqH0krtaLiZxlv72URSOjaoPfUbP';

  items = this.cartService.items;
  isOpen = this.cartService.isOpen;
  totalItems = this.cartService.totalItems;
  totalPrice = this.cartService.totalPrice;
  appliedCoupon = this.cartService.appliedCoupon;
  originalTotalPrice = this.cartService.originalTotalPrice;
  discountAmount = this.cartService.discountAmount;

  isRtl = computed(() => this.languageService.currentLanguage() === 'ar');
  get currentLang(): string { return this.languageService.currentLanguage(); }

  closeCart(): void { this.cartService.close(); }

  increaseQuantity(item: any): void {
    this.cartService.updateQuantity(item.productId, item.quantity + 1).subscribe();
  }

  decreaseQuantity(item: any): void {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.productId, item.quantity - 1).subscribe();
    } else {
      this.removeFromCart(item);
    }
  }

  removeFromCart(item: any): void {
    if (item.productId) this.cartService.removeFromCart(item.productId, item.quantity).subscribe();
  }
  
  goToProductDetail(item: any): void {
    this.cartService.close();
    this.router.navigate(['/' + this.currentLang + '/products/' + item.productId]);
  }

  proceedToCheckout(): void {
    this.cartService.close();
    this.router.navigate(['/' + this.currentLang + '/orders/confirm']);
  }

  isItemDiscounted(productId: string | undefined): boolean {
    if (!productId) return false;
    const item = this.items().find(i => i.productId === productId);
    const applied = this.appliedCoupon();
    if (!applied?.itemPrices) return false;
    return !!(applied.itemPrices[productId] < (item?.productPrice || 0));
  }

  getItemDiscountedPrice(item: any): number { return this.cartService.getItemDiscountedValue(item); }
}
