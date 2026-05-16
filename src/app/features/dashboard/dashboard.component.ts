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
import { PhotoService } from '../../core/services/photo.service';
import { User, UserProfile } from '../../core/models/auth.model';
import { ProfileService } from '../../core/services/profile.service';
import { Result } from '../../core/models/result.model';
import { Order } from '../../core/models/order.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslatePipe],
  template: `
    <main class="min-h-screen bg-surface pb-24 w-full" [dir]="currentLang() === 'ar' ? 'rtl' : 'ltr'">

      <!-- ══ Hero Header ══ -->
      <header class="min-h-[420px] md:min-h-[380px] relative overflow-hidden bg-on-surface flex items-center md:items-end pb-16 pt-28 md:pt-0">
        <div class="absolute inset-0 z-0">
          <div class="absolute inset-0 bg-gradient-to-t from-on-surface via-on-surface/60 to-transparent z-10"></div>
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--primary)_0%,_transparent_50%)] opacity-30 z-0 animate-pulse"></div>
          @if (getPhotoUrl()) {
            <img [src]="getPhotoUrl()" class="w-full h-full object-cover opacity-60 blur-md scale-110">
          }
        </div>

        <div class="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 w-full relative z-20
                    flex flex-col md:flex-row items-center md:items-end justify-between gap-8 text-center md:text-start">

          <!-- Avatar + Name -->
          <div class="flex flex-col md:flex-row items-center md:items-end gap-5 md:gap-8">
            <!-- Avatar -->
            <div class="relative group">
              <div class="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 bg-surface rounded-[32px] md:rounded-[40px] p-1.5 shadow-2xl relative z-10 overflow-hidden transform group-hover:scale-105 transition-transform duration-500">
                <div class="w-full h-full bg-surface-container-high rounded-[28px] md:rounded-[32px] overflow-hidden flex items-center justify-center">
                  @if (photoUploading()) {
                    <div class="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  } @else if (getPhotoUrl()) {
                    <img [src]="getPhotoUrl()" alt="Profile" class="w-full h-full object-cover">
                  } @else {
                    <span class="text-4xl md:text-5xl font-black text-primary font-headline">{{ userInitials() }}</span>
                  }
                </div>
              </div>
              <!-- Camera Upload -->
              <label for="dash-photo"
                     class="absolute -bottom-2 -right-2 w-10 h-10 md:w-12 md:h-12 bg-primary text-on-primary rounded-xl md:rounded-2xl flex items-center justify-center cursor-pointer shadow-xl hover:scale-110 active:scale-95 transition-all z-20 border-4 border-surface">
                <span class="material-symbols-outlined text-lg md:text-xl">photo_camera</span>
              </label>
              <input type="file" id="dash-photo" class="hidden" accept="image/*" (change)="onPhotoSelected($event)">
            </div>

            <!-- Name + Roles -->
            <div class="flex flex-col items-center md:items-start pb-2 gap-3">
              <div class="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                @for (role of user()?.roles || []; track role) {
                  <span class="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-white border border-white/20">{{ role }}</span>
                }
              </div>
              <h1 class="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tighter text-white leading-none">{{ userFullName() }}</h1>
              <p class="font-body text-white/60 tracking-widest uppercase text-xs break-all">{{ userEmail() }}</p>
            </div>
          </div>

          <!-- Logout -->
          <div class="flex justify-center md:justify-start mb-2 w-full md:w-auto">
            <button (click)="logout()"
                    class="px-8 sm:px-10 py-3 sm:py-4 bg-error text-on-error rounded-full font-headline font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:scale-105 active:scale-95 transition-all">
              {{ 'dashboard.deauthenticate' | translate }}
            </button>
          </div>
        </div>
      </header>

      <!-- ══ Content Section ══ -->
      <section class="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 -mt-12 sm:-mt-16 relative z-30">

        <!-- Stats Cards -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-10 md:mb-16">

          <div class="bg-surface-container-lowest p-4 sm:p-6 md:p-8 lg:p-10 rounded-[24px] sm:rounded-[32px] md:rounded-[40px] shadow-2xl border border-outline-variant/10 group hover:border-primary/30 transition-all">
            <div class="flex justify-between items-start mb-3 sm:mb-5 md:mb-8">
              <div class="w-9 h-9 sm:w-11 sm:h-11 md:w-14 md:h-14 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined text-lg sm:text-xl md:text-3xl">inventory_2</span>
              </div>
              <span class="text-[7px] sm:text-[8px] md:text-[10px] font-black uppercase tracking-widest text-outline text-end leading-tight">{{ 'dashboard.historicalLog' | translate }}</span>
            </div>
            <p class="font-headline text-2xl sm:text-3xl md:text-5xl font-black text-on-surface mb-1 md:mb-2">{{ stats().totalOrders }}</p>
            <p class="text-[7px] sm:text-[8px] md:text-[10px] font-black uppercase tracking-widest text-outline truncate">{{ 'dashboard.totalOrders' | translate }}</p>
          </div>

          <div class="bg-surface-container-lowest p-4 sm:p-6 md:p-8 lg:p-10 rounded-[24px] sm:rounded-[32px] md:rounded-[40px] shadow-2xl border border-outline-variant/10 group hover:border-tertiary/30 transition-all">
            <div class="flex justify-between items-start mb-3 sm:mb-5 md:mb-8">
              <div class="w-9 h-9 sm:w-11 sm:h-11 md:w-14 md:h-14 bg-tertiary/10 rounded-xl md:rounded-2xl flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined text-lg sm:text-xl md:text-3xl">shopping_cart</span>
              </div>
              <span class="text-[7px] sm:text-[8px] md:text-[10px] font-black uppercase tracking-widest text-outline text-end leading-tight">{{ 'dashboard.activeSequence' | translate }}</span>
            </div>
            <p class="font-headline text-2xl sm:text-3xl md:text-5xl font-black text-on-surface mb-1 md:mb-2">{{ carttotal() }}</p>
            <p class="text-[7px] sm:text-[8px] md:text-[10px] font-black uppercase tracking-widest text-outline truncate">{{ 'dashboard.itemsInBuffer' | translate }}</p>
          </div>

        </div>

        <!-- Main Card (Tabs) -->
        <div class="bg-surface-container-lowest rounded-[28px] sm:rounded-[36px] md:rounded-[40px] lg:rounded-[48px] shadow-2xl border border-outline-variant/10 overflow-hidden mb-12">

          <!-- Tab Navigation -->
          <nav class="flex items-center overflow-x-auto scrollbar-hide border-b border-outline-variant/10">
            <button *ngFor="let tab of tabs"
                    (click)="activeTab.set(tab.id)"
                    [class]="'flex-1 min-w-[80px] px-3 sm:px-5 md:px-8 py-4 sm:py-5 md:py-7 font-headline font-black text-[9px] sm:text-[10px] md:text-xs uppercase tracking-widest transition-all whitespace-nowrap ' +
                             (activeTab() === tab.id ? 'text-primary bg-primary/5 border-b-4 border-primary' : 'text-outline hover:text-on-surface')">
              {{ tab.label | translate }}
            </button>
          </nav>

          <!-- Tab Content -->
          <div class="p-4 sm:p-6 md:p-10 lg:p-14">

            <!-- Overview Tab -->
            <div *ngIf="activeTab() === 'overview'" class="space-y-10 animate-fade-in text-start">
              <div>
                <h3 class="font-headline font-black text-lg sm:text-xl md:text-2xl text-on-surface mb-6 md:mb-8 tracking-tighter">
                  {{ 'dashboard.strategicExecution' | translate }}
                </h3>
                <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4 lg:gap-6">

                  <a *ngIf="canAddProduct()" [routerLink]="['/' + currentLang() + '/admin/products/add']"
                     class="p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl md:rounded-[28px] bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-all text-center group">
                    <span class="material-symbols-outlined text-xl sm:text-2xl md:text-4xl text-primary block mb-1 sm:mb-2 md:mb-4 group-hover:scale-125 transition-transform">add_box</span>
                    <span class="font-headline font-black text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-widest text-primary line-clamp-2">{{ 'admin.addProduct.addProduct' | translate }}</span>
                  </a>

                  <a [routerLink]="'/' + currentLang() + '/products'"
                     class="p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl md:rounded-[28px] bg-surface-container-low border border-outline-variant/10 hover:border-primary/20 transition-all text-center group">
                    <span class="material-symbols-outlined text-xl sm:text-2xl md:text-4xl text-on-surface-variant block mb-1 sm:mb-2 md:mb-4 group-hover:scale-125 transition-transform">category</span>
                    <span class="font-headline font-black text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-widest text-on-surface-variant line-clamp-2">{{ 'dashboard.browseProducts' | translate }}</span>
                  </a>

                  <a [routerLink]="'/' + currentLang() + '/orders'"
                     class="p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl md:rounded-[28px] bg-surface-container-low border border-outline-variant/10 hover:border-primary/20 transition-all text-center group">
                    <span class="material-symbols-outlined text-xl sm:text-2xl md:text-4xl text-on-surface-variant block mb-1 sm:mb-2 md:mb-4 group-hover:scale-125 transition-transform">list_alt</span>
                    <span class="font-headline font-black text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-widest text-on-surface-variant line-clamp-2">{{ 'dashboard.viewAllOrders' | translate }}</span>
                  </a>

                  <a *ngIf="isAdmin()" [routerLink]="['/' + currentLang() + '/admin/categories/add']"
                     class="p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl md:rounded-[28px] bg-secondary/5 border border-secondary/20 hover:bg-secondary/10 transition-all text-center group">
                    <span class="material-symbols-outlined text-xl sm:text-2xl md:text-4xl text-secondary block mb-1 sm:mb-2 md:mb-4 group-hover:scale-125 transition-transform">create_new_folder</span>
                    <span class="font-headline font-black text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-widest text-secondary line-clamp-2">{{ 'admin.addCategory.button' | translate }}</span>
                  </a>

                  <a [routerLink]="'/' + currentLang() + '/dashboard/my-coupons'"
                     class="p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl md:rounded-[28px] bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-all text-center group">
                    <span class="material-symbols-outlined text-xl sm:text-2xl md:text-4xl text-primary block mb-1 sm:mb-2 md:mb-4 group-hover:scale-125 transition-transform">confirmation_number</span>
                    <span class="font-headline font-black text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-widest text-primary line-clamp-2">{{ 'dashboard.myCoupons' | translate }}</span>
                  </a>

                  <a *ngIf="isAdmin()" [routerLink]="['/' + currentLang() + '/admin/coupons']"
                     class="p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl md:rounded-[28px] bg-tertiary/5 border border-tertiary/20 hover:bg-tertiary/10 transition-all text-center group">
                    <span class="material-symbols-outlined text-xl sm:text-2xl md:text-4xl text-tertiary block mb-1 sm:mb-2 md:mb-4 group-hover:scale-125 transition-transform">settings_input_component</span>
                    <span class="font-headline font-black text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-widest text-tertiary line-clamp-2">{{ 'admin.coupons.title' | translate }}</span>
                  </a>

                </div>
              </div>
            </div>

            <!-- Account Tab -->
            <div *ngIf="activeTab() === 'account'" class="space-y-8 md:space-y-12 animate-fade-in text-start">
              <h3 class="font-headline font-black text-xl md:text-2xl text-on-surface tracking-tighter">{{ 'dashboard.identityParameters' | translate }}</h3>
              <div class="space-y-3 md:space-y-4">
                <div *ngFor="let field of profileFields" class="relative py-4 md:py-6 border-b border-outline-variant/10">
                  <div class="space-y-1 pr-8">
                    <p class="text-[10px] font-black uppercase tracking-widest text-outline">{{ field.label | translate }}</p>
                    <p class="font-headline font-black text-on-surface break-all text-sm md:text-base">{{ field.value() }}</p>
                  </div>
                  <span class="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-outline-variant opacity-30">shield_lock</span>
                </div>
              </div>
            </div>

            <!-- Orders Tab -->
            <div *ngIf="activeTab() === 'orders'" class="py-16 md:py-24 text-center space-y-6 md:space-y-8 animate-fade-in">
              <div class="w-24 h-24 md:w-32 md:h-32 rounded-[32px] md:rounded-[40px] bg-surface-container-low flex items-center justify-center text-outline-variant mx-auto mb-6 md:mb-8 relative">
                <span class="material-symbols-outlined text-5xl md:text-6xl opacity-30">inventory_2</span>
                <div class="absolute inset-0 border-2 border-dashed border-outline-variant/30 rounded-[32px] md:rounded-[40px]"></div>
              </div>
              <h3 class="font-headline text-2xl md:text-3xl font-black text-on-surface">{{ 'dashboard.yourOrders' | translate }}</h3>
              <p class="font-body text-on-surface-variant max-w-xs mx-auto opacity-70 text-sm md:text-base">{{ 'dashboard.ordersDescription' | translate }}</p>
              <a [routerLink]="'/' + currentLang() + '/orders'"
                 class="inline-block py-4 md:py-5 px-10 md:px-12 bg-on-surface text-surface rounded-[28px] md:rounded-[32px] font-headline font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all text-sm md:text-base">
                {{ 'dashboard.viewOrders' | translate }}
              </a>
            </div>

          </div>
        </div>
      </section>
    </main>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private wishService = inject(WishService);
  private tokenService = inject(TokenService);
  private languageService = inject(LanguageService);
  private orderService = inject(OrderService);
  private profileService = inject(ProfileService);
  private photoService = inject(PhotoService);

  user = signal<User | null>(null);
  profile = signal<UserProfile | null>(null);
  activeTab = signal<'overview' | 'orders' | 'account'>('overview');
  stats = signal({ totalOrders: 0, cartItems: 0, wishlist: 0 });
  photoUploading = signal(false);
  carttotal = this.cartService.total;
  userEmail = computed(() => this.tokenService.getEmail());

  tabs: {id: 'overview' | 'orders' | 'account', label: string}[] = [
    { id: 'overview', label: 'dashboard.overview' },
    { id: 'orders', label: 'dashboard.orders' },
    { id: 'account', label: 'dashboard.account' }
  ];

  profileFields = [
    { label: 'auth.fullName', value: () => this.profile()?.fullName || '-' },
    { label: 'auth.email', value: () => this.profile()?.email || this.userEmail() },
    { label: 'auth.phone', value: () => this.profile()?.phoneNumber || this.user()?.phoneNumber || '-' },
    { label: 'dashboard.address', value: () => this.profile()?.address || '-' },
    { label: 'auth.gender', value: () => this.getGenderText() },
    { label: 'dashboard.memberSince', value: () => this.getCreatedDate() }
  ];

  userFullName = computed(() => {
    const p = this.profile();
    if (p?.fullName) return p.fullName;
    const user = this.user();
    return (user?.firstName || user?.lastName) ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : this.tokenService.getName() || 'User';
  });

  canAddProduct = computed(() => this.authService.isLoggedIn() && (this.tokenService.isSeller() || this.tokenService.hasRole('Admin')));
  isAdmin = computed(() => this.tokenService.hasRole('Admin'));
  userInitials = computed(() => {
    const p = this.profile();
    if (p?.fullName) {
      const parts = p.fullName.split(' ');
      return parts.length > 1 ? `${parts[0].charAt(0)}${parts[parts.length-1].charAt(0)}`.toUpperCase() : p.fullName.substring(0, 2).toUpperCase();
    }
    const user = this.user();
    if (user?.firstName || user?.lastName) return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
    const name = this.tokenService.getName();
    return name ? name.split(' ').map(part => part.charAt(0)).join('').toUpperCase().slice(0, 2) : 'U';
  });

  currentLang(): string { return this.languageService.currentLanguage(); }

  ngOnInit(): void {
    this.authService.loadCurrentUser();
    this.authService.currentUser$.subscribe(u => this.user.set(u));
    this.loadProfile();
    this.loadWishlistCount();
    this.loadOrdersCount();
  }

  loadProfile(): void {
    this.profileService.getProfile().subscribe(res => {
      if (res.success && res.data) this.profile.set(res.data);
    });
  }

  getPhotoUrl(): string {
    const profile = this.profile();
    return this.photoService.getPhotoUrl(profile?.imageUrl, 'user');
  }

  getGenderText(): string { return this.profile()?.gender === true ? 'Male' : this.profile()?.gender === false ? 'Female' : 'Not specified'; }
  getCreatedDate(): string { return this.profile()?.createdAt ? new Date(this.profile()!.createdAt!).toLocaleDateString() : '-'; }

  loadOrdersCount(): void {
    const userId = this.tokenService.getUserId();
    if (!userId) return;
    const api = this.tokenService.isSeller() ? this.orderService.getOrdersBySellerId(userId) : this.orderService.getOrdersByUserId(userId);
    api.subscribe((res: Result<Order[]>) => {
      if (res.success && res.data) this.stats.update(s => ({ ...s, totalOrders: res.data!.length }));
    });
  }

  loadWishlistCount(): void {
    const userId = this.tokenService.getUserId();
    if (userId) this.wishService.getWishes().subscribe(res => {
      if (res.success && res.data) this.stats.update(s => ({ ...s, wishlist: res.data!.length }));
    });
  }

  onPhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.photoUploading.set(true);
      this.profileService.uploadImage(file).subscribe({
        next: () => { this.loadProfile(); this.photoUploading.set(false); },
        error: () => this.photoUploading.set(false)
      });
    }
  }

  logout(): void { this.authService.logout(); }
}
