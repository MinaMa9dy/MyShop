import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { TokenService } from '../../../core/services/token.service';
import { Order } from '../../../core/models/order.model';
import { LanguageService } from '../../../core/services/language.service';
import { PhotoService } from '../../../core/services/photo.service';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="min-h-screen bg-surface pb-24 w-full" dir="rtl">

      <!-- Header -->
      <div class="px-4 md:px-6 pt-5 pb-3 max-w-[1400px] mx-auto">
        <h1 class="font-black text-on-surface text-xl" style="font-family:'Cairo',sans-serif;">طلباتي</h1>
      </div>

      <section class="max-w-[1400px] mx-auto px-4 md:px-6 pb-8">

        <!-- Loading -->
        @if (loading()) {
          <div class="flex flex-col items-center justify-center py-24 gap-4">
            <div class="w-10 h-10 border-4 border-outline-variant/20 rounded-full animate-spin"
                 style="border-top-color:#7B1818;"></div>
          </div>
        }

        <!-- Error -->
        @else if (error()) {
          <div class="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <span class="material-symbols-outlined text-4xl text-error/50">report</span>
            <p class="font-bold text-on-surface text-sm" style="font-family:'Cairo',sans-serif;">{{ error() }}</p>
            <button (click)="loadOrders()" class="text-white rounded-full px-5 py-2 text-sm font-bold"
                    style="font-family:'Cairo',sans-serif; background:#7B1818;">إعادة المحاولة</button>
          </div>
        }

        <!-- Empty -->
        @else if (orders().length === 0) {
          <div class="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div class="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center">
              <span class="material-symbols-outlined text-4xl text-outline-variant">package_2</span>
            </div>
            <p class="font-black text-on-surface text-lg" style="font-family:'Cairo',sans-serif;">لا توجد طلبات</p>
            <p class="text-on-surface-variant text-sm" style="font-family:'Tajawal',sans-serif;">ابدأ التسوق وضع أول طلباتك</p>
            <button [routerLink]="'/' + currentLang() + '/products'"
                    class="text-white rounded-full px-6 py-2.5 font-bold text-sm transition-all"
                    style="font-family:'Cairo',sans-serif; background:#7B1818;">تصفح المنتجات</button>
          </div>
        }

        <!-- Orders List -->
        @else {
          <div class="flex flex-col gap-4">
            @for (order of orders(); track order.id) {
              <div class="bg-white rounded-2xl overflow-hidden border border-outline-variant/15"
                   style="box-shadow: 0 2px 10px rgba(0,0,0,0.06);">

                <!-- Order Header -->
                <div class="px-4 py-3 flex items-center justify-between border-b border-outline-variant/10">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style="background:#FFF3F3;">
                      <span class="material-symbols-outlined text-lg" style="color:#7B1818;">receipt_long</span>
                    </div>
                    <div>
                      <div class="text-[10px] text-on-surface-variant" style="font-family:'Tajawal',sans-serif;">رقم الطلب</div>
                      <div class="font-black text-sm" style="font-family:'Cairo',sans-serif; color:#7B1818;">
                        #{{ order.id.slice(0,8).toUpperCase() }}
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-on-surface-variant" style="font-family:'Tajawal',sans-serif;">
                      {{ order.createdAt | date:'dd/MM/yyyy' }}
                    </span>
                    <span class="text-xs font-bold px-2.5 py-1 rounded-full"
                          [class]="getStatusClasses(order.status)"
                          style="font-family:'Cairo',sans-serif;">
                      {{ getStatusArabic(order.status) }}
                    </span>
                  </div>
                </div>

                <!-- Order Items -->
                <div class="px-4 py-3 flex flex-col gap-2">
                  @for (item of order.orderItems; track item.id) {
                    <div class="flex items-center gap-3">
                      <div class="w-12 h-12 rounded-xl overflow-hidden bg-surface-container-low flex-shrink-0 border border-outline-variant/10">
                        <img [src]="photoService.getPhotoUrlFromPath(getPhotoPath(item) || '')"
                             class="w-full h-full object-contain p-1"
                             (error)="handleImageError($event)">
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="font-bold text-sm text-on-surface truncate" style="font-family:'Cairo',sans-serif;">
                          {{ item.productName }}
                        </div>
                        <div class="text-xs text-on-surface-variant" style="font-family:'Tajawal',sans-serif;">
                          {{ item.quantity }} × EGP {{ item.unitPrice }}
                        </div>
                      </div>
                      <div class="font-black text-sm flex-shrink-0" style="font-family:'Cairo',sans-serif; color:#7B1818;">
                        EGP {{ item.unitPrice * item.quantity }}
                      </div>
                    </div>
                  }
                </div>

                <!-- Order Footer -->
                <div class="px-4 py-3 bg-surface-container-lowest/50 border-t border-outline-variant/10 flex items-center justify-between">
                  <div class="flex items-center gap-2 text-xs text-on-surface-variant" style="font-family:'Tajawal',sans-serif;">
                    <span class="material-symbols-outlined text-sm">location_on</span>
                    {{ order.city }}{{ order.street ? ' - ' + order.street : '' }}
                  </div>
                  <div class="flex items-center gap-3">
                    @if (order.status === 'Pending' || order.status === '1') {
                      <button (click)="cancelOrder(order.id)"
                              class="text-error text-xs font-bold border border-error/20 rounded-full px-3 py-1 hover:bg-error/5 transition-all"
                              style="font-family:'Cairo',sans-serif;">إلغاء</button>
                    }
                    <div class="font-black" style="font-family:'Cairo',sans-serif; color:#7B1818;">
                      EGP {{ calculateOrderTotal(order) }}
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </section>
    </main>
  `,
  styles: []
})
export class OrderListComponent implements OnInit {
  private orderService = inject(OrderService);
  private tokenService = inject(TokenService);
  private languageService = inject(LanguageService);
  photoService = inject(PhotoService);

  orders = signal<Order[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  currentLang(): string { return this.languageService.currentLanguage(); }
  ngOnInit(): void { this.loadOrders(); }

  loadOrders(): void {
    this.loading.set(true); this.error.set(null);
    const api = this.tokenService.isSeller()
      ? this.orderService.getCurrentSellerOrders()
      : this.orderService.getMyOrders();
    api.subscribe({
      next: (res) => {
        if (res.success && res.data) this.orders.set(res.data);
        else this.error.set(res.error?.message || 'فشل تحميل الطلبات');
        this.loading.set(false);
      },
      error: () => { this.error.set('فشل تحميل الطلبات'); this.loading.set(false); }
    });
  }

  cancelOrder(id: string): void {
    if (!confirm('هل تريد إلغاء هذا الطلب؟')) return;
    this.orderService.cancelOrder(id).subscribe({
      next: (res) => { if (res.success) this.loadOrders(); },
      error: () => {}
    });
  }

  calculateOrderTotal(order: Order): number {
    return order.totalAmount || (order.orderItems || []).reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  }

  getStatusArabic(status: any): string {
    const s = status?.toString();
    const map: Record<string, string> = {
      '1': 'قيد الانتظار', 'Pending': 'قيد الانتظار',
      '2': 'تم الشحن',     'Shipped': 'تم الشحن',
      '3': 'تم التسليم',   'Delivered': 'تم التسليم',
      '4': 'ملغي',         'Cancelled': 'ملغي', 'Canceled': 'ملغي'
    };
    return map[s] || 'قيد الانتظار';
  }

  getStatusClasses(status: any): string {
    const s = status?.toString();
    if (s === '1' || s === 'Pending')   return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
    if (s === '2' || s === 'Shipped')   return 'bg-blue-50 text-blue-700 border border-blue-200';
    if (s === '3' || s === 'Delivered') return 'bg-green-50 text-green-700 border border-green-200';
    if (s === '4' || s === 'Cancelled' || s === 'Canceled') return 'bg-red-50 text-red-700 border border-red-200';
    return 'bg-surface-container text-outline';
  }

  getPhotoPath(item: any): string | null {
    return item.productPhotoPath || item.ProductPhotoPath || item.productphotopath || item.photoPath || item.Photo || null;
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/placeholder.svg';
  }
}
