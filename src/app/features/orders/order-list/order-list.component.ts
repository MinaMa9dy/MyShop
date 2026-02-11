import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderItem } from '../../../core/models/order.model';
import { LanguageService } from '../../../core/services/language.service';
import { PhotoService } from '../../../core/services/photo.service';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    <div class="orders-page min-h-screen bg-gray-50 py-8">
      <div class="max-w-4xl mx-auto px-4">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">{{ 'orders.title' | translate }}</h1>
          <p class="text-gray-500">{{ 'orders.subtitle' | translate }}</p>
        </div>

        <!-- Loading State -->
        @if (loading()) {
          <div class="flex justify-center py-16">
            <div class="loading-spinner w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        } @else if (error()) {
          <!-- Error State -->
          <div class="card text-center py-12 bg-white rounded-xl shadow-sm">
            <div class="text-5xl mb-4">❌</div>
            <p class="text-red-500 mb-4">{{ error() }}</p>
            <button 
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              (click)="loadOrders()">
              {{ 'common.loading' | translate }}
            </button>
          </div>
        } @else if (orders().length === 0) {
          <!-- Empty State -->
          <div class="card text-center py-16 bg-white rounded-xl shadow-sm">
            <div class="text-6xl mb-4">📦</div>
            <p class="text-gray-600 text-lg mb-4">{{ 'orders.empty' | translate }}</p>
            <a 
              [routerLink]="'/' + currentLang() + '/products'" 
              class="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              {{ 'home.shopNow' | translate }}
            </a>
          </div>
        } @else {
          <!-- Orders List -->
          <div class="space-y-6">
            @for (order of orders(); track order.id) {
              <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <!-- Order Header -->
                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                  <div class="flex flex-wrap justify-between items-center gap-3">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span class="text-xl">📋</span>
                      </div>
                      <div>
                        <span class="text-sm text-gray-500">{{ 'orders.orderId' | translate }}</span>
                        <p class="font-mono text-sm font-medium text-gray-800">#{{ order.id.slice(0, 8).toUpperCase() }}</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-3">
                      <div class="text-right">
                        <span class="text-sm text-gray-500 block">{{ 'orders.date' | translate }}</span>
                        <span class="text-sm font-medium text-gray-800">{{ order.createdAt | date:'dd MMM yyyy' }}</span>
                      </div>
                      <span 
                        class="px-3 py-1 rounded-full text-xs font-semibold"
                        [class.bg-green-100]="order.status === 'Delivered'"
                        [class.text-green-700]="order.status === 'Delivered'"
                        [class.bg-blue-100]="order.status === 'Shipped'"
                        [class.text-blue-700]="order.status === 'Shipped'"
                        [class.bg-yellow-100]="order.status === 'Processing'"
                        [class.text-yellow-700]="order.status === 'Processing'"
                        [class.bg-red-100]="order.status === 'Cancelled'"
                        [class.text-red-700]="order.status === 'Cancelled'">
                        {{ getStatusText(order.status) | translate }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Order Items -->
                <div class="p-6">
                  <div class="space-y-4">
                    @for (item of order.orderItems; track item.id) {
                      <div class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <!-- Product Image -->
                        <div class="w-16 h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                          @if (getPhotoPath(item)) {
                            <img 
                              [src]="photoService.getPhotoUrlFromPath(getPhotoPath(item)!)" 
                              [alt]="item.productName"
                              class="w-full h-full object-cover"
                              (error)="handleImageError($event)">
                          } @else {
                            <span class="text-3xl">📦</span>
                          }
                        </div>
                        
                        <!-- Product Info -->
                        <div class="flex-1 min-w-0">
                          <h4 class="font-medium text-gray-800 truncate">{{ item.productName }}</h4>
                          <p class="text-sm text-gray-500">{{ item.unitPrice | currency:'EGP':'symbol':'1.0-0':'en-EG' }} × {{ item.quantity }}</p>
                        </div>
                        
                        <!-- Item Total -->
                        <div class="text-right">
                          <span class="font-bold text-gray-800">{{ getItemTotal(item) | currency:'EGP':'symbol':'1.0-0':'en-EG' }}</span>
                        </div>
                      </div>
                    }
                  </div>

                  <!-- Order Footer -->
                  <div class="mt-6 pt-4 border-t border-gray-200">
                    <div class="flex flex-wrap justify-between items-end gap-4">
                      <div class="text-sm text-gray-600">
                        <div class="flex items-center gap-2">
                          <span class="text-lg">📍</span>
                          <span>{{ order.city }}, {{ order.street }}</span>
                        </div>
                        @if (order.buyerPhone) {
                          <p class="mt-2 flex items-center gap-2">
                            <span class="text-lg">📞</span>
                            <span>{{ order.buyerPhone }}</span>
                          </p>
                        }
                        @if (order.comment) {
                          <p class="mt-2 text-gray-500 flex items-start gap-2">
                            <span class="text-lg">📝</span>
                            {{ order.comment }}
                          </p>
                        }
                      </div>
                      <div class="text-right">
                        <p class="text-sm text-gray-500 mb-1">{{ 'orders.total' | translate }}</p>
                        <p class="text-2xl font-bold text-blue-600">{{ calculateOrderTotal(order) | currency:'EGP':'symbol':'1.0-0':'en-EG' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class OrderListComponent implements OnInit {
  private orderService = inject(OrderService);
  private languageService = inject(LanguageService);
  photoService = inject(PhotoService);
  
  orders = signal<Order[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  
  // Get current language for routerLink
  currentLang(): string {
    return this.languageService.currentLanguage();
  }
  
  ngOnInit(): void {
    this.loadOrders();
  }
  
  loadOrders(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.orderService.getOrdersByUserId().subscribe({
      next: (response: any) => {
        let ordersData: any[] = [];
        if (Array.isArray(response)) {
          ordersData = response;
        } else if (response && Array.isArray(response.data)) {
          ordersData = response.data;
        } else if (response && response.items && Array.isArray(response.items)) {
          ordersData = response.items;
        }
        
        // Calculate totals for each order from items
        ordersData = ordersData.map(order => ({
          ...order,
          calculatedTotal: this.calculateOrderTotalFromItems(order.orderItems || [])
        }));
        
        this.orders.set(ordersData);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.error.set('Failed to load orders. Please try again.');
        this.loading.set(false);
      }
    });
  }
  
  calculateOrderTotal(order: Order): number {
    return this.calculateOrderTotalFromItems(order.orderItems || []);
  }
  
  calculateOrderTotalFromItems(orderItems: any[]): number {
    if (!orderItems || orderItems.length === 0) return 0;
    return orderItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  }
  
  getItemTotal(item: any): number {
    return item.unitPrice * item.quantity;
  }
  
  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Delivered': 'orders.delivered',
      'Shipped': 'orders.shipped',
      'Processing': 'orders.processing',
      'Cancelled': 'orders.cancelled'
    };
    return statusMap[status] || 'orders.processing';
  }
  
  getPhotoPath(item: any): string | null {
    // Get the photo path from the item
    const path = item.productPhotoPath || item.ProductPhotoPath || item.productphotopath || item.photoPath || item.Photo || null;
    if (!path) return null;
    
    // Extract just the filename from the path (e.g., "Photos/filename.jpg" -> "filename.jpg")
    const lastSlashIndex = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
    const fileName = lastSlashIndex >= 0 ? path.substring(lastSlashIndex + 1) : path;
    
    return fileName;
  }
  
  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/placeholder.svg';
  }
}
