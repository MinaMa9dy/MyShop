import { Component, inject, OnInit, signal, computed, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
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
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslatePipe],
  template: `
    <main class="min-h-screen bg-surface" [dir]="currentLang === 'ar' ? 'rtl' : 'ltr'">
      <div class="max-w-7xl mx-auto px-6 py-12">
        
        @if (loading()) {
          <div class="flex flex-col items-center justify-center py-40 gap-4">
            <div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p class="font-headline font-bold text-outline uppercase tracking-widest text-xs">{{ 'common.syncingDetails' | translate }}</p>
          </div>
        } @else if (!product()) {
          <div class="text-center py-40 bg-surface-container-lowest rounded-3xl border-2 border-dashed border-outline-variant/30 animate-fade-in">
             <span class="material-symbols-outlined text-6xl text-outline-variant mb-4">error</span>
             <p class="font-headline text-2xl font-black text-on-surface mb-6">{{ 'common.productNotFound' | translate }}</p>
             <a routerLink="/products" class="inline-flex items-center gap-2 px-8 py-4 bg-primary text-on-primary rounded-2xl font-headline font-bold shadow-xl hover:scale-105 active:scale-95 transition-all">
                <span class="material-symbols-outlined">arrow_back</span>
                {{ 'common.backToProducts' | translate }}
             </a>
          </div>
        } @else {
          <!-- Breadcrumb -->
          <nav class="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-outline mb-12 animate-fade-in">
            <a routerLink="/" class="hover:text-primary transition-colors">{{ 'common.home' | translate }}</a>
            <span class="w-1 h-1 rounded-full bg-outline-variant"></span>
            <a routerLink="/products" class="hover:text-primary transition-colors">{{ 'common.catalog' | translate }}</a>
            @if (product()?.category) {
              <span class="w-1 h-1 rounded-full bg-outline-variant"></span>
              <span class="text-on-surface">{{ product()?.category }}</span>
            }
          </nav>
          
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            <!-- Gallery Section (6 cols) -->
            <div class="lg:col-span-7 space-y-6 animate-slide-up">
              <div class="relative aspect-square bg-surface-container-lowest rounded-[40px] overflow-hidden border border-outline-variant/10 shadow-2xl group">
                
                @if (allPhotos().length > 0) {
                  <div class="flex h-full w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth" #carousel (scroll)="onScroll($event)">
                    @for (photo of allPhotos(); track photo.id) {
                      <div class="flex-shrink-0 w-full h-full snap-center flex items-center justify-center p-12">
                        <img [src]="photoService.getPhotoUrl(photo.fileName)" 
                             [alt]="product()?.name" 
                             class="w-full h-full object-contain transition-transform duration-700 hover:scale-105">
                      </div>
                    }
                  </div>

                  <!-- Navigation Arrows (Desktop) -->
                  @if (allPhotos().length > 1) {
                    <button (click)="scrollPrev()" class="hidden lg:flex absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/60 backdrop-blur-md items-center justify-center text-on-surface hover:bg-primary hover:text-white transition-all z-10 opacity-0 group-hover:opacity-100 shadow-xl">
                      <span class="material-symbols-outlined text-2xl">arrow_back</span>
                    </button>
                    <button (click)="scrollNext()" class="hidden lg:flex absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/60 backdrop-blur-md items-center justify-center text-on-surface hover:bg-primary hover:text-white transition-all z-10 opacity-0 group-hover:opacity-100 shadow-xl">
                      <span class="material-symbols-outlined text-2xl">arrow_forward</span>
                    </button>

                    <!-- Indicators -->
                    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                      @for (photo of allPhotos(); track photo.id; let i = $index) {
                        <button (click)="scrollToPhoto(i)"
                                class="w-2 h-2 rounded-full transition-all duration-300 hover:scale-125 focus:outline-none" 
                                [class]="currentPhotoIndex() === i ? 'bg-primary w-6' : 'bg-outline-variant/30'"></button>
                      }
                    </div>
                  }
                } @else {
                  <div class="w-full h-full flex items-center justify-center text-outline-variant">
                    <span class="material-symbols-outlined text-9xl opacity-10">inventory_2</span>
                  </div>
                }
                
                <button (click)="toggleWishlist()"
                        class="absolute top-8 right-8 w-14 h-14 rounded-full backdrop-blur-xl flex items-center justify-center transition-all duration-300 z-10 shadow-lg"
                        [class]="isWishlisted() ? 'bg-error text-on-error scale-110' : 'bg-white/80 text-on-surface hover:bg-white'">
                  <span class="material-symbols-outlined text-3xl" [class.fill-current]="isWishlisted()">favorite</span>
                </button>

                @if (isOnSale()) {
                   <div class="absolute top-8 left-8 flex flex-col items-start gap-3">
                      <span class="bg-error text-on-error px-4 py-2 rounded-2xl font-headline font-black text-xs uppercase tracking-widest shadow-xl">{{ salePercentage() }}% OFF</span>
                   </div>
                }
              </div>

              @if (allPhotos().length > 1) {
                <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  @for (photo of allPhotos(); track photo.id; let i = $index) {
                    <button (click)="scrollToPhoto(i)"
                            class="flex-shrink-0 w-24 h-24 rounded-2xl bg-surface-container-lowest border-2 transition-all p-2 overflow-hidden"
                            [class.border-primary]="currentPhotoIndex() === i"
                            [class.border-transparent]="currentPhotoIndex() !== i">
                      <img [src]="photoService.getPhotoUrl(photo.fileName)" class="w-full h-full object-contain">
                    </button>
                  }
                </div>
              }
            </div>

            <!-- Content Section (5 cols) -->
            <div class="lg:col-span-5 space-y-10 animate-slide-up text-center lg:text-start" style="animation-delay: 100ms">
              <div class="space-y-4">
                <div class="flex items-center justify-center lg:justify-start gap-3">
                   <span class="text-[10px] font-black uppercase tracking-[0.3em] text-primary px-3 py-1 bg-primary/10 rounded-full">{{ product()?.category }}</span>
                   <span class="w-1 h-1 rounded-full bg-outline-variant"></span>
                   <span class="text-[10px] font-black uppercase tracking-[0.3em] text-outline">{{ totalReviewCount() }} {{ 'product.reviews' | translate }}</span>
                </div>
                <h1 class="font-headline text-5xl font-black tracking-tighter text-on-surface leading-tight">
                  {{ product()?.name }}
                </h1>
                <p class="font-body text-on-surface-variant opacity-70 leading-relaxed text-lg">
                  {{ product()?.description }}
                </p>
              </div>

              <div class="p-8 bg-surface-container rounded-[32px] border border-outline-variant/10 space-y-8">
                <!-- Price Display -->
                <div class="flex items-baseline justify-center lg:justify-start gap-4">
                   <span class="font-headline text-4xl font-black text-on-surface tracking-tighter">
                     {{ product()?.newPrice | currency:'EGP':'symbol':'1.0-0':'en-EG' }}
                   </span>
                   @if (isOnSale()) {
                     <span class="font-body text-xl text-outline-variant line-through opacity-50">
                        {{ product()?.oldPrice | currency:'EGP':'symbol':'1.0-0':'en-EG' }}
                     </span>
                   }
                </div>

                <!-- Stock Status Tag -->
                <div class="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                   <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/50 border border-outline-variant/20 shadow-sm">
                      <div class="w-2 h-2 rounded-full" [class.bg-success]="product()?.shownQuantity > 0" [class.bg-error]="product()?.shownQuantity <= 0"></div>
                      <span class="text-[10px] font-black uppercase tracking-widest" [class.text-success]="product()?.shownQuantity > 0" [class.text-error]="product()?.shownQuantity <= 0">
                        {{ product()?.shownQuantity > 0 ? (('product.inStock' | translate) + ' (' + product()?.shownQuantity + ')') : ('product.outOfStock' | translate) }}
                      </span>
                   </div>
                   @if (product()?.supplierName) {
                    <span class="text-[10px] font-black uppercase tracking-widest text-outline">{{ 'product.source' | translate }}: {{ product()?.supplierName }}</span>
                   }
                </div>

                <!-- Quantity & Add to Cart -->
                @if (product()?.shownQuantity > 0) {
                  <div class="space-y-6 pt-4">
                    <div class="flex items-center justify-between">
                       <span class="text-[10px] font-black uppercase tracking-widest text-outline">{{ 'product.configurationQuantity' | translate }}</span>
                       <div class="flex items-center gap-6 bg-surface p-2 rounded-2xl border border-outline-variant/30">
                          <button (click)="decreaseQuantity()" class="w-10 h-10 rounded-xl hover:bg-surface-container transition-colors flex items-center justify-center">
                            <span class="material-symbols-outlined text-lg">remove</span>
                          </button>
                          <span class="font-headline font-black text-lg min-w-[20px] text-center">{{ quantity }}</span>
                          <button (click)="increaseQuantity()" class="w-10 h-10 rounded-xl hover:bg-surface-container transition-colors flex items-center justify-center">
                            <span class="material-symbols-outlined text-lg">add</span>
                          </button>
                       </div>
                    </div>

                    <button (click)="addToCart()"
                              [disabled]="loading() || product()?.shownQuantity === 0"
                              class="w-full py-5 bg-primary text-on-primary rounded-[32px] font-headline font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:scale-100 group">
                        <span class="material-symbols-outlined group-hover:rotate-12 transition-transform">shopping_bag</span>
                        {{ 'product.initializeAcquisition' | translate }}
                      </button>
                  </div>
                }

                @if (canEditProduct()) {
                   <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                      <button (click)="editProduct()" class="py-4 bg-tertiary/10 text-tertiary rounded-2xl font-headline font-bold text-sm tracking-tight hover:bg-tertiary hover:text-on-tertiary transition-all">{{ 'dashboard.editProfile' | translate }}</button>
                      <button (click)="deleteProduct()" class="py-4 bg-error/10 text-error rounded-2xl font-headline font-bold text-sm tracking-tight hover:bg-error hover:text-on-error transition-all">{{ 'dashboard.decommission' | translate }}</button>
                   </div>
                }
              </div>


            </div>
          </div>

          <!-- Reviews Section -->
          <section class="mt-40 animate-slide-up">
            <div class="flex flex-col md:flex-row justify-between items-center md:items-end gap-12 mb-16 text-center md:text-start">
               <div class="max-w-xl mx-auto md:mx-0">
                  <p class="font-label text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">{{ 'product.customerIntelligence' | translate }}</p>
                  <h2 class="font-headline text-4xl font-black text-on-surface tracking-tighter mb-4">{{ 'product.customerReviews' | translate }}</h2>
                  <p class="font-body text-sm text-on-surface-variant max-w-lg opacity-70">{{ 'product.reviewDesc' | translate }}</p>
               </div>
               
               <div class="flex items-center gap-8 bg-surface-container px-10 py-6 rounded-3xl border border-outline-variant/10">
                  <div class="text-center">
                    <p class="font-headline text-3xl font-black text-primary">{{ averageRating() }}</p>
                    <p class="text-[10px] font-black uppercase tracking-widest text-outline">{{ 'product.meanRating' | translate }}</p>
                  </div>
                  <div class="w-px h-10 bg-outline-variant/30"></div>
                  <div class="text-center">
                    <p class="font-headline text-3xl font-black text-on-surface">{{ totalReviewCount() }}</p>
                    <p class="text-[10px] font-black uppercase tracking-widest text-outline">{{ 'product.totalLogs' | translate }}</p>
                  </div>
               </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-16">
               <!-- Review Submission (4 cols) -->
               <div class="lg:col-span-4 lg:sticky lg:top-24 h-fit">
                  @if (isLoggedIn()) {
                    <div class="bg-surface-container-low p-8 rounded-[40px] border border-outline-variant/20 shadow-xl space-y-8 text-center md:text-start">
                       <h3 class="font-headline font-black text-xl tracking-tight text-on-surface text-center md:text-start">{{ 'product.logNewIntelligence' | translate }}</h3>
                       
                       <div class="space-y-4">
                          <label class="text-[10px] font-black uppercase tracking-widest text-outline block text-center md:text-start">{{ 'product.satisfactionScore' | translate }}</label>
                          <div class="flex justify-center md:justify-start gap-2">
                            @for (star of [1, 2, 3, 4, 5]; track star) {
                              <button (click)="setRating(star)" class="group focus:outline-none transition-transform hover:scale-125">
                                <span class="material-symbols-outlined text-3xl transition-colors" [class]="star <= newReviewStars ? 'text-primary fill-current' : 'text-outline-variant'">star</span>
                              </button>
                            }
                          </div>
                       </div>

                       <div class="space-y-4">
                          <label class="text-[10px] font-black uppercase tracking-widest text-outline block text-center md:text-start">{{ 'product.intelligenceContent' | translate }}</label>
                          <textarea [(ngModel)]="newReviewContent" rows="5" 
                                    class="w-full bg-surface border-2 border-transparent focus:border-primary/20 p-5 rounded-2xl outline-none font-body text-sm text-on-surface transition-all resize-none"
                                    [placeholder]="'product.quantifyExperience' | translate"></textarea>
                       </div>

                       @if (reviewError()) {
                        <div class="p-4 bg-error/10 text-error rounded-xl text-xs font-bold">{{ reviewError() }}</div>
                       }

                       @if (reviewSuccess()) {
                        <div class="p-4 bg-success/10 text-success rounded-xl text-xs font-bold">{{ 'product.feedbackIntegrated' | translate }}</div>
                       }

                       <button (click)="submitReview()"
                                [disabled]="reviewSubmitting() || newReviewStars === 0 || !newReviewContent.trim()"
                                class="w-full py-5 bg-on-surface text-surface rounded-2xl font-headline font-bold shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none">
                           @if (reviewSubmitting()) {
                             <span class="w-5 h-5 border-2 border-surface/30 border-t-white rounded-full animate-spin"></span>
                           } @else {
                             {{ 'product.commitIntelligence' | translate }}
                           }
                        </button>
                    </div>
                  } @else {
                    <div class="bg-surface-container-low p-10 rounded-[40px] text-center border border-dashed border-outline-variant/40 space-y-6">
                       <span class="material-symbols-outlined text-5xl text-outline-variant">lock</span>
                       <p class="font-headline font-bold text-on-surface-variant leading-relaxed">{{ 'product.loggingRestricted' | translate }}</p>
                       <a [routerLink]="'/' + currentLang + '/auth/login'" class="inline-block px-8 py-4 bg-primary text-on-primary rounded-2xl font-headline font-bold shadow-lg hover:scale-105 transition-all">{{ 'product.signInToCommit' | translate }}</a>
                    </div>
                  }
               </div>

               <!-- Review List (8 cols) -->
               <div class="lg:col-span-8 space-y-8">
                  @if (loadingReviews()) {
                    <div class="flex justify-center py-20">
                      <div class="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                    </div>
                  } @else if (reviews().length === 0) {
                    <div class="text-center py-32 bg-surface-container-lowest rounded-[40px] border border-outline-variant/10">
                       <p class="font-headline font-bold text-outline-variant opacity-60">{{ 'product.zeroLogs' | translate }}</p>
                    </div>
                  } @else {
                    @for (review of reviews(); track review.id) {
                      <div class="bg-surface-container-lowest p-8 rounded-[40px] border border-outline-variant/10 hover:border-primary/20 transition-all group shadow-sm hover:shadow-xl">
                         <div class="flex flex-col sm:flex-row items-start justify-between gap-6">
                            <div class="flex items-center gap-5">
                               <div class="w-14 h-14 bg-surface-container rounded-2xl border border-outline-variant/20 overflow-hidden flex items-center justify-center relative">
                                  @if (getReviewerPhotoUrl(review.photoUrl)) {
                                    <img [src]="getReviewerPhotoUrl(review.photoUrl)" class="w-full h-full object-cover">
                                  } @else {
                                    <span class="material-symbols-outlined text-outline-variant text-2xl">person</span>
                                  }
                               </div>
                               <div>
                                  <h4 class="font-headline font-black text-on-surface group-hover:text-primary transition-colors">{{ review.personName || 'Unidentified Civilian' }}</h4>
                                  <p class="text-[10px] font-black uppercase tracking-widest text-outline">{{ review.createdAt | date:'longDate' }}</p>
                               </div>
                            </div>
                            <div class="flex gap-1 bg-surface px-4 py-2 rounded-xl border border-outline-variant/10">
                               @for (star of [1, 2, 3, 4, 5]; track star) {
                                 <span class="material-symbols-outlined text-lg" [class]="star <= review.stars ? 'text-primary fill-current' : 'text-outline-variant'">star</span>
                               }
                            </div>
                         </div>
                         <div class="mt-8 relative">
                           <span class="material-symbols-outlined absolute -left-2 -top-4 opacity-5 text-4xl transform -scale-x-100">format_quote</span>
                           <p class="font-body text-on-surface-variant leading-relaxed text-lg pl-6">
                              {{ review.content }}
                           </p>
                         </div>
                      </div>
                    }
                  }
               </div>
            </div>
          </section>
        }
      </div>
    </main>
  `,
  styles: []
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
  
  product = signal<any>(null);
  loading = signal(true);
  mainImage = signal<string | null>(null);
  quantity = 1;
  
  isWishlisted = signal<boolean>(false);
  reviews = signal<Review[]>([]);
  loadingReviews = signal(false);
  newReviewStars = 0;
  newReviewContent = '';
  reviewSubmitting = signal(false);
  reviewError = signal<string | null>(null);
  reviewSuccess = signal(false);
  
  salePercentage = computed(() => {
    const p = this.product();
    if (!p || !p.oldPrice || !p.newPrice || p.oldPrice <= p.newPrice) return 0;
    return Math.round(((p.oldPrice - p.newPrice) / p.oldPrice) * 100);
  });
  
  isOnSale = computed(() => {
    const p = this.product();
    return p ? p.oldPrice > p.newPrice : false;
  });
  
  totalReviewCount = computed(() => Math.max(this.product()?.reviewCount || 0, this.reviews().length));

  averageRating = computed(() => {
     const revs = this.reviews();
     if (revs.length === 0) return this.product()?.averageRating || '0.0';
     const sum = revs.reduce((acc, curr) => acc + curr.stars, 0);
     return (sum / revs.length).toFixed(1);
  });

  canEditProduct = computed(() => {
    const p = this.product();
    if (!p || !this.authService.isLoggedIn()) return false;
    const userId = this.tokenService.getUserId();
    return (p.supplierId === userId || p.SupplierId === userId) && (this.tokenService.isSeller() || this.tokenService.hasRole('Admin'));
  });

  allPhotos = computed(() => {
     const p = this.product();
     if (!p) return [];
     return p.productPhotos || p.productphotos || [];
  });
  
  getReviewerPhotoUrl(photoPath: string | undefined): string {
    if (!photoPath) return '';
    const normalizedPath = photoPath.replace(/\\/g, '/');
    const parts = normalizedPath.split('/');
    const fileName = parts[parts.length - 1];
    return `${environment.apiUrl}/Photo/UserPhoto/${fileName}`;
  }
  
  @ViewChild('carousel') carouselElement!: ElementRef;
  currentPhotoIndex = signal(0);

  scrollToPhoto(index: number): void {
    if (this.carouselElement) {
      const element = this.carouselElement.nativeElement;
      const width = element.offsetWidth;
      // Handle RTL scroll direction (negative offset in most modern browsers)
      const scrollPos = this.currentLang === 'ar' ? -width * index : width * index;
      element.scrollTo({ left: scrollPos, behavior: 'smooth' });
      this.currentPhotoIndex.set(index);
    }
  }

  scrollNext(): void {
    const nextIndex = (this.currentPhotoIndex() + 1) % this.allPhotos().length;
    this.scrollToPhoto(nextIndex);
  }

  scrollPrev(): void {
    const prevIndex = (this.currentPhotoIndex() - 1 + this.allPhotos().length) % this.allPhotos().length;
    this.scrollToPhoto(prevIndex);
  }

  onScroll(event: Event): void {
    const element = event.target as HTMLElement;
    // Use Math.abs for RTL support (where scrollLeft can be negative)
    const index = Math.round(Math.abs(element.scrollLeft) / element.offsetWidth);
    if (this.currentPhotoIndex() !== index) {
      this.currentPhotoIndex.set(index);
    }
  }
  
  ngOnInit(): void { this.loadProduct(); }
  ngAfterViewInit(): void {}
  
  loadProduct(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.loading.set(false); return; }
    
    this.product.set(null); this.mainImage.set(null);
    this.productService.getById(id).subscribe({
      next: (response: any) => {
        const normalized = this.normalizeProduct(response);
        this.product.set(normalized);
        const photos = normalized.productPhotos;
        if (photos && photos.length > 0) {
          this.mainImage.set(this.photoService.getPhotoUrl(photos[0].fileName));
        }
        this.loading.set(false);
        this.loadReviews(id);
        this.checkWishlistStatus(id);
      },
      error: () => this.loading.set(false)
    });
  }
  
  checkWishlistStatus(productId: string): void {
    const userId = this.tokenService.getUserId();
    if (!userId) return;
    this.wishService.getWishes(userId).subscribe({
      next: (wishes) => this.isWishlisted.set(wishes.some(w => w.productId === productId))
    });
  }
  
  toggleWishlist(): void {
    const userId = this.tokenService.getUserId();
    const productId = this.product()?.id;
    if (!userId) { this.router.navigate(['/' + this.currentLang + '/auth/login']); return; }
    if (!productId) return;
    
    if (this.isWishlisted()) {
      this.wishService.removeWish(userId, productId).subscribe({ next: () => this.isWishlisted.set(false) });
    } else {
      this.wishService.addWish({ userId, productId }).subscribe({ next: () => this.isWishlisted.set(true) });
    }
  }
  
  loadReviews(productId: string): void {
    this.loadingReviews.set(true);
    this.reviewService.getReviewsByProductId(productId).subscribe({
      next: (response: Review[]) => {
        this.reviews.set(Array.isArray(response) ? response : (response as any).data || []);
        this.loadingReviews.set(false);
      },
      error: () => this.loadingReviews.set(false)
    });
  }
  
  setMainImage(photo: any): void {
    this.mainImage.set(this.photoService.getPhotoUrl(photo.fileName));
  }
  
  increaseQuantity(): void {
    const maxStock = this.product()?.shownQuantity || 99;
    if (this.quantity < maxStock) this.quantity++;
  }
  
  decreaseQuantity(): void { if (this.quantity > 1) this.quantity--; }
  
  addToCart(): void {
    this.cartService.addToCart(this.product()?.id, this.quantity).subscribe();
  }
  
  isLoggedIn(): boolean { return this.authService.isLoggedIn(); }
  get currentLang(): string { return this.languageService.currentLanguage(); }
  setRating(stars: number): void { this.newReviewStars = stars; }
  
  submitReview(): void {
    const productId = this.product()?.id;
    const userId = this.tokenService.getUserId() || '';
    if (!productId || !userId) return;
    
    this.reviewSubmitting.set(true);
    this.reviewService.addReview({ customerId: userId, productId, stars: this.newReviewStars, content: this.newReviewContent, personName: '' }).subscribe({
      next: () => {
        this.reviewSubmitting.set(false); this.reviewSuccess.set(true);
        this.newReviewStars = 0; this.newReviewContent = '';
        this.loadReviews(productId);
      },
      error: (err) => { this.reviewSubmitting.set(false); this.reviewError.set(err.message); }
    });
  }

  editProduct(): void {
    if (this.product()?.id) this.router.navigate([`/${this.currentLang}/admin/products/add`], { queryParams: { id: this.product().id } });
  }

  deleteProduct(): void {
    if (this.product()?.id && confirm('Delete product?')) {
      this.productService.delete(this.product().id).subscribe({ next: () => this.router.navigate([`/${this.currentLang}/products`]) });
    }
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
      category: p.category || p.Category || p.categoryName || p.CategoryName,
      supplierId: p.supplierId || p.SupplierId,
      supplierName: p.supplierName || p.SupplierName || p.supplier || p.Supplier,
      shownQuantity: p.shownQuantity || (p.shownQuantity === 0 ? 0 : (p.ShownQuantity || 0)),
      quantityInStock: p.quantityInStock || p.QuantityInStock,
      productPhotos: p.productPhotos || p.ProductPhotos || p.productphotos || [],
      haveSale: p.haveSale ?? p.HaveSale ?? false,
      isFasting: p.isFasting ?? p.IsFasting ?? false,
      popularity: p.popularity || p.Popularity || 0,
      reviewCount: p.reviewCount || p.ReviewCount || 0
    };
  }
}
