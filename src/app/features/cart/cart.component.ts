import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CartService } from '../../core/services/cart.service';
import { LanguageService } from '../../core/services/language.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <!-- Cart Sidebar Backdrop -->
    @if (cartService.isOpen()) {
      <div 
        class="fixed inset-0 bg-black/50 z-40 transition-opacity"
        (click)="closeCart()">
      </div>
    }
    
    <!-- Cart Sidebar -->
    <div 
      class="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out"
      [class.translate-x-0]="cartService.isOpen()"
      [class.translate-x-full]="!cartService.isOpen()">
      
      <!-- Cart Header -->
      <div class="flex items-center justify-between p-4 border-b">
        <h2 class="text-xl font-bold">{{ 'cart.cart' | translate }}</h2>
        <button 
          (click)="closeCart()"
          class="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Cart Items -->
      <div class="flex-1 overflow-y-auto p-4">
        @if (cartService.items().length === 0) {
          <div class="text-center py-12">
            <div class="text-6xl mb-4">🛒</div>
            <p class="text-gray-500">{{ 'cart.emptyCart' | translate }}</p>
            <button 
              [routerLink]="['/' + currentLang + '/products']"
              (click)="closeCart()"
              class="mt-4 btn btn-primary px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {{ 'cart.continueShopping' | translate }}
            </button>
          </div>
        } @else {
          <div class="space-y-4">
            @for (item of cartService.items(); track item.id || item.productId) {
              <div class="flex gap-4 p-3 bg-gray-50 rounded-lg">
                <!-- Product Image -->
                <div class="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  @if (item.productImage) {
                    <img [src]="item.productImage" [alt]="item.productName" class="w-full h-full object-cover">
                  } @else {
                    <div class="w-full h-full flex items-center justify-center text-3xl">📦</div>
                  }
                </div>
                
                <!-- Product Info -->
                <div class="flex-1 min-w-0">
                  <h3 class="font-medium text-gray-800 truncate">{{ item.productName || ('cart.product' | translate) }}</h3>
                  
                  <!-- Quantity Controls -->
                  <div class="flex items-center gap-2 mt-2">
                    <button 
                      (click)="decreaseQuantity(item)"
                      class="w-8 h-8 flex items-center justify-center bg-white border rounded-full hover:bg-gray-100 transition-colors">
                      <span class="text-lg">-</span>
                    </button>
                    <span class="w-8 text-center font-medium">{{ item.quantity }}</span>
                    <button 
                      (click)="increaseQuantity(item)"
                      class="w-8 h-8 flex items-center justify-center bg-white border rounded-full hover:bg-gray-100 transition-colors">
                      <span class="text-lg">+</span>
                    </button>
                  </div>
                </div>
                
                <!-- Remove Button -->
                <button 
                  (click)="removeFromCart(item)"
                  class="text-red-500 hover:text-red-700 p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            }
          </div>
        }
      </div>
      
      <!-- Cart Footer -->
      @if (cartService.items().length > 0) {
        <div class="border-t p-4 space-y-4">
          <!-- Checkout Button -->
          <button 
            [routerLink]="['/' + currentLang + '/cart/checkout']"
            (click)="closeCart()"
            class="w-full btn btn-primary py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors">
            {{ 'cart.checkout' | translate }}
          </button>
          
          <!-- Continue Shopping -->
          <button 
            [routerLink]="['/' + currentLang + '/products']"
            (click)="closeCart()"
            class="w-full btn btn-secondary py-2 text-gray-600 hover:text-gray-800 transition-colors">
            {{ 'cart.continueShopping' | translate }}
          </button>
        </div>
      }
    </div>
  `
})
export class CartComponent {
  cartService = inject(CartService);
  private languageService = inject(LanguageService);
  private authService = inject(AuthService);
  
  get currentLang(): string {
    return this.languageService.currentLanguage();
  }
  
  closeCart(): void {
    this.cartService.close();
  }
  
  increaseQuantity(item: any): void {
    this.cartService.updateCartItem(item.id, item.productId, item.userId, item.quantity + 1);
  }
  
  decreaseQuantity(item: any): void {
    if (item.quantity > 1) {
      this.cartService.updateCartItem(item.id, item.productId, item.userId, item.quantity - 1);
    } else {
      this.removeFromCart(item);
    }
  }
  
  removeFromCart(item: any): void {
    // Use cart item id for API call, fallback to productId for local removal
    if (item.id) {
      this.cartService.removeFromCart(item.id).subscribe({
        next: () => console.log('Item removed from cart'),
        error: (error) => console.error('Error removing item:', error)
      });
    } else {
      // Fallback to local removal
      this.cartService.removeItem(item.productId);
    }
  }
}
