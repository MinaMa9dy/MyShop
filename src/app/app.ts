import { Component, inject, signal, OnInit, OnDestroy, Renderer2, computed, effect, HostListener, ElementRef } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, Event as RouterEvent, NavigationEnd } from '@angular/router';
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
import { filter, debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { UserProfile } from './core/models/auth.model';
import { ProfileService } from './core/services/profile.service';
import { PhotoService } from './core/services/photo.service';
import { ProductService } from './core/services/product.service';
import { Product } from './core/models/product.model';
import { environment } from '../environments/environment';
import { CategoryService } from './core/services/category.service';
import { Category } from './core/models/category.model';
import { WishService } from './core/services/wish.service';



@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, TranslateModule, FormsModule, CartComponent, ToastComponent],
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
  private categoryService = inject(CategoryService);
  private wishService = inject(WishService);
  
  private loginSubscription?: Subscription;
  private routerSubscription?: Subscription;
  private searchSubscription?: Subscription;
  private searchSubject = new Subject<string>();
  
  title = 'MyShop';
  
  isLoggedIn = this.authService.isLoggedIn;
  cartItemCount = this.cartService.total;
  wishItemCount = this.wishService.count;
  currentLanguage = this.languageService.currentLanguage;
  
  // Search
  searchQuery = '';
  searchResults = signal<Product[]>([]);
  showSearchDropdown = signal(false);
  isSearching = signal(false);
  
  // Categories
  categoryTree = signal<Category[]>([]);
  
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
    
    // Set visibility and searching state immediately to prevent flicker during debounce
    const isValid = term.trim().length >= 2;
    this.showSearchDropdown.set(isValid);
    if (isValid) {
      this.isSearching.set(true);
    } else {
      this.isSearching.set(false);
      this.searchResults.set([]);
    }
  }

  closeSearch(): void {
    this.searchQuery = '';
    this.searchResults.set([]);
    this.showSearchDropdown.set(false);
  }

  @HostListener('document:mousedown', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const searchContainers = document.querySelectorAll('.group.relative');
    let clickedInside = false;
    searchContainers.forEach(container => {
      if (container.contains(event.target as Node)) {
        clickedInside = true;
      }
    });

    if (!clickedInside) {
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
  expandedCategories = signal<Set<string>>(new Set());

  toggleCategory(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.expandedCategories.update(set => {
      const newSet = new Set(set);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  isExpanded(id: string): boolean {
    return this.expandedCategories().has(id);
  }

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
      this.loadWishes();
    }
    
    this.loadCategoryTree();
    
    // Subscribe to login success event for cart sync
    this.loginSubscription = this.authService.loginSuccess.subscribe(() => {
      this.fetchUserCart();
      this.loadUserProfile();
      this.loadWishes();
    });
    
    // Scroll to top on navigation
    this.routerSubscription = this.router.events.pipe(
      filter((event: RouterEvent): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.showSearchDropdown.set(false);
    });

    // Search Autocomplete Logic with robust error handling
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
        // Catch errors inside switchMap so the main observable doesn't die
        return this.productService.getAll({ searchTerm: term, pageSize: 5 }).pipe(
          // Ensure isSearching is false even on error
          catchError(err => {
            console.error('Search error:', err);
            this.isSearching.set(false);
            this.searchResults.set([]);
            return of(null);
          })
        );
      })
    ).subscribe({
      next: (res: any) => {
        if (res && res.success && res.data) {
          const normalized = (res.data || []).map((p: any) => this.normalizeProduct(p));
          this.searchResults.set(normalized);
        } else {
          this.searchResults.set([]);
        }
        this.isSearching.set(false);
      },
      error: (err) => {
        console.error('Search subscription fatal error:', err);
        this.isSearching.set(false);
        this.searchResults.set([]);
      }
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
        if (res.success && res.data) {
          this.userProfile.set(res.data);
        }
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
      }
    });
  }

  private loadCategoryTree(): void {
    this.categoryService.getTree().subscribe({
      next: (tree) => {
        this.categoryTree.set(tree);
      },
      error: (err) => {
        console.error('Error loading category tree:', err);
      }
    });
  }

  private loadWishes(): void {
    this.wishService.getWishes().subscribe({
      error: (err) => console.error('Error loading wishes:', err)
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

  private normalizeProduct(p: any): any {
    if (!p) return p;
    return {
      ...p,
      id: p.id || p.Id,
      name: p.name || p.Name,
      description: p.description || p.Description,
      newPrice: p.newPrice || p.NewPrice || p.productVariants?.[0]?.newPrice || p.productVariants?.[0]?.NewPrice || 0,
      oldPrice: p.oldPrice || p.OldPrice || p.productVariants?.[0]?.oldPrice || p.productVariants?.[0]?.OldPrice || 0,
      stockQuantity: (p.stockQuantity ?? p.StockQuantity ?? p.productVariants?.[0]?.stockQuantity ?? p.productVariants?.[0]?.StockQuantity) ?? 0,
      categoryId: p.categoryId || p.CategoryId,
      categoryName: p.categoryName || p.CategoryName,
      productPhotos: p.productPhotos || p.ProductPhotos || p.productphotos || [],
      productVariants: p.productVariants || p.ProductVariants || p.productvariants || []
    };
  }
}

