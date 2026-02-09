import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { PhotoService } from '../../../core/services/photo.service';

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
          
          <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <!-- Product Images -->
              <div class="product-images p-6 bg-gray-100">
                <div class="main-image h-96 bg-white rounded-xl mb-4 overflow-hidden flex items-center justify-center shadow-sm">
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
                    <p class="font-medium text-gray-800">{{ product()?.reviewCount || 0 }}</p>
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
                  <button 
                    class="py-4 px-6 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl transition-colors"
                    title="Add to favorites">
                    ❤️
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private languageService = inject(LanguageService);
  private router = inject(Router);
  photoService = inject(PhotoService);
  
  product = signal<any>(null);
  loading = signal(true);
  mainImage = signal<string | null>(null);
  quantity = 1;
  
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
  
  ngOnInit(): void {
    this.loadProduct();
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
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.loading.set(false);
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
}
