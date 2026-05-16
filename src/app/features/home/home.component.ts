import { Component, inject, OnInit, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
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
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-page bg-surface min-h-screen" dir="rtl">

      <!-- ════════════════════════════════════
           HERO BANNER SECTION
      ════════════════════════════════════ -->
      <section class="px-3 pt-4 pb-2 md:px-6 md:pt-6">
        <div class="rounded-2xl overflow-hidden">
          <img src="assets/images/1.png"
               alt="كانتين سان مارك"
               class="w-full h-auto block rounded-2xl">
        </div>
      </section>

      <!-- ════════════════════════════════════
           CATEGORIES SECTION
      ════════════════════════════════════ -->
      <section class="py-4 md:py-6">
        <div class="flex items-center justify-between px-4 mb-3">
          <h2 class="font-black text-on-surface text-base md:text-lg" style="font-family:'Cairo',sans-serif;">
            التصنيفات
          </h2>
        </div>

        <!-- Scrollable category chips -->
        <div class="flex gap-3 px-4 overflow-x-auto no-scrollbar pb-2">
          @for (category of categories(); track category.id) {
            <a [routerLink]="'/' + currentLang + '/products'"
               [queryParams]="{categoryId: category.id}"
               class="flex-shrink-0 flex flex-col items-center gap-1.5 no-underline group"
               style="min-width: 72px;">
              <div class="w-[68px] h-[68px] rounded-2xl bg-surface-container-lowest border border-outline-variant/20 flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/5 transition-all duration-300"
                   style="box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                <span class="material-symbols-outlined text-2xl text-primary transition-transform duration-300 group-hover:scale-110">
                  {{ getCategoryIcon(category.name) }}
                </span>
              </div>
              <span class="text-[11px] text-center text-on-surface font-bold line-clamp-2 leading-tight"
                    style="font-family:'Cairo',sans-serif; max-width: 72px;">
                {{ category.name }}
              </span>
            </a>
          }

          <!-- "More" chip -->
          <a [routerLink]="'/' + currentLang + '/categories'"
             class="flex-shrink-0 flex flex-col items-center gap-1.5 no-underline group"
             style="min-width: 72px;">
            <div class="w-[68px] h-[68px] rounded-2xl bg-surface-container-lowest border border-outline-variant/20 flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/5 transition-all duration-300"
                 style="box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
              <span class="material-symbols-outlined text-2xl text-primary">grid_view</span>
            </div>
            <span class="text-[11px] text-center text-on-surface font-bold" style="font-family:'Cairo',sans-serif;">
              المزيد
            </span>
          </a>
        </div>
      </section>

      <!-- ════════════════════════════════════
           BEST SELLERS / الأكثر مبيعاً
      ════════════════════════════════════ -->
      <section class="py-2 md:py-4">
        <div class="flex items-center justify-between px-4 mb-3">
          <h2 class="font-black text-on-surface text-base md:text-lg" style="font-family:'Cairo',sans-serif;">
            الأكثر مبيعاً
          </h2>
          <a [routerLink]="'/' + currentLang + '/products'"
             class="text-primary text-sm font-bold no-underline hover:underline flex items-center gap-0.5"
             style="font-family:'Cairo',sans-serif;">
            <span class="material-symbols-outlined text-base">chevron_left</span>
            عرض الكل
          </a>
        </div>

        @if (displayedProducts().length > 0) {
          <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 md:gap-4 px-3 md:px-4">
            @for (product of displayedProducts(); track product.id; let i = $index) {
              <div class="ksm-product-card flex flex-col relative group"
                   style="animation: fade-in-up 0.5s ease forwards; animation-delay: {{ i * 50 }}ms; opacity: 0;">

                <!-- Wishlist Button -->
                <button
                  class="absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90"
                  [class.bg-red-50]="wishlistIds().has(product.id)"
                  [class.bg-white]="!wishlistIds().has(product.id)"
                  (click)="toggleWishlist(product, $event)"
                  style="box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                  <span class="material-symbols-outlined text-[16px] transition-colors duration-200"
                        [class.text-red-500]="wishlistIds().has(product.id)"
                        [class.text-outline-variant]="!wishlistIds().has(product.id)"
                        [style.font-variation-settings]="wishlistIds().has(product.id) ? '&quot;FILL&quot; 1' : '&quot;FILL&quot; 0'">
                    favorite
                  </span>
                </button>

                <!-- Sale Badge -->
                @if (product.haveSale) {
                  <div class="absolute top-2 left-2 z-10">
                    <span class="bg-error text-white text-[9px] font-black px-1.5 py-0.5 rounded-lg"
                          style="font-family:'Cairo',sans-serif;">خصم</span>
                  </div>
                }

                <!-- Product Image -->
                <a [routerLink]="'/' + currentLang + '/products/' + product.id"
                   class="block aspect-square overflow-hidden bg-surface-container-low no-underline">
                  <img [src]="getMainPhotoUrl(product) || placeholder"
                       [alt]="product.name"
                       loading="lazy"
                       class="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105">
                </a>

                <!-- Product Info -->
                <div class="p-2 flex flex-col flex-1">
                  <!-- Category -->
                  @if (product.categoryName) {
                    <div class="text-[10px] text-primary/80 mb-0.5 truncate" style="font-family:'Tajawal',sans-serif;">
                      {{ product.categoryName }}
                    </div>
                  }
                  
                  <a [routerLink]="'/' + currentLang + '/products/' + product.id"
                     class="no-underline">
                    <h3 class="text-on-surface font-bold text-[12px] md:text-sm leading-tight line-clamp-2 mb-1 hover:text-primary transition-colors"
                        style="font-family:'Cairo',sans-serif;">
                      {{ product.name }}
                    </h3>
                  </a>

                  <!-- Rating & Supplier -->
                  <div class="flex items-center justify-between mb-2">
                    <!-- Rating -->
                    <div class="flex items-center gap-0.5 text-[10px] text-on-surface-variant">
                      <span class="material-symbols-outlined text-[12px] text-[#C4962A]" style="font-variation-settings: 'FILL' 1">star</span>
                      <span class="font-bold text-[#7B1818]">{{ product.averageRating | number:'1.1-1' }}</span>
                      <span>({{ product.reviewCount }})</span>
                    </div>
                    <!-- Supplier -->
                    @if (product.supplierName) {
                      <div class="text-[9px] text-outline-variant truncate max-w-[60px]" style="font-family:'Tajawal',sans-serif;" [title]="product.supplierName">
                        {{ product.supplierName }}
                      </div>
                    }
                  </div>

                  @if (product.description) {
                    <p class="text-on-surface-variant text-[10px] line-clamp-1 mb-1 hidden md:block"
                       style="font-family:'Tajawal',sans-serif;">
                      {{ product.description }}
                    </p>
                  }

                  <!-- Price + Add to Cart -->
                  <div class="flex items-center justify-between mt-auto pt-1.5 gap-1">
                    <div class="flex flex-col min-w-0">
                      @if (product.oldPrice > product.newPrice) {
                        <span class="text-[9px] text-outline-variant line-through"
                              style="font-family:'Cairo',sans-serif;">
                          EGP {{ product.oldPrice }}
                        </span>
                      }
                      <span class="text-primary font-black text-[13px] md:text-base"
                            style="font-family:'Cairo',sans-serif;">
                        EGP {{ product.newPrice }}
                      </span>
                    </div>

                    @if (product.stockQuantity > 0) {
                      <button (click)="addToCart(product, $event)"
                              class="ksm-add-btn flex-shrink-0"
                              title="أضف إلى السلة">
                        <span class="material-symbols-outlined text-[18px]">shopping_cart</span>
                      </button>
                    } @else {
                      <div class="flex-shrink-0 w-9 h-9 rounded-full bg-surface-container flex items-center justify-center opacity-40">
                        <span class="material-symbols-outlined text-[18px] text-outline-variant">remove_shopping_cart</span>
                      </div>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <!-- Skeleton Loading -->
          <div class="grid grid-cols-3 md:grid-cols-4 gap-2.5 px-3">
            @for (i of [1,2,3,4,5,6]; track i) {
              <div class="rounded-2xl overflow-hidden bg-surface-container-low">
                <div class="skeleton aspect-square"></div>
                <div class="p-2 space-y-2">
                  <div class="skeleton h-3 w-full rounded-lg"></div>
                  <div class="skeleton h-3 w-2/3 rounded-lg"></div>
                  <div class="skeleton h-6 w-full rounded-full mt-2"></div>
                </div>
              </div>
            }
          </div>
        }
      </section>


      <!-- Admin add product button (visible only for admins/sellers) -->
      @if (canAddProduct()) {
        <div class="fixed bottom-24 left-4 z-50 md:bottom-8 md:right-6 md:left-auto">
          <a [routerLink]="'/' + currentLang + '/admin/products/add'"
             class="flex items-center gap-2 bg-primary text-white font-bold rounded-full px-5 py-3 shadow-xl hover:bg-primary-dim transition-all active:scale-95 no-underline"
             style="font-family:'Cairo',sans-serif; box-shadow: 0 8px 24px rgba(123,24,24,0.35);">
            <span class="material-symbols-outlined text-xl">add</span>
            <span class="hidden md:inline">إضافة منتج</span>
          </a>
        </div>
      }

    </div>
  `,
  styles: [`
    :host { display: block; }
    .no-underline { text-decoration: none !important; }

    /* Product card hover glow */
    .ksm-product-card:hover {
      box-shadow: 0 8px 24px rgba(123, 24, 24, 0.12);
    }

    /* Fade-in animation for product cards */
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
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

  placeholder = 'assets/images/placeholder.svg';

  featuredProducts = signal<any[]>([]);
  categories = signal<any[]>([]);
  wishlistIds = signal<Set<string>>(new Set());
  processingId = signal<string | null>(null);

  columns = signal<number>(3);

  displayedProducts = computed(() => {
    const products = this.featuredProducts();
    const cols = this.columns();
    const rows = cols >= 6 ? 3 : (cols >= 4 ? 3 : 4);
    return products.slice(0, cols * rows);
  });

  isLoggedIn = computed(() => !!this.tokenService.getUserId());

  canAddProduct = computed(() =>
    this.authService.isLoggedIn() &&
    (this.tokenService.isSeller() || this.tokenService.hasRole('Admin'))
  );

  get currentLang(): string {
    return this.languageService.currentLanguage();
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
    const w = window.innerWidth;
    if (w >= 1536) this.columns.set(6);
    else if (w >= 1280) this.columns.set(5);
    else if (w >= 1024) this.columns.set(4);
    else if (w >= 768) this.columns.set(4);
    else this.columns.set(3);
  }

  /** Maps category names to material icons */
  getCategoryIcon(name: string): string {
    const n = (name || '').toLowerCase();
    if (n.includes('مشروب') || n.includes('drink') || n.includes('beverage')) return 'local_cafe';
    if (n.includes('معلب') || n.includes('can') || n.includes('canned')) return 'inventory_2';
    if (n.includes('حلو') || n.includes('sweet') || n.includes('candy')) return 'cake';
    if (n.includes('مكرون') || n.includes('pasta') || n.includes('أرز') || n.includes('rice')) return 'rice_bowl';
    if (n.includes('منظف') || n.includes('clean') || n.includes('soap')) return 'cleaning_services';
    if (n.includes('خضار') || n.includes('vegetable') || n.includes('veget')) return 'eco';
    if (n.includes('لحم') || n.includes('meat') || n.includes('protein')) return 'kebab_dining';
    if (n.includes('خبز') || n.includes('bread') || n.includes('bakery')) return 'breakfast_dining';
    if (n.includes('أجبان') || n.includes('cheese') || n.includes('dairy') || n.includes('ألبان')) return 'set_meal';
    if (n.includes('frozen') || n.includes('مجمد')) return 'ac_unit';
    if (n.includes('snack') || n.includes('وجبة خفيفة')) return 'cookie';
    return 'category';
  }

  private loadFeaturedProducts(): void {
    this.productService.getHotProducts(24).subscribe({
      next: (result) => {
        if (result.success && result.data) {
          this.featuredProducts.set(result.data.map((p: any) => this.normalizeProduct(p)));
        }
      },
      error: (err) => console.error('Error loading products:', err)
    });
  }

  private loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (response: any) => {
        let cats: any[] = [];
        if (Array.isArray(response)) cats = response;
        else if (response?.data && Array.isArray(response.data)) cats = response.data;
        // Show only first 5 in horizontal scroll (+ "more" chip is hardcoded)
        this.categories.set(cats.slice(0, 5));
      },
      error: (err) => console.error('Error loading categories:', err)
    });
  }

  loadWishlist(): void {
    if (!this.tokenService.getUserId()) return;
    this.wishService.getWishes().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const ids = new Set<string>();
          res.data.forEach((w: any) => { if (w.productId) ids.add(w.productId); });
          this.wishlistIds.set(ids);
        }
      },
      error: (err) => console.error('Error loading wishlist:', err)
    });
  }

  toggleWishlist(product: any, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.tokenService.getUserId()) {
      this.router.navigate(['/' + this.currentLang + '/auth/login']);
      return;
    }

    const productId = product.id;
    const inWishlist = this.wishlistIds().has(productId);
    const prev = new Set(this.wishlistIds());
    const next = new Set(this.wishlistIds());

    inWishlist ? next.delete(productId) : next.add(productId);
    this.wishlistIds.set(next);

    if (inWishlist) {
      this.wishService.removeWish(productId).subscribe({
        error: () => this.wishlistIds.set(prev)
      });
    } else {
      this.wishService.addWish({ productId }).subscribe({
        error: () => this.wishlistIds.set(prev)
      });
    }
  }

  addToCart(product: any, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.tokenService.getUserId()) {
      this.router.navigate(['/' + this.currentLang + '/auth/login']);
      return;
    }
    if (product.stockQuantity <= 0) return;

    const variantId = product.productVariants?.[0]?.id || product.id;
    this.cartService.addToCart(variantId, 1, product).subscribe({
      error: (err) => console.error('Error adding to cart:', err)
    });
  }

  getMainPhotoUrl(product: any): string | null {
    if (!product?.productPhotos?.length) return null;
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
      newPrice: p.newPrice || p.NewPrice || p.productVariants?.[0]?.newPrice || 0,
      oldPrice: p.oldPrice || p.OldPrice || p.productVariants?.[0]?.oldPrice || 0,
      categoryId: p.categoryId || p.CategoryId,
      categoryName: p.categoryName || p.CategoryName,
      stockQuantity: (p.stockQuantity ?? p.StockQuantity ?? p.productVariants?.[0]?.stockQuantity) ?? 0,
      productPhotos: p.productPhotos || p.ProductPhotos || [],
      productVariants: p.productVariants || p.ProductVariants || [],
      haveSale: p.haveSale ?? p.HaveSale ?? false,
      isFasting: p.isFasting ?? p.IsFasting ?? false,
      averageRating: p.averageRating || p.AverageRating || 0,
      reviewCount: p.reviewCount || p.ReviewCount || 0,
    };
  }
}
