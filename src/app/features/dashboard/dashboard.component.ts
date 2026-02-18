import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { WishService } from '../../core/services/wish.service';
import { TokenService } from '../../core/services/token.service';
import { LanguageService } from '../../core/services/language.service';
import { OrderService } from '../../core/services/order.service';
import { User, UserProfile } from '../../core/models/auth.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslatePipe],
  template: `
    <div class="profile-page min-h-screen bg-gray-50">
      <!-- Profile Header Banner -->
      <div class="profile-banner bg-gradient-to-r from-indigo-600 to-purple-600 h-48 relative">
        <div class="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
          <div class="w-32 h-32 bg-white rounded-full p-1 shadow-lg relative">
            <div class="w-full h-full bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden">
              @if (photoUploading()) {
                <div class="w-full h-full flex items-center justify-center">
                  <div class="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              } @else if (getPhotoUrl()) {
                <img [src]="getPhotoUrl()" alt="Profile Photo" class="w-full h-full object-cover">
              } @else {
                <span class="text-5xl font-bold text-indigo-600">{{ userInitials() }}</span>
              }
            </div>
            <!-- Change Photo Button -->
            <label for="photo-input" class="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-indigo-700 transition-colors shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </label>
            <input type="file" id="photo-input" class="hidden" accept="image/*" (change)="onPhotoSelected($event)">
          </div>
        </div>
      </div>
      
      <!-- Profile Info Section -->
      <div class="pt-20 pb-8">
        <div class="container mx-auto px-4">
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">{{ userFullName() }}</h1>
            <p class="text-gray-500 mb-3">{{ userEmail() }}</p>
            <div class="flex justify-center gap-2 mb-4">
              @for (role of user()?.roles || []; track role) {
                <span class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">{{ role }}</span>
              }
            </div>
          </div>
          
          <!-- Profile Navigation Tabs -->
          <div class="max-w-4xl mx-auto">
            <div class="flex justify-center gap-4 mb-8">
              <button 
                (click)="activeTab.set('overview')" 
                [class]="'px-6 py-3 rounded-lg font-medium transition-all ' + (activeTab() === 'overview' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100')">
                {{ 'dashboard.overview' | translate }}
              </button>
              <button 
                (click)="activeTab.set('orders')" 
                [class]="'px-6 py-3 rounded-lg font-medium transition-all ' + (activeTab() === 'orders' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100')">
                {{ 'dashboard.orders' | translate }}
              </button>
              <button 
                (click)="activeTab.set('wishlist')" 
                [class]="'px-6 py-3 rounded-lg font-medium transition-all ' + (activeTab() === 'wishlist' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100')">
                {{ 'dashboard.wishlist' | translate }}
              </button>
              <button 
                (click)="activeTab.set('account')" 
                [class]="'px-6 py-3 rounded-lg font-medium transition-all ' + (activeTab() === 'account' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100')">
                {{ 'dashboard.account' | translate }}
              </button>
            </div>
            
            <!-- Tab Content -->
            <div class="bg-white rounded-2xl shadow-lg p-6">
              <!-- Overview Tab -->
              @if (activeTab() === 'overview') {
                <div class="space-y-6">
                  <!-- Stats Cards -->
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center">
                    <div class="profile-stat-card p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl text-center w-full max-w-xs">
                      <div class="flex justify-center mb-4">
                        <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-2xl text-white">
                          📦
                        </div>
                      </div>
                      <p class="text-3xl font-bold text-gray-800">{{ stats().totalOrders }}</p>
                      <p class="text-gray-600">{{ 'dashboard.totalOrders' | translate }}</p>
                    </div>
                    
                    <div class="profile-stat-card p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl text-center w-full max-w-xs">
                      <div class="flex justify-center mb-4">
                        <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-2xl text-white">
                          🛒
                        </div>
                      </div>
                      <p class="text-3xl font-bold text-gray-800">{{ cartTotalItems() }}</p>
                      <p class="text-gray-600">{{ 'dashboard.cartItems' | translate }}</p>
                    </div>
                    
                    <div class="profile-stat-card p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl text-center w-full max-w-xs">
                      <div class="flex justify-center mb-4">
                        <div class="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-2xl text-white">
                          ❤️
                        </div>
                      </div>
                      <p class="text-3xl font-bold text-gray-800">{{ stats().wishlist }}</p>
                      <p class="text-gray-600">{{ 'dashboard.wishlist' | translate }}</p>
                    </div>
                  </div>
                  
                  <!-- Quick Actions -->
                  <div class="border-t border-gray-100 pt-6">
                    <h3 class="text-xl font-semibold text-gray-800 mb-4">{{ 'dashboard.quickActions' | translate }}</h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <a [routerLink]="'/' + currentLang() + '/products'" class="profile-action-btn p-4 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-all text-center group">
                        <span class="text-3xl block mb-2 group-hover:scale-110 transition-transform">🛍️</span>
                        <span class="font-medium text-gray-700 group-hover:text-indigo-600">{{ 'dashboard.browseProducts' | translate }}</span>
                      </a>
                      <a [routerLink]="'/' + currentLang() + '/cart'" class="profile-action-btn p-4 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-all text-center group">
                        <span class="text-3xl block mb-2 group-hover:scale-110 transition-transform">🛒</span>
                        <span class="font-medium text-gray-700 group-hover:text-indigo-600">{{ 'dashboard.viewCart' | translate }}</span>
                      </a>
                      <a [routerLink]="'/' + currentLang() + '/categories'" class="profile-action-btn p-4 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-all text-center group">
                        <span class="text-3xl block mb-2 group-hover:scale-110 transition-transform">📂</span>
                        <span class="font-medium text-gray-700 group-hover:text-indigo-600">{{ 'nav.categories' | translate }}</span>
                      </a>
                      <a [routerLink]="'/' + currentLang() + '/orders'" class="profile-action-btn p-4 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-all text-center group">
                        <span class="text-3xl block mb-2 group-hover:scale-110 transition-transform">📋</span>
                        <span class="font-medium text-gray-700 group-hover:text-indigo-600">{{ 'orders.title' | translate }}</span>
                      </a>
                    </div>
                  </div>
                </div>
              }
              
              <!-- Orders Tab -->
              @if (activeTab() === 'orders') {
                <div class="text-center py-12">
                  <div class="text-6xl mb-4">📦</div>
                  <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ 'dashboard.yourOrders' | translate }}</h3>
                  <p class="text-gray-500 mb-6">{{ 'dashboard.ordersDescription' | translate }}</p>
                  <a [routerLink]="'/' + currentLang() + '/orders'" class="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    {{ 'dashboard.viewAllOrders' | translate }}
                  </a>
                </div>
              }
              
              <!-- Wishlist Tab -->
              @if (activeTab() === 'wishlist') {
                <div class="text-center py-12">
                  <div class="text-6xl mb-4">❤️</div>
                  <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ 'dashboard.yourWishlist' | translate }}</h3>
                  <p class="text-gray-500 mb-6">{{ 'dashboard.wishlistDescription' | translate }}</p>
                  <a [routerLink]="'/' + currentLang() + '/wishes'" class="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    {{ 'dashboard.viewWishlist' | translate }}
                  </a>
                </div>
              }
              
              <!-- Account Tab -->
              @if (activeTab() === 'account') {
                <div class="space-y-6">
                  <h3 class="text-xl font-semibold text-gray-800 mb-4">{{ 'dashboard.accountInfo' | translate }}</h3>
                  
                  <div class="profile-info-card">
                    <div class="flex justify-between py-4 border-b border-gray-100">
                      <span class="text-gray-500">{{ 'auth.firstName' | translate }}</span>
                      <span class="font-medium text-gray-800">{{ profile()?.firstName || '-' }}</span>
                    </div>
                    <div class="flex justify-between py-4 border-b border-gray-100">
                      <span class="text-gray-500">{{ 'auth.lastName' | translate }}</span>
                      <span class="font-medium text-gray-800">{{ profile()?.lastName || '-' }}</span>
                    </div>
                    <div class="flex justify-between py-4 border-b border-gray-100">
                      <span class="text-gray-500">{{ 'auth.email' | translate }}</span>
                      <span class="font-medium text-gray-800">{{ userEmail() }}</span>
                    </div>
                    <div class="flex justify-between py-4 border-b border-gray-100">
                      <span class="text-gray-500">{{ 'auth.phone' | translate }}</span>
                      <span class="font-medium text-gray-800">{{ user()?.phoneNumber || '-' }}</span>
                    </div>
                    <div class="flex justify-between py-4 border-b border-gray-100">
                      <span class="text-gray-500">{{ 'auth.gender' | translate }}</span>
                      <span class="font-medium text-gray-800">{{ getGenderText() }}</span>
                    </div>
                    <div class="flex justify-between py-4">
                      <span class="text-gray-500">{{ 'dashboard.memberSince' | translate }}</span>
                      <span class="font-medium text-gray-800">{{ getCreatedDate() }}</span>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private wishService = inject(WishService);
  private tokenService = inject(TokenService);
  private languageService = inject(LanguageService);
  private orderService = inject(OrderService);
  
  user = signal<User | null>(null);
  profile = signal<UserProfile | null>(null);
  
  // Active tab state for profile navigation
  activeTab = signal<'overview' | 'orders' | 'wishlist' | 'account'>('overview');
  
  stats = signal({
    totalOrders: 0,
    cartItems: 0,
    wishlist: 0
  });
  
  // Photo uploading state
  photoUploading = signal(false);
  photoVersion = signal(0);
  
  // Expose cart totalItems to template
  cartTotalItems = this.cartService.totalItems;
  
  // Get email from token claims
  userEmail = computed(() => this.tokenService.getEmail());
  
  // Get name from token claims
  userName = computed(() => this.tokenService.getName());
  
  // Get user full name from user object
  userFullName = computed(() => {
    const user = this.user();
    if (user?.firstName || user?.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return this.tokenService.getName() || 'User';
  });
  
  // Get member since date
  memberSince = computed(() => {
    const user = this.user();
    if (user?.createdAt) {
      const date = new Date(user.createdAt);
      return date.getFullYear().toString();
    }
    return '2026';
  });
  
  // Get user initials for avatar
  userInitials = computed(() => {
    const user = this.user();
    const firstName = user?.firstName || '';
    const lastName = user?.lastName || '';
    if (firstName || lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    const name = this.tokenService.getName();
    if (name) {
      const parts = name.split(' ');
      return parts.map(p => p.charAt(0)).join('').toUpperCase().slice(0, 2);
    }
    return 'U';
  });
  
  // Get current language for routerLink
  currentLang(): string {
    return this.languageService.currentLanguage();
  }
  
  ngOnInit(): void {
    this.loadUserInfo();
    this.loadProfile();
    this.authService.loadCurrentUser();
    this.loadWishlistCount();
    this.loadOrdersCount();
  }
  
  loadUserInfo(): void {
    this.authService.currentUser$.subscribe({
      next: (user) => {
        this.user.set(user);
      },
      error: (error) => {
        console.error('Error loading user:', error);
      }
    });
  }
  
  loadProfile(): void {
    const userId = this.tokenService.getUserId();
    if (!userId) return;
    
    this.authService.getUserProfile(userId).subscribe({
      next: (profile) => {
        this.profile.set(profile);
      },
      error: (error) => {
        console.error('Error loading profile:', error);
      }
    });
  }
  
  getPhotoUrl(): string {
    const profile = this.profile();
    if (profile?.userPhoto?.relativePath) {
      const normalizedPath = profile.userPhoto.relativePath.replace(/\\/g, '/');
      const parts = normalizedPath.split('/');
      const fileName = parts[parts.length - 1];
      return `${environment.apiUrl}/Photo/UserPhoto/${fileName}`;
    }
    return '';
  }
  
  getGenderText(): string {
    const profile = this.profile();
    if (profile?.gender === true) {
      return 'Male';
    } else if (profile?.gender === false) {
      return 'Female';
    }
    return 'Not specified';
  }
  
  getCreatedDate(): string {
    const profile = this.profile();
    if (profile?.createdAt) {
      return new Date(profile.createdAt).toLocaleDateString();
    }
    return '';
  }
  
  loadOrdersCount(): void {
    const userId = this.tokenService.getUserId();
    if (!userId) return;
    
    this.orderService.getOrdersByUserId(userId).subscribe({
      next: (orders) => {
        this.stats.update(s => ({
          ...s,
          totalOrders: orders.length
        }));
      },
      error: (error) => {
        console.error('Error loading orders count:', error);
      }
    });
  }
  
  loadWishlistCount(): void {
    const userId = this.tokenService.getUserId();
    if (!userId) return;
    
    this.wishService.getWishes(userId).subscribe({
      next: (wishes) => {
        this.stats.update(s => ({
          ...s,
          wishlist: wishes.length
        }));
      },
      error: (error) => {
        console.error('Error loading wishlist count:', error);
      }
    });
  }
  
  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.uploadPhoto(file);
    }
  }
  
  uploadPhoto(file: File): void {
    const userId = this.tokenService.getUserId();
    if (!userId) return;
    
    this.photoUploading.set(true);
    this.authService.changeUserPhoto(file, userId).subscribe({
      next: () => {
        // Reload profile to get updated photo
        this.loadProfile();
        this.photoUploading.set(false);
      },
      error: (error) => {
        console.error('Error uploading photo:', error);
        this.photoUploading.set(false);
      }
    });
  }
  
  logout(): void {
    this.authService.logout();
  }
}
