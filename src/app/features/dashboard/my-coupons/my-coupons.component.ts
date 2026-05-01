import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CouponService } from '../../../core/services/coupon.service';
import { LanguageService } from '../../../core/services/language.service';
import { UserCouponDto, DiscountType } from '../../../core/models/coupon.model';

@Component({
  selector: 'app-my-coupons',
  standalone: true,
  imports: [CommonModule, TranslateModule, TranslatePipe],
  template: `
    <main class="min-h-screen bg-surface pb-24" [dir]="isRtl() ? 'rtl' : 'ltr'">
      <header class="bg-surface-container-low pt-24 pb-16 border-b border-outline-variant/30 relative overflow-hidden">
        <div class="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_bottom_left,_var(--primary)_0%,_transparent_70%)]"></div>
        <div class="max-w-7xl mx-auto px-6 relative z-10">
           <div class="text-start">
              <h1 class="font-headline text-5xl font-black tracking-tighter text-on-surface mb-2">{{ 'dashboard.myCoupons' | translate }}</h1>
              <p class="font-body text-on-surface-variant opacity-70">{{ 'dashboard.myCouponsSubtitle' | translate }}</p>
           </div>
        </div>
      </header>

      <section class="max-w-7xl mx-auto px-6 py-16">
        @if (loading()) {
          <div class="flex flex-col items-center justify-center py-40 gap-4">
             <div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
             <p class="font-headline font-black text-xs uppercase tracking-widest text-outline">{{ 'dashboard.syncRewards' | translate }}</p>
          </div>
        } @else if (coupons().length === 0) {
          <div class="text-center py-40 bg-surface-container-low/30 rounded-[48px] border-2 border-dashed border-outline-variant/20">
             <div class="w-32 h-32 rounded-[40px] bg-surface-container-high flex items-center justify-center text-outline-variant mx-auto mb-8">
                <span class="material-symbols-outlined text-6xl opacity-30">confirmation_number</span>
             </div>
             <h3 class="font-headline text-2xl font-black text-on-surface mb-2">{{ 'dashboard.noCoupons' | translate }}</h3>
             <p class="font-body text-on-surface-variant opacity-60">{{ 'dashboard.noCouponsSubtitle' | translate }}</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up">
            @for (uc of coupons(); track uc.id) {
              <div class="relative group bg-surface-container-lowest rounded-[32px] border border-outline-variant/10 overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                <!-- Coupon Header -->
                <div class="p-8 bg-primary/5 border-b border-outline-variant/5 relative overflow-hidden">
                   <div class="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
                   <div class="flex justify-between items-start mb-6">
                      <div class="px-4 py-2 bg-white rounded-xl shadow-sm border border-outline-variant/10">
                         <span class="font-headline font-black text-primary tracking-wider">{{ uc.coupon.code }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                         <div class="w-2 h-2 rounded-full" [class]="uc.canUse ? 'bg-success animate-pulse' : 'bg-outline-variant'"></div>
                         <span class="text-[8px] font-black uppercase tracking-widest" [class]="uc.canUse ? 'text-success' : 'text-outline-variant'">
                           {{ uc.canUse ? ('dashboard.ready' | translate) : ('dashboard.exhausted' | translate) }}
                         </span>
                      </div>
                   </div>
                   <div class="space-y-1">
                      <p class="text-[10px] font-black uppercase tracking-[0.2em] text-outline opacity-60">{{ 'dashboard.benefitTier' | translate }}</p>
                      <h4 class="font-headline font-black text-2xl text-on-surface">
                        {{ formatDiscount(uc.coupon) }}
                      </h4>
                   </div>
                </div>

                <!-- Coupon Details -->
                <div class="p-8 space-y-6">
                   <p class="text-xs font-medium text-on-surface-variant leading-relaxed">{{ uc.coupon.couponDescription }}</p>
                   
                   <div class="grid grid-cols-2 gap-4">
                      <div class="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/5">
                         <p class="text-[8px] font-black uppercase tracking-widest text-outline mb-1">{{ 'dashboard.minOrder' | translate }}</p>
                         <p class="font-headline font-black text-sm text-on-surface">{{ uc.coupon.minAmount | currency:'EGP':'symbol':'1.0-0':'en-EG' }}</p>
                      </div>
                      <div class="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/5">
                         <p class="text-[8px] font-black uppercase tracking-widest text-outline mb-1">{{ 'dashboard.usedCount' | translate }}</p>
                         <p class="font-headline font-black text-sm text-on-surface">{{ uc.userUsageCount }} {{ 'dashboard.times' | translate }}</p>
                      </div>
                   </div>

                   <div class="flex items-center justify-between pt-4 border-t border-outline-variant/5">
                      <div class="flex items-center gap-2">
                         <span class="material-symbols-outlined text-sm text-outline-variant">event</span>
                         <span class="text-[9px] font-black uppercase tracking-widest text-outline-variant">
                           {{ uc.coupon.expirationDate ? (uc.coupon.expirationDate | date:'dd MMM yyyy') : ('dashboard.noExpiry' | translate) }}
                         </span>
                      </div>
                      <button (click)="copyCode(uc.coupon.code)" class="flex items-center gap-2 text-primary hover:scale-105 active:scale-95 transition-all">
                         <span class="material-symbols-outlined text-sm">content_copy</span>
                         <span class="text-[9px] font-black uppercase tracking-widest">{{ 'dashboard.copyCode' | translate }}</span>
                      </button>
                   </div>
                </div>
                
                <!-- Decorative Cutouts -->
                <div class="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 bg-surface rounded-r-full border-y border-r border-outline-variant/10"></div>
                <div class="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-4 h-8 bg-surface rounded-l-full border-y border-l border-outline-variant/10"></div>
              </div>
            }
          </div>
        }
      </section>
    </main>
  `,
  styles: []
})
export class MyCouponsComponent implements OnInit {
  private couponService = inject(CouponService);
  private languageService = inject(LanguageService);
  private translate = inject(TranslateService);

  coupons = signal<UserCouponDto[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  isRtl = () => this.languageService.currentLanguage() === 'ar';

  ngOnInit() {
    this.loadMyCoupons();
  }

  loadMyCoupons() {
    this.loading.set(true);
    this.couponService.getMyCoupons().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.coupons.set(res.data);
        } else {
          this.error.set(res.error?.message || 'Failed to load coupons.');
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Sync failure.');
        this.loading.set(false);
      }
    });
  }

  formatDiscount(coupon: any): string {
    const suffix = coupon.discountType === DiscountType.Percentage ? this.translate.instant('admin.coupons.reduction') : this.translate.instant('admin.coupons.fixed');
    return coupon.discountType === DiscountType.Percentage 
      ? `${coupon.discountValue}% ${suffix}` 
      : `${coupon.discountValue} EGP ${suffix}`;
  }

  copyCode(code: string) {
    navigator.clipboard.writeText(code);
    // Could add a toast here
  }
}
