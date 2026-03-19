import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { CouponService } from '../../../../core/services/coupon.service';
import { LanguageService } from '../../../../core/services/language.service';
import { Coupon, DiscountType } from '../../../../core/models/coupon.model';

@Component({
  selector: 'app-coupon-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    <div class="coupons-page py-8 min-h-screen bg-gray-50">
      <div class="container mx-auto px-4 max-w-7xl">
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">{{ 'admin.coupons.title' | translate }}</h1>
            <p class="text-gray-500 mt-2">{{ 'admin.coupons.subtitle' | translate }}</p>
          </div>
          <button 
            [routerLink]="['/' + currentLang + '/admin/coupons/add']"
            class="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-600/20 transform hover:-translate-y-0.5 active:translate-y-0 text-sm md:text-base">
            <span class="text-xl leading-none">+</span>
            <span class="font-bold">{{ 'admin.coupons.addCoupon' | translate }}</span>
          </button>
        </div>

        @if (error()) {
          <div class="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-start">
            <span class="mr-2">⚠️</span>
            <span>{{ error() }}</span>
          </div>
        }

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          @if (loading()) {
            <div class="flex justify-center py-12">
              <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          } @else if (coupons().length === 0) {
            <div class="text-center py-16">
              <div class="text-5xl mb-4">🎫</div>
              <h3 class="text-xl font-bold text-gray-800 mb-2">{{ 'admin.coupons.noCoupons' | translate }}</h3>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                    <th class="p-4 font-semibold">{{ 'admin.coupons.name' | translate }}</th>
                    <th class="p-4 font-semibold">{{ 'admin.coupons.discountValue' | translate }}</th>
                    <th class="p-4 font-semibold">{{ 'admin.coupons.minAmount' | translate }}</th>
                    <th class="p-4 font-semibold">{{ 'admin.coupons.expirationDate' | translate }}</th>
                    <th class="p-4 font-semibold">{{ 'admin.coupons.isActive' | translate }}</th>
                    <th class="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  @for (coupon of coupons(); track coupon.couponCode) {
                    <tr class="hover:bg-gray-50/50 transition-colors group">
                      <td class="p-4">
                        <div class="font-medium text-gray-800">{{ coupon.couponName }}</div>
                        <div class="text-xs text-gray-500">{{ coupon.couponDescription }}</div>
                      </td>
                      <td class="p-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                              [ngClass]="getDiscountTypeClass(coupon.discountType)">
                          {{ formatDiscount(coupon) }}
                        </span>
                      </td>
                      <td class="p-4 whitespace-nowrap text-gray-600">
                        {{ coupon.minAmount | currency:'EGP ' }}
                      </td>
                      <td class="p-4 whitespace-nowrap text-gray-600">
                        {{ coupon.expirationDate ? (coupon.expirationDate | date) : '∞' }}
                      </td>
                      <td class="p-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                              [class.bg-green-100]="coupon.isActive" 
                              [class.text-green-800]="coupon.isActive"
                              [class.bg-gray-100]="!coupon.isActive" 
                              [class.text-gray-800]="!coupon.isActive">
                          {{ coupon.isActive ? 'Active' : 'Inactive' }}
                        </span>
                      </td>
                      <td class="p-4 whitespace-nowrap text-right">
                        <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <!-- Assign Products Button -->
                          <button 
                            [routerLink]="['/' + currentLang + '/admin/coupons/assign', coupon.couponCode]"
                            class="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="{{ 'admin.coupons.assignProducts' | translate }}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                          </button>
                          <!-- Edit Button -->
                          <button 
                            [routerLink]="['/' + currentLang + '/admin/coupons/edit', coupon.couponCode]"
                            class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="{{ 'admin.coupons.editCoupon' | translate }}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <!-- Delete Button -->
                          <button 
                            (click)="deleteCoupon(coupon.couponCode)"
                            [disabled]="deletingId() === coupon.couponCode"
                            class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete">
                            @if (deletingId() === coupon.couponCode) {
                              <div class="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            } @else {
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class CouponListComponent implements OnInit {
  private couponService = inject(CouponService);
  private languageService = inject(LanguageService);

  coupons = signal<Coupon[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  deletingId = signal<string | null>(null);

  get currentLang(): string {
    return this.languageService.currentLanguage();
  }

  ngOnInit() {
    this.loadCoupons();
  }

  loadCoupons() {
    this.loading.set(true);
    this.error.set(null);
    this.couponService.getAll().subscribe({
      next: (data) => {
        this.coupons.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading coupons', err);
        this.error.set(err.error?.message || 'Failed to load coupons');
        this.loading.set(false);
      }
    });
  }

  formatDiscount(coupon: Coupon): string {
    if (coupon.discountType === DiscountType.Percentage) {
      return `${coupon.discountValue}%`;
    }
    return `EGP ${coupon.discountValue}`;
  }

  getDiscountTypeClass(type: DiscountType): string {
    return type === DiscountType.Percentage 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-indigo-100 text-indigo-800';
  }

  deleteCoupon(id: string) {
    if (confirm('Are you sure you want to delete this coupon?')) {
      this.deletingId.set(id);
      this.couponService.delete(id).subscribe({
        next: () => {
          this.coupons.update(list => list.filter(c => c.couponCode !== id));
          this.deletingId.set(null);
        },
        error: (err) => {
          console.error('Error deleting coupon', err);
          this.error.set(err.error?.message || 'Failed to delete coupon');
          this.deletingId.set(null);
        }
      });
    }
  }
}
