import { Component, inject, OnInit, signal, effect } from '@angular/core';
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

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslatePipe],
  template: `
    <div class="products-page min-h-screen bg-gray-50 py-8">
      <div class="max-w-7xl mx-auto px-4">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">{{ 'home.featuredProducts' | translate }}</h1>
          <p class="text-gray-500">{{ 'home.subtitle' | translate }}</p>
        </div>
        
        <!-- Filters Bar -->
        <div class="card mb-8 p-4">
          <div class="flex flex-wrap gap-4 items-center justify-center">
            <!-- Search -->
            <div class="form-group mb-0">
              <input 
                type="text" 
                [(ngModel)]="searchTerm"
                (ngModelChange)="onFilterChange()"
                class="input px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                [placeholder]="'home.search' | translate">
            </div>
            
            <!-- Categories -->
            <div class="form-group mb-0">
              <select 
                [(ngModel)]="selectedCategory"
                (ngModelChange)="onFilterChange()"
                class="input px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">{{ 'home.allCategories' | translate }}</option>
                @for (category of categories(); track category.id) {
                  <option [value]="category.id">{{ category.name }}</option>
                }
              </select>
            </div>
            
            <!-- Price Range -->
            <div class="form-group mb-0">
              <div class="flex gap-2 items-center">
                <input 
                  type="number" 
                  [(ngModel)]="minPrice"
                  (ngModelChange)="onFilterChange()"
                  class="input w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  [placeholder]="'home.minPrice' | translate">
                <span class="text-gray-400">-</span>
                <input 
                  type="number" 
                  [(ngModel)]="maxPrice"
                  (ngModelChange)="onFilterChange()"
                  class="input w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  [placeholder]="'home.maxPrice' | translate">
              </div>
            </div>
            
            <!-- On Sale Filter -->
            <label class="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                [(ngModel)]="onSaleOnly"
                (ngModelChange)="onFilterChange()"
                class="w-4 h-4 text-blue-600 rounded">
              <span class="text-gray-700">{{ 'home.onSaleOnly' | translate }}</span>
            </label>
            
            <button 
              class="btn btn-secondary px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              (click)="clearFilters()">
              {{ 'home.clear' | translate }}
            </button>
          </div>
        </div>
        
        <!-- Results Count -->
        <div class="text-center mb-6">
          <span class="text-gray-500">
            {{ 'home.showingProducts' | translate:{'count': products().length} }}
          </span>
        </div>
        
        @if (loading()) {
          <div class="flex justify-center py-12">
            <div class="loading-spinner w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        } @else if (products().length === 0) {
          <div class="card text-center py-12 bg-white rounded-xl shadow">
            <p class="text-gray-500 mb-4">{{ 'home.noProductsFound' | translate }}</p>
            <button class="btn btn-primary px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" (click)="clearFilters()">
              {{ 'home.clear' | translate }}
            </button>
          </div>
        } @else {
          <!-- Products Grid - Centered -->
          <div class="flex justify-center">
            <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 max-w-7xl w-full px-2 sm:px-0">
              @for (product of products(); track product.id) {
                <a [routerLink]="['/' + currentLang + '/products', product.id]" 
                   class="product-card card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer block bg-white rounded-lg overflow-hidden"
                   style="min-height: auto;">
                  <!-- Product Image -->
                  <div class="h-36 sm:h-48 bg-gray-100 flex items-center justify-center overflow-hidden relative">
                    @if ((product.productPhotos && product.productPhotos.length > 0) || (product.productphotos && product.productphotos.length > 0)) {
                      <img [src]="photoService.getPhotoUrl((product.productPhotos || product.productphotos)[0].fileName)" 
                           [alt]="product.name"
                           class="h-full w-full object-cover">
                    } @else {
                      <span class="text-6xl text-gray-300">📦</span>
                    }
                    @if (product.haveSale) {
                      <span class="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        {{ 'product.sale' | translate }}
                      </span>
                    }
                    @if (product.isFasting) {
                      <span class="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        {{ 'product.fasting' | translate }}
                      </span>
                    }
                  </div>
                  <!-- Product Info -->
                  <div class="p-2 sm:p-4 text-center">
                    <h3 class="font-bold text-xs sm:text-base mb-1 text-gray-800 truncate px-1">
                      {{ product.name }}
                    </h3>
                    <!-- Price -->
                    <div class="mb-1 sm:mb-2">
                      <span class="text-base sm:text-2xl font-bold text-red-600">
                        {{ product.newPrice | currency:'EGP':'symbol':'1.0-0':'en-EG' }}
                      </span>
                    </div>
                    <!-- Quantity -->
                    <div class="mb-1">
                      @if (product.shownQuantity > 0) {
                        <span class="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
                          <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                          {{ 'product.inStock' | translate }} ({{ product.shownQuantity }})
                        </span>
                      } @else {
                        <span class="inline-flex items-center gap-1 text-red-500 text-sm font-medium">
                          <span class="w-2 h-2 bg-red-500 rounded-full"></span>
                          {{ 'product.outOfStock' | translate }}
                        </span>
                      }
                    </div>
                    <!-- Category -->
                    @if (product.categoryName) {
                      <p class="text-gray-500 text-sm truncate px-2 mb-3">
                        {{ product.categoryName }}
                      </p>
                    }
                    <!-- Add to Cart Button -->
                    <button 
                      class="w-full py-1.5 sm:py-2 px-3 sm:px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 text-xs sm:text-base"
                      [class.opacity-50]="product.shownQuantity <= 0"
                      [class.cursor-not-allowed]="product.shownQuantity <= 0"
                      [disabled]="product.shownQuantity <= 0"
                      (click)="addToCart(product, $event)">
                      {{ product.shownQuantity > 0 ? ('product.addToCart' | translate) : ('product.outOfStock' | translate) }}
                    </button>
                  </div>
                </a>
              }
            </div>
          </div>
          
          <!-- Pagination - Centered -->
          @if (totalPages() >= 1) {
            <div class="pagination flex flex-col items-center gap-4 mt-8">
              <div class="text-sm text-gray-500">
                {{ 'home.pageInfo' | translate:{'current': currentPage(), 'total': totalPages()} }}
              </div>
              <div class="flex justify-center gap-2">
                <button 
                  class="btn btn-secondary px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                  [disabled]="currentPage() === 1"
                  (click)="goToPage(currentPage() - 1)">
                  {{ 'home.previous' | translate }}
                </button>
                @for (page of getPages(); track page) {
                  <button 
                    class="px-4 py-2 rounded-lg"
                    [class.bg-blue-600]="page === currentPage()"
                    [class.text-white]="page === currentPage()"
                    [class.bg-gray-200]="page !== currentPage()"
                    [class.text-gray-700]="page !== currentPage()"
                    (click)="goToPage(page)">
                    {{ page }}
                  </button>
                }
                <button 
                  class="btn btn-secondary px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                  [disabled]="currentPage() === totalPages()"
                  (click)="goToPage(currentPage() + 1)">
                  {{ 'home.next' | translate }}
                </button>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
  private languageService = inject(LanguageService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private router = inject(Router);
  photoService = inject(PhotoService);
  
  products = signal<any[]>([]);
  categories = signal<any[]>([]);
  loading = signal(false);
  currentPage = signal(1);
  pageSize = 8;
  totalPages = signal(1);
  
  // Get current language for routerLink
  get currentLang(): string {
    return this.languageService.currentLanguage();
  }
  
  // Filters
  searchTerm = '';
  selectedCategory = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  onSaleOnly = false;
  
  constructor() {
    effect(() => {
      this.loadProducts();
    });
  }
  
  ngOnInit(): void {
    this.loadCategories();
    
    // Read query params
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
        console.log('Products API Response:', response);
        let prods: any[] = [];
        if (Array.isArray(response)) {
          prods = response;
        } else if (response && Array.isArray(response.getProducts)) {
          prods = response.getProducts;
        } else if (response && Array.isArray(response.items)) {
          prods = response.items;
        } else if (response && Array.isArray(response.data)) {
          prods = response.data;
        } else if (response && response.data && Array.isArray(response.data.items)) {
          prods = response.data.items;
        }
        this.products.set(prods);
        
        // Handle pagination using TotalPages from response
        let totalPages = 1;
        if (response && response.totalPages) {
          totalPages = response.totalPages;
        } else if (response && response.data && response.data.totalPages) {
          totalPages = response.data.totalPages;
        } else {
          // Calculate total pages from totalCount if available
          let totalCount = 0;
          if (response && response.totalCount) {
            totalCount = response.totalCount;
          } else if (response && response.data && response.data.totalCount) {
            totalCount = response.data.totalCount;
          }
          if (totalCount > 0) {
            totalPages = Math.ceil(totalCount / this.pageSize);
          } else if (prods.length > 0) {
            totalPages = Math.ceil(prods.length / this.pageSize);
          }
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
        console.log('Categories API Response:', response);
        let cats: any[] = [];
        if (Array.isArray(response)) {
          cats = response;
        } else if (response && Array.isArray(response.data)) {
          cats = response.data;
        } else if (response && response.items) {
          cats = response.items;
        }
        this.categories.set(cats);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
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
    
    // User is logged in, add to cart (auth interceptor will handle 401 by redirecting to login)
    // userId is now automatically extracted from JWT token in cartService
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
