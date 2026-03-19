import { Component, inject, OnInit, signal, computed } from '@angular/core';
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
    <main class="home-page min-h-screen bg-surface">
      <!-- Premium Hero Section -->
      <section class="relative px-6 py-10 md:py-20 max-w-7xl mx-auto overflow-hidden">
        <div class="relative rounded-2xl md:rounded-3xl overflow-hidden min-h-[400px] md:min-h-[550px] flex items-center p-8 md:p-16 bg-gradient-to-br from-primary to-primary-container text-on-primary">
          <!-- Topographic Decorative Background -->
          <div class="absolute inset-0 opacity-20 pointer-events-none" 
               style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCrToAN7K9bxCYHNmah4SPbCguXNVlpK-DeQWeEBnHb8hhrK_YwTkoUXoEOh-RgjYVbFZj2ZzFPFjqLgEqS81zBG3mBRaFpNCTpPthaRKkjbY6cN5ywiH6wrgPH-fov4huJ80NbYSMgUyawNMMrAIHqttsqobdz8M4Yk_ERm3md8eXwLlW4PLs3aIXrOye6hD6Mc0OtdU9LpkjMLI7eeChndSjrvjUUdPvpHGIlYDvLm3UBFRbdvqH0krtaLiZxlv72URSOjaoPfUbP'); background-size: cover; background-position: center;">
          </div>
          
          <div class="relative z-10 max-w-2xl animate-fade-in text-start">
            <h1 class="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-none mb-6">
              {{ 'home.welcome' | translate }}
            </h1>
            <p class="font-body text-lg md:text-xl opacity-90 mb-10 max-w-lg leading-relaxed">
              {{ 'home.subtitle' | translate }}
            </p>
            <div class="flex flex-wrap gap-4">
              <a [routerLink]="'/' + currentLang + '/products'" 
                 class="bg-surface-container-lowest text-primary font-headline font-bold px-10 py-4 rounded-full hover:scale-105 active:scale-95 transition-transform duration-300 shadow-xl flex items-center gap-3">
                {{ 'home.shopNow' | translate }}
                <span class="material-symbols-outlined">arrow_forward</span>
              </a>
              @if (!isLoggedIn()) {
                <a [routerLink]="'/' + currentLang + '/auth/register'" 
                   class="bg-white/10 backdrop-blur-md border border-white/20 text-white font-headline font-bold px-10 py-4 rounded-full hover:bg-white/20 transition-all duration-300">
                  {{ 'home.createAccount' | translate }}
                </a>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- Bento-Style Categories -->
      <section class="categories px-6 py-12 max-w-7xl mx-auto">
        <div class="flex justify-between items-end mb-10">
          <div>
            <h2 class="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
              {{ 'home.categories' | translate }}
            </h2>
            <p class="text-on-surface-variant font-body text-xs uppercase tracking-widest animate-fade-in-up" style="animation-delay: 100ms">{{ 'home.browseByDept' | translate }}</p>
          </div>
          <a [routerLink]="['/' + currentLang + '/categories']" 
             class="text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all group">
            {{ 'home.viewAll' | translate }}
            <span class="material-symbols-outlined transform group-hover:translate-x-1 transition-transform">chevron_right</span>
          </a>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
          @for (category of categories(); track category.id) {
            <a [routerLink]="['/' + currentLang + '/products']" 
               [queryParams]="{categoryId: category.id}"
               class="group cursor-pointer aspect-square rounded-2xl bg-surface-container-low flex flex-col items-center justify-center p-6 hover:bg-white hover:shadow-2xl transition-all duration-500 relative overflow-hidden text-center">
              
              <div class="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500">
                <span class="material-symbols-outlined text-4xl text-primary">{{ getCategoryIcon(category.name) }}</span>
              </div>
              
              <span class="font-headline font-bold text-lg text-on-surface">{{ category.name }}</span>
              <p class="text-on-surface-variant text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {{ category.productsCount || 0 }} {{ 'nav.products' | translate }}
              </p>
              
              <!-- Subtle inner glow on hover -->
              <div class="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/5 rounded-2xl transition-all pointer-events-none"></div>
            </a>
          }
        </div>
      </section>

      <!-- Premium Featured Products Grid -->
      <section class="featured-products px-6 py-12 max-w-7xl mx-auto mb-20 text-start">
        <div class="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <h2 class="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
            {{ 'home.featuredProducts' | translate }}
          </h2>
          
          <div class="flex gap-4">
            @if (canAddProduct()) {
              <button 
                [routerLink]="['/' + currentLang + '/admin/products/add']"
                class="flex items-center gap-2 px-6 py-3 bg-secondary text-on-secondary rounded-xl hover:bg-secondary-dim transition-all shadow-lg hover:shadow-secondary/20 transform hover:-translate-y-0.5">
                <span class="material-symbols-outlined">add_circle</span>
                <span class="font-semibold">{{ 'admin.addProduct.addProduct' | translate }}</span>
              </button>
            }
            <a [routerLink]="'/' + currentLang + '/products'" class="flex items-center gap-2 px-6 py-3 bg-surface-container border border-outline-variant text-on-surface rounded-xl hover:bg-surface-container-high transition-all">
               {{ 'home.viewAll' | translate }}
            </a>
          </div>
        </div>

        @if (featuredProducts().length > 0) {
          <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10">
            @for (product of featuredProducts(); track product.id) {
              <div class="group animate-fade-in-up relative bg-surface-container-lowest rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-transparent hover:border-outline-variant/30 flex flex-col">
                
                <!-- Product Media Area -->
                <div class="relative aspect-[4/5] overflow-hidden bg-surface-container-low">
                  <a [routerLink]="['/' + currentLang + '/products', product.id]">
                    <img [src]="photoService.getMainPhotoUrl(product.productPhotos || product.productphotos) || placeholder" 
                         [alt]="product.name"
                         class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                  </a>
                  
                  <!-- Quality Badges -->
                  <div class="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                    @if (product.haveSale) {
                      <span class="bg-error text-on-error text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                        {{ 'product.sale' | translate }}
                      </span>
                    }
                    @if (product.isFasting) {
                      <span class="bg-primary text-on-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                        {{ 'product.fasting' | translate }}
                      </span>
                    }
                  </div>

                  <!-- Quick Action Button (Wishlist) -->
                  <button 
                    class="absolute top-2 right-2 md:top-4 md:right-4 z-20 p-2 md:p-2.5 bg-white/80 backdrop-blur-md rounded-full shadow-xl hover:bg-primary hover:text-white transition-all duration-300 transform hover:scale-110 active:scale-90"
                    [class.text-primary]="wishlistIds().has(product.id)"
                    [class.text-on-surface-variant]="!wishlistIds().has(product.id)"
                    (click)="toggleWishlist(product, $event)">
                    <span class="material-symbols-outlined text-lg md:text-xl flex items-center justify-center leading-none" 
                          [style.font-variation-settings]="wishlistIds().has(product.id) ? '\\'FILL\\' 1' : '\\'FILL\\' 0'">
                      favorite
                    </span>
                  </button>

                  <!-- Glassmorphism Add to Cart Tray -->
                  <div class="absolute inset-x-4 bottom-4 glass-tray p-4 rounded-xl translate-y-20 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-between shadow-2xl overflow-hidden">
                    <span class="font-headline font-bold text-sm text-on-surface">{{ 'product.quickAdd' | translate }}</span>
                    <button 
                      class="bg-primary text-on-primary p-2 rounded-full hover:scale-110 active:scale-95 transition-all shadow-lg"
                      [disabled]="product.shownQuantity <= 0"
                      (click)="addToCart(product, $event)">
                      <span class="material-symbols-outlined text-sm">add</span>
                    </button>
                    <!-- Glass effect overlay for the tray -->
                    <div class="absolute inset-0 bg-white/10 -z-10"></div>
                  </div>
                </div>

                <!-- Product Content Info -->
                <div class="p-3 md:p-6 flex flex-col flex-grow text-start">
                  <div class="flex justify-between items-start mb-1 md:mb-3">
                    <a [routerLink]="['/' + currentLang + '/products', product.id]" class="hover:text-primary transition-colors">
                      <h3 class="font-headline font-bold text-xs md:text-lg leading-tight line-clamp-1 truncate block max-w-[120px] md:max-w-[180px]">
                        {{ product.name }}
                      </h3>
                    </a>
                    <div class="hidden md:flex items-center gap-1 text-tertiary">
                      <span class="material-symbols-outlined text-xs" style="font-variation-settings: 'FILL' 1;">star</span>
                      <span class="text-xs font-black">4.9</span>
                    </div>
                  </div>
                  
                  <p class="text-on-surface-variant text-[10px] md:text-xs mb-2 md:mb-6 line-clamp-1 md:line-clamp-2 leading-relaxed flex-grow">
                    {{ 'product.premiumNote' | translate }}
                  </p>

                  <div class="flex items-center justify-between mt-auto">
                    <div class="flex flex-col">
                      <span class="text-sm md:text-2xl font-black text-primary font-headline">{{ product.newPrice | currency:'EGP':'symbol':'1.0-0':'en-EG' }}</span>
                      @if (product.oldPrice > product.newPrice) {
                        <span class="text-[8px] md:text-xs text-outline line-through">{{ product.oldPrice | currency:'EGP':'symbol':'1.0-0':'en-EG' }}</span>
                      }
                    </div>
                    
                    @if (product.shownQuantity <= 0) {
                      <span class="px-3 py-1 bg-surface-container-high text-on-surface-variant text-[10px] font-bold rounded-full">
                        {{ 'product.outOfStock' | translate }}
                      </span>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="text-center py-20 bg-surface-container-low rounded-3xl border-2 border-dashed border-outline-variant/30 text-on-surface-variant">
            <span class="material-symbols-outlined text-6xl mb-4 opacity-20">inventory_2</span>
            <p class="font-headline font-bold">{{ 'home.noProducts' | translate }}</p>
          </div>
        }
      </section>
    </main>
  `,
  styles: []
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
  
  // Check if user is logged in
  isLoggedIn = computed(() => !!this.tokenService.getUserId());
  
  canAddProduct = computed(() => {
    return this.authService.isLoggedIn() && (this.tokenService.isSeller() || this.tokenService.hasRole('Admin'));
  });
  
  get currentLang(): string {
    return this.languageService.currentLanguage();
  }

  getCategoryIcon(name: string): string {
    const iconMap: { [key: string]: string } = {
      'Electronics': 'devices',
      'Phones': 'smartphone',
      'Computers': 'laptop_mac',
      'Home': 'home',
      'Fashion': 'apparel',
      'Beauty': 'content_cut',
      'Sports': 'sports_basketball',
      'Toys': 'toys',
      'Grocery': 'shopping_basket',
      'Health': 'health_and_safety',
      'Automotive': 'directions_car',
      'Books': 'menu_book'
    };
    return iconMap[name] || 'inventory_2';
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
        } else if (response && typeof response === 'object') {
          products = response.getProducts || response.GetProducts ||
                     response.items || response.Items || 
                     response.data || response.Data || [];
        }
        this.featuredProducts.set(products.map(p => this.normalizeProduct(p)));
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

  private normalizeProduct(p: any): any {
    if (!p) return p;
    return {
      ...p,
      id: p.id || p.Id,
      name: p.name || p.Name,
      description: p.description || p.Description,
      price: p.price || p.Price,
      newPrice: p.newPrice || p.NewPrice,
      oldPrice: p.oldPrice || p.OldPrice,
      categoryId: p.categoryId || p.CategoryId,
      categoryName: p.categoryName || p.CategoryName,
      supplierId: p.supplierId || p.SupplierId,
      shownQuantity: p.shownQuantity || (p.shownQuantity === 0 ? 0 : (p.ShownQuantity || 0)),
      quantityInStock: p.quantityInStock || p.QuantityInStock,
      productPhotos: p.productPhotos || p.ProductPhotos || p.productphotos || [],
      haveSale: p.haveSale ?? p.HaveSale ?? false,
      isFasting: p.isFasting ?? p.IsFasting ?? false,
      popularity: p.popularity || p.Popularity || 0,
      reviewCount: p.reviewCount || p.ReviewCount || 0
    };
  }
}
