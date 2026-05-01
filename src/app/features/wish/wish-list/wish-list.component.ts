import { Component, inject, OnInit, signal } from '@angular/core';
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
          <div class="grid grid-cols-2 gap-6 md:gap-10">
            @for (wish of wishes(); track wish.productId) {
              <div class="group relative bg-surface-container-lowest rounded-[40px] overflow-hidden border border-outline-variant/10 hover:border-primary/20 transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] flex flex-col h-full animate-fade-in">
                
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

                   <!-- Overlays & Badges -->
                   <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                   <!-- Sale Badge -->
                   @if (wish.product?.haveSale || ((wish.product?.oldPrice ?? 0) > (wish.product?.newPrice ?? 0))) {
                     <div class="absolute top-6 left-6 z-10">
                       <span class="bg-error text-on-error text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-2xl shadow-2xl animate-pulse-soft">
                         {{ 'product.onSale' | translate }}
                       </span>
                     </div>
                   }

                   <!-- Removal Button -->
                   <button (click)="removeFromWish(wish, $event)"
                           [disabled]="removingId() === wish.productId"
                           class="absolute top-6 right-6 w-12 h-12 rounded-2xl backdrop-blur-xl bg-white/90 text-on-surface hover:bg-error hover:text-on-error transition-all duration-300 z-20 shadow-xl flex items-center justify-center group/del">
                     @if (removingId() === wish.productId) {
                       <span class="w-5 h-5 border-2 border-on-surface/30 border-t-primary rounded-full animate-spin"></span>
                     } @else {
                       <span class="material-symbols-outlined text-xl group-hover/del:rotate-90 transition-transform">close</span>
                     }
                   </button>

                   <!-- Quick Action -->
                   <div class="absolute inset-x-6 bottom-6 translate-y-20 group-hover:translate-y-0 transition-all duration-500 ease-out z-20">
                     <button (click)="addToCart(wish, $event)"
                             [disabled]="addingId() === wish.productId"
                             class="w-full py-5 bg-on-surface text-surface rounded-[24px] font-headline font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary hover:text-on-primary shadow-2xl transition-all">
                        @if (addingId() === wish.productId) {
                          <span class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        } @else {
                          <span>{{ 'WISH.acquire' | translate }}</span>
                          <span class="material-symbols-outlined text-lg">shopping_bag</span>
                        }
                     </button>
                   </div>
                </div>

                <!-- Info Section -->
                <div class="p-8 flex flex-col flex-grow bg-surface-container-lowest relative z-10">
                   <div class="flex-grow space-y-3 mb-8">
                      <div class="flex items-center gap-3">
                         <span class="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
                         <p class="text-[10px] font-black uppercase tracking-[0.3em] text-outline opacity-60 text-start">{{ wish.product?.categoryName || 'General' }}</p>
                      </div>
                      <h3 class="font-headline font-black text-xl text-on-surface line-clamp-2 hover:text-primary transition-colors cursor-pointer text-start leading-tight" (click)="goToProduct(wish.productId!)">
                        {{ wish.product?.name }}
                      </h3>
                   </div>

                   <div class="pt-8 border-t border-outline-variant/10 flex items-end justify-between gap-4">
                      <div class="flex flex-col items-start gap-1">
                        @if (wish.product?.haveSale && wish.product?.oldPrice && (wish.product?.oldPrice ?? 0) > (wish.product?.newPrice ?? 0)) {
                          <span class="text-[10px] font-black text-outline-variant line-through opacity-50 tracking-tighter">
                             {{ wish.product?.oldPrice | currency:'EGP':'symbol':'1.0-0':'en-EG' }}
                          </span>
                        }
                        <span class="font-headline font-black text-2xl text-on-surface tracking-tighter flex items-center gap-1">
                           {{ (wish.product?.newPrice ?? 0) | currency:'EGP':'symbol':'1.0-0':'en-EG' }}
                        </span>
                      </div>

                      <button (click)="goToProduct(wish.productId!)" class="w-12 h-12 rounded-2xl bg-surface-container-high text-on-surface hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center group/view shadow-sm">
                         <span class="material-symbols-outlined transform group-hover/view:scale-110 group-hover/view:rotate-12 transition-transform">arrow_outward</span>
                      </button>
                   </div>
                </div>
              </div>
            }
          </div>
        }
      </section>
    </main>
  `,
  styles: []
})
export class WishListComponent implements OnInit {
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

  placeholder = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrToAN7K9bxCYHNmah4SPbCguXNVlpK-DeQWeEBnHb8hhrK_YwTkoUXoEOh-RgjYVbFZj2ZzFPFjqLgEqS81zBG3mBRaFpNCTpPthaRKkjbY6cN5ywiH6wrgPH-fov4huJ80NbYSMgUyawNMMrAIHqttsqobdz8M4Yk_ERm3md8eXwLlW4PLs3aIXrOye6hD6Mc0OtdU9LpkjMLI7eeChndSjrvjUUdPvpHGIlYDvLm3UBFRbdvqH0krtaLiZxlv72URSOjaoPfUbP';

  get isRtl(): boolean { return this.languageService.currentLanguage() === 'ar'; }
  get currentLang(): string { return this.languageService.currentLanguage(); }

  ngOnInit(): void { this.loadWishes(); }

  loadWishes(): void {
    const userId = this.tokenService.getUserId();
    if (!userId) { this.error.set('Authentication Failure'); this.loading.set(false); return; }

    this.wishService.getWishes().subscribe({
      next: (res) => { 
        if (res.isSuccess && res.data) {
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
      newPrice: p.newPrice || p.NewPrice,
      oldPrice: p.oldPrice || p.OldPrice,
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
      isFasting: p.isFasting ?? p.IsFasting ?? false
    };
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
        if (res.isSuccess) {
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
