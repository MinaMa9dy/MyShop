import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
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
      <header class="bg-surface-container-low pt-24 pb-12 md:pb-16 border-b border-outline-variant/30 relative overflow-hidden">
        <div class="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_bottom_left,_var(--primary)_0%,_transparent_70%)]"></div>
        <div class="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row justify-between items-center md:items-end gap-8 text-center md:text-start">
           <div class="flex-grow">
              <h1 class="font-headline text-4xl md:text-5xl font-black tracking-tighter text-on-surface mb-2">{{ 'admin.coupons.title' | translate }}</h1>
              <p class="font-body text-sm md:text-base text-on-surface-variant opacity-70">{{ 'admin.coupons.subtitle' | translate }}</p>
           </div>
           <button [routerLink]="['/' + currentLang + '/admin/coupons/add']"
                   class="w-full md:w-auto px-10 py-5 bg-primary text-on-primary rounded-[32px] font-headline font-bold shadow-[0_20px_40px_rgba(var(--primary-rgb),0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group">
              <span class="material-symbols-outlined group-hover:rotate-90 transition-transform">confirmation_number</span>
              <span>{{ 'admin.coupons.addCoupon' | translate }}</span>
           </button>
        </div>
      </header>

      <section class="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
        @if (error()) {
          <div class="mb-12 p-6 bg-error/10 text-error rounded-3xl border border-error/20 flex items-start gap-4 animate-fade-in">
             <span class="material-symbols-outlined">report</span>
             <p class="text-xs font-black uppercase tracking-widest text-start">{{ error() }}</p>
          </div>
        }

        <div class="animate-slide-up">
          @if (loading()) {
            <div class="bg-surface-container-lowest rounded-[48px] shadow-2xl border border-outline-variant/10 p-20 flex flex-col items-center justify-center gap-4">
               <div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
               <p class="font-headline font-black text-xs uppercase tracking-widest text-outline">{{ 'admin.coupons.syncIncentives' | translate }}</p>
            </div>
          } @else if (coupons().length === 0) {
            <div class="bg-surface-container-lowest rounded-[48px] shadow-2xl border border-outline-variant/10 text-center py-40 bg-surface-container-low/30">
               <div class="w-32 h-32 rounded-[40px] bg-surface-container-high flex items-center justify-center text-outline-variant mx-auto mb-8">
                  <span class="material-symbols-outlined text-6xl opacity-30">local_activity</span>
               </div>
               <h3 class="font-headline text-2xl font-black text-on-surface mb-2">{{ 'admin.coupons.noCoupons' | translate }}</h3>
               <p class="font-body text-on-surface-variant opacity-60 mb-10">{{ 'admin.coupons.noCouponsSubtitle' | translate }}</p>
               <button [routerLink]="['/' + currentLang + '/admin/coupons/add']" class="px-8 py-4 bg-outline text-surface rounded-2xl font-headline font-bold">{{ 'admin.coupons.addCoupon' | translate }}</button>
            </div>
          } @else {
            <!-- Desktop View: Table -->
            <div class="hidden md:block bg-surface-container-lowest rounded-[48px] shadow-2xl border border-outline-variant/10 overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-start border-collapse">
                  <thead>
                    <tr class="bg-surface-container text-[10px] font-black uppercase tracking-[0.2em] text-outline border-b border-outline-variant/10">
                      <th class="p-8 font-black">{{ 'admin.coupons.name' | translate }}</th>
                      <th class="p-8 font-black">{{ 'admin.coupons.discountValue' | translate }}</th>
                      <th class="p-8 font-black">{{ 'admin.coupons.minAmount' | translate }}</th>
                      <th class="p-8 font-black">{{ 'admin.coupons.expirationDate' | translate }}</th>
                      <th class="p-8 font-black">{{ 'admin.coupons.status' | translate }}</th>
                      <th class="p-8 font-black text-end">{{ 'admin.coupons.actions' | translate }}</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-outline-variant/10">
                    @for (coupon of coupons(); track coupon.id) {
                      <tr class="hover:bg-primary/[0.02] transition-colors group">
                        <td class="p-8">
                          <div class="font-headline font-black text-on-surface">{{ coupon.code }}</div>
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
                             {{ coupon.expirationDate ? (coupon.expirationDate | date:'dd MMM yyyy') : ('admin.coupons.permanent' | translate) }}
                          </div>
                        </td>
                        <td class="p-8">
                          <div class="flex items-center gap-2">
                             <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"
                                   [class]="coupon.isActive ? 'bg-success/10 text-success' : 'bg-outline-variant/10 text-outline-variant'">
                                <div class="w-1.5 h-1.5 rounded-full" [class]="coupon.isActive ? 'bg-success animate-pulse' : 'bg-outline-variant'"></div>
                                {{ coupon.isActive ? ('admin.coupons.operational' | translate) : ('admin.coupons.dormant' | translate) }}
                             </span>
                          </div>
                        </td>
                        <td class="p-8">
                          <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                             <a [routerLink]="['/' + currentLang + '/admin/coupons/edit', coupon.id]" 
                                class="w-10 h-10 rounded-xl hover:bg-surface-container transition-all flex items-center justify-center text-outline hover:text-primary group/edit"
                                title="{{ 'admin.coupons.edit' | translate }}">
                                <span class="material-symbols-outlined text-lg group-hover/edit:rotate-12 transition-transform">edit</span>
                             </a>
                             <a [routerLink]="['/' + currentLang + '/admin/coupons/assign', coupon.id]" 
                                class="w-10 h-10 rounded-xl hover:bg-surface-container transition-all flex items-center justify-center text-outline hover:text-tertiary group/link"
                                title="{{ 'admin.coupons.assignProducts' | translate }}">
                                <span class="material-symbols-outlined text-lg group-hover/link:scale-110 transition-transform">link</span>
                             </a>
                             <a [routerLink]="['/' + currentLang + '/admin/coupons/users', coupon.id]" 
                                class="w-10 h-10 rounded-xl hover:bg-surface-container transition-all flex items-center justify-center text-outline hover:text-primary group/users"
                                title="{{ 'admin.coupons.manageUsers' | translate }}">
                                <span class="material-symbols-outlined text-lg group-hover/users:scale-110 transition-transform">person_add</span>
                             </a>
                             <button (click)="deleteCoupon(coupon.id)" [disabled]="deletingId() === coupon.id"
                                     class="w-12 h-12 rounded-2xl bg-error/10 text-error hover:bg-error hover:text-on-error transition-all flex items-center justify-center shadow-sm disabled:opacity-50">
                               @if (deletingId() === coupon.id) {
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
            </div>

            <!-- Mobile View: Cards -->
            <div class="md:hidden space-y-6">
              @for (coupon of coupons(); track coupon.id) {
                <div class="bg-surface-container-lowest rounded-[32px] shadow-xl border border-outline-variant/10 overflow-hidden">
                  <div class="p-6 space-y-6">
                    <div class="flex justify-between items-start">
                      <div class="space-y-1">
                        <div class="font-headline font-black text-xl text-on-surface">{{ coupon.code }}</div>
                        <div class="text-[10px] font-black uppercase tracking-widest text-outline opacity-60">{{ coupon.couponDescription }}</div>
                      </div>
                      <span class="px-4 py-1.5 rounded-full font-headline font-black text-[9px] uppercase tracking-widest"
                            [ngClass]="getDiscountTypeClass(coupon.discountType)">
                        {{ formatDiscount(coupon) }}
                      </span>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <div class="space-y-1">
                        <p class="text-[8px] font-black uppercase tracking-widest text-outline">{{ 'admin.coupons.minAmount' | translate }}</p>
                        <p class="font-headline font-black text-on-surface">{{ coupon.minAmount | currency:'EGP':'symbol':'1.0-0':'en-EG' }}</p>
                      </div>
                      <div class="space-y-1">
                        <p class="text-[8px] font-black uppercase tracking-widest text-outline">{{ 'admin.coupons.status' | translate }}</p>
                        <div class="flex items-center gap-2">
                           <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5"
                                 [class]="coupon.isActive ? 'bg-success/10 text-success' : 'bg-outline-variant/10 text-outline-variant'">
                              <div class="w-1.5 h-1.5 rounded-full" [class]="coupon.isActive ? 'bg-success animate-pulse' : 'bg-outline-variant'"></div>
                              {{ coupon.isActive ? ('admin.coupons.operational' | translate) : ('admin.coupons.dormant' | translate) }}
                           </span>
                        </div>
                      </div>
                    </div>

                    <div class="pt-4 border-t border-outline-variant/10 flex justify-between items-center">
                       <div class="space-y-1">
                         <p class="text-[8px] font-black uppercase tracking-widest text-outline">{{ 'admin.coupons.expirationDate' | translate }}</p>
                         <p class="text-[9px] font-black uppercase tracking-widest text-outline-variant">
                           {{ coupon.expirationDate ? (coupon.expirationDate | date:'dd MMM yyyy') : ('admin.coupons.permanent' | translate) }}
                         </p>
                       </div>
                       <div class="flex items-center gap-2">
                          <button [routerLink]="['/' + currentLang + '/admin/coupons/users', coupon.id]"
                                  class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm"
                                  title="{{ 'admin.coupons.manageUsers' | translate }}">
                            <span class="material-symbols-outlined text-sm">person_add</span>
                          </button>
                          <button [routerLink]="['/' + currentLang + '/admin/coupons/assign', coupon.id]"
                                  class="w-10 h-10 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center shadow-sm"
                                  title="{{ 'admin.coupons.assignProducts' | translate }}">
                            <span class="material-symbols-outlined text-sm">link</span>
                          </button>
                          <button [routerLink]="['/' + currentLang + '/admin/coupons/edit', coupon.id]"
                                  class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm"
                                  title="{{ 'admin.coupons.editCoupon' | translate }}">
                            <span class="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button (click)="deleteCoupon(coupon.id)" [disabled]="deletingId() === coupon.id"
                                  class="w-10 h-10 rounded-xl bg-error/10 text-error flex items-center justify-center shadow-sm disabled:opacity-50">
                            @if (deletingId() === coupon.id) {
                              <span class="w-3 h-3 border-2 border-error/30 border-t-error rounded-full animate-spin"></span>
                            } @else {
                              <span class="material-symbols-outlined text-sm">delete</span>
                            }
                          </button>
                       </div>
                    </div>
                  </div>
                </div>
              }
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
  private translate = inject(TranslateService);

  coupons = signal<Coupon[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  deletingId = signal<string | null>(null);

  get currentLang(): string { return this.languageService.currentLanguage(); }
  ngOnInit() { this.loadCoupons(); }

  loadCoupons() {
    this.loading.set(true); this.error.set(null);
    this.couponService.getAll().subscribe({
      next: (res) => { 
        if (res.success && res.data) {
          this.coupons.set(res.data);
        } else {
          this.error.set(res.error?.message || 'Failed to sync coupons.');
        }
        this.loading.set(false); 
      },
      error: (err) => { this.error.set(err.error?.message || 'Failed to sync coupons.'); this.loading.set(false); }
    });
  }

  formatDiscount(coupon: Coupon): string {
    const suffix = coupon.discountType === DiscountType.Percentage ? this.translate.instant('admin.coupons.reduction') : this.translate.instant('admin.coupons.fixed');
    return coupon.discountType === DiscountType.Percentage ? `${coupon.discountValue}% ${suffix}` : `${coupon.discountValue} EGP ${suffix}`;
  }

  getDiscountTypeClass(type: DiscountType): string {
    return type === DiscountType.Percentage ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-tertiary/10 text-tertiary border border-tertiary/20';
  }

  deleteCoupon(id: string) {
    if (confirm(this.translate.instant('admin.coupons.deleteConfirm'))) {
      this.deletingId.set(id);
      this.couponService.delete(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.coupons.update(list => list.filter(c => c.id !== id));
          } else {
            this.error.set(res.error?.message || 'Decommission failure.');
          }
          this.deletingId.set(null);
        },
        error: (err) => { this.error.set(err.error?.message || 'Decommission failure.'); this.deletingId.set(null); }
      });
    }
  }
}

