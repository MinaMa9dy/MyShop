import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
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

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <main class="min-h-screen bg-surface pb-24 w-full" dir="rtl">

      <!-- ══ Profile Header ══ -->
      <div class="relative overflow-hidden" style="background: linear-gradient(160deg, #7B1818 0%, #5A1010 100%);">
        <div class="absolute top-0 left-0 w-64 h-64 rounded-full opacity-10"
             style="background: radial-gradient(circle, #C4962A 0%, transparent 70%); transform: translate(-30%,-30%);"></div>

        <div class="px-4 md:px-6 pt-6 pb-16 max-w-[1400px] mx-auto">
          <div class="flex items-center gap-4">
            <!-- Avatar -->
            <div class="relative flex-shrink-0">
              <div class="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden bg-white/10 border-2 border-white/20"
                   style="box-shadow: 0 8px 24px rgba(0,0,0,0.3);">
                @if (photoUploading()) {
                  <div class="w-full h-full flex items-center justify-center">
                    <div class="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                } @else if (getPhotoUrl()) {
                  <img [src]="getPhotoUrl()" alt="Profile" class="w-full h-full object-cover">
                } @else {
                  <div class="w-full h-full flex items-center justify-center">
                    <span class="font-black text-white text-2xl" style="font-family:'Cairo',sans-serif;">{{ userInitials() }}</span>
                  </div>
                }
              </div>
              <label for="dash-photo"
                     class="absolute -bottom-2 -left-2 w-8 h-8 bg-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-all"
                     style="border: 2px solid #C4962A;">
                <span class="material-symbols-outlined text-sm" style="color:#7B1818;">photo_camera</span>
              </label>
              <input type="file" id="dash-photo" class="hidden" accept="image/*" (change)="onPhotoSelected($event)">
            </div>

            <!-- Name -->
            <div class="flex-1 min-w-0">
              <div class="flex gap-1.5 flex-wrap mb-1.5">
                @for (role of user()?.roles || []; track role) {
                  <span class="text-[9px] font-black uppercase tracking-wider text-white/70 bg-white/10 rounded-full px-2 py-0.5 border border-white/10"
                        style="font-family:'Cairo',sans-serif;">{{ role }}</span>
                }
              </div>
              <h1 class="font-black text-white text-xl md:text-2xl truncate" style="font-family:'Cairo',sans-serif;">
                {{ userFullName() }}
              </h1>
              <p class="text-white/50 text-xs truncate" style="font-family:'Tajawal',sans-serif;">{{ userEmail() }}</p>
            </div>

            <!-- Logout -->
            <button (click)="logout()"
                    type="button"
                    class="flex-shrink-0 relative z-50 cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10 active:scale-95">
              <span class="text-[10px] font-black uppercase tracking-wider" style="font-family:'Cairo',sans-serif;">خروج</span>
              <span class="material-symbols-outlined text-lg">logout</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ══ Stats Cards ══ -->
      <div class="px-4 md:px-6 max-w-[1400px] mx-auto -mt-8 relative z-10 mb-4">
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-white rounded-2xl p-4 flex items-center gap-3"
               style="box-shadow: 0 4px 16px rgba(123,24,24,0.12);">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style="background:#FFF3F3;">
              <span class="material-symbols-outlined text-xl" style="color:#7B1818;">inventory_2</span>
            </div>
            <div>
              <div class="font-black text-2xl" style="font-family:'Cairo',sans-serif; color:#7B1818;">{{ stats().totalOrders }}</div>
              <div class="text-xs text-on-surface-variant" style="font-family:'Tajawal',sans-serif;">طلباتي</div>
            </div>
          </div>
          <div class="bg-white rounded-2xl p-4 flex items-center gap-3"
               style="box-shadow: 0 4px 16px rgba(123,24,24,0.12);">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style="background:#FFF8EC;">
              <span class="material-symbols-outlined text-xl" style="color:#C4962A;">shopping_cart</span>
            </div>
            <div>
              <div class="font-black text-2xl" style="font-family:'Cairo',sans-serif; color:#C4962A;">{{ carttotal() }}</div>
              <div class="text-xs text-on-surface-variant" style="font-family:'Tajawal',sans-serif;">في السلة</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ Tabs ══ -->
      <div class="px-4 md:px-6 max-w-[1400px] mx-auto">
        <nav class="flex bg-surface-container-lowest rounded-2xl p-1 mb-4 gap-1"
             style="box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          @for (tab of tabs; track tab.id) {
            <button (click)="activeTab.set(tab.id)"
                    class="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                    [style.background]="activeTab() === tab.id ? '#7B1818' : 'transparent'"
                    [style.color]="activeTab() === tab.id ? 'white' : '#6B7280'"
                    style="font-family:'Cairo',sans-serif;">
              {{ tab.label }}
            </button>
          }
        </nav>

        <!-- Overview -->
        @if (activeTab() === 'overview') {
          <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-6">
            @if (canAddProduct()) {
              <a [routerLink]="['/' + currentLang() + '/admin/products/add']"
                 class="flex flex-col items-center gap-2 p-4 rounded-2xl no-underline transition-all active:scale-95"
                 style="background:#FFF3F3; border: 1px solid #F0D4D4;">
                <span class="material-symbols-outlined text-2xl" style="color:#7B1818;">add_box</span>
                <span class="text-[10px] font-black text-center leading-tight" style="font-family:'Cairo',sans-serif; color:#7B1818;">إضافة منتج</span>
              </a>
            }
            <a [routerLink]="'/' + currentLang() + '/products'"
               class="flex flex-col items-center gap-2 p-4 rounded-2xl no-underline transition-all active:scale-95"
               style="background:#F9F7F4; border: 1px solid #E8E0D5;">
              <span class="material-symbols-outlined text-2xl text-on-surface-variant">category</span>
              <span class="text-[10px] font-black text-center text-on-surface-variant leading-tight" style="font-family:'Cairo',sans-serif;">تصفح المنتجات</span>
            </a>
            <a [routerLink]="'/' + currentLang() + '/orders'"
               class="flex flex-col items-center gap-2 p-4 rounded-2xl no-underline transition-all active:scale-95"
               style="background:#F9F7F4; border: 1px solid #E8E0D5;">
              <span class="material-symbols-outlined text-2xl text-on-surface-variant">list_alt</span>
              <span class="text-[10px] font-black text-center text-on-surface-variant leading-tight" style="font-family:'Cairo',sans-serif;">طلباتي</span>
            </a>
            <a [routerLink]="'/' + currentLang() + '/dashboard/my-coupons'"
               class="flex flex-col items-center gap-2 p-4 rounded-2xl no-underline transition-all active:scale-95"
               style="background:#FFF8EC; border: 1px solid #EDD89A;">
              <span class="material-symbols-outlined text-2xl" style="color:#C4962A;">confirmation_number</span>
              <span class="text-[10px] font-black text-center leading-tight" style="font-family:'Cairo',sans-serif; color:#C4962A;">كوبوناتي</span>
            </a>
            @if (isAdmin()) {
              <a [routerLink]="['/' + currentLang() + '/admin/categories/add']"
                 class="flex flex-col items-center gap-2 p-4 rounded-2xl no-underline transition-all active:scale-95"
                 style="background:#FFF3F3; border: 1px solid #F0D4D4;">
                <span class="material-symbols-outlined text-2xl" style="color:#7B1818;">create_new_folder</span>
                <span class="text-[10px] font-black text-center leading-tight" style="font-family:'Cairo',sans-serif; color:#7B1818;">إضافة تصنيف</span>
              </a>
              <a [routerLink]="['/' + currentLang() + '/admin/coupons']"
                 class="flex flex-col items-center gap-2 p-4 rounded-2xl no-underline transition-all active:scale-95"
                 style="background:#F9F7F4; border: 1px solid #E8E0D5;">
                <span class="material-symbols-outlined text-2xl text-on-surface-variant">settings_input_component</span>
                <span class="text-[10px] font-black text-center text-on-surface-variant leading-tight" style="font-family:'Cairo',sans-serif;">الكوبونات</span>
              </a>
            }
          </div>
        }

        <!-- Account -->
        @if (activeTab() === 'account') {
          <div class="bg-white rounded-2xl overflow-hidden" style="box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            @for (field of profileFields; track field.label; let last = $last) {
              <div class="px-4 py-3.5" [class.border-b]="!last" style="border-color:#F0EAE0;">
                <div class="text-[10px] font-black uppercase tracking-wider mb-0.5"
                     style="font-family:'Cairo',sans-serif; color:#C4962A;">{{ field.label }}</div>
                <div class="font-bold text-on-surface text-sm" style="font-family:'Tajawal',sans-serif;">{{ field.value() }}</div>
              </div>
            }
          </div>
        }

        <!-- Orders -->
        @if (activeTab() === 'orders') {
          <div class="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div class="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center">
              <span class="material-symbols-outlined text-4xl text-outline-variant">inventory_2</span>
            </div>
            <p class="font-black text-on-surface text-lg" style="font-family:'Cairo',sans-serif;">طلباتي</p>
            <a [routerLink]="'/' + currentLang() + '/orders'"
               class="text-white rounded-full px-6 py-2.5 font-bold text-sm no-underline transition-all"
               style="font-family:'Cairo',sans-serif; background:#7B1818;">
              عرض جميع الطلبات
            </a>
          </div>
        }
      </div>

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

  tabs: { id: 'overview' | 'orders' | 'account', label: string }[] = [
    { id: 'overview', label: 'نظرة عامة' },
    { id: 'orders',   label: 'الطلبات' },
    { id: 'account',  label: 'حسابي' }
  ];

  profileFields = [
    { label: 'الاسم الكامل',     value: () => this.profile()?.fullName || '-' },
    { label: 'البريد الإلكتروني', value: () => this.profile()?.email || this.userEmail() },
    { label: 'رقم الهاتف',       value: () => this.profile()?.phoneNumber || this.user()?.phoneNumber || '-' },
    { label: 'العنوان',          value: () => this.profile()?.address || '-' },
    { label: 'الجنس',            value: () => this.getGenderText() },
    { label: 'عضو منذ',         value: () => this.getCreatedDate() }
  ];

  userFullName = computed(() => {
    const p = this.profile();
    if (p?.fullName) return p.fullName;
    const user = this.user();
    return (user?.firstName || user?.lastName)
      ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
      : this.tokenService.getName() || 'مستخدم';
  });

  canAddProduct = computed(() =>
    this.authService.isLoggedIn() && (this.tokenService.isSeller() || this.tokenService.hasRole('Admin'))
  );
  isAdmin = computed(() => this.tokenService.hasRole('Admin'));

  userInitials = computed(() => {
    const p = this.profile();
    if (p?.fullName) {
      const parts = p.fullName.split(' ');
      return parts.length > 1
        ? `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase()
        : p.fullName.substring(0, 2).toUpperCase();
    }
    const user = this.user();
    if (user?.firstName || user?.lastName)
      return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
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

  getGenderText(): string {
    return this.profile()?.gender === true ? 'ذكر' : this.profile()?.gender === false ? 'أنثى' : 'غير محدد';
  }

  getCreatedDate(): string {
    return this.profile()?.createdAt ? new Date(this.profile()!.createdAt!).toLocaleDateString('ar-EG') : '-';
  }

  loadOrdersCount(): void {
    const userId = this.tokenService.getUserId();
    if (!userId) return;
    const api = this.tokenService.isSeller()
      ? this.orderService.getOrdersBySellerId(userId)
      : this.orderService.getOrdersByUserId(userId);
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
