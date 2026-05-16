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
  templateUrl: './wish-list.component.html',
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
    if (width >= 1280) this.columns.set(5);
    else if (width >= 1024) this.columns.set(4);
    else if (width >= 640) this.columns.set(3);
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

  handleImageError(event: Event, productId?: string): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/placeholder.svg';
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

  addToCart(wish: Wish): void {
    const userId = this.tokenService.getUserId();
    if (!userId) {
      this.router.navigate(['/' + this.currentLang + '/auth/login']);
      return;
    }

    const productId = wish.productId;
    if (!productId) return;

    const variantId = wish.product?.productVariants?.[0]?.id || (wish.product as any)?.productVariants?.[0]?.id || productId;

    this.addingId.set(productId);
    this.cartService.addToCart(variantId, 1, wish.product).subscribe({
      next: () => this.addingId.set(null),
      error: () => this.addingId.set(null)
    });
  }

  removeFromWish(wish: Wish): void {
    const userId = this.tokenService.getUserId();
    if (!userId || !wish.productId) return;
    this.removingId.set(wish.productId);
    this.wishService.removeWish(wish.productId).subscribe({
      next: (res) => {
        if (res.success) {
          this.wishes.update(items => items.filter(item => item.productId !== wish.productId));
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
