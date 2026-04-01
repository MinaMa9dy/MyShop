import { Component, inject, signal, OnInit, OnDestroy, Renderer2, computed, effect } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, Event, NavigationEnd } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';
import { LanguageService } from './core/services/language.service';
import { TokenService } from './core/services/token.service';
import { CartComponent } from './features/cart/cart.component';
import { ToastComponent } from './shared/toast/toast.component';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { UserProfile } from './core/models/auth.model';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslateModule, CartComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private languageService = inject(LanguageService);
  private tokenService = inject(TokenService);
  private renderer = inject(Renderer2);
  private router = inject(Router);
  
  private loginSubscription?: Subscription;
  private routerSubscription?: Subscription;
  
  title = 'MyShop';
  
  isLoggedIn = this.authService.isLoggedIn;
  cartItemCount = this.cartService.totalItems;
  currentLanguage = this.languageService.currentLanguage;
  
  // User profile for photo
  private userProfile = signal<UserProfile | null>(null);
  
  // Get user initials for avatar
  userInitials = computed(() => {
    const name = this.tokenService.getName();
    if (name) {
      const parts = name.split(' ');
      return parts.map(p => p.charAt(0)).join('').toUpperCase().slice(0, 2);
    }
    return '👤';
  });
  
  // Get user photo URL — computed so it only recalculates when userProfile changes
  userPhotoUrl = computed(() => {
    const profile = this.userProfile();
    if (profile?.userPhoto?.relativePath) {
      const normalizedPath = profile.userPhoto.relativePath.replace(/\\/g, '/');
      const parts = normalizedPath.split('/');
      const fileName = parts[parts.length - 1];
      return `${environment.apiUrl}/Photo/UserPhoto/${fileName}`;
    }
    return '';
  });
  
  // Mobile menu state
  mobileMenuOpen = signal(false);

  constructor() {
    effect(() => {
      const isLocked = this.mobileMenuOpen() || this.cartService.isOpen();
      this.toggleBodyScroll(isLocked);
    });
  }
  
  ngOnInit(): void {
    // Load cart from local storage first (for quick display)
    this.cartService.loadFromStorage();
    
    // If user is logged in, fetch cart from backend
    const userId = this.tokenService.getUserId();
    if (this.authService.isAuthenticated() && userId) {
      this.fetchUserCart();
      this.loadUserProfile();
    }
    
    // Subscribe to login success event for cart sync
    this.loginSubscription = this.authService.loginSuccess.subscribe(() => {
      this.fetchUserCart();
      this.loadUserProfile();
    });
    
    // Scroll to top on navigation
    this.routerSubscription = this.router.events.pipe(
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  
  ngOnDestroy(): void {
    this.loginSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
  }
  
  private fetchUserCart(): void {
    this.cartService.getCartItems().subscribe({
        next: () => { /* cart loaded */ },
        error: (error: any) => {
          if (error.status === 401) return; // User not authenticated — keep local cart
          console.error('Error loading cart:', error);
        }
      });
  }
  
  private loadUserProfile(): void {
    const userId = this.tokenService.getUserId();
    if (!userId) return;
    
    this.authService.getUserProfile(userId).subscribe({
      next: (profile) => {
        this.userProfile.set(profile);
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
      }
    });
  }
  
  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }
  
  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
  
  private toggleBodyScroll(lock: boolean): void {
    if (typeof document !== 'undefined') {
      if (lock) {
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
