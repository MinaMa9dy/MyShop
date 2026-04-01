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
          <div class="grid grid-cols-2 lg:grid-cols-4 md:grid-cols-3 gap-6 md:gap-8 hover-glow">
            @for (wish of wishes(); track wish.productId) {
              <div class="group relative bg-surface-container-lowest rounded-3xl overflow-hidden border border-outline-variant/10 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl flex flex-col h-full">
                
                <!-- Image Section -->
                <div class="relative aspect-[4/5] bg-surface-container overflow-hidden cursor-pointer" (click)="goToProduct(wish.productId!)">
                  @if (getMainPhotoUrl(wish)) {
                    <img [src]="getMainPhotoUrl(wish)" [alt]="wish.product?.name" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                  } @else {
                    <div class="w-full h-full flex items-center justify-center text-outline-variant opacity-20">
                      <span class="material-symbols-outlined text-7xl">inventory_2</span>
                    </div>
                  }

                  <!-- Sale Badge -->
                  @if (wish.product?.haveSale || ((wish.product?.oldPrice ?? 0) > (wish.product?.newPrice ?? 0))) {
                    <div class="absolute top-6 left-6 z-10 flex flex-col items-start gap-2">
                      <span class="bg-error text-on-error text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg animate-pulse-soft">
                        {{ 'product.onSale' | translate }}
                      </span>
                    </div>
                  }

                  <!-- Removal Button -->
                  <button (click)="removeFromWish(wish, $event)"
                          [disabled]="removingId() === wish.productId"
                          class="absolute top-6 right-6 w-12 h-12 rounded-full backdrop-blur-md bg-white/80 text-on-surface hover:bg-error hover:text-on-error transition-all duration-300 z-10 shadow-lg flex items-center justify-center">
                    @if (removingId() === wish.productId) {
                      <span class="w-4 h-4 border-2 border-on-surface/30 border-t-white rounded-full animate-spin"></span>
                    } @else {
                      <span class="material-symbols-outlined text-xl">close</span>
                    }
                  </button>

                  <div class="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black/60 to-transparent flex justify-center">
                    <button (click)="addToCart(wish, $event)"
                            [disabled]="addingId() === wish.productId"
                            class="w-full py-4 glass-tray rounded-2xl text-white font-headline font-bold flex items-center justify-center gap-3 hover:bg-primary transition-colors">
                       @if (addingId() === wish.productId) {
                         <span class="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin"></span>
                       } @else {
                         <span class="text-xs">{{ 'WISH.acquire' | translate }}</span>
                         <span class="material-symbols-outlined text-sm">shopping_cart</span>
                       }
                    </button>
                  </div>
                </div>

                <!-- Info Section -->
                <div class="p-6 flex flex-col flex-grow">
                   <div class="flex-grow space-y-2 mb-6">
                      <p class="text-[10px] font-black uppercase tracking-[0.3em] text-outline text-start">{{ wish.product?.categoryName || 'General' }}</p>
                      <h3 class="font-headline font-black text-lg text-on-surface line-clamp-2 hover:text-primary transition-colors cursor-pointer text-start" (click)="goToProduct(wish.productId!)">
                        {{ wish.product?.name }}
                      </h3>
                   </div>

                   <div class="pt-6 border-t border-outline-variant/10 flex items-center justify-between">
                      <div class="flex items-baseline gap-3">
                        <span class="font-headline font-black text-2xl text-on-surface tracking-tighter">
                           {{ (wish.product?.newPrice ?? 0) | currency:'EGP':'symbol':'1.0-0':'en-EG' }}
                        </span>
                        @if (wish.product?.haveSale && wish.product?.oldPrice && (wish.product?.oldPrice ?? 0) > (wish.product?.newPrice ?? 0)) {
                          <span class="text-sm font-body text-outline-variant line-through opacity-60">
                             {{ wish.product?.oldPrice | currency:'EGP':'symbol':'1.0-0':'en-EG' }}
                          </span>
                        }
                      </div>

                      <button (click)="goToProduct(wish.productId!)" class="text-primary group/btn flex items-center gap-1 font-black uppercase text-[10px] tracking-widest">
                         <span>{{ 'WISH.view' | translate }}</span>
                         <span class="material-symbols-outlined text-sm transform group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
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

    this.wishService.getWishes(userId).subscribe({
      next: (wishes) => { this.wishes.set(wishes); this.loading.set(false); },
      error: () => { this.error.set('Failed to synchronize collection.'); this.loading.set(false); }
    });
  }

  getMainPhotoUrl(wish: Wish): string {
    const photos = wish.product?.productPhotos || (wish.product as any)?.productphotos;
    if (photos && photos.length > 0) {
      const mainPhoto = photos.find((p: any) => p.isMain);
      return this.photoService.getPhotoUrl(mainPhoto?.fileName || photos[0].fileName);
    }
    return '';
  }

  addToCart(wish: Wish, event: Event): void {
    event.stopPropagation();
    const productId = wish.productId;
    if (!productId) return;
    this.addingId.set(productId);
    this.cartService.addToCart(productId, 1).subscribe({
      next: () => this.addingId.set(null),
      error: () => this.addingId.set(null)
    });
  }

  removeFromWish(wish: Wish, event: Event): void {
    event.stopPropagation();
    const userId = this.tokenService.getUserId();
    if (!userId || !wish.productId) return;
    this.removingId.set(wish.productId);
    this.wishService.removeWish(userId, wish.productId).subscribe({
      next: () => {
        this.wishes.update(items => items.filter(item => item.productId !== wish.productId));
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
