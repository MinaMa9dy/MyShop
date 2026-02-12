import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { LanguageService } from '../../core/services/language.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { PhotoService } from '../../core/services/photo.service';
import { WishService } from '../../core/services/wish.service';
import { TokenService } from '../../core/services/token.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    <div class="home-page">
      <!-- Hero Section -->
      <section class="hero bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
        <div class="container mx-auto px-4 text-center">
          <h1 class="text-4xl md:text-6xl font-bold mb-6">
            {{ 'home.welcome' | translate }}
          </h1>
          <p class="text-xl md:text-2xl mb-8 opacity-90">
            {{ 'home.subtitle' | translate }}
          </p>
          <div class="flex justify-center gap-4">
            <a [routerLink]="'/' + currentLang + '/products'" 
               class="btn bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors">
              {{ 'home.shopNow' | translate }}
            </a>
            <a [routerLink]="'/' + currentLang + '/auth/register'" 
               class="btn border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold transition-colors">
              {{ 'home.createAccount' | translate }}
            </a>
          </div>
        </div>
      </section>

      <!-- Categories Section -->
      <section class="categories py-16 bg-gray-50">
        <div class="container mx-auto px-4">
          <h2 class="section-title text-center text-2xl font-bold mb-8 text-gray-800">
            {{ 'home.categories' | translate }}
          </h2>
          @if (categories().length > 0) {
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
              @for (category of categories(); track category.id) {
                <a [routerLink]="['/' + currentLang + '/products']" 
                   [queryParams]="{categoryId: category.id}"
                   class="category-card card bg-white hover:shadow-xl hover:-translate-y-1 cursor-pointer text-center p-6 rounded-xl transform transition-all duration-300">
                  <div class="category-icon text-5xl mb-4">
                    📦
                  </div>
                  <h3 class="font-semibold text-lg text-gray-800">{{ category.name }}</h3>
                  <p class="text-gray-500 text-sm mt-2">
                    {{ category.productsCount || 0 }} {{ 'nav.products' | translate }}
                  </p>
                </a>
              }
            </div>
          } @else {
            <div class="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl shadow">
              {{ 'home.noProducts' | translate }}
            </div>
          }
        </div>
      </section>

      <!-- Featured Products Section -->
      <section class="featured-products py-16">
        <div class="max-w-7xl mx-auto px-4">
          <!-- Centered Header -->
          <div class="text-center mb-10">
            <h2 class="text-3xl font-bold mb-3 text-gray-800">
              {{ 'home.featuredProducts' | translate }}
            </h2>
            <a [routerLink]="'/' + currentLang + '/products'" class="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 transition-colors">
              {{ 'home.viewAll' | translate }}
            </a>
          </div>
          
          @if (featuredProducts().length > 0) {
            <div class="flex justify-center">
              <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 max-w-6xl px-2 sm:px-0">
                @for (product of featuredProducts(); track product.id) {
                  <div class="product-card card bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer rounded-lg overflow-hidden"
                       style="min-height: auto;">
                    <!-- Product Image Container -->
                    <a [routerLink]="['/' + currentLang + '/products', product.id]" class="block relative group">
                      <div class="h-40 sm:h-48 bg-gray-100 flex items-center justify-center overflow-hidden relative">
                          @if (photoService.getMainPhotoUrl(product.productPhotos || product.productphotos)) {
                            <img [src]="photoService.getMainPhotoUrl(product.productPhotos || product.productphotos)" 
                                 [alt]="product.name"
                                 class="h-full w-full object-cover">
                          } @else {
                            <img [src]="placeholder" 
                                 [alt]="product.name"
                                 class="h-full w-full object-cover p-4">
                          }
                          
                          <!-- Sale and Fasting Labels -->
                          <div class="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none z-10">
                            @if (product.haveSale) {
                              <span class="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                                {{ 'product.sale' | translate }}
                              </span>
                            }
                            @if (product.isFasting) {
                              <span class="bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                                {{ 'product.fasting' | translate }}
                              </span>
                            }
                          </div>
                          
                          <!-- Heart Button -->
                          <button 
                            class="absolute top-2 right-2 z-20 p-1.5 bg-white/90 rounded-full shadow-md hover:bg-red-50 transition-all duration-200 transform hover:scale-110"
                            [class.text-red-500]="wishlistIds().has(product.id)"
                            [class.text-gray-400]="!wishlistIds().has(product.id)"
                            [disabled]="processingId() === product.id"
                            (click)="toggleWishlist(product, $event)">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" [class.fill-current]="wishlistIds().has(product.id)" viewBox="0 0 24 24">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                          </button>
                      </div>
                    </a>
                    
                    <!-- Product Info -->
                    <div class="p-2 sm:p-3 text-center">
                      <a [routerLink]="['/' + currentLang + '/products', product.id]" class="block">
                        <h3 class="font-bold text-[10px] sm:text-sm text-gray-800 line-clamp-2 px-1 leading-tight hover:text-blue-600 transition-colors">
                          {{ product.name }}
                        </h3>
                      </a>
                      <!-- Price -->
                      <div class="mt-1 mb-1">
                        <span class="text-sm sm:text-base font-bold text-red-600">
                          {{ product.newPrice | currency:'EGP':'symbol':'1.0-0':'en-EG' }}
                        </span>
                      </div>
                      <!-- Quantity -->
                      <div class="mb-2">
                        @if (product.shownQuantity > 0) {
                          <span class="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                            <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                            {{ 'product.inStock' | translate }}
                          </span>
                        } @else {
                          <span class="inline-flex items-center gap-1 text-red-500 text-xs font-medium">
                            <span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            {{ 'product.outOfStock' | translate }}
                          </span>
                        }
                      </div>
                      <!-- Add to Cart Button -->
                      <button 
                        class="w-full py-1.5 px-2 sm:px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition-colors duration-200 text-xs"
                        [class.opacity-50]="product.shownQuantity <= 0"
                        [class.cursor-not-allowed]="product.shownQuantity <= 0"
                        [disabled]="product.shownQuantity <= 0"
                        (click)="addToCart(product, $event)">
                        {{ product.shownQuantity > 0 ? ('product.addToCart' | translate) : ('product.outOfStock' | translate) }}
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          } @else {
            <div class="text-center py-12 text-gray-500 bg-white rounded-xl shadow">
              {{ 'home.noProducts' | translate }}
            </div>
          }
        </div>
      </section>
    </div>
  `,
  styles: [`
    .card {
      box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06);
    }
  `]
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private languageService = inject(LanguageService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private wishService = inject(WishService);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  photoService = inject(PhotoService);
  
  // Placeholder image URL
  placeholder = 'assets/images/placeholder.svg';
  
  featuredProducts = signal<any[]>([]);
  categories = signal<any[]>([]);
  
  // Track wishlist items
  wishlistIds = signal<Set<string>>(new Set());
  // Track which product is being processed
  processingId = signal<string | null>(null);
  
  get currentLang(): string {
    return this.languageService.currentLanguage();
  }

  ngOnInit(): void {
    this.loadFeaturedProducts();
    this.loadCategories();
    this.loadWishlist();
  }
  
  private loadFeaturedProducts(): void {
    this.productService.getHotestProducts(8).subscribe({
      next: (response: any) => {
        let products: any[] = [];
        if (Array.isArray(response)) {
          products = response;
        } else if (response && Array.isArray(response.items)) {
          products = response.items;
        }
        this.featuredProducts.set(products);
      },
      error: (error) => {
        console.error('Error loading hotest products:', error);
      }
    });
  }
  
  private loadCategories(): void {
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
