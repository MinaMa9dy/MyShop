import { Component, inject, signal, OnInit, OnDestroy, Renderer2, computed, effect, HostListener, ElementRef } from '@angular/core';
import { RouterOutlet, RouterLink, Router, Event, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';
import { LanguageService } from './core/services/language.service';
import { TokenService } from './core/services/token.service';
import { CartComponent } from './features/cart/cart.component';
import { ToastComponent } from './shared/toast/toast.component';
import { Subscription, Subject } from 'rxjs';
import { filter, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { UserProfile } from './core/models/auth.model';
import { ProfileService } from './core/services/profile.service';
import { PhotoService } from './core/services/photo.service';
import { ProductService } from './core/services/product.service';
import { Product } from './core/models/product.model';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, TranslateModule, FormsModule, CartComponent, ToastComponent],
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
  private profileService = inject(ProfileService);
  public photoService = inject(PhotoService);
  private productService = inject(ProductService);
  private elementRef = inject(ElementRef);
  
  private loginSubscription?: Subscription;
  private routerSubscription?: Subscription;
  private searchSubscription?: Subscription;
  private searchSubject = new Subject<string>();
  
  title = 'MyShop';
  
  isLoggedIn = this.authService.isLoggedIn;
  cartItemCount = this.cartService.totalItems;
  currentLanguage = this.languageService.currentLanguage;
  
  // Search
  searchQuery = '';
  searchResults = signal<Product[]>([]);
  showSearchDropdown = signal(false);
  isSearching = signal(false);
  
  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/' + this.currentLanguage() + '/products'], { 
        queryParams: { searchTerm: this.searchQuery.trim() }
      });
      // Clear the search bar after navigation
      this.searchQuery = '';
      this.searchResults.set([]);
      this.showSearchDropdown.set(false);
      this.closeMobileMenu(); // Close mobile menu if open
    }
  }

  onSearchInput(term: string): void {
    this.searchQuery = term;
    this.searchSubject.next(term);
    this.showSearchDropdown.set(term.length >= 2);
  }

  selectProduct(productId: string): void {
    this.router.navigate(['/' + this.currentLanguage() + '/products', productId]);
    this.searchQuery = '';
    this.searchResults.set([]);
    this.showSearchDropdown.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showSearchDropdown.set(false);
    }
  }

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
    return this.photoService.getPhotoUrl(this.userProfile()?.imageUrl, 'user');
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
      this.showSearchDropdown.set(false);
    });

    // Search Autocomplete Logic
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (!term.trim() || term.length < 2) {
          this.searchResults.set([]);
          this.isSearching.set(false);
          return [null];
        }
        this.isSearching.set(true);
        return this.productService.getAll({ searchTerm: term, pageSize: 5 });
      })
    ).subscribe(res => {
      if (res && 'isSuccess' in res && res.isSuccess && res.data) {
        this.searchResults.set(res.data.items);
      } else {
        this.searchResults.set([]);
      }
      this.isSearching.set(false);
    });
  }
  
  ngOnDestroy(): void {
    this.loginSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
    this.searchSubscription?.unsubscribe();
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
    this.profileService.getProfile().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.userProfile.set(res.data);
        }
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
