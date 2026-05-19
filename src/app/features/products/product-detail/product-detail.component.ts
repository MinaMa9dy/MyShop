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
    <main class="min-h-screen bg-surface w-full" [dir]="currentLang === 'ar' ? 'rtl' : 'ltr'">
      <div class="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 py-12">
        
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
            @if (product()?.categoryName) {
              <span class="w-1 h-1 rounded-full bg-outline-variant"></span>
              <span class="text-on-surface">{{ product()?.categoryName }}</span>
            }
          </nav>
          
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            <!-- Gallery Section (7 cols) -->
            <div class="lg:col-span-7 flex flex-col lg:flex-row gap-6 animate-slide-up">
              
              <!-- Vertical Thumbnail Strip (PC View) -->
              @if (allPhotos().length > 1) {
                <div class="hidden lg:flex flex-col gap-4 w-20 overflow-y-auto max-h-[600px] scrollbar-hide py-2">
                  @for (photo of allPhotos(); track photo.id; let i = $index) {
                    <button (click)="scrollToPhoto(i)"
                            class="relative aspect-square w-full rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:scale-105 active:scale-95 flex-shrink-0 shadow-sm"
                            [class]="currentPhotoIndex() === i ? 'border-primary shadow-lg ring-4 ring-primary/10' : 'border-outline-variant/20 hover:border-primary/40'">
                      <img [src]="photoService.getPhotoUrl(photo.url)" 
                           class="w-full h-full object-cover"
                           [class.opacity-40]="currentPhotoIndex() !== i">
                      @if (currentPhotoIndex() === i) {
                        <div class="absolute inset-0 bg-primary/5"></div>
                      }
                    </button>
                  }
                </div>
              }

              <div class="flex-1 relative aspect-square bg-surface-container-lowest rounded-[40px] overflow-hidden border border-outline-variant/10 shadow-2xl group">
                
                @if (allPhotos().length > 0) {
                  <div class="flex h-full w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth" #carousel (scroll)="onScroll($event)">
                    @for (photo of allPhotos(); track photo.id) {
                      <div class="flex-shrink-0 w-full h-full snap-center flex items-center justify-center p-12">
                        <img [src]="photoService.getPhotoUrl(photo.url)" 
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

                    <!-- Indicators (Mobile/Compact) -->
                    <div class="lg:hidden absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
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
            </div>

            <!-- Content Section (5 cols) -->
            <div class="lg:col-span-5 space-y-10 animate-slide-up text-center lg:text-start" style="animation-delay: 100ms">
              <div class="space-y-4">
                <div class="flex items-center justify-center lg:justify-start gap-3">
                   <span class="text-[10px] font-black uppercase tracking-[0.3em] text-primary px-3 py-1 bg-primary/10 rounded-full">{{ product()?.categoryName }}</span>
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
                     {{ (selectedVariant()?.newPrice || product()?.newPrice) | currency:'EGP':'symbol':'1.0-0':'en-EG' }}
                   </span>
                   @if (isOnSale()) {
                     <span class="font-body text-xl text-outline-variant line-through opacity-50">
                        {{ (selectedVariant()?.oldPrice || product()?.oldPrice) | currency:'EGP':'symbol':'1.0-0':'en-EG' }}
                     </span>
                   }
                </div>

                <!-- Dynamic Attribute Matrix -->
                @if (attributeGroups().length > 0 && product()?.productVariants && product()?.productVariants!.length > 1) {
                  <div class="space-y-8 animate-fade-in">
                    @for (group of attributeGroups(); track group.name) {
                      <div class="space-y-4">
                        <div class="flex items-center justify-between px-2">
                          <label class="text-[10px] font-black uppercase tracking-[0.2em] text-outline">{{ group.name }}</label>
                          <span class="text-[10px] font-bold text-primary">{{ selectedAttributes()[group.name] }}</span>
                        </div>
                        <div class="flex flex-wrap gap-3">
                          @for (val of group.values; track val) {
                            <button (click)="selectAttributeValue(group.name, val)"
                                    [class.bg-primary]="selectedAttributes()[group.name] === val"
                                    [class.text-on-primary]="selectedAttributes()[group.name] === val"
                                    [class.border-primary]="selectedAttributes()[group.name] === val"
                                    [class.shadow-[0_8px_20px_-6px_rgba(var(--primary-rgb),0.4)]]="selectedAttributes()[group.name] === val"
                                    [class.scale-105]="selectedAttributes()[group.name] === val"
                                    [class.opacity-40]="!isOptionAvailable(group.name, val)"
                                    [class.bg-surface-container-low]="selectedAttributes()[group.name] !== val"
                                    class="px-6 py-4 rounded-[20px] text-[11px] font-black tracking-widest transition-all border border-outline-variant/30 min-w-[100px] hover:border-primary/50 relative overflow-hidden group/opt active:scale-95">
                              <span class="relative z-10">{{ val }}</span>
                              @if (!isOptionAvailable(group.name, val)) {
                                <div class="absolute inset-0 bg-outline/5 flex items-center justify-center rotate-12 pointer-events-none">
                                  <div class="w-full h-[1.5px] bg-outline-variant/40"></div>
                                </div>
                              }
                              <div class="absolute inset-0 bg-primary opacity-0 group-hover/opt:opacity-5 transition-opacity"></div>
                            </button>
                          }
                        </div>
                      </div>
                    }
                  </div>
                } @else if (product()?.productVariants && product()?.productVariants!.length > 1) {
                  <!-- Fallback to list if no structured attributes -->
                  <div class="space-y-4">
                     <label class="text-[10px] font-black uppercase tracking-widest text-outline px-2">{{ 'product.variants' | translate }}</label>
                     <div class="flex flex-wrap gap-3">
                       @for (variant of product()?.productVariants; track variant.id) {
                         <button (click)="selectVariant(variant)" 
                                 [class]="selectedVariant()?.id === variant.id ? 'bg-primary text-on-primary shadow-lg scale-105' : 'bg-surface-container-high text-on-surface-variant'"
                                 class="px-6 py-3 rounded-2xl text-[10px] font-black tracking-widest transition-all border border-outline-variant/20 min-w-[80px]">
                           {{ variant.sku }} ({{ variant.stockQuantity }})
                         </button>
                       }
                     </div>
                  </div>
                }

                <!-- Stock Status Tag -->
                <!-- Stock & Source Information -->
                <div class="flex flex-wrap items-center justify-center lg:justify-start gap-6 px-2">
                   <div class="flex items-center gap-3">
                      <div class="relative flex h-3 w-3">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" 
                              [class.bg-success]="(selectedVariant()?.stockQuantity ?? product()?.stockQuantity ?? 0) > 0"
                              [class.bg-error]="(selectedVariant()?.stockQuantity ?? product()?.stockQuantity ?? 0) <= 0"></span>
                        <span class="relative inline-flex rounded-full h-3 w-3"
                              [class.bg-success]="(selectedVariant()?.stockQuantity ?? product()?.stockQuantity ?? 0) > 0"
                              [class.bg-error]="(selectedVariant()?.stockQuantity ?? product()?.stockQuantity ?? 0) <= 0"></span>
                      </div>
                      <span class="text-[11px] font-black uppercase tracking-[0.15em]" 
                            [class.text-success]="(selectedVariant()?.stockQuantity ?? product()?.stockQuantity ?? 0) > 0" 
                            [class.text-error]="(selectedVariant()?.stockQuantity ?? product()?.stockQuantity ?? 0) <= 0">
                        {{ (selectedVariant()?.stockQuantity ?? product()?.stockQuantity ?? 0) > 0 ? ('product.inStock' | translate) : ('product.outOfStock' | translate) }}
                        @if ((selectedVariant()?.stockQuantity ?? product()?.stockQuantity ?? 0) > 0) {
                          <span class="ml-1 opacity-60">({{ selectedVariant()?.stockQuantity ?? product()?.stockQuantity }})</span>
                        }
                      </span>
                   </div>
                   @if (product()?.supplierName) {
                    <div class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-sm text-outline">verified</span>
                      <span class="text-[11px] font-black uppercase tracking-[0.15em] text-outline">{{ 'product.source' | translate }}: {{ product()?.supplierName }}</span>
                    </div>
                   }
                </div>

                <!-- Quantity & Selection Section -->
                <div class="flex flex-col sm:flex-row items-center gap-6 pt-6 border-t border-outline-variant/10">
                  <div class="flex flex-col gap-2 w-full sm:w-auto">
                    <label class="text-[10px] font-black uppercase tracking-[0.2em] text-outline text-center lg:text-start px-2">
                      {{ 'product.configurationQuantity' | translate }}
                    </label>
                    <div class="inline-flex items-center self-center lg:self-start bg-surface-container-low p-1.5 rounded-[24px] border border-outline-variant/20 shadow-sm hover:border-primary/30 transition-all group/qty">
                      <button (click)="decreaseQuantity()" 
                              class="w-12 h-12 rounded-[20px] flex items-center justify-center text-on-surface-variant hover:bg-white hover:text-primary hover:shadow-md transition-all active:scale-90">
                        <span class="material-symbols-outlined text-xl">remove</span>
                      </button>
                      
                      <div class="px-8 flex flex-col items-center justify-center min-w-[60px]">
                        <span class="font-headline font-black text-xl text-on-surface leading-none">{{ quantity }}</span>
                        <span class="text-[8px] font-bold uppercase tracking-widest text-outline-variant mt-0.5">{{ 'common.units' | translate }}</span>
                      </div>

                      <button (click)="increaseQuantity()" 
                              class="w-12 h-12 rounded-[20px] flex items-center justify-center text-on-surface-variant hover:bg-white hover:text-primary hover:shadow-md transition-all active:scale-90">
                        <span class="material-symbols-outlined text-xl">add</span>
                      </button>
                    </div>
                  </div>

                  <div class="flex-1 w-full pt-4 sm:pt-6">
                    @if ((selectedVariant()?.stockQuantity ?? product()?.stockQuantity ?? 0) > 0) {
                      <button (click)="addToCart()"
                              [disabled]="loading()"
                              class="w-full h-[72px] bg-primary text-on-primary rounded-[28px] font-headline font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_40px_-12px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_25px_50px_-12px_rgba(var(--primary-rgb),0.4)] hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:translate-y-0 group">
                        <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:rotate-12 transition-transform">
                          <span class="material-symbols-outlined text-xl">shopping_cart</span>
                        </div>
                        <span>{{ 'product.initializeAcquisition' | translate }}</span>
                      </button>
                    } @else {
                      <div class="w-full h-[72px] bg-surface-container-high text-outline-variant rounded-[28px] border-2 border-dashed border-outline-variant/20 flex items-center justify-center gap-4 opacity-60">
                        <span class="material-symbols-outlined">block</span>
                        <span class="font-headline font-black text-xs uppercase tracking-widest">{{ 'product.outOfStock' | translate }}</span>
                      </div>
                    }
                  </div>
                </div>

                @if (canEditProduct()) {
                   <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                      <button (click)="editProduct()" class="py-4 bg-tertiary/10 text-tertiary rounded-2xl font-headline font-bold text-sm tracking-tight hover:bg-tertiary hover:text-on-tertiary transition-all">{{ 'admin.editProduct' | translate }}</button>
                      <button (click)="deleteProduct()" class="py-4 bg-error/10 text-error rounded-2xl font-headline font-bold text-sm tracking-tight hover:bg-error hover:text-on-error transition-all">{{ 'admin.deleteProduct' | translate }}</button>
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
                                    class="w-full bg-surface border-2 border-transparent focus:border-primary/20 p-5 rounded-2xl outline-none font-body text-sm text-on-surface transition-all resize-y min-h-[140px]"
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
                           <p class="font-body text-on-surface-variant leading-relaxed text-lg pl-6 break-words whitespace-pre-wrap">
                              {{ review.content }}
                           </p>
                         </div>
                      </div>
                    }
                  }
               </div>
            </div>
          </section>

          <!-- Related Products Section -->
          @if (relatedProducts().length > 0) {
            <section class="mt-40 animate-slide-up" style="animation-delay: 200ms">
              <div class="flex flex-col md:flex-row justify-between items-center md:items-end gap-8 mb-16 text-center md:text-start">
                <div class="max-w-xl mx-auto md:mx-0">
                  <p class="font-label text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">{{ 'product.curatedSelection' | translate }}</p>
                  <h2 class="font-headline text-4xl font-black text-on-surface tracking-tighter mb-4">{{ 'product.relatedProducts' | translate }}</h2>
                  <p class="font-body text-sm text-on-surface-variant max-w-lg opacity-70">{{ 'product.relatedDesc' | translate }}</p>
                </div>
                <div class="flex items-center gap-4 justify-center md:justify-end w-full md:w-auto flex-shrink-0">
                  <!-- Navigation Arrows for Related Products Slider -->
                  <div class="hidden md:flex gap-2">
                    <button (click)="scrollRelatedPrev()" class="w-12 h-12 rounded-full bg-surface-container hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center shadow-sm">
                      <span class="material-symbols-outlined text-xl">arrow_back</span>
                    </button>
                    <button (click)="scrollRelatedNext()" class="w-12 h-12 rounded-full bg-surface-container hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center shadow-sm">
                      <span class="material-symbols-outlined text-xl">arrow_forward</span>
                    </button>
                  </div>
                  <a routerLink="/products" [queryParams]="{ categoryId: product()?.categoryId }" class="flex items-center gap-2 px-8 py-4 bg-surface-container text-on-surface rounded-2xl font-headline font-bold text-sm hover:bg-primary hover:text-on-primary transition-all shadow-sm">
                    {{ 'common.viewAll' | translate }}
                    <span class="material-symbols-outlined">arrow_forward</span>
                  </a>
                </div>
              </div>

              <div class="flex overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth gap-4 lg:gap-6 xl:gap-8 pb-6" #relatedCarousel>
                @for (item of relatedProducts(); track item.id) {
                  <div class="snap-start flex-shrink-0 w-[180px] sm:w-[220px] ksm-product-card group flex flex-col relative">

                    <!-- Badges -->
                    @if (item.haveSale || item.oldPrice > item.newPrice) {
                      <div class="absolute top-2 left-2 z-10">
                        <span class="bg-error text-white text-[9px] font-black px-1.5 py-0.5 rounded-md"
                              style="font-family:'Cairo',sans-serif;">خصم</span>
                      </div>
                    }
                    @if (item.isFasting) {
                      <div class="absolute top-2 left-2 mt-5 z-10">
                        <span class="bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded-md"
                              style="font-family:'Cairo',sans-serif;">صيامي</span>
                      </div>
                    }

                    <!-- Wishlist Button -->
                    <button class="absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all active:scale-90"
                            [class.bg-red-50]="wishlistIds().has(item.id)"
                            [class.bg-white]="!wishlistIds().has(item.id)"
                            (click)="toggleWishlistForProduct(item, $event)">
                      <span class="material-symbols-outlined text-[16px] transition-colors"
                            [class.text-red-500]="wishlistIds().has(item.id)"
                            [class.text-outline-variant]="!wishlistIds().has(item.id)"
                            [style.font-variation-settings]="wishlistIds().has(item.id) ? '&quot;FILL&quot; 1' : '&quot;FILL&quot; 0'">
                        favorite
                      </span>
                    </button>

                    <!-- Product Image -->
                    <a [routerLink]="'/' + currentLang + '/products/' + item.id"
                       class="block aspect-square overflow-hidden bg-surface-container-low no-underline">
                      <img [src]="getMainPhotoUrl(item) || 'assets/images/placeholder.svg'"
                           [alt]="item.name"
                           loading="lazy"
                           class="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105">
                    </a>

                    <!-- Info -->
                    <div class="p-2 flex flex-col flex-1">
                      <!-- Category -->
                      @if (item.categoryName) {
                        <div class="text-[10px] text-primary/80 mb-0.5 truncate" style="font-family:'Tajawal',sans-serif;">
                          {{ item.categoryName }}
                        </div>
                      }
                      
                      <!-- Title -->
                      <a [routerLink]="'/' + currentLang + '/products/' + item.id" class="no-underline">
                        <h3 class="text-on-surface font-bold text-[12px] md:text-sm line-clamp-2 mb-1 hover:text-primary transition-colors leading-tight"
                            style="font-family:'Cairo',sans-serif;">
                          {{ item.name }}
                        </h3>
                      </a>

                      <!-- Rating & Supplier -->
                      <div class="flex items-center justify-between mb-2">
                        <!-- Rating -->
                        <div class="flex items-center gap-0.5 text-[10px] text-on-surface-variant">
                          <span class="material-symbols-outlined text-[12px] text-[#C4962A]" style="font-variation-settings: 'FILL' 1">star</span>
                          <span class="font-bold text-[#7B1818]">{{ item.averageRating | number:'1.1-1' }}</span>
                          <span>({{ item.reviewCount }})</span>
                        </div>
                        <!-- Supplier -->
                        @if (item.supplierName) {
                          <div class="text-[9px] text-outline-variant truncate max-w-[60px]" style="font-family:'Tajawal',sans-serif;" [title]="item.supplierName">
                            {{ item.supplierName }}
                          </div>
                        }
                      </div>

                      <!-- Price + Cart -->
                      <div class="flex items-center justify-between mt-auto pt-1 gap-1">
                        <div class="flex flex-col min-w-0">
                          @if (item.oldPrice > item.newPrice) {
                            <span class="text-[9px] text-outline-variant line-through" style="font-family:'Cairo',sans-serif;">
                              EGP {{ item.oldPrice }}
                            </span>
                          }
                          <span class="text-primary font-black text-[13px] md:text-sm" style="font-family:'Cairo',sans-serif;">
                            EGP {{ item.newPrice }}
                          </span>
                        </div>

                        @if (item.stockQuantity > 0) {
                          <button (click)="addToCartRelated(item, $event)"
                                  class="ksm-add-btn flex-shrink-0">
                            <span class="material-symbols-outlined text-[18px]">shopping_cart</span>
                          </button>
                        } @else {
                          <div class="flex-shrink-0 w-9 h-9 rounded-full bg-surface-container flex items-center justify-center opacity-30">
                            <span class="material-symbols-outlined text-[16px] text-outline-variant">remove_shopping_cart</span>
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            </section>
          }
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
  selectedVariant = signal<any>(null);
  loading = signal(true);
  relatedProducts = signal<any[]>([]);
  loadingRelated = signal(false);
  mainImage = signal<string | null>(null);
  quantity = 1;
  
  // Variant Matrix Selection State
  selectedAttributes = signal<Record<string, string>>({});
  wishlistIds = signal<Set<string>>(new Set());
  
  attributeGroups = computed(() => {
    const p = this.product();
    if (!p || !p.productVariants) return [];
    
    const groups: Record<string, Set<string>> = {};
    
    p.productVariants.forEach((v: any) => {
      if (!v.attributes) return;
      v.attributes.forEach((a: any) => {
        if (!groups[a.attributeName]) groups[a.attributeName] = new Set();
        groups[a.attributeName].add(a.value);
      });
    });
    
    return Object.keys(groups).map(name => ({
      name,
      values: Array.from(groups[name])
    }));
  });
  
  isWishlisted = signal<boolean>(false);
  reviews = signal<Review[]>([]);
  loadingReviews = signal(false);
  newReviewStars = 0;
  newReviewContent = '';
  reviewSubmitting = signal(false);
  reviewError = signal<string | null>(null);
  reviewSuccess = signal(false);
  
  salePercentage = computed(() => {
    const v = this.selectedVariant();
    if (!v || !v.oldPrice || !v.newPrice || v.oldPrice <= v.newPrice) return 0;
    return Math.round(((v.oldPrice - v.newPrice) / v.oldPrice) * 100);
  });
  
  isOnSale = computed(() => {
    const v = this.selectedVariant();
    return v ? v.oldPrice > v.newPrice : false;
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
    return this.photoService.getPhotoUrl(photoPath, 'user');
  }

  getMainPhotoUrl(product: any): string | null {
    if (!product || !product.productPhotos || product.productPhotos.length === 0) return null;
    const main = product.productPhotos.find((p: any) => p.isMain) || product.productPhotos[0];
    return this.photoService.getPhotoUrl(main.url);
  }
  
  @ViewChild('carousel') carouselElement!: ElementRef;
  @ViewChild('relatedCarousel') relatedCarouselElement!: ElementRef;
  currentPhotoIndex = signal(0);

  scrollRelatedPrev(): void {
    if (this.relatedCarouselElement) {
      const direction = this.currentLang === 'ar' ? 1 : -1;
      this.relatedCarouselElement.nativeElement.scrollBy({ left: 320 * direction, behavior: 'smooth' });
    }
  }

  scrollRelatedNext(): void {
    if (this.relatedCarouselElement) {
      const direction = this.currentLang === 'ar' ? -1 : 1;
      this.relatedCarouselElement.nativeElement.scrollBy({ left: 320 * direction, behavior: 'smooth' });
    }
  }

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
  
  ngOnInit(): void {
    // Subscribe to route parameter changes to handle searching for a new product
    // while already on a product detail page (component reuse)
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadProduct(params['id']);
      }
    });
  }
  ngAfterViewInit(): void {}
  
  loadProduct(id?: string): void {
    if (!id) {
      id = this.route.snapshot.paramMap.get('id') || undefined;
    }
    if (!id) { this.loading.set(false); return; }
    
    this.loading.set(true);
    this.quantity = 1; // Reset quantity on product change
    this.currentPhotoIndex.set(0); // Reset photo index
    this.productService.getById(id).subscribe({
      next: (result) => {
        if (result.success && result.data) {
          const p = this.normalizeProduct(result.data);
          console.log('Normalized Product Data:', p);
          this.product.set(p);
          if (p.productPhotos && p.productPhotos.length > 0) {
            const main = p.productPhotos.find((ph: any) => ph.isMain) || p.productPhotos[0];
            this.mainImage.set(this.photoService.getPhotoUrl(main.url));
          }
          
          // Select first variant by default if exists
          if (p.productVariants && p.productVariants.length > 0) {
            const firstVariant = p.productVariants[0];
            this.selectedVariant.set(firstVariant);
            
            // Pre-select attributes of the first variant
            const initialAttrs: Record<string, string> = {};
            if (firstVariant.attributes) {
              firstVariant.attributes.forEach((a: any) => initialAttrs[a.attributeName] = a.value);
            }
            this.selectedAttributes.set(initialAttrs);
          }
        }
        this.loading.set(false);
        this.loadReviews(id);
        this.checkWishlistStatus(id);
        this.loadRelatedProducts(id);
      },
      error: () => this.loading.set(false)
    });
  }

  loadRelatedProducts(productId: string): void {
    this.loadingRelated.set(true);
    this.productService.getRelatedProducts(productId).subscribe({
      next: (result) => {
        if (result.success && result.data) {
          this.relatedProducts.set(result.data.map(p => this.normalizeProduct(p)));
        }
        this.loadingRelated.set(false);
      },
      error: () => this.loadingRelated.set(false)
    });
  }
  
  checkWishlistStatus(productId: string): void {
    const userId = this.tokenService.getUserId();
    if (!userId) return;
    this.wishService.getWishes().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const ids = new Set<string>();
          res.data.forEach(w => { if (w.productId) ids.add(w.productId); });
          this.wishlistIds.set(ids);
          this.isWishlisted.set(ids.has(productId));
        }
      }
    });
  }
  
  toggleWishlist(): void {
    const userId = this.tokenService.getUserId();
    const productId = this.product()?.id;
    if (!userId) { this.router.navigate(['/' + this.currentLang + '/auth/login']); return; }
    if (!productId) return;
    
    // --- OPTIMISTIC UPDATE START ---
    const wasWishlisted = this.isWishlisted();
    this.isWishlisted.set(!wasWishlisted);
    this.wishlistIds.update(set => {
      const nextSet = new Set(set);
      if (wasWishlisted) nextSet.delete(productId);
      else nextSet.add(productId);
      return nextSet;
    });
    // --- OPTIMISTIC UPDATE END ---

    if (wasWishlisted) {
      this.wishService.removeWish(productId).subscribe({
        next: () => console.log('Optimistic UI (Detail): Successfully removed'),
        error: (err) => {
          console.error('Optimistic UI (Detail): Error removing, rolling back', err);
          this.isWishlisted.set(true);
          this.wishlistIds.update(set => {
            const nextSet = new Set(set);
            nextSet.add(productId);
            return nextSet;
          });
        }
      });
    } else {
      this.wishService.addWish({ productId }).subscribe({
        next: () => console.log('Optimistic UI (Detail): Successfully added'),
        error: (err) => {
          console.error('Optimistic UI (Detail): Error adding, rolling back', err);
          this.isWishlisted.set(false);
          this.wishlistIds.update(set => {
            const nextSet = new Set(set);
            nextSet.delete(productId);
            return nextSet;
          });
        }
      });
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
    this.mainImage.set(this.photoService.getPhotoUrl(photo.url));
  }
  
  increaseQuantity(): void {
    const maxStock = this.selectedVariant()?.stockQuantity ?? this.product()?.stockQuantity ?? 99;
    if (this.quantity < maxStock) this.quantity++;
  }
  
  decreaseQuantity(): void { if (this.quantity > 1) this.quantity--; }
  
  selectAttributeValue(attrName: string, value: string): void {
    const p = this.product();
    if (!p || !p.productVariants) return;

    const newSelection = { ...this.selectedAttributes() };
    newSelection[attrName] = value;
    
    // 1. Try to find an exact match for the new selection
    let match = p.productVariants.find((v: any) => {
      return Object.entries(newSelection).every(([name, val]) => {
        return v.attributes.some((a: any) => a.attributeName === name && a.value === val);
      });
    });

    // 2. If no exact match, find the first variant that has the NEWLY selected value
    // and adopt its other attributes (Auto-Correction)
    if (!match) {
      match = p.productVariants.find((v: any) => {
        return v.attributes.some((a: any) => a.attributeName === attrName && a.value === value);
      });
    }

    if (match) {
      this.selectVariant(match);
    }
  }

  syncVariantFromAttributes(): void {
    const p = this.product();
    if (!p || !p.productVariants) return;
    
    const selection = this.selectedAttributes();
    
    // Find a variant that matches ALL selected attributes
    const match = p.productVariants.find((v: any) => {
      return Object.entries(selection).every(([name, value]) => {
        return v.attributes.some((a: any) => a.attributeName === name && a.value === value);
      });
    });
    
    if (match) {
      this.selectedVariant.set(match);
      this.quantity = 1;
    }
  }

  isOptionAvailable(attrName: string, value: string): boolean {
    const p = this.product();
    if (!p || !p.productVariants) return false;
    
    // To check if an option is available, we look if there's any variant 
    // that has this value PLUS the other currently selected values.
    const currentSelection = { ...this.selectedAttributes() };
    currentSelection[attrName] = value;
    
    return p.productVariants.some((v: any) => {
      return Object.entries(currentSelection).every(([name, val]) => {
        // Only check attributes that exist in this variant
        const attr = v.attributes.find((a: any) => a.attributeName === name);
        return attr ? attr.value === val : true; 
      });
    });
  }

  selectVariant(variant: any): void {
    this.selectedVariant.set(variant);
    this.quantity = 1;
    
    // Update selected attributes to match this variant
    const newAttrs: Record<string, string> = {};
    if (variant.attributes) {
      variant.attributes.forEach((a: any) => newAttrs[a.attributeName] = a.value);
    }
    this.selectedAttributes.set(newAttrs);
  }

  addToCart(): void {
    const userId = this.tokenService.getUserId();
    if (!userId) {
      this.router.navigate(['/' + this.currentLang + '/auth/login']);
      return;
    }

    const currentProduct = this.product();
    const variant = this.selectedVariant();
    
    // Use variantId if it exists
    const targetId = variant?.id || currentProduct?.id;
    
    if (targetId) {
      // Create a combined object for optimistic UI display
      const displayData = {
        ...currentProduct,
        newPrice: variant?.newPrice || currentProduct.newPrice,
        variantDetails: this.formatSelectedVariantDetails()
      };
      
      this.cartService.addToCart(targetId, this.quantity, displayData).subscribe();
    }
  }

  addToCartRelated(product: any, event: Event): void {
    event.preventDefault(); event.stopPropagation();
    const userId = this.tokenService.getUserId();
    if (!userId) {
      this.router.navigate(['/' + this.currentLang + '/auth/login']);
      return;
    }
    const variantId = product.productVariants?.[0]?.id || product.id;
    if (product.stockQuantity <= 0) return;
    this.cartService.addToCart(variantId, 1, product).subscribe({
      next: () => console.log('Related added to cart'),
      error: (err) => console.error('Cart error:', err)
    });
  }

  toggleWishlistForProduct(product: any, event: Event): void {
    event.preventDefault(); event.stopPropagation();
    const userId = this.tokenService.getUserId();
    if (!userId) { this.router.navigate(['/' + this.currentLang + '/auth/login']); return; }
    
    const productId = product.id;
    const isCurrentlyInWishlist = this.wishlistIds().has(productId);
    
    // --- OPTIMISTIC UPDATE START ---
    this.wishlistIds.update(set => {
      const nextSet = new Set(set);
      if (isCurrentlyInWishlist) nextSet.delete(productId);
      else nextSet.add(productId);
      return nextSet;
    });
    if (this.product()?.id === productId) {
      this.isWishlisted.set(!isCurrentlyInWishlist);
    }
    // --- OPTIMISTIC UPDATE END ---

    if (isCurrentlyInWishlist) {
      this.wishService.removeWish(productId).subscribe({
        next: () => console.log('Successfully removed related from wishlist'),
        error: (err) => {
          console.error('Error removing, rolling back', err);
          this.wishlistIds.update(set => {
            const nextSet = new Set(set);
            nextSet.add(productId);
            return nextSet;
          });
          if (this.product()?.id === productId) {
            this.isWishlisted.set(true);
          }
        }
      });
    } else {
      this.wishService.addWish({ productId }).subscribe({
        next: () => console.log('Successfully added related to wishlist'),
        error: (err) => {
          console.error('Error adding, rolling back', err);
          this.wishlistIds.update(set => {
            const nextSet = new Set(set);
            nextSet.delete(productId);
            return nextSet;
          });
          if (this.product()?.id === productId) {
            this.isWishlisted.set(false);
          }
        }
      });
    }
  }

  private formatSelectedVariantDetails(): string {
    const attrs = this.selectedAttributes();
    return Object.entries(attrs)
      .map(([name, val]) => `${name}: ${val}`)
      .join(', ');
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
      newPrice: p.newPrice || p.NewPrice || p.productVariants?.[0]?.newPrice || p.productVariants?.[0]?.NewPrice || 0,
      oldPrice: p.oldPrice || p.OldPrice || p.productVariants?.[0]?.oldPrice || p.productVariants?.[0]?.OldPrice || 0,
      categoryId: p.categoryId || p.CategoryId,
      categoryName: p.categoryName || p.CategoryName,
      supplierId: p.supplierId || p.SupplierId,
      supplierName: p.supplierName || p.SupplierName || p.supplier || p.Supplier,
      shownQuantity: (p.stockQuantity ?? p.StockQuantity ?? p.productVariants?.[0]?.stockQuantity ?? p.productVariants?.[0]?.StockQuantity) ?? 0,
      stockQuantity: (p.stockQuantity ?? p.StockQuantity ?? p.productVariants?.[0]?.stockQuantity ?? p.productVariants?.[0]?.StockQuantity) ?? 0,
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
        stockQuantity: (v.stockQuantity ?? v.StockQuantity ?? v.shownQuantity ?? v.ShownQuantity) ?? 0,
        attributes: (v.attributes || v.Attributes || []).map((a: any) => ({
          attributeId: a.attributeId || a.AttributeId,
          attributeName: a.attributeName || a.AttributeName,
          value: a.value || a.Value
        }))
      })),
      haveSale: p.haveSale ?? p.HaveSale ?? false,
      isFasting: p.isFasting ?? p.IsFasting ?? false,
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
}

