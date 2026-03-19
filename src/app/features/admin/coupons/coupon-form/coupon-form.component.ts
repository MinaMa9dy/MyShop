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
    <div class="coupon-form-page py-12 bg-gray-50 min-h-screen">
      <div class="container mx-auto px-4 max-w-2xl">
        <!-- Back Link -->
        <a [routerLink]="['/' + currentLang + '/admin/coupons']" 
           class="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-8 group transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Coupons
        </a>

        <div class="card p-8 shadow-xl border-0 rounded-2xl bg-white">
          <div class="text-center mb-10">
            <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm">
              🎫
            </div>
            <h1 class="text-3xl font-bold text-gray-800 mb-2">
              {{ (isEditMode() ? 'admin.coupons.editCoupon' : 'admin.coupons.addCoupon') | translate }}
            </h1>
          </div>

          <!-- Alert Messages -->
          @if (error()) {
            <div class="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg flex items-start animate-fade-in">
              <span class="mr-2">⚠️</span>
              <span>{{ error() }}</span>
            </div>
          }

          @if (loading()) {
            <div class="flex justify-center py-12">
              <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          } @else {
            <form [formGroup]="couponForm" (ngSubmit)="onSubmit()" class="space-y-6">
              
              <!-- Name -->
              <div class="form-group flex flex-col">
                <label class="text-sm font-semibold text-gray-700 mb-2">{{ 'admin.coupons.name' | translate }} *</label>
                <input type="text" formControlName="couponName" placeholder="{{ 'admin.coupons.namePlaceholder' | translate }}"
                  class="px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                  [class.border-red-500]="couponForm.get('couponName')?.invalid && couponForm.get('couponName')?.touched">
              </div>

              <!-- Description -->
              <div class="form-group flex flex-col">
                <label class="text-sm font-semibold text-gray-700 mb-2">{{ 'admin.coupons.description' | translate }}</label>
                <textarea formControlName="couponDescription" rows="3" placeholder="{{ 'admin.coupons.descriptionPlaceholder' | translate }}"
                  class="px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none resize-none"></textarea>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Discount Type -->
                <div class="form-group flex flex-col">
                  <label class="text-sm font-semibold text-gray-700 mb-2">{{ 'admin.coupons.discountType' | translate }} *</label>
                  <select formControlName="discountType"
                    class="px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none">
                    <option [ngValue]="1">{{ 'admin.coupons.percentage' | translate }}</option>
                    <option [ngValue]="2">{{ 'admin.coupons.fixedAmount' | translate }}</option>
                  </select>
                </div>

                <!-- Discount Value -->
                <div class="form-group flex flex-col">
                  <label class="text-sm font-semibold text-gray-700 mb-2">{{ 'admin.coupons.discountValue' | translate }} *</label>
                  <input type="number" formControlName="discountValue" step="0.01" min="0" placeholder="{{ 'admin.coupons.discountValuePlaceholder' | translate }}"
                    class="px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                    [class.border-red-500]="couponForm.get('discountValue')?.invalid && couponForm.get('discountValue')?.touched">
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Minimum Amount -->
                <div class="form-group flex flex-col">
                  <label class="text-sm font-semibold text-gray-700 mb-2">{{ 'admin.coupons.minAmount' | translate }} *</label>
                  <input type="number" formControlName="minAmount" step="0.01" min="0" placeholder="{{ 'admin.coupons.minAmountPlaceholder' | translate }}"
                    class="px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none">
                </div>

                <!-- Expiration Date -->
                <div class="form-group flex flex-col">
                  <label class="text-sm font-semibold text-gray-700 mb-2">{{ 'admin.coupons.expirationDate' | translate }}</label>
                  <input type="datetime-local" formControlName="expirationDate"
                    class="px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none">
                </div>
              </div>

              <!-- Is Active -->
              <div class="form-group flex items-center mt-4">
                <input type="checkbox" id="isActive" formControlName="isActive" class="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500">
                <label for="isActive" class="ml-2 text-sm font-semibold text-gray-700">{{ 'admin.coupons.isActive' | translate }}</label>
              </div>

              <!-- Submit Buttons -->
              <div class="flex gap-4 pt-6">
                <button type="button" [routerLink]="['/' + currentLang + '/admin/coupons']"
                  class="flex-1 py-4 px-6 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all active:scale-95">
                  Cancel
                </button>
                <button type="submit" [disabled]="couponForm.invalid || submitting()"
                  class="flex-1 py-4 px-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center">
                  @if (submitting()) {
                    <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {{ 'admin.coupons.saving' | translate }}
                  } @else {
                    {{ 'admin.coupons.save' | translate }}
                  }
                </button>
              </div>
            </form>
          }
        </div>
      </div>
    </div>
  `
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

  get currentLang(): string {
    return this.languageService.currentLanguage();
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.couponCode.set(id);
        this.isEditMode.set(true);
        this.loadCoupon(id);
      }
    });

    // Handle discount value validation based on discount type
    this.couponForm.get('discountType')?.valueChanges.subscribe(type => {
      if (type === 1) { // Percentage
        this.couponForm.get('discountValue')?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
      } else {
        this.couponForm.get('discountValue')?.setValidators([Validators.required, Validators.min(0)]);
      }
      this.couponForm.get('discountValue')?.updateValueAndValidity();
    });
  }

  loadCoupon(id: string) {
    this.loading.set(true);
    this.couponService.getById(id).subscribe({
      next: (coupon) => {
        // Format datetime-local string (YYYY-MM-DDThh:mm)
        let formattedDate = '';
        if (coupon.expirationDate) {
          const date = new Date(coupon.expirationDate);
          formattedDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        }

        this.couponForm.patchValue({
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          couponName: coupon.couponName,
          couponDescription: coupon.couponDescription,
          minAmount: coupon.minAmount,
          expirationDate: formattedDate,
          isActive: coupon.isActive
        });
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading coupon', err);
        this.error.set(err.error?.message || 'Failed to load coupon details');
        this.loading.set(false);
      }
    });
  }

  onSubmit() {
    if (this.couponForm.invalid) {
      this.couponForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const formValue = this.couponForm.value;
    const submissionData = {
      ...formValue,
      expirationDate: formValue.expirationDate ? new Date(formValue.expirationDate).toISOString() : null
    };

    if (this.isEditMode() && this.couponCode()) {
      const updateDto: UpdateCouponDto = submissionData;
      this.couponService.update(this.couponCode()!, updateDto).subscribe({
        next: () => {
          this.router.navigate(['/', this.currentLang, 'admin', 'coupons']);
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err.error?.message || 'Failed to update coupon');
        }
      });
    } else {
      const createDto: CreateCouponDto = submissionData;
      this.couponService.create(createDto).subscribe({
        next: () => {
          this.router.navigate(['/', this.currentLang, 'admin', 'coupons']);
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err.error?.message || 'Failed to create coupon');
        }
      });
    }
  }
}
