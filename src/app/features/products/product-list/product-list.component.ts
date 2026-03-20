import { Component, inject, OnInit, signal, computed, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
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
  imports: [CommonModule, RouterLink, FormsModule, TranslatePipe],
  templateUrl: './product-list.component.html'
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
  pageSize = 8;
  totalPages = signal(1);

  // Track wishlist items
  wishlistIds = signal<Set<string>>(new Set());
  // Track which product is being processed
  processingId = signal<string | null>(null);
  isMobileFiltersOpen = signal(false);

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
    this.loadCategories();
    this.loadWishlist();

    this.route.queryParams.subscribe(params => {
      const categoryId = params['categoryId'];
      if (categoryId) this.selectedCategory = categoryId;
      this.loadProducts();
    });
  }

  loadProducts(): void {
    this.loading.set(true);

    this.productService.getFiltered({
      searchTerm: this.searchTerm,
      categoryId: this.selectedCategory || undefined,
      minPrice: this.minPrice || undefined,
      maxPrice: this.maxPrice || undefined,
      isOnSale: this.onSaleOnly || undefined,
      isFasting: this.isFastingOnly || undefined,
      page: this.currentPage(),
      pageSize: this.pageSize
    }).subscribe({
      next: (response: any) => {
        console.log('Product Response Debug:', response);
        let prods: any[] = [];
        if (Array.isArray(response)) {
          prods = response;
        } else if (response && typeof response === 'object') {
          // Check for common data wrappers
          prods = response.getProducts || response.GetProducts ||
                  response.items || response.Items || 
                  response.data || response.Data || 
                  response.products || response.Products || [];
        }
        this.products.set(prods.map(p => this.normalizeProduct(p)));

        let totalPages = 1;
        if (response) {
          totalPages = response.totalPages || response.TotalPages || 
                       (response.totalCount || response.TotalCount ? Math.ceil((response.totalCount || response.TotalCount) / this.pageSize) : 1);
        }
        this.totalPages.set(Math.max(1, totalPages));
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading.set(false);
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (response: any) => {
        let cats: any[] = [];
        if (Array.isArray(response)) cats = response;
        else if (response && Array.isArray(response.data)) cats = response.data;
        this.categories.set(cats.map(c => this.normalizeCategory(c)));
      },
      error: (error) => console.error('Error loading categories:', error)
    });
  }

  loadWishlist(): void {
    const userId = this.tokenService.getUserId();
    if (!userId) return;

    this.wishService.getWishes(userId).subscribe({
      next: (wishes) => {
        const ids = new Set<string>();
        wishes.forEach(w => { if (w.productId) ids.add(w.productId); });
        this.wishlistIds.set(ids);
      },
      error: (error) => console.error('Error loading wishlist:', error)
    });
  }

  toggleWishlist(product: any, event: Event): void {
    event.preventDefault(); event.stopPropagation();
    const userId = this.tokenService.getUserId();
    if (!userId) { this.router.navigate(['/' + this.currentLang + '/auth/login']); return; }

    const productId = product.id;
    const isCurrentlyInWishlist = this.wishlistIds().has(productId);
    this.processingId.set(productId);

    if (isCurrentlyInWishlist) {
      this.wishService.removeWish(userId, productId).subscribe({
        next: () => {
          const newIds = new Set(this.wishlistIds());
          newIds.delete(productId);
          this.wishlistIds.set(newIds);
          this.processingId.set(null);
        },
        error: () => this.processingId.set(null)
      });
    } else {
      this.wishService.addWish({ userId, productId }).subscribe({
        next: () => {
          const newIds = new Set(this.wishlistIds());
          newIds.add(productId);
          this.wishlistIds.set(newIds);
          this.processingId.set(null);
        },
        error: () => this.processingId.set(null)
      });
    }
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadProducts();
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
    if (product.shownQuantity <= 0) return;
    this.cartService.addToCart(product.id, 1).subscribe({
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
    if (product.id) this.router.navigate([`/${this.currentLang}/admin/products/add`], { queryParams: { id: product.id } });
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

  private normalizeCategory(c: any): any {
    if (!c) return c;
    return {
      ...c,
      id: c.id || c.Id,
      name: c.name || c.Name,
      description: c.description || c.Description
    };
  }

  ngOnDestroy(): void {
    this.toggleBodyScroll(false);
  }

  private toggleBodyScroll(lock: boolean): void {
    if (lock) document.body.classList.add('overflow-hidden');
    else document.body.classList.remove('overflow-hidden');
  }
}
