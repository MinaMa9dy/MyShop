import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { TokenService } from '../../core/services/token.service';
import { User } from '../../core/models/auth.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    <div class="dashboard-page py-8">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="page-header mb-2">{{ 'footer.dashboard' | translate }}</h1>
            <p class="text-gray-500">{{ 'dashboard.welcomeBack' | translate }}, {{ userName() || 'User' }}</p>
          </div>
        </div>
        
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="stat-card card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-500 text-sm mb-1">{{ 'dashboard.totalOrders' | translate }}</p>
                <p class="text-3xl font-bold text-gray-800">{{ stats().totalOrders }}</p>
              </div>
              <div class="stat-icon w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                📦
              </div>
            </div>
          </div>
          
          <div class="stat-card card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-500 text-sm mb-1">{{ 'dashboard.cartItems' | translate }}</p>
                <p class="text-3xl font-bold text-gray-800">{{ cartTotalItems() }}</p>
              </div>
              <div class="stat-icon w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                🛒
              </div>
            </div>
          </div>
          
          <div class="stat-card card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-500 text-sm mb-1">{{ 'dashboard.wishlist' | translate }}</p>
                <p class="text-3xl font-bold text-gray-800">{{ stats().wishlist }}</p>
              </div>
              <div class="stat-icon w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl">
                ❤️
              </div>
            </div>
          </div>
          
          <div class="stat-card card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-500 text-sm mb-1">{{ 'dashboard.memberSince' | translate }}</p>
                <p class="text-lg font-bold text-gray-800">{{ memberSince() }}</p>
              </div>
              <div class="stat-icon w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
                👤
              </div>
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Quick Actions -->
          <div class="card">
            <h2 class="section-title">{{ 'dashboard.quickActions' | translate }}</h2>
            <div class="grid grid-cols-2 gap-4">
              <a routerLink="/products" class="action-btn p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center">
                <span class="text-3xl block mb-2">🛍️</span>
                <span class="font-medium">{{ 'dashboard.browseProducts' | translate }}</span>
              </a>
              <a routerLink="/cart" class="action-btn p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center">
                <span class="text-3xl block mb-2">🛒</span>
                <span class="font-medium">{{ 'dashboard.viewCart' | translate }}</span>
              </a>
              <a routerLink="/categories" class="action-btn p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center">
                <span class="text-3xl block mb-2">📂</span>
                <span class="font-medium">{{ 'nav.categories' | translate }}</span>
              </a>
              <button class="action-btn p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center">
                <span class="text-3xl block mb-2">⚙️</span>
                <span class="font-medium">{{ 'dashboard.settings' | translate }}</span>
              </button>
            </div>
          </div>
          
          <!-- Account Info -->
          <div class="card">
            <h2 class="section-title">{{ 'dashboard.accountInfo' | translate }}</h2>
            <div class="account-info">
              <div class="info-row flex justify-between py-3 border-b border-gray-100">
                <span class="text-gray-500">{{ 'auth.email' | translate }}</span>
                <span class="font-medium">{{ userEmail() }}</span>
              </div>
              <div class="info-row flex justify-between py-3 border-b border-gray-100">
                <span class="text-gray-500">{{ 'dashboard.userId' | translate }}</span>
                <span class="font-medium text-sm truncate max-w-[200px]">{{ user()?.id }}</span>
              </div>
              <div class="info-row flex justify-between py-3 border-b border-gray-100">
                <span class="text-gray-500">{{ 'dashboard.roles' | translate }}</span>
                <div class="flex gap-2">
                  @for (role of user()?.roles || []; track role) {
                    <span class="badge badge-info">{{ role }}</span>
                  }
                </div>
              </div>
              <div class="info-row flex justify-between py-3">
                <span class="text-gray-500">{{ 'dashboard.status' | translate }}</span>
                <span class="badge badge-success">{{ 'dashboard.active' | translate }}</span>
              </div>
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
  private tokenService = inject(TokenService);
  
  user = signal<User | null>(null);
  
  stats = signal({
    totalOrders: 0,
    cartItems: 0,
    wishlist: 3
  });
  
  memberSince = signal('2026');
  
  // Expose cart totalItems to template
  cartTotalItems = this.cartService.totalItems;
  
  // Get email from token claims
  userEmail = computed(() => this.tokenService.getEmail());
  
  // Get name from token claims
  userName = computed(() => this.tokenService.getName());
  
  ngOnInit(): void {
    this.loadUserInfo();
    this.authService.loadCurrentUser();
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
  
  logout(): void {
    this.authService.logout();
  }
}
