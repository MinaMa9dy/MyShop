import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { CouponService } from '../../../../core/services/coupon.service';
import { LanguageService } from '../../../../core/services/language.service';
import { CreateCouponDto, UpdateCouponDto, DiscountType } from '../../../../core/models/coupon.model';

@Component({
  selector: 'app-coupon-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  template: `
    <main class="min-h-screen bg-surface pb-24" [dir]="currentLang === 'ar' ? 'rtl' : 'ltr'">
      <!-- Hero Header -->
      <header class="bg-surface-container-low pt-24 pb-16 border-b border-outline-variant/30 relative overflow-hidden">
        <div class="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_top_right,_var(--primary)_0%,_transparent_70%)]"></div>
        <div class="max-w-3xl mx-auto px-6 relative z-10 text-center">
           <div class="w-16 h-16 bg-white/50 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-white/20">
              <span class="material-symbols-outlined text-3xl text-primary">confirmation_number</span>
           </div>
           <h1 class="font-headline text-5xl font-black tracking-tighter text-on-surface mb-2">
             {{ (isEditMode() ? 'admin.coupons.editCoupon' : 'admin.coupons.addCoupon') | translate }}
           </h1>
           <p class="font-body text-on-surface-variant opacity-70">Define the incentive parameters and operational scope.</p>
        </div>
      </header>

      <div class="max-w-3xl mx-auto px-6 py-16 animate-slide-up">
        <div class="bg-surface-container-lowest rounded-[48px] shadow-2xl border border-outline-variant/10 overflow-hidden">
          @if (loading()) {
            <div class="flex flex-col items-center justify-center py-40 gap-4">
               <div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
               <p class="font-headline font-black text-xs uppercase tracking-widest text-outline">Synchronizing Sequence</p>
            </div>
          } @else {
            <form [formGroup]="couponForm" (ngSubmit)="onSubmit()" class="p-10 md:p-16 space-y-10">
              
              <!-- Core Metadata -->
              <section class="space-y-8">
                <div class="flex items-center gap-4 border-b border-outline-variant/10 pb-4">
                  <span class="material-symbols-outlined text-primary">label</span>
                  <h3 class="font-headline font-black text-xl text-on-surface">Incentive Metadata</h3>
                </div>

                <div class="space-y-3">
                  <label class="text-[10px] font-black uppercase tracking-widest text-outline px-2">{{ 'admin.coupons.name' | translate }} *</label>
                  <input type="text" formControlName="couponName" [placeholder]="'admin.coupons.namePlaceholder' | translate"
                         class="w-full bg-surface-container-low px-6 py-5 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-body text-sm text-on-surface transition-all">
                  @if (couponForm.get('couponName')?.invalid && couponForm.get('couponName')?.touched) {
                    <p class="text-[10px] font-black text-error uppercase px-2">Identifier Required</p>
                  }
                </div>

                <div class="space-y-3">
                  <label class="text-[10px] font-black uppercase tracking-widest text-outline px-2">{{ 'admin.coupons.description' | translate }}</label>
                  <textarea formControlName="couponDescription" rows="3" [placeholder]="'admin.coupons.descriptionPlaceholder' | translate"
                            class="w-full bg-surface-container-low px-6 py-5 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-body text-sm text-on-surface transition-all resize-none"></textarea>
                </div>
              </section>

              <!-- Parametrics -->
              <section class="space-y-8">
                <div class="flex items-center gap-4 border-b border-outline-variant/10 pb-4">
                  <span class="material-symbols-outlined text-primary">settings_input_component</span>
                  <h3 class="font-headline font-black text-xl text-on-surface">Operational Parameters</h3>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div class="space-y-3">
                    <label class="text-[10px] font-black uppercase tracking-widest text-outline px-2 text-start">{{ 'admin.coupons.discountType' | translate }} *</label>
                    <div class="relative group">
                      <select formControlName="discountType"
                              class="w-full bg-surface-container-low px-6 py-5 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-body text-sm text-on-surface transition-all appearance-none cursor-pointer">
                        <option [ngValue]="1">{{ 'admin.coupons.percentage' | translate }} (%)</option>
                        <option [ngValue]="2">{{ 'admin.coupons.fixedAmount' | translate }} (EGP)</option>
                      </select>
                      <span class="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:rotate-180 transition-transform">expand_more</span>
                    </div>
                  </div>

                  <div class="space-y-3 text-start">
                    <label class="text-[10px] font-black uppercase tracking-widest text-outline px-2">{{ 'admin.coupons.discountValue' | translate }} *</label>
                    <input type="number" formControlName="discountValue" step="0.01" min="0" [placeholder]="'admin.coupons.discountValuePlaceholder' | translate"
                           class="w-full bg-surface-container-low px-6 py-5 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-headline font-black text-xl text-primary transition-all">
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div class="space-y-3 text-start">
                    <label class="text-[10px] font-black uppercase tracking-widest text-outline px-2">{{ 'admin.coupons.minAmount' | translate }} (EGP) *</label>
                    <input type="number" formControlName="minAmount" step="0.01" min="0" [placeholder]="'admin.coupons.minAmountPlaceholder' | translate"
                           class="w-full bg-surface-container-low px-6 py-5 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-headline font-black text-xl text-on-surface transition-all">
                  </div>

                  <div class="space-y-3 text-start">
                    <label class="text-[10px] font-black uppercase tracking-widest text-outline px-2">{{ 'admin.coupons.expirationDate' | translate }}</label>
                    <input type="datetime-local" formControlName="expirationDate"
                           class="w-full bg-surface-container-low px-6 py-5 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-body text-sm text-on-surface transition-all">
                  </div>
                </div>

                <div class="py-4 px-6 bg-surface rounded-2xl border border-outline-variant/10">
                   <label class="flex items-center gap-4 cursor-pointer group">
                      <input type="checkbox" formControlName="isActive" class="hidden peer">
                      <div class="w-6 h-6 border-2 border-outline-variant peer-checked:border-primary peer-checked:bg-primary transition-all rounded-lg flex items-center justify-center">
                         <span class="material-symbols-outlined text-white text-sm scale-0 peer-checked:scale-100 transition-transform">check</span>
                      </div>
                      <span class="text-sm font-bold text-on-surface-variant group-hover:text-primary transition-colors text-start">{{ 'admin.coupons.isActive' | translate }}</span>
                   </label>
                </div>
              </section>

              @if (error()) {
                <div class="p-6 bg-error/10 text-error rounded-3xl border border-error/20 flex items-start gap-4">
                   <span class="material-symbols-outlined">report</span>
                   <p class="text-xs font-black uppercase tracking-widest">{{ error() }}</p>
                </div>
              }

              <footer class="pt-8 border-t border-outline-variant/10 flex flex-col sm:flex-row gap-6">
                <button type="submit" [disabled]="couponForm.invalid || submitting()"
                        class="flex-[2] py-6 bg-on-surface text-surface rounded-[32px] font-headline font-bold text-lg shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 group">
                   @if (submitting()) {
                     <span class="w-6 h-6 border-4 border-surface/30 border-t-white rounded-full animate-spin"></span>
                   } @else {
                     <span>Establish Incentive</span>
                     <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">local_activity</span>
                   }
                </button>
                <a [routerLink]="['/' + currentLang + '/admin/coupons']"
                   class="flex-1 py-6 bg-surface-container rounded-[32px] font-headline font-bold text-xs uppercase tracking-widest text-outline hover:bg-surface-container-high transition-all text-center flex items-center justify-center">
                   Cancel
                </a>
              </footer>
            </form>
          }
        </div>
      </div>
    </main>
  `,
  styles: []
})
export class CouponFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private couponService = inject(CouponService);
  private languageService = inject(LanguageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  couponCode = signal<string | null>(null);
  isEditMode = signal(false);
  loading = signal(false);
  submitting = signal(false);
  error = signal<string | null>(null);

  couponForm: FormGroup = this.fb.group({
    discountType: [1, [Validators.required]],
    discountValue: [0, [Validators.required, Validators.min(0)]],
    couponName: ['', [Validators.required]],
    couponDescription: [''],
    minAmount: [0, [Validators.required, Validators.min(0)]],
    expirationDate: [''],
    isActive: [true]
  });

  get currentLang(): string { return this.languageService.currentLanguage(); }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) { this.couponCode.set(id); this.isEditMode.set(true); this.loadCoupon(id); }
    });

    this.couponForm.get('discountType')?.valueChanges.subscribe(type => {
      if (type === 1) this.couponForm.get('discountValue')?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
      else this.couponForm.get('discountValue')?.setValidators([Validators.required, Validators.min(0)]);
      this.couponForm.get('discountValue')?.updateValueAndValidity();
    });
  }

  loadCoupon(id: string) {
    this.loading.set(true);
    this.couponService.getById(id).subscribe({
      next: (coupon) => {
        let formattedDate = coupon.expirationDate ? coupon.expirationDate.toString().slice(0, 16) : '';
        this.couponForm.patchValue({ ...coupon, expirationDate: formattedDate });
        this.loading.set(false);
      },
      error: (err) => { this.error.set(err.error?.message || 'Load failed.'); this.loading.set(false); }
    });
  }

  onSubmit() {
    if (this.couponForm.invalid) { this.couponForm.markAllAsTouched(); return; }
    this.submitting.set(true); this.error.set(null);
    const submissionData = { ...this.couponForm.value, expirationDate: this.couponForm.value.expirationDate || null };

    const api = this.isEditMode() && this.couponCode() ? this.couponService.update(this.couponCode()!, submissionData) : this.couponService.create(submissionData);
    api.subscribe({
      next: () => this.router.navigate(['/', this.currentLang, 'admin', 'coupons']),
      error: (err) => { this.submitting.set(false); this.error.set(err.error?.message || 'Submission failed.'); }
    });
  }
}
