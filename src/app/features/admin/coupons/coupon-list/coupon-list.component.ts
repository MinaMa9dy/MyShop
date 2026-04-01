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
    <main class="min-h-screen bg-surface pb-24" [dir]="currentLang === 'ar' ? 'rtl' : 'ltr'">
      <!-- Hero Header -->
      <header class="bg-surface-container-low pt-24 pb-16 border-b border-outline-variant/30 relative overflow-hidden">
        <div class="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_bottom_left,_var(--primary)_0%,_transparent_70%)]"></div>
        <div class="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
           <div class="text-start">
              <h1 class="font-headline text-5xl font-black tracking-tighter text-on-surface mb-2">{{ 'admin.coupons.title' | translate }}</h1>
              <p class="font-body text-on-surface-variant opacity-70">{{ 'admin.coupons.subtitle' | translate }}</p>
           </div>
           <button [routerLink]="['/' + currentLang + '/admin/coupons/add']"
                   class="px-10 py-5 bg-primary text-on-primary rounded-[32px] font-headline font-bold shadow-[0_20px_40px_rgba(var(--primary-rgb),0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group">
              <span class="material-symbols-outlined group-hover:rotate-90 transition-transform">confirmation_number</span>
              <span>{{ 'admin.coupons.addCoupon' | translate }}</span>
           </button>
        </div>
      </header>

      <section class="max-w-7xl mx-auto px-6 py-16">
        @if (error()) {
          <div class="mb-12 p-6 bg-error/10 text-error rounded-3xl border border-error/20 flex items-start gap-4 animate-fade-in">
             <span class="material-symbols-outlined">report</span>
             <p class="text-xs font-black uppercase tracking-widest">{{ error() }}</p>
          </div>
        }

        <div class="bg-surface-container-lowest rounded-[48px] shadow-2xl border border-outline-variant/10 overflow-hidden animate-slide-up">
          @if (loading()) {
            <div class="flex flex-col items-center justify-center py-40 gap-4">
               <div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
               <p class="font-headline font-black text-xs uppercase tracking-widest text-outline">Synchronizing Incentives</p>
            </div>
          } @else if (coupons().length === 0) {
            <div class="text-center py-40 bg-surface-container-low/30">
               <div class="w-32 h-32 rounded-[40px] bg-surface-container-high flex items-center justify-center text-outline-variant mx-auto mb-8">
                  <span class="material-symbols-outlined text-6xl opacity-30">local_activity</span>
               </div>
               <h3 class="font-headline text-2xl font-black text-on-surface mb-2">{{ 'admin.coupons.noCoupons' | translate }}</h3>
               <p class="font-body text-on-surface-variant opacity-60 mb-10">No active incentives discovered in the sequence.</p>
               <button [routerLink]="['/' + currentLang + '/admin/coupons/add']" class="px-8 py-4 bg-outline text-surface rounded-2xl font-headline font-bold">New Coupon</button>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-start border-collapse">
                <thead>
                  <tr class="bg-surface-container text-[10px] font-black uppercase tracking-[0.2em] text-outline border-b border-outline-variant/10">
                    <th class="p-8 font-black">{{ 'admin.coupons.name' | translate }}</th>
                    <th class="p-8 font-black">{{ 'admin.coupons.discountValue' | translate }}</th>
                    <th class="p-8 font-black">{{ 'admin.coupons.minAmount' | translate }}</th>
                    <th class="p-8 font-black">{{ 'admin.coupons.expirationDate' | translate }}</th>
                    <th class="p-8 font-black">{{ 'admin.coupons.isActive' | translate }}</th>
                    <th class="p-8 font-black text-end">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-outline-variant/10">
                  @for (coupon of coupons(); track coupon.couponCode) {
                    <tr class="hover:bg-primary/[0.02] transition-colors group">
                      <td class="p-8">
                        <div class="font-headline font-black text-on-surface">{{ coupon.couponName }}</div>
                        <div class="text-[10px] font-black uppercase tracking-widest text-outline opacity-60 pt-1">{{ coupon.couponDescription }}</div>
                      </td>
                      <td class="p-8">
                        <span class="px-5 py-2 rounded-full font-headline font-black text-[10px] uppercase tracking-widest"
                              [ngClass]="getDiscountTypeClass(coupon.discountType)">
                          {{ formatDiscount(coupon) }}
                        </span>
                      </td>
                      <td class="p-8">
                        <div class="font-headline font-black text-sm text-on-surface">{{ coupon.minAmount | currency:'EGP':'symbol':'1.0-0':'en-EG' }}</div>
                      </td>
                      <td class="p-8">
                        <div class="text-[10px] font-black uppercase tracking-widest text-outline-variant">
                           {{ coupon.expirationDate ? (coupon.expirationDate | date:'dd MMM yyyy') : 'PERMANENT' }}
                        </div>
                      </td>
                      <td class="p-8">
                        <div class="flex items-center gap-2">
                           <div class="w-2 h-2 rounded-full" [class]="coupon.isActive ? 'bg-success animate-pulse' : 'bg-outline-variant'"></div>
                           <span class="text-[10px] font-black uppercase tracking-widest" [class]="coupon.isActive ? 'text-success' : 'text-outline-variant'">
                             {{ coupon.isActive ? 'OPERATIONAL' : 'DORMANT' }}
                           </span>
                        </div>
                      </td>
                      <td class="p-8">
                        <div class="flex items-center justify-end gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                           <button [routerLink]="['/' + currentLang + '/admin/coupons/assign', coupon.couponCode]"
                                   class="w-12 h-12 rounded-2xl bg-tertiary/10 text-tertiary hover:bg-tertiary hover:text-on-tertiary transition-all flex items-center justify-center shadow-sm"
                                   title="{{ 'admin.coupons.assignProducts' | translate }}">
                             <span class="material-symbols-outlined">link</span>
                           </button>
                           <button [routerLink]="['/' + currentLang + '/admin/coupons/edit', coupon.couponCode]"
                                   class="w-12 h-12 rounded-2xl bg-primary/10 text-primary hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center shadow-sm"
                                   title="{{ 'admin.coupons.editCoupon' | translate }}">
                             <span class="material-symbols-outlined">edit</span>
                           </button>
                           <button (click)="deleteCoupon(coupon.couponCode)" [disabled]="deletingId() === coupon.couponCode"
                                   class="w-12 h-12 rounded-2xl bg-error/10 text-error hover:bg-error hover:text-on-error transition-all flex items-center justify-center shadow-sm disabled:opacity-50">
                             @if (deletingId() === coupon.couponCode) {
                               <span class="w-4 h-4 border-2 border-error/30 border-t-error rounded-full animate-spin"></span>
                             } @else {
                               <span class="material-symbols-outlined">delete</span>
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
      </section>
    </main>
  `,
  styles: []
})
export class CouponListComponent implements OnInit {
  private couponService = inject(CouponService);
  private languageService = inject(LanguageService);

  coupons = signal<Coupon[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  deletingId = signal<string | null>(null);

  get currentLang(): string { return this.languageService.currentLanguage(); }
  ngOnInit() { this.loadCoupons(); }

  loadCoupons() {
    this.loading.set(true); this.error.set(null);
    this.couponService.getAll().subscribe({
      next: (data) => { this.coupons.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err.error?.message || 'Failed to sync coupons.'); this.loading.set(false); }
    });
  }

  formatDiscount(coupon: Coupon): string {
    return coupon.discountType === DiscountType.Percentage ? `${coupon.discountValue}% Reduction` : `${coupon.discountValue} EGP Fixed`;
  }

  getDiscountTypeClass(type: DiscountType): string {
    return type === DiscountType.Percentage ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-tertiary/10 text-tertiary border border-tertiary/20';
  }

  deleteCoupon(id: string) {
    if (confirm('Delete this coupon?')) {
      this.deletingId.set(id);
      this.couponService.delete(id).subscribe({
        next: () => {
          this.coupons.update(list => list.filter(c => c.couponCode !== id));
          this.deletingId.set(null);
        },
        error: (err) => { this.error.set(err.error?.message || 'Decommission failure.'); this.deletingId.set(null); }
      });
    }
  }
}
