import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CartService } from '../../core/services/cart.service';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  private cartService = inject(CartService);
  private languageService = inject(LanguageService);
  private router = inject(Router);

  // Placeholder image URL
  placeholder = 'assets/images/placeholder.svg';

  // Track image errors to prevent infinite loops
  private imageErrors = new Set<string>();

  // Expose signals to template
  items = this.cartService.items;
  isOpen = this.cartService.isOpen;
  totalItems = this.cartService.totalItems;
  totalPrice = this.cartService.totalPrice;

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

  proceedToCheckout(): void {
    // Close cart and navigate to order confirmation page
    this.cartService.close();
    // Navigate to order confirmation page
    this.router.navigate(['/' + this.currentLang + '/orders/confirm']);
  }
}
