import { Component, inject, OnInit, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { WishService } from '../../../core/services/wish.service';
import { CartService } from '../../../core/services/cart.service';
import { TokenService } from '../../../core/services/token.service';
import { LanguageService } from '../../../core/services/language.service';
import { PhotoService } from '../../../core/services/photo.service';
import { Wish } from '../../../core/models/wish.model';

@Component({
  selector: 'app-wish-list',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <main class="min-h-screen bg-surface" [dir]="isRtl ? 'rtl' : 'ltr'">
      <!-- Hero Header -->
      <section class="bg-surface-container-low py-16 md:py-24 border-b border-outline-variant/30">
        <div class="max-w-7xl mx-auto px-6">
          <div class="max-w-2xl text-start">
            <h1 class="font-headline text-5xl md:text-6xl font-black tracking-tighter text-on-surface mb-6">
              {{ 'WISH.title' | translate }}
            </h1>
            <p class="font-body text-lg text-on-surface-variant opacity-70 leading-relaxed">
              {{ 'WISH.subtitle' | translate }}
            </p>
          </div>
        </div>
      </section>

      <section class="max-w-7xl mx-auto px-6 py-20">
        @if (loading()) {
          <div class="flex flex-col items-center justify-center py-40 gap-4">
            <div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p class="font-headline font-bold text-outline uppercase tracking-widest text-xs">Syncing Collection</p>
          </div>
        } @else if (error()) {
          <div class="text-center py-40 bg-error/5 rounded-3xl border-2 border-dashed border-error/20">
             <span class="material-symbols-outlined text-6xl text-error mb-4">error</span>
             <p class="font-headline text-xl font-black text-on-surface mb-6">{{ error() }}</p>
             <button (click)="loadWishes()" class="px-8 py-4 bg-primary text-on-primary rounded-2xl font-headline font-bold">Retry</button>
          </div>
        } @else if (wishes().length === 0) {
          <div class="text-center py-40 bg-surface-container-lowest rounded-3xl border-2 border-dashed border-outline-variant/30 animate-fade-in">
             <div class="w-32 h-32 bg-surface-container-low rounded-[40px] flex items-center justify-center text-outline-variant mx-auto mb-8 border-2 border-outline-variant/10 shadow-sm relative overflow-hidden">
                <span class="material-symbols-outlined text-6xl opacity-30 animate-pulse">favorite</span>
                <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
             </div>
             <h2 class="font-headline text-2xl font-black text-on-surface mb-3">{{ 'WISH.empty' | translate }}</h2>
             <p class="font-body text-on-surface-variant opacity-60 mb-10 max-w-sm mx-auto leading-relaxed">{{ 'WISH.emptyDesc' | translate }}</p>
             <button (click)="continueShopping()" class="px-10 py-5 bg-primary text-on-primary rounded-2xl font-headline font-bold shadow-[0_15px_30px_rgba(var(--primary-rgb),0.3)] hover:scale-105 active:scale-95 transition-all">{{ 'WISH.browseProducts' | translate }}</button>
          </div>
        } @else {
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
            @for (wish of displayedWishes(); track wish.productId) {
              <div class="group relative bg-surface-container-lowest rounded-3xl sm:rounded-[40px] overflow-hidden border border-outline-variant/10 hover:border-primary/20 transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] flex flex-col h-full animate-fade-in">
                
                <!-- Image Section -->
                <div class="relative aspect-[4/5] bg-surface-container-low overflow-hidden cursor-pointer" (click)="goToProduct(wish.productId!)">
                   @if (getMainPhotoUrl(wish)) {
                     <img [src]="getMainPhotoUrl(wish)" [alt]="wish.product?.name" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110">
                   } @else {
                     <div class="w-full h-full flex flex-col items-center justify-center text-outline-variant/20 gap-4">
                       <span class="material-symbols-outlined text-7xl">image</span>
                       <p class="text-[10px] font-black uppercase tracking-widest">{{ 'admin.products.noImage' | translate }}</p>
                     </div>
                   }

                   <!-- Remove from Wishlist Button -->
                   <button (click)="removeFromWish(wish, $event)"
                           class="absolute top-4 right-4 w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-md text-error flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all z-20 group/remove">
                     @if (removingId() === wish.productId) {
                       <div class="w-5 h-5 border-2 border-error/20 border-t-error rounded-full animate-spin"></div>
                     } @else {
                       <span class="material-symbols-outlined text-xl transition-transform group-hover/remove:rotate-12">delete</span>
                     }
                   </button>
                </div>

                <!-- Info Section -->
                <div class="p-4 sm:p-6 flex flex-col items-center justify-center bg-white">
                   <h3 class="font-headline font-black text-sm sm:text-lg text-on-surface line-clamp-1 hover:text-primary transition-colors cursor-pointer text-center leading-tight" (click)="goToProduct(wish.productId!)">
                     {{ wish.product?.name }}
                   </h3>
                </div>
              </div>
            }
          </div>

          <!-- Pagination Control -->
          @if (totalPages() > 1) {
            <div class="mt-20 flex items-center justify-center gap-3 animate-fade-in">
              <button (click)="goToPage(currentPage() - 1)" 
                      [disabled]="currentPage() === 1"
                      class="w-12 h-12 rounded-2xl bg-white border border-outline-variant/10 flex items-center justify-center text-on-surface hover:bg-primary hover:text-on-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm">
                <span class="material-symbols-outlined">chevron_left</span>
              </button>
              
              <div class="flex items-center gap-2">
                @for (p of [].constructor(totalPages()); track $index) {
                  <button (click)="goToPage($index + 1)"
                          class="w-12 h-12 rounded-2xl font-headline font-black text-sm transition-all shadow-sm"
                          [class]="currentPage() === ($index + 1) ? 'bg-primary text-on-primary scale-110' : 'bg-white border border-outline-variant/10 text-on-surface hover:bg-surface-container'">
                    {{ $index + 1 }}
                  </button>
                }
              </div>

              <button (click)="goToPage(currentPage() + 1)" 
                      [disabled]="currentPage() === totalPages()"
                      class="w-12 h-12 rounded-2xl bg-white border border-outline-variant/10 flex items-center justify-center text-on-surface hover:bg-primary hover:text-on-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm">
                <span class="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          }
        }
      </section>
    </main>
  `,
  styles: []
})
export class WishListComponent implements OnInit, OnDestroy {
  private wishService = inject(WishService);
  private cartService = inject(CartService);
  private tokenService = inject(TokenService);
  private languageService = inject(LanguageService);
  private photoService = inject(PhotoService);
  private router = inject(Router);

  wishes = signal<Wish[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  removingId = signal<string | null>(null);
  addingId = signal<string | null>(null);

  // Pagination & Grid Logic
  currentPage = signal(1);
  columns = signal(2);
  pageSize = computed(() => {
    const cols = this.columns();
    return cols === 4 ? 12 : (cols === 3 ? 9 : 8);
  });
  
  displayedWishes = computed(() => {
    const all = this.wishes();
    const start = (this.currentPage() - 1) * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });

  totalPages = computed(() => Math.ceil(this.wishes().length / this.pageSize()));

  private resizeListener?: () => void;

  get isRtl(): boolean { return this.languageService.currentLanguage() === 'ar'; }
  get currentLang(): string { return this.languageService.currentLanguage(); }

  ngOnInit(): void { 
    this.updateColumns();
    this.resizeListener = () => this.updateColumns();
    window.addEventListener('resize', this.resizeListener);
    this.loadWishes(); 
  }

  ngOnDestroy(): void {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  private updateColumns(): void {
    const width = window.innerWidth;
    if (width >= 1024) this.columns.set(4);
    else if (width >= 768) this.columns.set(3);
    else this.columns.set(2);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  loadWishes(): void {
    const userId = this.tokenService.getUserId();
    if (!userId) { this.error.set('Authentication Failure'); this.loading.set(false); return; }

    this.wishService.getWishes().subscribe({
      next: (res) => { 
        if (res.success && res.data) {
          const normalizedWishes = res.data.map(w => ({
            ...w,
            product: w.product ? this.normalizeProduct(w.product) : undefined
          }));
          this.wishes.set(normalizedWishes); 
        } else {
          this.error.set(res.error?.message || 'Failed to synchronize collection.');
        }
        this.loading.set(false); 
      },
      error: () => { this.error.set('Failed to synchronize collection.'); this.loading.set(false); }
    });
  }

  getMainPhotoUrl(wish: Wish): string {
    if (!wish.product || !wish.product.productPhotos || wish.product.productPhotos.length === 0) return '';
    const main = wish.product.productPhotos.find((p: any) => p.isMain) || wish.product.productPhotos[0];
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
      stockQuantity: (p.stockQuantity ?? p.StockQuantity ?? p.productVariants?.[0]?.stockQuantity ?? p.productVariants?.[0]?.StockQuantity) ?? 0,
      categoryId: p.categoryId || p.CategoryId,
      categoryName: p.categoryName || p.CategoryName,
      productPhotos: (p.productPhotos || p.ProductPhotos || p.productphotos || []).map((ph: any) => ({
        id: ph.id || ph.Id,
        url: ph.url || ph.Url,
        isMain: ph.isMain ?? ph.IsMain ?? false,
        fileName: ph.fileName || ph.FileName || ph.url || ph.Url
      })),
      productVariants: (p.productVariants || p.ProductVariants || p.productvariants || []).map((v: any) => ({
        id: v.id || v.Id,
        sku: v.sku || v.Sku,
        oldPrice: v.oldPrice || v.OldPrice,
        newPrice: v.newPrice || v.NewPrice,
        stockQuantity: (v.stockQuantity ?? v.StockQuantity ?? v.shownQuantity ?? v.ShownQuantity) ?? 1
      })),
      haveSale: p.haveSale ?? p.HaveSale ?? false,
      isFasting: p.isFasting ?? p.IsFasting ?? false,
      popularity: p.popularity || p.Popularity || 0,
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

  addToCart(wish: Wish, event: Event): void {
    event.stopPropagation();
    
    // Auth Check
    const userId = this.tokenService.getUserId();
    if (!userId) {
      this.router.navigate(['/' + this.currentLang + '/auth/login']);
      return;
    }

    const productId = wish.productId;
    if (!productId) return;
    
    // Try to get the first variant ID, otherwise fallback to productId 
    // (though the cart service now strictly expects a variant ID)
    const variantId = wish.product?.productVariants?.[0]?.id || (wish.product as any)?.productVariants?.[0]?.id || productId;

    this.addingId.set(productId);
    this.cartService.addToCart(variantId, 1, wish.product).subscribe({
      next: () => this.addingId.set(null),
      error: () => this.addingId.set(null)
    });
  }

  removeFromWish(wish: Wish, event: Event): void {
    event.stopPropagation();
    const userId = this.tokenService.getUserId();
    if (!userId || !wish.productId) return;
    this.removingId.set(wish.productId);
    this.wishService.removeWish(wish.productId).subscribe({
      next: (res) => {
        if (res.success) {
          this.wishes.update(items => items.filter(item => item.productId !== wish.productId));
        } else {
          // Handle error
        }
        this.removingId.set(null);
      },
      error: () => this.removingId.set(null)
    });
  }

  goToProduct(productId: string): void {
    this.router.navigate(['/' + this.currentLang + '/products', productId]);
  }

  continueShopping(): void {
    this.router.navigate(['/' + this.currentLang + '/products']);
  }
}

