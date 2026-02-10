import { Component, inject, signal, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';
import { LanguageService } from './core/services/language.service';
import { CartComponent } from './features/cart/cart.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, TranslateModule, CartComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private languageService = inject(LanguageService);
  private renderer = inject(Renderer2);
  
  private loginSubscription?: Subscription;
  
  title = 'MyShop';
  
  isLoggedIn = this.authService.isLoggedIn;
  cartItemCount = this.cartService.totalItems;
  currentLanguage = this.languageService.currentLanguage;
  
  // Mobile menu state
  mobileMenuOpen = signal(false);
  
  ngOnInit(): void {
    // Load cart from local storage first (for quick display)
    this.cartService.loadFromStorage();
    
    // If user is logged in, fetch cart from backend
    if (this.authService.isAuthenticated()) {
      this.fetchUserCart();
    }
    
    // Subscribe to login success event for cart sync
    this.loginSubscription = this.authService.loginSuccess.subscribe(() => {
      console.log('Login success detected, fetching cart from backend');
      this.fetchUserCart();
    });
  }
  
  ngOnDestroy(): void {
    this.loginSubscription?.unsubscribe();
  }
  
  private fetchUserCart(): void {
    this.cartService.getCartItems().subscribe({
        next: () => {
          console.log('Cart loaded from backend');
        },
        error: (error: any) => {
          console.error('Error loading cart:', error);
        }
      });
  }
  
  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(value => {
      const newValue = !value;
      this.toggleBodyScroll(!newValue);
      return newValue;
    });
  }
  
  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
    this.toggleBodyScroll(true);
  }
  
  private toggleBodyScroll(enable: boolean): void {
    if (typeof document !== 'undefined') {
      if (this.mobileMenuOpen()) {
        this.renderer.addClass(document.body, 'overflow-hidden');
      } else {
        this.renderer.removeClass(document.body, 'overflow-hidden');
      }
    }
  }
  
  logout(): void {
    this.authService.logout();
    this.cartService.clear();
    this.closeMobileMenu();
  }
  
  toggleLanguage(): void {
    this.languageService.toggleLanguage();
  }
  
  toggleCart(): void {
    this.cartService.toggle();
  }
}
