import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { OrderService } from '../../../core/services/order.service';
import { TokenService } from '../../../core/services/token.service';
import { Order } from '../../../core/models/order.model';
import { LanguageService } from '../../../core/services/language.service';
import { PhotoService } from '../../../core/services/photo.service';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    <main class="min-h-screen bg-surface pb-20" [dir]="currentLang() === 'ar' ? 'rtl' : 'ltr'">
      <!-- Hero Section -->
      <section class="bg-surface-container-low pt-24 pb-16 border-b border-outline-variant/30">
        <div class="max-w-7xl mx-auto px-6">
          <div class="max-w-2xl text-start">
             <h1 class="font-headline text-5xl font-black tracking-tighter text-on-surface mb-2">{{ 'orders.acquisitionHistory' | translate }}</h1>
             <p class="font-body text-on-surface-variant opacity-70">{{ 'orders.acquisitionDesc' | translate }}</p>
          </div>
        </div>
      </section>

      <section class="max-w-5xl mx-auto px-6 py-16">
        @if (loading()) {
          <div class="flex flex-col items-center justify-center py-40 gap-4">
            <div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
             <p class="font-headline font-black text-xs uppercase tracking-widest text-outline">{{ 'orders.retrieving' | translate }}</p>
          </div>
        } @else if (error()) {
          <div class="text-center py-32 bg-error/5 rounded-[40px] border-2 border-dashed border-error/20 animate-fade-in">
             <span class="material-symbols-outlined text-6xl text-error mb-4">report</span>
             <p class="font-headline text-xl font-bold text-on-surface mb-6">{{ error() }}</p>
              <button (click)="loadOrders()" class="px-8 py-4 bg-primary text-on-primary rounded-2xl font-headline font-bold">{{ 'orders.retryAction' | translate }}</button>
          </div>
        } @else if (orders().length === 0) {
          <div class="text-center py-40 bg-surface-container-low rounded-[48px] border-2 border-dashed border-outline-variant/30 animate-fade-in">
             <div class="w-32 h-32 rounded-[40px] bg-surface-container-high flex items-center justify-center text-outline-variant mx-auto mb-8">
                <span class="material-symbols-outlined text-6xl opacity-30">package_2</span>
             </div>
             <h2 class="font-headline text-2xl font-black text-on-surface mb-4">{{ 'orders.empty' | translate }}</h2>
             <p class="font-body text-on-surface-variant opacity-60 mb-10 max-w-sm mx-auto">{{ 'orders.emptyDesc' | translate }}</p>
             <button [routerLink]="'/' + currentLang() + '/products'" class="px-10 py-5 bg-on-surface text-surface rounded-2xl font-headline font-bold shadow-xl hover:scale-105 active:scale-95 transition-all">{{ 'orders.curateCatalog' | translate }}</button>
          </div>
        } @else {
          <div class="space-y-12">
            @for (order of orders(); track order.id) {
              <div class="bg-surface-container-lowest rounded-[48px] shadow-2xl border border-outline-variant/10 overflow-hidden animate-slide-up group">
                
                <!-- Order Header -->
                <div class="p-8 md:p-10 border-b border-outline-variant/5">
                   <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                      <div class="flex items-center gap-6">
                         <div class="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary relative">
                            <span class="material-symbols-outlined text-3xl">receipt_long</span>
                            <div class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary animate-ping opacity-20"></div>
                         </div>
                         <div>
                             <p class="text-[10px] font-black uppercase tracking-[0.4em] text-outline mb-1">{{ 'orders.sequenceIdentifier' | translate }}</p>
                            <h3 class="font-headline text-xl font-black text-on-surface">#{{ order.id.slice(0, 8).toUpperCase() }}</h3>
                         </div>
                      </div>

                      <div class="flex flex-wrap items-center gap-4">
                          <div class="px-6 py-3 bg-surface rounded-2xl border border-outline-variant/20">
                             <p class="text-[8px] font-black uppercase tracking-widest text-outline mb-0.5">{{ 'orders.deploymentDate' | translate }}</p>
                             <p class="font-headline font-black text-sm text-on-surface">{{ order.createdAt | date:'dd MMM yyyy' }}</p>
                          </div>
                         
                         <div class="px-8 py-3 rounded-2xl font-headline font-black text-[10px] uppercase tracking-widest shadow-sm"
                              [class]="getStatusClasses(order.status)">
                            {{ getStatusText(order.status) | translate }}
                         </div>
                      </div>
                   </div>
                </div>

                <!-- Order Content -->
                <div class="p-8 md:p-10">
                   <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <!-- Items -->
                      <div class="space-y-6">
                         <p class="text-[10px] font-black uppercase tracking-widest text-outline mb-4">{{ 'orders.unitInventory' | translate }}</p>
                        @for (item of order.orderItems; track item.id) {
                          <div class="flex items-center gap-5 p-4 bg-surface rounded-3xl border border-outline-variant/5 group/item hover:bg-surface-container-low transition-colors duration-500">
                             <div class="w-14 h-14 bg-white rounded-2xl overflow-hidden flex-shrink-0 border border-outline-variant/10 p-1">
                                <img [src]="photoService.getPhotoUrlFromPath(getPhotoPath(item) || '')" 
                                     class="w-full h-full object-contain transition-transform group-hover/item:scale-110"
                                     (error)="handleImageError($event)">
                             </div>
                             <div class="flex-grow min-w-0">
                                <h4 class="font-headline font-bold text-xs text-on-surface truncate pr-4">{{ item.productName }}</h4>
                                <p class="text-[10px] font-black uppercase tracking-widest text-outline pt-1">QTY: {{ item.quantity }} × {{ item.unitPrice | currency:'EGP':'symbol':'1.0-0':'en-EG' }}</p>
                             </div>
                             <div class="text-end">
                                <p class="font-headline font-black text-sm text-on-surface">
                                   {{ (item.unitPrice * item.quantity) | currency:'EGP':'symbol':'1.0-0':'en-EG' }}
                                </p>
                             </div>
                          </div>
                        }
                      </div>

                      <!-- Logistics & Valuation -->
                      <div class="space-y-10">
                         <div class="space-y-6">
                            <p class="text-[10px] font-black uppercase tracking-widest text-outline">Logistics Coordinates</p>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                               <div class="space-y-2">
                                  <span class="material-symbols-outlined text-outline-variant text-sm">location_on</span>
                                  <p class="text-xs font-black text-on-surface">{{ order.city }}</p>
                                  <p class="text-[10px] text-outline opacity-60">{{ order.street }}</p>
                               </div>
                               <div class="space-y-2">
                                  <span class="material-symbols-outlined text-outline-variant text-sm">contact_phone</span>
                                  <p class="text-xs font-black text-on-surface">{{ order.buyerPhone || 'Linked Identity' }}</p>
                                  @if (order.comment) {
                                    <p class="text-[10px] text-outline opacity-60 italic truncate">"{{ order.comment }}"</p>
                                  }
                               </div>
                            </div>
                         </div>

                         <div class="pt-8 border-t border-outline-variant/10">
                            <div class="flex justify-between items-end">
                               <div>
                                  <p class="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">Final Valuation</p>
                                  <p class="font-headline text-4xl font-black text-on-surface tracking-tighter">{{ calculateOrderTotal(order) | currency:'EGP':'symbol':'1.0-0':'en-EG' }}</p>
                               </div>
                               <span class="text-[10px] font-black uppercase tracking-widest text-outline opacity-40">Valuation Verified</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <!-- Footer Action -->
                <div class="px-10 py-6 bg-surface-container border-t border-outline-variant/5 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                   <p class="text-[8px] font-black uppercase tracking-widest text-outline">Order Status: Completed</p>
                   <button class="text-primary font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform">
                      <span>Request Detail Log</span>
                      <span class="material-symbols-outlined text-sm">arrow_forward</span>
                   </button>
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
    const api = this.tokenService.isSeller() ? this.orderService.getCurrentSellerOrders() : this.orderService.getOrdersByUserId();
    
    api.subscribe({
      next: (response: any) => {
        let data = Array.isArray(response) ? response : response.data || response.items || [];
        this.orders.set(data);
        this.loading.set(false);
      },
      error: () => { this.error.set('Failed to synchronize order records.'); this.loading.set(false); }
    });
  }
  
  calculateOrderTotal(order: Order): number {
    return (order.orderItems || []).reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  }
  
  getStatusText(status: string): string {
    const map: { [key: string]: string } = { 'Delivered': 'orders.delivered', 'Shipped': 'orders.shipped', 'Processing': 'orders.processing', 'Cancelled': 'orders.cancelled' };
    return map[status] || 'orders.processing';
  }

  getStatusClasses(status: string): string {
    const map: { [key: string]: string } = {
       'Delivered': 'bg-success/10 text-success border border-success/20',
       'Shipped': 'bg-primary/10 text-primary border border-primary/20',
       'Processing': 'bg-tertiary/10 text-tertiary border border-tertiary/20',
       'Cancelled': 'bg-error/10 text-error border border-error/20'
    };
    return map[status] || 'bg-surface-container-high text-outline border border-outline-variant/30';
  }
  
  getPhotoPath(item: any): string | null {
    const path = item.productPhotoPath || item.ProductPhotoPath || item.productphotopath || item.photoPath || item.Photo || null;
    if (!path) return null;
    const lastSlash = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
    return lastSlash >= 0 ? path.substring(lastSlash + 1) : path;
  }
  
  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrToAN7K9bxCYHNmah4SPbCguXNVlpK-DeQWeEBnHb8hhrK_YwTkoUXoEOh-RgjYVbFZj2ZzFPFjqLgEqS81zBG3mBRaFpNCTpPthaRKkjbY6cN5ywiH6wrgPH-fov4huJ80NbYSMgUyawNMMrAIHqttsqobdz8M4Yk_ERm3md8eXwLlW4PLs3aIXrOye6hD6Mc0OtdU9LpkjMLI7eeChndSjrvjUUdPvpHGIlYDvLm3UBFRbdvqH0krtaLiZxlv72URSOjaoPfUbP';
  }
}
