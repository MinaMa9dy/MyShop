import { Component, inject, OnInit, signal, computed, OnDestroy } from '@angular/core';
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
    <div class="home-page bg-surface">
      <!-- Premium Hero Section -->
      <section class="relative px-4 sm:px-6 lg:px-10 py-8 md:py-16 max-w-[1920px] mx-auto overflow-hidden">
        <div class="relative rounded-2xl md:rounded-3xl overflow-hidden min-h-[400px] md:min-h-[550px] flex items-center p-8 md:p-16 bg-gradient-to-br from-primary to-primary-container text-on-primary">
          <!-- Topographic Decorative Background -->
          <div class="absolute inset-0 opacity-20 pointer-events-none" 
               style="background-image: url('assets/images/hero-bg.webp'); background-size: cover; background-position: center;">
          </div>
          
          <div class="relative z-10 max-w-2xl animate-fade-in text-center md:text-start mx-auto md:mx-0 flex flex-col items-center md:items-start">
            <h1 class="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-none mb-6">
              {{ 'home.welcome' | translate }}
            </h1>
            <p class="font-body text-lg md:text-xl opacity-90 mb-10 max-w-lg leading-relaxed">
              {{ 'home.subtitle' | translate }}
            </p>
            <div class="flex flex-col sm:flex-row flex-wrap gap-4 justify-center md:justify-start w-full sm:w-auto">
              <a [routerLink]="'/' + currentLang + '/products'" 
                 class="bg-surface-container-lowest text-primary font-headline font-bold px-10 py-4 rounded-full hover:scale-105 active:scale-95 transition-transform duration-300 shadow-xl flex items-center justify-center gap-3">
                {{ 'home.shopNow' | translate }}
                <span class="material-symbols-outlined">arrow_forward</span>
              </a>
              @if (!isLoggedIn()) {
                <a [routerLink]="'/' + currentLang + '/auth/register'" 
                   class="bg-white/10 backdrop-blur-md border border-white/20 text-white font-headline font-bold px-10 py-4 rounded-full hover:bg-white/20 transition-all duration-300 flex items-center justify-center">
                  {{ 'home.createAccount' | translate }}
                </a>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- Dynamic Categories Grid -->
      <section class="categories py-10 max-w-[1920px] mx-auto w-full">
        <div class="flex items-center justify-between mb-8 px-4 sm:px-6 lg:px-10">
          <h2 class="font-headline text-2xl md:text-3xl font-black tracking-tight text-on-surface">
            {{ 'home.categories' | translate }}
          </h2>
          <a [routerLink]="['/' + currentLang + '/categories']" class="text-primary font-black text-xs uppercase tracking-widest hover:underline">{{ 'common.viewAll' | translate }}</a>
        </div>

        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 sm:gap-4 px-4 sm:px-6 lg:px-10">
          @for (category of categories(); track category.id) {
            <a [routerLink]="['/' + currentLang + '/products']" 
               [queryParams]="{categoryId: category.id}"
               class="group cursor-pointer no-underline flex flex-col items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-2xl hover:bg-surface-container-low transition-all duration-300">
              
              <div class="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 rounded-[20px] sm:rounded-[28px] bg-surface-container-low flex items-center justify-center group-hover:bg-primary/5 transition-all duration-500 border border-outline-variant/5 group-hover:border-primary/20 group-hover:shadow-xl group-hover:-translate-y-1">
                <span class="material-symbols-outlined text-2xl sm:text-3xl text-primary transition-transform duration-500 group-hover:scale-110">{{ getCategoryIcon(category.name) }}</span>
              </div>
              
              <span class="font-headline font-black text-[9px] sm:text-[10px] text-on-surface text-center uppercase tracking-widest opacity-70 group-hover:opacity-100 group-hover:text-primary transition-all line-clamp-1">{{ category.name }}</span>
            </a>
          }
        </div>
      </section>

      <!-- Premium Featured Products Grid -->
      <section class="featured-products px-4 sm:px-6 lg:px-10 py-12 max-w-[1920px] mx-auto w-full mb-6 md:mb-20 text-center md:text-start">
        <div class="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 text-center md:text-start">
          <h2 class="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
            {{ 'home.featuredProducts' | translate }}
          </h2>
          
          <div class="flex flex-wrap justify-center md:justify-start gap-4">
            @if (canAddProduct()) {
              <button 
                [routerLink]="['/' + currentLang + '/admin/products/add']"
                class="flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-on-secondary rounded-xl hover:bg-secondary-dim transition-all shadow-lg hover:shadow-secondary/20 transform hover:-translate-y-0.5">
                <span class="material-symbols-outlined">add_circle</span>
                <span class="font-semibold">{{ 'admin.addProduct.addProduct' | translate }}</span>
              </button>
            }
            <a [routerLink]="'/' + currentLang + '/products'" class="flex items-center justify-center gap-2 px-6 py-3 bg-surface-container border border-outline-variant text-on-surface rounded-xl hover:bg-surface-container-high transition-all">
               {{ 'home.viewAll' | translate }}
            </a>
          </div>
        </div>

        @if (displayedProducts().length > 0) {
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6 lg:gap-8">
            @for (product of displayedProducts(); track product.id; let i = $index) {
              <div class="group animate-fade-in-up relative bg-surface-container-lowest rounded-2xl overflow-hidden transition-[transform,shadow,border-color] duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-transparent hover:border-outline-variant/30 flex flex-col"
                   style="will-change: transform, opacity; transform: translateZ(0); backface-visibility: hidden; contain: layout;">
                
                <!-- Product Media Area -->
                <div class="relative aspect-[4/5] overflow-hidden bg-surface-container-low">
                  <a [routerLink]="['/' + currentLang + '/products', product.id]">
                    <img [src]="getMainPhotoUrl(product) || placeholder" 
                         [alt]="product.name"
                         loading="lazy"
                         decoding="async"
                         [attr.fetchpriority]="i < 4 ? 'high' : 'auto'"
                         class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                         style="will-change: transform;">
                  </a>
                  
                  <!-- Quality Badges -->
                  <div class="absolute top-2 left-2 md:top-4 md:left-4 flex flex-col items-start gap-1 pointer-events-none z-10">
                    @if (product.haveSale) {
                      <span class="bg-error/90 md:backdrop-blur-md text-on-error text-[7px] md:text-[10px] font-black uppercase tracking-widest px-2 py-0.5 md:px-2.5 md:py-1 rounded-lg md:rounded-xl shadow-lg ring-1 ring-white/20">
                        {{ 'product.sale' | translate }}
                      </span>
                    }
                    @if (product.isFasting) {
                      <span class="bg-primary/90 md:backdrop-blur-md text-on-primary text-[7px] md:text-[10px] font-black uppercase tracking-widest px-2 py-0.5 md:px-2.5 md:py-1 rounded-lg md:rounded-xl shadow-lg ring-1 ring-white/20">
                        {{ 'product.fasting' | translate }}
                      </span>
                    }
                  </div>

                  <!-- Quick Action Button (Wishlist) -->
                  <button 
                    class="absolute top-2 right-2 md:top-4 md:right-4 z-20 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full shadow-2xl transition-[transform,background-color] duration-300 transform hover:scale-110 active:scale-90 border border-outline-variant/10"
                    [class.bg-red-600]="wishlistIds().has(product.id)"
                    [class.bg-white]="!wishlistIds().has(product.id)"
                    (click)="toggleWishlist(product, $event)">
                    <span class="material-symbols-outlined text-lg md:text-xl leading-none transition-colors duration-300"
                          [class.text-white]="wishlistIds().has(product.id)"
                          [class.text-on-surface-variant]="!wishlistIds().has(product.id)"
                          [style.font-variation-settings]="' &quot;FILL&quot; 0 '">
                      favorite
                    </span>
                  </button>


                </div>

                <!-- Product Content Info -->
                <div class="p-3 md:p-6 flex flex-col flex-grow text-start">
                  <div class="flex items-start justify-between gap-3 mb-2">
                    <a [routerLink]="['/' + currentLang + '/products', product.id]" class="group/title">
                      <h3 class="font-headline font-black text-sm md:text-xl leading-tight line-clamp-2 group-hover/title:text-primary transition-colors">
                        {{ product.name }}
                      </h3>
                    </a>
                    <div class="flex items-center gap-1 bg-surface-container px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg shrink-0">
                      <div class="flex items-center gap-0.5">
                        <span class="material-symbols-outlined text-[12px] md:text-[14px] text-amber-500 fill-current">star</span>
                        <span class="text-[10px] md:text-[11px] font-black text-on-surface">{{ product.averageRating | number:'1.1-1' }}</span>
                      </div>
                      <span class="w-0.5 h-3 bg-outline-variant/20 hidden md:block"></span>
                      <span class="text-[8px] md:text-[9px] font-bold text-outline-variant">({{ product.reviewCount }})</span>
                    </div>
                  </div>
                  
                  <div class="mb-4">
                    <span class="text-[10px] font-black uppercase tracking-[0.2em] text-primary/50">{{ product.categoryName }}</span>
                    @if (product.description) {
                      <p class="text-[11px] md:text-sm text-on-surface-variant/70 line-clamp-2 leading-relaxed mt-1">
                        {{ product.description }}
                      </p>
                    }
                  </div>

                  <div class="space-y-4 mt-auto">
                    <div class="flex items-center justify-between pt-4 border-t border-outline-variant/10 gap-2">
                      <div class="flex flex-col items-start min-w-0">
                        @if (product.oldPrice > product.newPrice) {
                          <span class="text-[9px] md:text-xs font-black text-outline-variant line-through opacity-40 tracking-tighter truncate">
                            {{ product.oldPrice | currency:'EGP':'symbol':'1.0-0':'en-EG' }}
                          </span>
                        }
                        <span class="text-[16px] md:text-2xl font-black text-on-surface font-headline tracking-tighter truncate">
                          {{ product.newPrice | currency:'EGP':'symbol':'1.0-0':'en-EG' }}
                        </span>
                      </div>
                      
                      <div class="flex items-center gap-1 md:gap-2 bg-surface-container-low px-2 md:px-3 py-1.5 md:py-2 rounded-xl md:rounded-2xl border border-outline-variant/5 shrink-0">
                        <span class="material-symbols-outlined text-sm md:text-lg text-outline-variant opacity-40">inventory_2</span>
                        <span class="text-[10px] md:text-[11px] font-black text-on-surface-variant">{{ product.stockQuantity }}</span>
                      </div>
                    </div>
                    
                    @if (product.stockQuantity > 0) {
                      <button (click)="addToCart(product, $event)"
                              class="w-full py-3 md:py-4 bg-primary text-on-primary rounded-xl md:rounded-[20px] font-headline font-black text-[9px] md:text-[11px] uppercase tracking-[0.1em] shadow-[0_15px_30px_rgba(var(--primary-rgb),0.2)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group/btn">
                        <span>{{ 'product.initializeAcquisition' | translate }}</span>
                        <span class="material-symbols-outlined text-base md:text-lg group-hover/btn:rotate-12 transition-transform">shopping_bag</span>
                      </button>
                    } @else {
                      <button disabled
                              class="w-full py-4 bg-surface-container text-outline-variant rounded-[20px] font-headline font-black text-[10px] md:text-[11px] uppercase tracking-[0.1em] flex items-center justify-center gap-3 opacity-50 grayscale">
                        <span>{{ 'product.outOfStock' | translate }}</span>
                        <span class="material-symbols-outlined text-lg">inventory_2</span>
                      </button>
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
    </div>
  `,
  styles: []
})
export class HomeComponent implements OnInit, OnDestroy {
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
  
  // Dynamic grid configuration
  columns = signal<number>(2);
  displayedProducts = computed(() => {
    const products = this.featuredProducts();
    const cols = this.columns();
    // Fill 3 rows on wide grids, 4 rows on narrower
    const targetRows = cols >= 5 ? 3 : (cols === 4 ? 3 : 4);
    const count = cols * targetRows;
    return products.slice(0, count);
  });

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


  private resizeListener?: () => void;

  ngOnInit(): void {
    this.updateColumns();
    this.resizeListener = () => this.updateColumns();
    window.addEventListener('resize', this.resizeListener);
    this.loadFeaturedProducts();
    this.loadCategories();
    this.loadWishlist();
  }

  ngOnDestroy(): void {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  private updateColumns(): void {
    const width = window.innerWidth;
    if (width >= 1536) this.columns.set(6);      // 2XL: 6 columns
    else if (width >= 1280) this.columns.set(5); // XL: 5 columns
    else if (width >= 1024) this.columns.set(4); // Desktop: 4 columns
    else if (width >= 768) this.columns.set(3);  // Tablet: 3 columns
    else this.columns.set(2);                    // Mobile: 2 columns
  }
  
  private loadFeaturedProducts(): void {
    // Load more products to have enough for any screen size (up to 4 rows of 4 = 16)
    this.productService.getHotProducts(24).subscribe({
      next: (result) => {
        if (result.success && result.data) {
          this.featuredProducts.set(result.data.map((p: any) => this.normalizeProduct(p)));
        }
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
    
    this.wishService.getWishes().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const ids = new Set<string>();
          res.data.forEach(w => {
            if (w.productId) ids.add(w.productId);
          });
          this.wishlistIds.set(ids);
        }
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
    
    // --- OPTIMISTIC UPDATE START ---
    const previousIds = new Set(this.wishlistIds());
    const newIds = new Set(this.wishlistIds());
    
    if (isCurrentlyInWishlist) {
      newIds.delete(productId);
    } else {
      newIds.add(productId);
    }
    
    // Update UI immediately
    this.wishlistIds.set(newIds);
    // --- OPTIMISTIC UPDATE END ---

    if (isCurrentlyInWishlist) {
      // Remove from wishlist in background
      this.wishService.removeWish(productId).subscribe({
        next: () => {
          // Success: No further action needed as UI is already updated
          console.log('Successfully removed from wishlist');
        },
        error: (error) => {
          console.error('Error removing from wishlist, rolling back:', error);
          // ROLLBACK: Revert to previous state
          this.wishlistIds.set(previousIds);
        }
      });
    } else {
      // Add to wishlist in background
      this.wishService.addWish({ productId }).subscribe({
        next: () => {
          // Success: No further action needed
          console.log('Successfully added to wishlist');
        },
        error: (error) => {
          console.error('Error adding to wishlist, rolling back:', error);
          // ROLLBACK: Revert to previous state
          this.wishlistIds.set(previousIds);
        }
      });
    }
  }
  
  addToCart(product: any, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    // Auth Check
    const userId = this.tokenService.getUserId();
    if (!userId) {
      this.router.navigate(['/' + this.currentLang + '/auth/login']);
      return;
    }

    if (product.stockQuantity <= 0) {
      return;
    }
    
    const variantId = product.productVariants?.[0]?.id || (product as any)?.productVariants?.[0]?.id || product.id;
    
    this.cartService.addToCart(variantId, 1, product).subscribe({
      next: () => {
        console.log('Added to cart successfully');
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
      }
    });
  }

  getMainPhotoUrl(product: any): string | null {
    if (!product || !product.productPhotos || product.productPhotos.length === 0) return null;
    const main = product.productPhotos.find((p: any) => p.isMain) || product.productPhotos[0];
    return this.photoService.getPhotoUrl(main.url);
  }

  private normalizeProduct(p: any): any {
    if (!p) return p;
    return {
      ...p,
      id: p.id || p.Id,
      name: p.name || p.Name,
      description: p.description || p.Description,
      price: p.price || p.Price,
      newPrice: p.newPrice || p.NewPrice || p.productVariants?.[0]?.newPrice || p.productVariants?.[0]?.NewPrice || 0,
      oldPrice: p.oldPrice || p.OldPrice || p.productVariants?.[0]?.oldPrice || p.productVariants?.[0]?.OldPrice || 0,
      categoryId: p.categoryId || p.CategoryId,
      categoryName: p.categoryName || p.CategoryName,
      supplierId: p.supplierId || p.SupplierId,
      shownQuantity: (p.stockQuantity ?? p.StockQuantity ?? p.productVariants?.[0]?.stockQuantity ?? p.productVariants?.[0]?.StockQuantity) ?? 0,
      stockQuantity: (p.stockQuantity ?? p.StockQuantity ?? p.productVariants?.[0]?.stockQuantity ?? p.productVariants?.[0]?.StockQuantity) ?? 0,
      quantityInStock: p.quantityInStock || p.QuantityInStock,
      productPhotos: p.productPhotos || p.ProductPhotos || p.productphotos || [],
      productVariants: p.productVariants || p.ProductVariants || p.productvariants || [],
      haveSale: p.haveSale ?? p.HaveSale ?? false,
      isFasting: p.isFasting ?? p.IsFasting ?? false,
      reviewCount: p.reviewCount || p.ReviewCount || 0,
      averageRating: p.averageRating || p.AverageRating || 0,
      attributeSummary: this.getAttributeSummary(p.productVariants || p.ProductVariants || p.productvariants || [])
    };
  }

  private getAttributeSummary(variants: any[]): { name: string, values: string[] }[] {
    const groups: Record<string, Set<string>> = {};
    variants.forEach((v: any) => {
      const attrs = v.attributes || v.Attributes || [];
      attrs.forEach((a: any) => {
        const name = a.attributeName || a.AttributeName;
        const value = a.value || a.Value;
        if (name && value) {
          if (!groups[name]) groups[name] = new Set();
          groups[name].add(value);
        }
      });
    });
    return Object.keys(groups).map(name => ({
      name,
      values: Array.from(groups[name])
    }));
  }
}

