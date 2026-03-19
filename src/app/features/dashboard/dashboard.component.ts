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
    <main class="min-h-screen bg-surface pb-24" [dir]="currentLang() === 'ar' ? 'rtl' : 'ltr'">
      <!-- Strategic Hero Section -->
      <header class="h-[40vh] min-h-[400px] relative overflow-hidden bg-on-surface flex items-end pb-24">
         <div class="absolute inset-0 z-0">
            <div class="absolute inset-0 bg-gradient-to-t from-on-surface via-on-surface/40 to-transparent z-10"></div>
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--primary)_0%,_transparent_50%)] opacity-30 z-0 animate-pulse"></div>
            @if (getPhotoUrl()) {
              <img [src]="getPhotoUrl()" class="w-full h-full object-cover opacity-60 blur-sm scale-110">
            }
         </div>

         <div class="max-w-7xl mx-auto px-6 w-full relative z-20 flex flex-col md:flex-row items-end justify-between gap-10">
            <div class="flex items-end gap-8 text-start">
               <!-- High-End Avatar -->
               <div class="relative group">
                  <div class="w-32 h-32 md:w-40 md:h-40 bg-surface rounded-[40px] p-2 shadow-2xl relative z-10 overflow-hidden transform group-hover:scale-105 transition-transform duration-500">
                     <div class="w-full h-full bg-surface-container-high rounded-[32px] overflow-hidden flex items-center justify-center">
                        @if (photoUploading()) {
                           <div class="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        } @else if (getPhotoUrl()) {
                           <img [src]="getPhotoUrl()" alt="Profile" class="w-full h-full object-cover">
                        } @else {
                           <span class="text-5xl font-black text-primary font-headline">{{ userInitials() }}</span>
                        }
                     </div>
                  </div>
                  <!-- Secure Upload Trigger -->
                  <label for="dash-photo" class="absolute -bottom-2 -right-2 w-12 h-12 bg-primary text-on-primary rounded-2xl flex items-center justify-center cursor-pointer shadow-xl hover:scale-110 active:scale-95 transition-all z-20 border-4 border-surface">
                     <span class="material-symbols-outlined text-xl">photo_camera</span>
                  </label>
                  <input type="file" id="dash-photo" class="hidden" accept="image/*" (change)="onPhotoSelected($event)">
               </div>

               <div class="pb-2">
                  <div class="flex items-center gap-3 mb-4">
                     @for (role of user()?.roles || []; track role) {
                        <span class="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white border border-white/20">{{ role }}</span>
                     }
                  </div>
                  <h1 class="font-headline text-5xl md:text-7xl font-black tracking-tighter text-white mb-2">{{ userFullName() }}</h1>
                  <p class="font-body text-white/60 tracking-widest uppercase text-xs">{{ userEmail() }}</p>
               </div>
            </div>

            <!-- Dashboard Control Panel -->
             <div class="flex gap-4 mb-2">
                <button (click)="logout()" class="px-8 py-4 bg-error text-on-error rounded-2xl font-headline font-bold uppercase tracking-widest text-[10px] shadow-2xl hover:bg-error-container hover:text-on-error-container transition-all">{{ 'dashboard.deauthenticate' | translate }}</button>
             </div>
         </div>
      </header>

      <section class="max-w-7xl mx-auto px-6 -mt-16 relative z-30">
        <!-- Quantified Metrics Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
           <div class="bg-surface-container-lowest p-10 rounded-[48px] shadow-2xl border border-outline-variant/10 group hover:border-primary/30 transition-all">
              <div class="flex justify-between items-start mb-8">
                  <div class="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                     <span class="material-symbols-outlined text-3xl">inventory_2</span>
                  </div>
                  <span class="text-[10px] font-black uppercase tracking-widest text-outline">{{ 'dashboard.historicalLog' | translate }}</span>
               </div>
               <p class="font-headline text-5xl font-black text-on-surface mb-2">{{ stats().totalOrders }}</p>
               <p class="text-[10px] font-black uppercase tracking-widest text-outline">{{ 'dashboard.totalOrders' | translate }} Protocol</p>
           </div>

           <div class="bg-surface-container-lowest p-10 rounded-[48px] shadow-2xl border border-outline-variant/10 group hover:border-tertiary/30 transition-all">
              <div class="flex justify-between items-start mb-8">
                  <div class="w-14 h-14 bg-tertiary/10 rounded-2xl flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform">
                     <span class="material-symbols-outlined text-3xl">shopping_cart</span>
                  </div>
                  <span class="text-[10px] font-black uppercase tracking-widest text-outline">{{ 'dashboard.activeSequence' | translate }}</span>
               </div>
               <p class="font-headline text-5xl font-black text-on-surface mb-2">{{ cartTotalItems() }}</p>
               <p class="text-[10px] font-black uppercase tracking-widest text-outline">{{ 'dashboard.itemsInBuffer' | translate }}</p>
           </div>

           <div class="bg-surface-container-lowest p-10 rounded-[48px] shadow-2xl border border-outline-variant/10 group hover:border-error/30 transition-all sm:col-span-2 lg:col-span-1">
              <div class="flex justify-between items-start mb-8">
                  <div class="w-14 h-14 bg-error/10 rounded-2xl flex items-center justify-center text-error group-hover:scale-110 transition-transform">
                     <span class="material-symbols-outlined text-3xl">favorite</span>
                  </div>
                  <span class="text-[10px] font-black uppercase tracking-widest text-outline">{{ 'dashboard.curationLog' | translate }}</span>
               </div>
               <p class="font-headline text-5xl font-black text-on-surface mb-2">{{ stats().wishlist }}</p>
               <p class="text-[10px] font-black uppercase tracking-widest text-outline">{{ 'dashboard.wishlist' | translate }} {{ 'dashboard.target' | translate }}</p>
           </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
           <!-- Main Content Area -->
           <div class="lg:col-span-2 space-y-12">
              <div class="bg-surface-container-lowest rounded-[48px] shadow-2xl border border-outline-variant/10 overflow-hidden">
                 <!-- Tab Navigation -->
                 <nav class="flex border-b border-outline-variant/10">
                    <button *ngFor="let tab of tabs" 
                            (click)="activeTab.set(tab.id)"
                            [class]="'flex-1 py-8 font-headline font-black text-xs uppercase tracking-widest transition-all ' + (activeTab() === tab.id ? 'text-primary bg-primary/5 border-b-4 border-primary' : 'text-outline hover:text-on-surface')">
                       {{ tab.label | translate }}
                    </button>
                 </nav>

                 <div class="p-10 md:p-16">
                     <!-- Overview Tab Content -->
                     <div *ngIf="activeTab() === 'overview'" class="space-y-12 animate-fade-in text-start">
                        <div>
                           <h3 class="font-headline font-black text-2xl text-on-surface mb-8 tracking-tighter">{{ 'dashboard.strategicExecution' | translate }}</h3>
                          <div class="grid grid-cols-2 lg:grid-cols-3 gap-6">
                             <a *ngIf="canAddProduct()" [routerLink]="['/' + currentLang() + '/admin/products/add']" 
                                class="p-8 rounded-[32px] bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-all text-center group">
                                <span class="material-symbols-outlined text-4xl text-primary mb-4 group-hover:scale-125 transition-transform">add_box</span>
                                <span class="block font-headline font-black text-[10px] uppercase tracking-widest text-primary">{{ 'admin.addProduct.addProduct' | translate }}</span>
                             </a>
                             <a [routerLink]="'/' + currentLang() + '/products'" 
                                class="p-8 rounded-[32px] bg-surface-container-low border border-outline-variant/10 hover:border-primary/20 transition-all text-center group">
                                <span class="material-symbols-outlined text-4xl text-on-surface-variant mb-4 group-hover:scale-125 transition-transform">category</span>
                                <span class="block font-headline font-black text-[10px] uppercase tracking-widest text-on-surface-variant">{{ 'dashboard.browseProducts' | translate }}</span>
                             </a>
                             <a [routerLink]="'/' + currentLang() + '/orders'" 
                                class="p-8 rounded-[32px] bg-surface-container-low border border-outline-variant/10 hover:border-primary/20 transition-all text-center group">
                                <span class="material-symbols-outlined text-4xl text-on-surface-variant mb-4 group-hover:scale-125 transition-transform">list_alt</span>
                                <span class="block font-headline font-black text-[10px] uppercase tracking-widest text-on-surface-variant">{{ 'dashboard.viewAllOrders' | translate }}</span>
                             </a>
                             <a *ngIf="isAdmin()" [routerLink]="['/' + currentLang() + '/admin/categories/add']" 
                                class="p-8 rounded-[32px] bg-secondary/5 border border-secondary/20 hover:bg-secondary/10 transition-all text-center group">
                                <span class="material-symbols-outlined text-4xl text-secondary mb-4 group-hover:scale-125 transition-transform">create_new_folder</span>
                                <span class="block font-headline font-black text-[10px] uppercase tracking-widest text-secondary text-start">{{ 'admin.addCategory.button' | translate }}</span>
                             </a>
                             <a *ngIf="isAdmin()" [routerLink]="['/' + currentLang() + '/admin/coupons']" 
                                class="p-8 rounded-[32px] bg-tertiary/5 border border-tertiary/20 hover:bg-tertiary/10 transition-all text-center group">
                                <span class="material-symbols-outlined text-4xl text-tertiary mb-4 group-hover:scale-125 transition-transform">confirmation_number</span>
                                <span class="block font-headline font-black text-[10px] uppercase tracking-widest text-tertiary text-start">{{ 'admin.coupons.title' | translate }}</span>
                             </a>
                          </div>
                       </div>
                    </div>

                     <!-- Account Tab -->
                     <div *ngIf="activeTab() === 'account'" class="space-y-12 animate-fade-in text-start">
                        <h3 class="font-headline font-black text-2xl text-on-surface tracking-tighter">{{ 'dashboard.identityParameters' | translate }}</h3>
                       <div class="space-y-4">
                          <div *ngFor="let field of profileFields" class="flex justify-between items-center py-6 border-b border-outline-variant/10">
                             <div class="space-y-1">
                                <p class="text-[10px] font-black uppercase tracking-widest text-outline">{{ field.label | translate }}</p>
                                <p class="font-headline font-black text-on-surface">{{ field.value() }}</p>
                             </div>
                             <span class="material-symbols-outlined text-outline-variant opacity-30">shield_lock</span>
                          </div>
                       </div>
                    </div>

                    <!-- Wishlist/Orders Simplified view -->
                    <div *ngIf="activeTab() === 'orders' || activeTab() === 'wishlist'" class="py-20 text-center space-y-8 animate-fade-in">
                        <div class="w-32 h-32 rounded-[40px] bg-surface-container-low flex items-center justify-center text-outline-variant mx-auto mb-8 relative">
                           <span class="material-symbols-outlined text-6xl opacity-30">{{ activeTab() === 'orders' ? 'inventory_2' : 'favorite' }}</span>
                           <div class="absolute inset-0 border-2 border-dashed border-outline-variant/30 rounded-[40px]"></div>
                        </div>
                        <h3 class="font-headline text-3xl font-black text-on-surface">{{ (activeTab() === 'orders' ? 'dashboard.yourOrders' : 'dashboard.yourWishlist') | translate }}</h3>
                        <p class="font-body text-on-surface-variant max-w-xs mx-auto opacity-70">{{ (activeTab() === 'orders' ? 'dashboard.ordersDescription' : 'dashboard.wishlistDescription') | translate }}</p>
                         <a [routerLink]="activeTab() === 'orders' ? '/' + currentLang() + '/orders' : '/' + currentLang() + '/wishes'" 
                            class="inline-block py-5 px-12 bg-on-surface text-surface rounded-[32px] font-headline font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all">
                            {{ 'dashboard.synchronizeTarget' | translate }}
                         </a>
                    </div>
                 </div>
              </div>
           </div>

           <!-- Sidebar / Auxiliary Info -->
           <aside class="space-y-8">
               <div class="bg-surface-container-lowest p-10 rounded-[48px] shadow-2xl border border-outline-variant/10 text-start">
                  <h4 class="font-headline font-black text-lg text-on-surface mb-8 tracking-tight">{{ 'dashboard.securityStatus' | translate }}</h4>
                  <div class="space-y-6">
                     <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
                           <span class="material-symbols-outlined text-xl">verified</span>
                        </div>
                        <div>
                           <p class="text-[10px] font-black uppercase tracking-widest text-on-surface">{{ 'dashboard.authenticated' | translate }}</p>
                           <p class="text-[8px] font-black uppercase tracking-widest text-outline">{{ 'dashboard.verifiedChannel' | translate }}</p>
                        </div>
                     </div>
                     <div class="flex items-center gap-4 opacity-50">
                        <div class="w-10 h-10 rounded-xl bg-surface-container-high text-outline-variant flex items-center justify-center">
                           <span class="material-symbols-outlined text-xl">2fa</span>
                        </div>
                        <div>
                           <p class="text-[10px] font-black uppercase tracking-widest text-on-surface">{{ 'dashboard.multiFactor' | translate }}</p>
                           <p class="text-[8px] font-black uppercase tracking-widest text-outline">{{ 'dashboard.disabledSector' | translate }}</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div class="bg-gradient-to-br from-primary to-primary-container p-10 rounded-[48px] shadow-2xl text-on-primary relative overflow-hidden group">
                  <div class="relative z-10 text-start">
                     <p class="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">{{ 'dashboard.protocolLoyalty' | translate }}</p>
                     <h4 class="font-headline font-black text-3xl mb-4 tracking-tighter">{{ 'dashboard.eliteSequence' | translate }}</h4>
                     <p class="font-body text-xs opacity-80 leading-relaxed mb-8">{{ 'dashboard.accessRestricted' | translate }}</p>
                     <button class="w-full py-4 bg-white text-primary rounded-2xl font-headline font-black text-[10px] uppercase tracking-widest group-hover:bg-primary-container group-hover:text-white transition-all">{{ 'dashboard.reviewBenefits' | translate }}</button>
                  </div>
                 <span class="material-symbols-outlined absolute -bottom-10 -right-10 text-[180px] opacity-10 blur-sm transform group-hover:rotate-12 transition-transform">star</span>
              </div>
           </aside>
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
  
  user = signal<User | null>(null);
  profile = signal<UserProfile | null>(null);
  activeTab = signal<'overview' | 'orders' | 'wishlist' | 'account'>('overview');
  stats = signal({ totalOrders: 0, cartItems: 0, wishlist: 0 });
  photoUploading = signal(false);
  cartTotalItems = this.cartService.totalItems;
  userEmail = computed(() => this.tokenService.getEmail());
  
  tabs: {id: any, label: string}[] = [
    { id: 'overview', label: 'dashboard.overview' },
    { id: 'orders', label: 'dashboard.orders' },
    { id: 'wishlist', label: 'dashboard.wishlist' },
    { id: 'account', label: 'dashboard.account' }
  ];

  profileFields = [
    { label: 'auth.firstName', value: () => this.profile()?.firstName || '-' },
    { label: 'auth.lastName', value: () => this.profile()?.lastName || '-' },
    { label: 'auth.email', value: () => this.userEmail() },
    { label: 'auth.phone', value: () => this.user()?.phoneNumber || '-' },
    { label: 'auth.gender', value: () => this.getGenderText() },
    { label: 'dashboard.memberSince', value: () => this.getCreatedDate() }
  ];

  userFullName = computed(() => {
    const user = this.user();
    return (user?.firstName || user?.lastName) ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : this.tokenService.getName() || 'User';
  });
  
  canAddProduct = computed(() => this.authService.isLoggedIn() && (this.tokenService.isSeller() || this.tokenService.hasRole('Admin')));
  isAdmin = computed(() => this.tokenService.hasRole('Admin'));
  userInitials = computed(() => {
    const user = this.user();
    if (user?.firstName || user?.lastName) return `${user.firstName?.charAt(0)}${user.lastName?.charAt(0)}`.toUpperCase();
    const name = this.tokenService.getName();
    return name ? name.split(' ').map(p => p.charAt(0)).join('').toUpperCase().slice(0, 2) : 'U';
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
    const userId = this.tokenService.getUserId();
    if (userId) this.authService.getUserProfile(userId).subscribe(p => this.profile.set(p));
  }
  
  getPhotoUrl(): string {
    const profile = this.profile();
    if (profile?.userPhoto?.relativePath) {
      const fileName = profile.userPhoto.relativePath.split(/[\\/]/).pop();
      return `${environment.apiUrl}/Photo/UserPhoto/${fileName}`;
    }
    return '';
  }
  
  getGenderText(): string { return this.profile()?.gender === true ? 'Male' : this.profile()?.gender === false ? 'Female' : 'Not specified'; }
  getCreatedDate(): string { return this.profile()?.createdAt ? new Date(this.profile()!.createdAt).toLocaleDateString() : '-'; }
  
  loadOrdersCount(): void {
    const userId = this.tokenService.getUserId();
    if (!userId) return;
    const api = this.tokenService.isSeller() ? this.orderService.getOrdersBySellerId(userId) : this.orderService.getOrdersByUserId(userId);
    api.subscribe(orders => this.stats.update(s => ({ ...s, totalOrders: orders.length })));
  }
  
  loadWishlistCount(): void {
    const userId = this.tokenService.getUserId();
    if (userId) this.wishService.getWishes(userId).subscribe(w => this.stats.update(s => ({ ...s, wishlist: w.length })));
  }
  
  onPhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.photoUploading.set(true);
      this.authService.changeUserPhoto(file).subscribe({ next: () => { this.loadProfile(); this.photoUploading.set(false); }, error: () => this.photoUploading.set(false) });
    }
  }
  
  logout(): void { this.authService.logout(); }
}
