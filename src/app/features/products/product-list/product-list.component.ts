import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { LanguageService } from '../../../core/services/language.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { PhotoService } from '../../../core/services/photo.service';
import { WishService } from '../../../core/services/wish.service';
import { TokenService } from '../../../core/services/token.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslatePipe],
  templateUrl: './product-list.component.html'
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
  private languageService = inject(LanguageService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private wishService = inject(WishService);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  photoService = inject(PhotoService);

  products = signal<any[]>([]);
  categories = signal<any[]>([]);
  loading = signal(false);
  currentPage = signal(1);
  pageSize = 8;
  totalPages = signal(1);

  // Track wishlist items
  wishlistIds = signal<Set<string>>(new Set());
  // Track which product is being processed
  processingId = signal<string | null>(null);

  get currentLang(): string {
    return this.languageService.currentLanguage();
  }

  // Filters
  searchTerm = '';
  selectedCategory = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  onSaleOnly = false;

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
    this.loadWishlist();

    this.route.queryParams.subscribe(params => {
      if (params['categoryId']) {
        this.selectedCategory = params['categoryId'];
        this.loadProducts();
      }
    });
  }

  loadProducts(): void {
    this.loading.set(true);

    this.productService.getFiltered({
      searchTerm: this.searchTerm,
      categoryId: this.selectedCategory || undefined,
      minPrice: this.minPrice || undefined,
      maxPrice: this.maxPrice || undefined,
      isOnSale: this.onSaleOnly || undefined,
      page: this.currentPage(),
      pageSize: this.pageSize
    }).subscribe({
      next: (response: any) => {
        console.log('Products API Response:', JSON.stringify(response, null, 2));
        
        let prods: any[] = [];
        
        // Handle different response formats
        if (Array.isArray(response)) {
          prods = response;
        } else if (response && typeof response === 'object') {
          // Try common property names for the products array
          if (Array.isArray(response.items)) {
            prods = response.items;
          } else if (Array.isArray(response.data)) {
            prods = response.data;
          } else if (Array.isArray(response.products)) {
            prods = response.products;
          } else if (Array.isArray(response.result)) {
            prods = response.result;
          } else {
            // Try to find any array property
            const arrayProp = Object.keys(response).find(key => Array.isArray(response[key]));
            if (arrayProp) {
              prods = response[arrayProp];
            }
          }
        }
        
        console.log('Parsed products:', prods.length, 'items');
        this.products.set(prods);

        let totalPages = 1;
        if (response && response.totalPages) {
          totalPages = response.totalPages;
        } else if (response && response.totalCount && this.pageSize) {
          totalPages = Math.ceil(response.totalCount / this.pageSize);
        }
        this.totalPages.set(Math.max(1, totalPages));
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading.set(false);
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (response: any) => {
        let cats: any[] = [];
        if (Array.isArray(response)) {
          cats = response;
        } else if (response && Array.isArray(response.data)) {
          cats = response.data;
        }
        this.categories.set(cats);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadWishlist(): void {
    const userId = this.tokenService.getUserId();
    if (!userId) return;

    this.wishService.getWishes(userId).subscribe({
      next: (wishes) => {
        const ids = new Set<string>();
        wishes.forEach(w => {
          if (w.productId) ids.add(w.productId);
        });
        this.wishlistIds.set(ids);
      },
      error: (error) => {
        console.error('Error loading wishlist:', error);
      }
    });
  }

  toggleWishlist(product: any, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const userId = this.tokenService.getUserId();
    if (!userId) {
      this.router.navigate(['/' + this.currentLang + '/auth/login']);
      return;
    }

    const productId = product.id;
    const isCurrentlyInWishlist = this.wishlistIds().has(productId);

    // Set processing state
    this.processingId.set(productId);

    if (isCurrentlyInWishlist) {
      // Remove from wishlist - wait for API response
      this.wishService.removeWish(userId, productId).subscribe({
        next: () => {
          // Update UI after successful API response
          const currentIds = this.wishlistIds();
          const newIds = new Set<string>();
          currentIds.forEach(id => newIds.add(id));
          newIds.delete(productId);
          this.wishlistIds.set(newIds);
          this.processingId.set(null);
        },
        error: (error) => {
          console.error('Error removing from wishlist:', error);
          this.processingId.set(null);
        }
      });
    } else {
      // Add to wishlist - wait for API response
      this.wishService.addWish({ userId, productId }).subscribe({
        next: () => {
          // Update UI after successful API response
          const currentIds = this.wishlistIds();
          const newIds = new Set<string>();
          currentIds.forEach(id => newIds.add(id));
          newIds.add(productId);
          this.wishlistIds.set(newIds);
          this.processingId.set(null);
        },
        error: (error) => {
          console.error('Error adding to wishlist:', error);
          this.processingId.set(null);
        }
      });
    }
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadProducts();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.onSaleOnly = false;
    this.currentPage.set(1);
    this.loadProducts();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadProducts();
    }
  }

  getPages(): number[] {
    const pages: number[] = [];
    const total = this.totalPages();
    const current = this.currentPage();

    for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
      pages.push(i);
    }

    return pages;
  }

  addToCart(product: any, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (product.shownQuantity <= 0) {
      return;
    }

    this.cartService.addToCart(product.id, 1).subscribe({
      next: () => {
        console.log('Added to cart successfully');
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
      }
    });
  }
}
