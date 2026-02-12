import { Component, inject, OnInit, signal, computed, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { PhotoService } from '../../../core/services/photo.service';
import { ReviewService } from '../../../core/services/review.service';
import { TokenService } from '../../../core/services/token.service';
import { WishService } from '../../../core/services/wish.service';
import { Review } from '../../../core/models/review.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslatePipe],
  template: `
    <div class="product-detail-page py-8 bg-gray-50 min-h-screen">
      <div class="max-w-7xl mx-auto px-4">
        @if (loading()) {
          <div class="flex justify-center py-20">
            <div class="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        } @else if (!product()) {
          <div class="card text-center py-16 bg-white rounded-2xl shadow">
            <p class="text-gray-500 text-xl mb-6">{{ 'common.productNotFound' | translate }}</p>
            <a routerLink="/products" class="btn btn-primary px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {{ 'common.backToProducts' | translate }}
            </a>
          </div>
        } @else {
          <!-- Breadcrumb -->
          <nav class="breadcrumb text-sm text-gray-500 mb-8 flex items-center gap-2">
            <a routerLink="/" class="hover:text-blue-600 transition-colors">Home</a>
            <span class="text-gray-400">/</span>
            <a routerLink="/products" class="hover:text-blue-600 transition-colors">Products</a>
            @if (product()?.category) {
              <span class="text-gray-400">/</span>
              <span class="text-gray-600">{{ product()?.category }}</span>
            }
          </nav>
          
          <div class="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <!-- Product Images -->
              <div #productImages class="product-images p-6 bg-gray-100" id="product-images">
                <div class="main-image h-96 bg-white rounded-xl mb-4 overflow-hidden flex items-center justify-center shadow-sm relative">
                  @if (mainImage()) {
                    <img [src]="mainImage()" 
                         [alt]="product()?.name"
                         class="h-full w-full object-contain p-4">
                  } @else if ((product()?.productPhotos && product()!.productPhotos!.length > 0) || (product()?.productphotos && product()!.productphotos!.length > 0)) {
                    <img [src]="photoService.getPhotoUrl((product()!.productPhotos || product()!.productphotos)![0].fileName)" 
                         [alt]="product()?.name"
                         class="h-full w-full object-contain p-4">
                  } @else {
                    <div class="text-center">
                      <span class="text-8xl text-gray-300">📦</span>
                      <p class="text-gray-400 mt-4">No image available</p>
                    </div>
                  }
                  
                  <!-- Wish Heart Button -->
                  <button 
                    class="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                    [class.text-red-500]="isInWishlist()"
                    [class.text-gray-400]="!isInWishlist()"
                    (click)="toggleWishlist()">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" [class.fill-current]="isInWishlist()" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </button>
                </div>
                @if ((product()?.productPhotos && product()!.productPhotos!.length > 1) || (product()?.productphotos && product()!.productphotos!.length > 1)) {
                  <div class="thumbnail-grid grid grid-cols-4 gap-3">
                    @for (photo of (product()!.productPhotos || product()!.productphotos); track photo.id) {
                      <button 
                        class="thumbnail h-20 bg-white rounded-lg overflow-hidden border-2 transition-all hover:shadow-md"
                        [class.border-blue-500]="mainImage() === photoService.getPhotoUrl(photo.fileName)"
                        [class.border-transparent]="mainImage() !== photoService.getPhotoUrl(photo.fileName)"
                        (click)="setMainImage(photo)">
                        <img [src]="photoService.getPhotoUrl(photo.fileName)" 
                             [alt]="product()?.name"
                             class="h-full w-full object-cover">
                      </button>
                    }
                  </div>
                }
              </div>
              
              <!-- Product Info -->
              <div class="product-info p-8">
                <div class="mb-4">
                  <h1 class="text-3xl font-bold text-gray-800 mb-3">{{ product()?.name }}</h1>
                  
                  @if (product()?.description) {
                    <p class="text-gray-600 leading-relaxed mb-4">
                      {{ product()?.description }}
                    </p>
                  }
                </div>
                
                <!-- Price Section -->
                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
                  @if (isOnSale()) {
                    <div class="flex flex-col gap-2">
                      <div class="flex items-baseline gap-3">
                        <span class="text-4xl font-bold text-red-600">
                          {{ product()?.newPrice | currency:'EGP':'symbol':'1.0-0':'en-EG' }}
                        </span>
                        <span class="text-xl text-gray-400 line-through">
                          {{ product()?.oldPrice | currency:'EGP':'symbol':'1.0-0':'en-EG' }}
                        </span>
                      </div>
                      <span class="bg-red-500 text-white text-sm px-3 py-1 rounded-full font-semibold inline-block w-fit">
                        {{ salePercentage() }}% OFF
                      </span>
                    </div>
                  } @else {
                    <span class="text-4xl font-bold text-gray-800">
                      {{ product()?.newPrice | currency:'EGP':'symbol':'1.0-0':'en-EG' }}
                    </span>
                  }
                </div>
                
                <!-- Stock Status -->
                <div class="mb-6">
                  @if (product()!.shownQuantity! > 0) {
                    <div class="flex items-center gap-2 text-green-600">
                      <span class="w-3 h-3 bg-green-500 rounded-full"></span>
                      <span class="font-medium">{{ 'product.inStock' | translate }} ({{ product()?.shownQuantity }})</span>
                    </div>
                  } @else {
                    <div class="flex items-center gap-2 text-red-500">
                      <span class="w-3 h-3 bg-red-500 rounded-full"></span>
                      <span class="font-medium">{{ 'product.outOfStock' | translate }}</span>
                    </div>
                  }
                </div>
                
                <!-- Product Details Grid -->
                <div class="grid grid-cols-2 gap-4 mb-6">
                  <div class="bg-gray-50 rounded-lg p-4">
                    <p class="text-sm text-gray-500 mb-1">{{ 'product.category' | translate }}</p>
                    <p class="font-medium text-gray-800">{{ product()?.category }}</p>
                  </div>
                  @if (product()?.supplier) {
                    <div class="bg-gray-50 rounded-lg p-4">
                      <p class="text-sm text-gray-500 mb-1">{{ 'product.supplier' | translate }}</p>
                      <p class="font-medium text-gray-800 text-sm truncate">{{ product()?.supplier }}</p>
                    </div>
                  }
                  <div class="bg-gray-50 rounded-lg p-4">
                    <p class="text-sm text-gray-500 mb-1">{{ 'product.reviews' | translate }}</p>
                    <p class="font-medium text-gray-800">{{ totalReviewCount() }}</p>
                  </div>
                </div>
                
                <!-- Quantity Selector -->
                @if (product()!.shownQuantity! > 0) {
                  <div class="mb-6">
                    <label class="block text-gray-700 font-medium mb-3">{{ 'product.quantity' | translate }}</label>
                    <div class="flex items-center gap-4">
                      <div class="flex items-center border border-gray-300 rounded-lg bg-white">
                        <button 
                          class="px-4 py-2 hover:bg-gray-100 transition-colors text-gray-600"
                          (click)="decreaseQuantity()">-</button>
                        <input 
                          type="text" 
                          [(ngModel)]="quantity"
                          class="w-16 text-center border-none focus:outline-none text-gray-800 font-medium"
                          readonly>
                        <button 
                          class="px-4 py-2 hover:bg-gray-100 transition-colors text-gray-600"
                          (click)="increaseQuantity()">+</button>
                      </div>
                      <span class="text-gray-500">
                        Max: {{ product()?.shownQuantity }}
                      </span>
                    </div>
                  </div>
                }
                
                <!-- Action Buttons -->
                <div class="flex gap-4">
                  <button 
                    class="flex-1 py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
                    [class.opacity-50]="product()!.shownQuantity! <= 0"
                    [class.cursor-not-allowed]="product()!.shownQuantity! <= 0"
                    [disabled]="product()!.shownQuantity! <= 0"
                    (click)="addToCart()">
                    <span class="text-xl">🛒</span>
                    {{ product()!.shownQuantity! > 0 ? ('product.addToCart' | translate) : ('product.outOfStock' | translate) }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Reviews Section -->
          <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div class="p-8">
              <h2 class="text-2xl font-bold text-gray-800 mb-6">{{ 'product.writeReview' | translate }}</h2>
              
              <!-- Review Form -->
              @if (isLoggedIn()) {
                <div class="bg-gray-50 rounded-xl p-6 mb-8">
                  <div class="mb-4">
                    <label class="block text-gray-700 font-medium mb-2">{{ 'product.rating' | translate }}</label>
                    <div class="flex gap-2">
                      @for (star of [1, 2, 3, 4, 5]; track star) {
                        <button 
                          type="button"
                          class="text-3xl transition-transform hover:scale-110 focus:outline-none"
                          [class.text-yellow-400]="star <= newReviewStars"
                          [class.text-gray-300]="star > newReviewStars"
                          (click)="setRating(star)">
                          ★
                        </button>
                      }
                    </div>
                  </div>
                  
                  <div class="mb-4">
                    <label class="block text-gray-700 font-medium mb-2">{{ 'product.reviewContent' | translate }}</label>
                    <textarea 
                      [(ngModel)]="newReviewContent"
                      rows="4"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="{{ 'product.reviewPlaceholder' | translate }}"></textarea>
                  </div>
                  
                  @if (reviewError()) {
                    <div class="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                      {{ reviewError() }}
                    </div>
                  }
                  
                  @if (reviewSuccess()) {
                    <div class="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
                      {{ 'product.reviewSubmitted' | translate }}
                    </div>
                  }
                  
                  <button 
                    type="button"
                    class="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    [disabled]="reviewSubmitting() || newReviewStars === 0 || !newReviewContent.trim()"
                    (click)="submitReview()">
                    @if (reviewSubmitting()) {
                      <span class="flex items-center gap-2">
                        <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        {{ 'product.submitting' | translate }}
                      </span>
                    } @else {
                      {{ 'product.submitReview' | translate }}
                    }
                  </button>
                </div>
              } @else {
                <div class="bg-gray-50 rounded-xl p-6 mb-8 text-center">
                  <p class="text-gray-600 mb-4">{{ 'product.loginToReview' | translate }}</p>
                  <a [routerLink]="'/' + getCurrentLang() + '/auth/login'" class="inline-block py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                    {{ 'product.login' | translate }}
                  </a>
                </div>
              }
              
              <!-- Existing Reviews -->
              <h3 class="text-xl font-bold text-gray-800 mb-4">{{ 'product.customerReviews' | translate }}</h3>
              
              @if (loadingReviews()) {
                <div class="flex justify-center py-8">
                  <div class="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              } @else if (reviews().length === 0) {
                <div class="text-center py-8 text-gray-500">
                  <p class="text-lg">{{ 'product.noReviews' | translate }}</p>
                  <p class="text-sm mt-2">{{ 'product.beFirstToReview' | translate }}</p>
                </div>
              } @else {
                <div class="space-y-4">
                  @for (review of reviews(); track review.id) {
                    <div class="bg-gray-50 rounded-xl p-6">
                      <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-3">
                          <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {{ review.personName ? review.personName.charAt(0) : 'U' }}
                          </div>
                          <div>
                            <p class="font-medium text-gray-800">{{ review.personName || 'Anonymous' }}</p>
                            <p class="text-sm text-gray-500">{{ review.createdAt | date:'mediumDate' }}</p>
                          </div>
                        </div>
                        <div class="flex gap-1">
                          @for (star of [1, 2, 3, 4, 5]; track star) {
                            <span 
                              class="text-lg"
                              [class.text-yellow-400]="star <= review.stars"
                              [class.text-gray-300]="star > review.stars">
                              ★
                            </span>
                          }
                        </div>
                      </div>
                      <p class="text-gray-600">{{ review.content }}</p>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ProductDetailComponent implements OnInit, AfterViewInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private languageService = inject(LanguageService);
  private router = inject(Router);
  photoService = inject(PhotoService);
  private tokenService = inject(TokenService);
  private reviewService = inject(ReviewService);
  private wishService = inject(WishService);
  
  // Element refs for scrolling
  productImagesRef!: ElementRef;
  
  product = signal<any>(null);
  loading = signal(true);
  mainImage = signal<string | null>(null);
  quantity = 1;
  
  // Wishlist state
  isWishlisted = signal<boolean>(false);
  
  // Review-related signals
  reviews = signal<Review[]>([]);
  loadingReviews = signal(false);
  newReviewStars = 0;
  newReviewContent = '';
  reviewSubmitting = signal(false);
  reviewError = signal<string | null>(null);
  reviewSuccess = signal(false);
  
  // Computed signal to calculate sale percentage
  salePercentage = computed(() => {
    const p = this.product();
    if (!p || !p.oldPrice || !p.newPrice) {
      return 0;
    }
    if (p.oldPrice <= p.newPrice) {
      return 0;
    }
    return Math.round(((p.oldPrice - p.newPrice) / p.oldPrice) * 100);
  });
  
  // Computed signal to check if product is on sale (only based on price comparison)
  isOnSale = computed(() => {
    const p = this.product();
    if (!p) return false;
    // Only show sale if oldPrice > newPrice
    return p.oldPrice > p.newPrice;
  });
  
  // Computed signal to get total review count (from product + loaded reviews)
  totalReviewCount = computed(() => {
    const productReviews = this.product()?.reviewCount || 0;
    const loadedReviews = this.reviews().length;
    return Math.max(productReviews, loadedReviews);
  });
  
  ngOnInit(): void {
    this.loadProduct();
  }
  
  ngAfterViewInit(): void {
    // Will scroll after product is loaded
  }
  
  loadProduct(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      return;
    }
    
    this.productService.getById(id).subscribe({
      next: (response: any) => {
        console.log('Product detail API Response:', response);
        console.log('Available properties:', Object.keys(response));
        this.product.set(response);
        
        // Set main image
        if (response && (response.productPhotos?.length > 0 || response.productphotos?.length > 0)) {
          const firstPhoto = (response.productPhotos || response.productphotos)[0];
          this.mainImage.set(this.photoService.getPhotoUrl(firstPhoto.fileName));
        }
        this.loading.set(false);
        
        // Scroll to product images section
        this.scrollToProductImages();
        
        // Load reviews for this product
        this.loadReviews(id);
        
        // Check if product is in wishlist
        this.checkWishlistStatus(id);
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.loading.set(false);
      }
    });
  }
  
  checkWishlistStatus(productId: string): void {
    const userId = this.tokenService.getUserId();
    if (!userId) {
      this.isWishlisted.set(false);
      return;
    }
    
    this.wishService.getWishes(userId).subscribe({
      next: (wishes) => {
        const isInWishlist = wishes.some(w => w.productId === productId);
        this.isWishlisted.set(isInWishlist);
      },
      error: (error) => {
        console.error('Error checking wishlist status:', error);
      }
    });
  }
  
  isInWishlist(): boolean {
    return this.isWishlisted();
  }
  
  toggleWishlist(): void {
    const userId = this.tokenService.getUserId();
    const productId = this.product()?.id;
    
    if (!userId) {
      // Redirect to login if not logged in
      this.router.navigate(['/' + this.getCurrentLang() + '/auth/login']);
      return;
    }
    
    if (!productId) return;
    
    if (this.isWishlisted()) {
      // Remove from wishlist
      this.wishService.removeWish(userId, productId).subscribe({
        next: () => {
          this.isWishlisted.set(false);
        },
        error: (error) => {
          console.error('Error removing from wishlist:', error);
        }
      });
    } else {
      // Add to wishlist
      this.wishService.addWish({ userId, productId }).subscribe({
        next: () => {
          this.isWishlisted.set(true);
        },
        error: (error) => {
          console.error('Error adding to wishlist:', error);
        }
      });
    }
  }
  
  loadReviews(productId: string): void {
    this.loadingReviews.set(true);
    this.reviewService.getReviewsByProductId(productId).subscribe({
      next: (response: Review[]) => {
        console.log('Reviews API Response:', response);
        if (Array.isArray(response)) {
          this.reviews.set(response);
        } else if (response && Array.isArray((response as any).data)) {
          this.reviews.set((response as any).data);
        }
        this.loadingReviews.set(false);
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.loadingReviews.set(false);
      }
    });
  }
  
  setMainImage(photo: any): void {
    this.mainImage.set(this.photoService.getPhotoUrl(photo.fileName));
  }
  
  increaseQuantity(): void {
    const maxStock = this.product()?.shownQuantity || 99;
    if (this.quantity < maxStock) {
      this.quantity++;
    }
  }
  
  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
  
  addToCart(): void {
    console.log('Adding to cart:', this.product()?.id, 'quantity:', this.quantity);
    
    // User is logged in, add to cart (auth interceptor will handle 401 by redirecting to login)
    // userId is now automatically extracted from JWT token in cartService
    this.cartService.addToCart(this.product()?.id, this.quantity).subscribe({
      next: () => {
        console.log('Added to cart successfully');
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
      }
    });
  }
  
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
  
  getCurrentLang(): string {
    return this.languageService.getCurrentLanguage();
  }
  
  scrollToProductImages(): void {
    setTimeout(() => {
      const element = document.getElementById('product-images');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }
  
  setRating(stars: number): void {
    this.newReviewStars = stars;
  }
  
  submitReview(): void {
    if (this.newReviewStars === 0 || !this.newReviewContent.trim()) {
      this.reviewError.set('Please provide a rating and review content');
      return;
    }
    
    const productId = this.product()?.id;
    if (!productId) {
      this.reviewError.set('Product ID not found');
      return;
    }
    
    this.reviewSubmitting.set(true);
    this.reviewError.set(null);
    this.reviewSuccess.set(false);
    
    // Get user ID from JWT token claims
    const userId = this.tokenService.getUserId() || '';
    this.reviewService.addReview({
      productId,
      stars: this.newReviewStars,
      content: this.newReviewContent,
      personName: ''
    }).subscribe({
      next: (response) => {
        console.log('Review submitted successfully:', response);
        this.reviewSubmitting.set(false);
        this.reviewSuccess.set(true);
        this.newReviewStars = 0;
        this.newReviewContent = '';
        // Reload reviews
        this.loadReviews(productId);
      },
      error: (error) => {
        console.error('Error submitting review:', error);
        this.reviewSubmitting.set(false);
        this.reviewError.set(error.message || 'Failed to submit review');
      }
    });
  }
}
