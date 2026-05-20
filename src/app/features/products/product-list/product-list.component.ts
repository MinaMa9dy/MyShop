import { Component, inject, OnInit, signal, computed, effect, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { LanguageService } from '../../../core/services/language.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { PhotoService } from '../../../core/services/photo.service';
import { WishService } from '../../../core/services/wish.service';
import { TokenService } from '../../../core/services/token.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './product-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent implements OnInit, OnDestroy {
  constructor() {
    effect(() => {
      const lock = this.isMobileFiltersOpen();
      this.toggleBodyScroll(lock);
    });
  }

  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
  private languageService = inject(LanguageService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private wishService = inject(WishService);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  photoService = inject(PhotoService);

  products = signal<any[]>([]);
  categories = signal<any[]>([]);
  loading = signal(false);
  currentPage = signal(1);
  pageSize = signal(typeof window !== 'undefined' ? (window.innerWidth >= 768 ? 20 : 15) : 15);
  totalPages = signal(1);

  // Track wishlist items
  wishlistIds = signal<Set<string>>(new Set());
  // Track which product is being processed
  processingId = signal<string | null>(null);
  isMobileFiltersOpen = signal(false);
  
  // Accordion state for categories
  expandedCategories = signal<Set<string>>(new Set());

  // Debounce search/filter changes to avoid hammering the API
  private filterChange$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  get canAddProduct(): boolean {
    return this.authService.isLoggedIn() && (this.tokenService.isSeller() || this.tokenService.hasRole('Admin'));
  }

  get currentLang(): string {
    return this.languageService.currentLanguage();
  }

  // Filters
  searchTerm = '';
  selectedCategory = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  onSaleOnly = false;
  isFastingOnly = false;

  ngOnInit(): void {
    // Debounce filter changes: wait 300ms after the last change before fetching
    this.filterChange$.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(() => this.loadProducts());

    this.loadCategories();
    this.loadWishlist();

    this.updatePageSize();
    window.addEventListener('resize', () => {
      const oldSize = this.pageSize();
      this.updatePageSize();
      if (oldSize !== this.pageSize()) {
        this.loadProducts();
      }
    });

    this.route.queryParams.subscribe(params => {
      this.selectedCategory = params['categoryId'] || '';
      this.searchTerm = params['searchTerm'] || '';
      this.loadProducts();
    });
  }

  loadProducts(): void {
    this.loading.set(true);

    this.productService.getAll({
      searchTerm: this.searchTerm,
      categoryId: this.selectedCategory || undefined,
      minPrice: this.minPrice || undefined,
      maxPrice: this.maxPrice || undefined,
      haveSale: this.onSaleOnly || undefined,
      isFasting: this.isFastingOnly || undefined,
      pageNumber: this.currentPage(),
      pageSize: this.pageSize()
    }).subscribe({
      next: (result) => {
        if (result.success && result.data) {
          this.products.set(result.data.map((p: any) => this.normalizeProduct(p)));
          this.totalPages.set(result.meta?.totalPages ?? 0);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading.set(false);
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getTree().subscribe({
      next: (tree) => {
        this.categories.set(tree);
      },
      error: (error) => console.error('Error loading category tree:', error)
    });
  }

  toggleCategory(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.expandedCategories.update(set => {
      const newSet = new Set(set);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }

  isExpanded(id: string): boolean {
    return this.expandedCategories().has(id);
  }

  loadWishlist(): void {
    const userId = this.tokenService.getUserId();
    if (!userId) return;

    this.wishService.getWishes().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const ids = new Set<string>();
          res.data.forEach(w => { if (w.productId) ids.add(w.productId); });
          this.wishlistIds.set(ids);
        }
      },
      error: (error) => console.error('Error loading wishlist:', error)
    });
  }

  toggleWishlist(product: any, event: Event): void {
    event.preventDefault(); event.stopPropagation();
    const userId = this.tokenService.getUserId();
    if (!userId) { this.router.navigate(['/auth/login']); return; }

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
    
    // Update local state immediately
    this.wishlistIds.set(newIds);
    // --- OPTIMISTIC UPDATE END ---

    if (isCurrentlyInWishlist) {
      this.wishService.removeWish(productId).subscribe({
        next: () => console.log('Optimistic UI: Successfully removed'),
        error: (err) => {
          console.error('Optimistic UI: Error removing from wishlist, rolling back', err);
          this.wishlistIds.set(previousIds);
        }
      });
    } else {
      this.wishService.addWish({ productId }).subscribe({
        next: () => console.log('Optimistic UI: Successfully added'),
        error: (err) => {
          console.error('Optimistic UI: Error adding to wishlist, rolling back', err);
          this.wishlistIds.set(previousIds);
        }
      });
    }
  }

  selectCategory(id: string): void {
    this.selectedCategory = id;
    this.onFilterChange();
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.filterChange$.next(); // debounced — actual fetch happens after 300ms idle
  }

  clearFilters(): void {
    this.searchTerm = ''; this.selectedCategory = '';
    this.minPrice = null; this.maxPrice = null; 
    this.onSaleOnly = false; this.isFastingOnly = false;
    this.currentPage.set(1); this.loadProducts();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadProducts();
    }
  }

  getPages(): number[] {
    const pages: number[] = [];
    for (let i = Math.max(1, this.currentPage() - 2); i <= Math.min(this.totalPages(), this.currentPage() + 2); i++) {
      pages.push(i);
    }
    return pages;
  }

  addToCart(product: any, event: Event): void {
    event.preventDefault(); event.stopPropagation();

    // Auth Check
    const userId = this.tokenService.getUserId();
    if (!userId) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const variantId = product.productVariants?.[0]?.id || (product as any)?.productVariants?.[0]?.id || product.id;

    if (product.stockQuantity <= 0) return;
    this.cartService.addToCart(variantId, 1, product).subscribe({
      next: () => console.log('Added to cart'),
      error: (err) => console.error('Cart error:', err)
    });
  }

  canEditProduct(product: any): boolean {
    if (!product || !this.authService.isLoggedIn()) return false;
    const userId = this.tokenService.getUserId();
    return (product.supplierId === userId || product.SupplierId === userId) && (this.tokenService.isSeller() || this.tokenService.hasRole('Admin'));
  }

  editProduct(product: any, event: Event): void {
    event.preventDefault(); event.stopPropagation();
    if (product.id) this.router.navigate(['/admin/products/add'], { queryParams: { id: product.id } });
  }

  deleteProduct(product: any, event: Event): void {
    event.preventDefault(); event.stopPropagation();
    if (product.id && confirm(`Delete "${product.name}"?`)) {
      this.productService.delete(product.id).subscribe({
        next: () => this.products.set(this.products().filter(p => p.id !== product.id))
      });
    }
  }

  getCategoryIcon(name: string): string {
    const iconMap: { [key: string]: string } = {
       'Electronics': 'devices', 'Phones': 'smartphone', 'Computers': 'laptop_mac',
       'Home': 'home', 'Fashion': 'apparel', 'Beauty': 'content_cut',
       'Sports': 'sports_basketball', 'Toys': 'toys', 'Grocery': 'shopping_basket',
       'Health': 'health_and_safety', 'Automotive': 'directions_car', 'Books': 'menu_book'
    };
    return iconMap[name] || 'label';
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
      stockQuantity: (p.stockQuantity ?? p.StockQuantity ?? p.productVariants?.[0]?.stockQuantity ?? p.productVariants?.[0]?.StockQuantity) ?? 0,
      categoryId: p.categoryId || p.CategoryId,
      categoryName: p.categoryName || p.CategoryName,
      supplierId: p.supplierId || p.SupplierId,
      supplierName: p.supplierName || p.SupplierName || p.supplier || p.Supplier,
      supplierLogoUrl: p.supplierLogoUrl || p.SupplierLogoUrl || null,
      quantityInStock: p.quantityInStock || p.QuantityInStock,
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

  private normalizeCategory(c: any): any {
    if (!c) return c;
    return {
      ...c,
      id: c.id || c.Id,
      name: c.name || c.Name,
      description: c.description || c.Description
    };
  }

  // Returns a page size that is a multiple of the grid column count
  // so rows are always complete at every breakpoint:
  //   mobile  (<768px)  → 3 cols → 15 products (5 full rows)
  //   md/lg   (<1280px) → 4 cols → 20 products (5 full rows)
  //   xl+     (≥1280px) → 5 cols → 20 products (4 full rows)
  getResponsivePageSize(): number {
    if (typeof window === 'undefined') return 15;
    const w = window.innerWidth;
    if (w >= 1280) return 20;   // 5 cols × 4 rows
    if (w >= 768)  return 20;   // 4 cols × 5 rows
    return 15;                  // 3 cols × 5 rows
  }

  private updatePageSize(): void {
    this.pageSize.set(this.getResponsivePageSize());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.toggleBodyScroll(false);
  }

  private toggleBodyScroll(lock: boolean): void {
    if (lock) document.body.classList.add('overflow-hidden');
    else document.body.classList.remove('overflow-hidden');
  }
}

