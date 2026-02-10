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
                    <!-- Product Image -->
                    <a [routerLink]="['/' + currentLang + '/products', product.id]" class="block">
                      <div class="h-40 sm:h-48 bg-gray-100 flex items-center justify-center overflow-hidden relative">
                          @if ((product.productPhotos && product.productPhotos.length > 0) || (product.productphotos && product.productphotos.length > 0)) {
                            <img [src]="photoService.getPhotoUrl((product.productPhotos || product.productphotos)[0].fileName)" 
                                 [alt]="product.name"
                                 class="h-full w-full object-cover">
                          } @else {
                            <img [src]="placeholder" 
                                 [alt]="product.name"
                                 class="h-full w-full object-cover p-4">
                          }
                          <!-- Labels - Sale and Fasting -->
                          <div class="absolute top-2 left-2 right-2 flex justify-between items-start pointer-events-none">
                            @if (product.haveSale) {
                              <span class="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold z-10">
                                {{ 'product.sale' | translate }}
                              </span>
                            }
                            @if (product.isFasting) {
                              <span class="bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold z-10">
                                {{ 'product.fasting' | translate }}
                              </span>
                            }
                          </div>
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
  private router = inject(Router);
  photoService = inject(PhotoService);
  
  // Placeholder image URL
  placeholder = 'assets/images/placeholder.svg';
  
  featuredProducts = signal<any[]>([]);
  categories = signal<any[]>([]);
  
  // Get current language for routerLink
  get currentLang(): string {
    return this.languageService.currentLanguage();
  }

  ngOnInit(): void {
    this.loadFeaturedProducts();
    this.loadCategories();
  }
  
  private loadFeaturedProducts(): void {
    this.productService.getHotestProducts(8).subscribe({
      next: (response: any) => {
        console.log('Hotest Products API Response:', response);
        let products: any[] = [];
        if (Array.isArray(response)) {
          products = response;
        } else if (response && Array.isArray(response.items)) {
          products = response.items;
        } else if (response && Array.isArray(response.data)) {
          products = response.data;
        } else if (response && response.data && Array.isArray(response.data.items)) {
          products = response.data.items;
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
