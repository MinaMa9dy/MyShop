import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { OrderService } from '../../../core/services/order.service';
import { CartService } from '../../../core/services/cart.service';
import { LanguageService } from '../../../core/services/language.service';
import { TokenService } from '../../../core/services/token.service';
import { PhotoService } from '../../../core/services/photo.service';
import { CouponService } from '../../../core/services/coupon.service';
import { ProductService } from '../../../core/services/product.service';
import { extractErrorMessage } from '../../../core/models/result.model';
import { AddOrderDto, CityOption } from '../../../core/models/order.model';

@Component({
  selector: 'app-order-confirm',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <main class="min-h-screen bg-[#FAF7F2] pb-32 font-body" [dir]="currentLang === 'ar' ? 'rtl' : 'ltr'">
      
      <!-- Top Header -->
      <header class="flex items-center justify-between px-4 py-4 sticky top-0 bg-[#FAF7F2] z-40">
        <button (click)="goBack()" class="w-10 h-10 flex items-center justify-center text-[#7B1818] hover:bg-[#7B1818]/10 rounded-full transition-colors">
          <span class="material-symbols-outlined rtl:rotate-180">arrow_back_ios_new</span>
        </button>
        <h1 class="font-headline font-black text-xl text-on-surface">
          @if (currentStep() === 1) { تفاصيل الشحن }
          @else if (currentStep() === 2) { طريقة الدفع }
          @else { مراجعة الطلب }
        </h1>
        <div class="w-10 h-10 rounded-full bg-[#F5EFE6] flex items-center justify-center text-[#7B1818]">
          <span class="material-symbols-outlined text-xl">
            @if (currentStep() === 1) { local_shipping }
            @else if (currentStep() === 2) { payments }
            @else { checklist }
          </span>
        </div>
      </header>

      <div class="max-w-3xl mx-auto px-4">
        <!-- Stepper -->
        <div class="flex items-center justify-between px-6 py-6 relative mb-4">
          <!-- Lines -->
          <div class="absolute top-1/2 left-10 right-10 h-[2px] bg-[#E8E0D5] -z-10 -translate-y-1/2"></div>
          <div class="absolute top-1/2 left-10 right-10 h-[2px] bg-[#7B1818] -z-10 -translate-y-1/2 transition-all duration-500"
               [style.transform]="'scaleX(' + (currentStep() === 1 ? 0 : currentStep() === 2 ? 0.5 : 1) + ')'"
               [style.transform-origin]="currentLang === 'ar' ? 'right' : 'left'"></div>
          
          <!-- Step 1 -->
          <div class="flex flex-col items-center gap-2 bg-[#FAF7F2] px-2 cursor-pointer" (click)="currentStep.set(1)">
            <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                 [class]="currentStep() >= 1 ? 'bg-[#7B1818] text-white shadow-lg' : 'bg-[#E8E0D5] text-[#8C7355]'">
              @if (currentStep() > 1) { <span class="material-symbols-outlined text-sm">done</span> } @else { 1 }
            </div>
            <span class="text-[9px] font-bold transition-colors" [class.text-[#7B1818]]="currentStep() >= 1" [class.text-[#8C7355]]="currentStep() < 1">تفاصيل الشحن</span>
          </div>

          <!-- Step 2 -->
          <div class="flex flex-col items-center gap-2 bg-[#FAF7F2] px-2 cursor-pointer" (click)="isFormValid() ? currentStep.set(2) : null">
            <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                 [class]="currentStep() >= 2 ? 'bg-[#7B1818] text-white shadow-lg' : 'bg-[#E8E0D5] text-[#8C7355]'">
              @if (currentStep() > 2) { <span class="material-symbols-outlined text-sm">done</span> } @else { 2 }
            </div>
            <span class="text-[9px] font-bold transition-colors" [class.text-[#7B1818]]="currentStep() >= 2" [class.text-[#8C7355]]="currentStep() < 2">طريقة الدفع</span>
          </div>

          <!-- Step 3 -->
          <div class="flex flex-col items-center gap-2 bg-[#FAF7F2] px-2 cursor-pointer" (click)="currentStep() === 3 ? currentStep.set(3) : null">
            <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                 [class]="currentStep() >= 3 ? 'bg-[#7B1818] text-white shadow-lg' : 'bg-[#E8E0D5] text-[#8C7355]'">
              3
            </div>
            <span class="text-[9px] font-bold transition-colors" [class.text-[#7B1818]]="currentStep() >= 3" [class.text-[#8C7355]]="currentStep() < 3">مراجعة الطلب</span>
          </div>
        </div>

        <!-- Order Summary Accordion (Visible on all steps) -->
        <div class="bg-[#F9F7F4] rounded-3xl border border-[#E8E0D5] overflow-hidden shadow-sm mb-6">
          <button class="w-full flex items-center justify-between p-5" (click)="toggleSummary()">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-[#7B1818]/10 flex items-center justify-center text-[#7B1818]">
                <span class="material-symbols-outlined text-sm">shopping_bag</span>
              </div>
              <span class="font-headline font-black text-[#7B1818] text-lg">محتويات الطلب</span>
            </div>
            <span class="material-symbols-outlined text-[#7B1818] transition-transform" [class.rotate-180]="showSummary">expand_less</span>
          </button>
          
          @if (showSummary) {
            <div class="px-5 pb-5 space-y-3">
              @for (item of cartItems(); track item.productVariantId) {
                <div class="flex items-center gap-4 bg-white p-3 rounded-2xl border border-[#E8E0D5]/50 shadow-sm">
                  <img [src]="photoService.getPhotoUrlFromPath(item.productImage || '')" class="w-14 h-14 object-contain rounded-xl bg-[#F5EFE6] p-1 border border-[#E8E0D5]" (error)="handleImageError($event)">
                  <div class="flex-1 text-start">
                    <h4 class="font-bold text-xs text-on-surface mb-0.5">{{ item.productName }}</h4>
                    <p class="text-[9px] text-outline">عدد {{ item.quantity }} × {{ getItemDiscountedPrice(item) | currency:'EGP':'symbol':'1.0-0':'en-EG' }}</p>
                  </div>
                  <div class="font-black text-[#7B1818] text-xs">
                    {{ getItemSubtotal(item) | currency:'EGP':'symbol':'1.0-0':'en-EG' }}
                  </div>
                </div>
              }
            </div>
          }
          
          <div class="px-5 py-4 space-y-2 border-t border-[#E8E0D5] bg-white/50 text-start">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold text-outline">الإجمالي الفرعي</span>
              <span class="text-xs font-bold text-on-surface">{{ originalTotalPrice() | currency:'EGP':'symbol':'1.0-0':'en-EG' }}</span>
            </div>
            
            @if (discountAmount() > 0) {
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                  <span class="text-[11px] font-bold text-error">قيمة الخصم</span>
                  <span class="text-[9px] bg-error/10 text-error px-1.5 py-0.5 rounded-full font-black">كوبون</span>
                </div>
                <span class="text-xs font-black text-error">-{{ discountAmount() | currency:'EGP':'symbol':'1.0-0':'en-EG' }}</span>
              </div>
            }

            <div class="flex items-center justify-between pt-2 mt-2 border-t border-[#E8E0D5]/50">
              <span class="font-headline font-black text-[#7B1818] text-sm">الإجمالي النهائي</span>
              <span class="font-headline font-black text-[#7B1818] text-xl">{{ totalPrice() | currency:'EGP':'symbol':'1.0-0':'en-EG' }}</span>
            </div>
          </div>
        </div>

        @switch (currentStep()) {
          @case (1) {
            <!-- Step 1: Shipping Details -->
            <div class="animate-slide-up">
              <div class="bg-white rounded-3xl border border-[#E8E0D5] p-6 shadow-sm mb-6">
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-9 h-9 rounded-full bg-[#F5EFE6] flex items-center justify-center text-[#7B1818]">
                    <span class="material-symbols-outlined text-base">location_on</span>
                  </div>
                  <h3 class="font-headline font-black text-[#7B1818] text-lg">أين نرسل طلبك؟</h3>
                </div>
                
                <form class="space-y-5">
                  <div class="space-y-2 text-start">
                    <label class="text-[11px] font-bold text-[#8C7355] px-1">المدينة</label>
                    <div class="relative">
                      <select [(ngModel)]="selectedCity" name="city" required class="w-full bg-[#F9F7F4] px-4 py-4 rounded-2xl border border-[#E8E0D5] outline-none font-body text-sm text-on-surface appearance-none focus:border-[#7B1818]/30 transition-colors">
                        <option value="" disabled>اختر مدينتك</option>
                        @for (city of cities(); track city) {
                          <option [value]="city">{{ city }}</option>
                        }
                      </select>
                      <span class="material-symbols-outlined absolute rtl:left-4 ltr:right-4 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">expand_more</span>
                    </div>
                  </div>
                  
                  <div class="space-y-2 text-start">
                    <label class="text-[11px] font-bold text-[#8C7355] px-1">رقم الجوال</label>
                    <input type="tel" [(ngModel)]="phoneNumber" name="phoneNumber" required placeholder="01xxxxxxxxx" class="w-full bg-[#F9F7F4] px-4 py-4 rounded-2xl border border-[#E8E0D5] outline-none font-body text-sm text-on-surface placeholder:text-outline-variant focus:border-[#7B1818]/30 transition-colors">
                  </div>
                  
                  <div class="space-y-2 text-start">
                    <label class="text-[11px] font-bold text-[#8C7355] px-1">العنوان بالتفصيل</label>
                    <input type="text" [(ngModel)]="street" name="street" required placeholder="اسم الشارع، رقم العمارة..." class="w-full bg-[#F9F7F4] px-4 py-4 rounded-2xl border border-[#E8E0D5] outline-none font-body text-sm text-on-surface placeholder:text-outline-variant focus:border-[#7B1818]/30 transition-colors">
                  </div>
                  
                  <div class="space-y-2 text-start">
                    <label class="text-[11px] font-bold text-[#8C7355] px-1">ملاحظات (اختياري)</label>
                    <textarea [(ngModel)]="comment" name="comment" rows="2" placeholder="أضف أي تفاصيل تساعد المندوب..." class="w-full bg-[#F9F7F4] px-4 py-4 rounded-2xl border border-[#E8E0D5] outline-none font-body text-sm text-on-surface placeholder:text-outline-variant resize-none focus:border-[#7B1818]/30 transition-colors"></textarea>
                  </div>
                </form>
              </div>

              <!-- Fast Coupon Entry in Step 1 -->
              <div class="bg-[#F9F7F4] rounded-3xl border border-[#E8E0D5] p-5 shadow-sm">
                <div class="flex items-center gap-2 mb-4">
                  <span class="material-symbols-outlined text-[#7B1818] text-sm">confirmation_number</span>
                  <h3 class="font-headline font-black text-[#7B1818] text-xs">هل لديك كوبون خصم؟</h3>
                </div>
                @if (appliedCoupon()) {
                  <div class="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-[#E8E0D5]">
                    <span class="font-black text-[#7B1818] text-xs">{{ appliedCoupon()?.coupon?.code }}</span>
                    <button (click)="removeCoupon()" class="text-error font-bold text-[10px]">إلغاء</button>
                  </div>
                } @else {
                  <div class="flex gap-2">
                    <input type="text" [(ngModel)]="couponInput" placeholder="أدخل الكود" class="flex-1 bg-white px-4 py-3 rounded-xl border border-[#E8E0D5] outline-none text-xs">
                    <button (click)="applyCoupon()" class="bg-[#7B1818] text-white px-4 rounded-xl text-xs font-bold">تطبيق</button>
                  </div>
                }
              </div>
            </div>
          }

          @case (2) {
            <!-- Step 2: Payment Method -->
            <div class="animate-slide-up">
              <div class="bg-white rounded-3xl border border-[#E8E0D5] p-6 shadow-sm">
                <div class="flex items-center gap-3 mb-8">
                  <div class="w-9 h-9 rounded-full bg-[#F5EFE6] flex items-center justify-center text-[#7B1818]">
                    <span class="material-symbols-outlined text-base">payments</span>
                  </div>
                  <h3 class="font-headline font-black text-[#7B1818] text-lg">اختر طريقة الدفع</h3>
                </div>

                <div class="space-y-4">
                  <!-- Cash on Delivery (Active) -->
                  <label class="flex items-center gap-4 p-5 rounded-2xl border-2 border-[#7B1818] bg-[#7B1818]/5 cursor-pointer transition-all">
                    <input type="radio" name="payment" [value]="'cod'" [checked]="selectedPayment() === 'cod'" class="hidden">
                    <div class="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#7B1818] shadow-sm">
                      <span class="material-symbols-outlined text-2xl">local_shipping</span>
                    </div>
                    <div class="flex-1 text-start">
                      <p class="font-black text-[#7B1818] text-sm">الدفع عند الاستلام</p>
                      <p class="text-[10px] text-outline">ادفع كاش عند وصول الطلب لباب بيتك</p>
                    </div>
                    <div class="w-5 h-5 rounded-full border-4 border-[#7B1818] bg-white"></div>
                  </label>

                  <!-- Disabled Options (Future) -->
                  <div class="flex items-center gap-4 p-5 rounded-2xl border border-[#E8E0D5] bg-surface-container-low opacity-60 grayscale cursor-not-allowed">
                    <div class="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-outline shadow-sm">
                      <span class="material-symbols-outlined text-2xl">credit_card</span>
                    </div>
                    <div class="flex-1 text-start">
                      <p class="font-bold text-outline text-sm">بطاقة ائتمان (قريباً)</p>
                      <p class="text-[10px] text-outline opacity-70">الدفع عبر الفيزا أو الماستركارد</p>
                    </div>
                  </div>

                  <div class="flex items-center gap-4 p-5 rounded-2xl border border-[#E8E0D5] bg-surface-container-low opacity-60 grayscale cursor-not-allowed">
                    <div class="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-outline shadow-sm">
                      <span class="material-symbols-outlined text-2xl">account_balance_wallet</span>
                    </div>
                    <div class="flex-1 text-start">
                      <p class="font-bold text-outline text-sm">محفظة إلكترونية (قريباً)</p>
                      <p class="text-[10px] text-outline opacity-70">فودافون كاش، فوري، وغيرهم</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }

          @case (3) {
            <!-- Step 3: Review Order -->
            <div class="animate-slide-up pb-4">
              <!-- Confirmation Details Cards -->
              <div class="grid grid-cols-1 gap-4">
                <div class="bg-white p-5 rounded-3xl border border-[#E8E0D5] shadow-sm text-start">
                  <div class="flex items-center gap-2 mb-3 text-[#7B1818]">
                    <span class="material-symbols-outlined text-sm">local_shipping</span>
                    <span class="text-[10px] font-black uppercase">التوصيل إلى</span>
                  </div>
                  <p class="font-bold text-sm text-on-surface">{{ selectedCity }}</p>
                  <p class="text-xs text-outline mt-1">{{ street }}</p>
                  <p class="text-xs text-outline mt-0.5">{{ phoneNumber }}</p>
                </div>

                <div class="bg-white p-5 rounded-3xl border border-[#E8E0D5] shadow-sm text-start">
                  <div class="flex items-center gap-2 mb-3 text-[#7B1818]">
                    <span class="material-symbols-outlined text-sm">payments</span>
                    <span class="text-[10px] font-black uppercase">طريقة الدفع</span>
                  </div>
                  <p class="font-bold text-sm text-on-surface">الدفع عند الاستلام (كاش)</p>
                </div>
              </div>
            </div>
          }
        }

        @if (error()) {
          <div class="mx-4 mt-4 p-4 bg-error/10 text-error rounded-2xl border border-error/20 flex items-center gap-3 animate-shake">
             <span class="material-symbols-outlined text-sm">report</span>
             <p class="text-[10px] font-bold uppercase">{{ error() }}</p>
          </div>
        }
      </div>

      <!-- Bottom Sticky Bar -->
      <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E0D5] p-4 flex items-center justify-between z-50 rounded-t-3xl shadow-[0_-15px_30px_rgba(0,0,0,0.06)] pb-safe">
        <div class="flex flex-col text-start">
          <p class="text-[10px] font-bold text-outline mb-0.5">المبلغ الإجمالي</p>
          <p class="font-headline font-black text-xl text-[#7B1818] leading-none">{{ totalPrice() | currency:'EGP':'symbol':'1.0-0':'en-EG' }}</p>
        </div>
        
        <button (click)="currentStep() < 3 ? nextStep() : placeOrder()" [disabled]="submitting()" 
                class="bg-[#7B1818] text-white px-10 py-4 rounded-[22px] font-black text-sm flex items-center gap-3 disabled:opacity-50 active:scale-95 transition-all shadow-lg shadow-[#7B1818]/30 min-w-[160px] justify-center">
          <span>
            @if (currentStep() < 3) { التالي } @else { تأكيد الطلب }
          </span>
          @if (submitting()) {
            <span class="material-symbols-outlined animate-spin text-sm">refresh</span>
          } @else {
            <span class="material-symbols-outlined text-sm">{{ currentStep() < 3 ? (currentLang === 'ar' ? 'arrow_back' : 'arrow_forward') : 'lock' }}</span>
          }
        </button>
      </div>

    </main>
  `,
  styles: [`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    .pb-safe { padding-bottom: max(1rem, env(safe-area-inset-bottom)); }
    .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
    @keyframes shake {
      10%, 90% { transform: translate3d(-1px, 0, 0); }
      20%, 80% { transform: translate3d(2px, 0, 0); }
      30%, 50%, 70% { transform: translate3d(-3px, 0, 0); }
      40%, 60% { transform: translate3d(3px, 0, 0); }
    }
  `]
})
export class OrderConfirmComponent implements OnInit, OnDestroy {
  private orderService = inject(OrderService);
  private cartService = inject(CartService);
  private languageService = inject(LanguageService);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  private location = inject(Location);
  private couponService = inject(CouponService);
  private productService = inject(ProductService);
  photoService = inject(PhotoService);

  showSummary = true;
  currentStep = signal(1);
  selectedPayment = signal('cod');

  couponInput = '';
  couponError = '';
  isApplyingCoupon = false;
  appliedCoupon = this.cartService.appliedCoupon;
  totalPrice = this.cartService.totalPrice;
  originalTotalPrice = this.cartService.originalTotalPrice;
  discountAmount = this.cartService.discountAmount;
  selectedCity: CityOption = '' as CityOption;
  street = '';
  phoneNumber = '';
  comment = '';

  submitting = signal(false);
  error = signal<string | null>(null);
  cartItems = this.cartService.items;
  cities = signal<string[]>([]);

  private imageErrors = new Set<string>();

  getItemSubtotal(item: any): number { return this.getItemDiscountedPrice(item) * item.quantity; }
  get currentLang(): string { return this.languageService.currentLanguage(); }

  toggleSummary(): void {
    this.showSummary = !this.showSummary;
  }

  goBack(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    } else {
      this.location.back();
    }
  }

  nextStep(): void {
    if (this.currentStep() === 1) {
      if (this.isFormValid()) {
        this.currentStep.set(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        this.error.set('يرجى إكمال بيانات الشحن أولاً');
      }
    } else if (this.currentStep() === 2) {
      this.currentStep.set(3);
      this.showSummary = true;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  ngOnInit(): void {
    if (this.cartItems().length === 0) this.router.navigate(['/' + this.currentLang + '/products']);
    this.loadCities();
  }

  loadCities(): void {
    this.productService.getCities().subscribe({
      next: (res) => { if (res.success && res.data) this.cities.set(res.data); },
      error: () => console.error('Failed to load cities')
    });
  }

  ngOnDestroy(): void {
    this.cartService.clearCoupon();
  }

  isFormValid(): boolean { return !!this.selectedCity && this.street.trim().length > 0 && this.phoneNumber.trim().length > 0; }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrToAN7K9bxCYHNmah4SPbCguXNVlpK-DeQWeEBnHb8hhrK_YwTkoUXoEOh-RgjYVbFZj2ZzFPFjqLgEqS81zBG3mBRaFpNCTpPthaRKkjbY6cN5ywiH6wrgPH-fov4huJ80NbYSMgUyawNMMrAIHqttsqobdz8M4Yk_ERm3md8eXwLlW4PLs3aIXrOye6hD6Mc0OtdU9LpkjMLI7eeChndSjrvjUUdPvpHGIlYDvLm3UBFRbdvqH0krtaLiZxlv72URSOjaoPfUbP';
  }

  placeOrder(): void {
    if (!this.isFormValid()) { this.error.set('Data fields incomplete.'); return; }
    this.submitting.set(true); this.error.set(null);
    const userId = this.tokenService.getUserId() || '';

    this.orderService.createOrder({
      customerId: userId, city: this.selectedCity, street: this.street.trim(),
      phoneNumber: this.phoneNumber.trim(), comment: this.comment.trim() || undefined,
      couponId: this.appliedCoupon()?.coupon?.id || undefined
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.submitting.set(false);
          this.cartService.clear();
          this.cartService.clearCoupon();
          this.router.navigate(['/' + this.currentLang + '/orders']);
        } else {
          this.submitting.set(false);
          this.error.set(res.error?.message || 'Execution failed.');
        }
      },
      error: (err) => { 
        this.submitting.set(false); 
        this.error.set(extractErrorMessage(err) || 'Execution failed.'); 
      }
    });
  }

  applyCoupon(): void {
    if (!this.couponInput.trim()) return;
    this.isApplyingCoupon = true; this.couponError = '';
    this.couponService.validate(this.couponInput).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.cartService.setCoupon(res.data);
          this.couponInput = '';
        } else {
          this.couponError = res.error?.message || 'Invalid coupon.';
        }
        this.isApplyingCoupon = false;
      },
      error: (err) => { 
        this.couponError = extractErrorMessage(err) || 'Validation failed.'; 
        this.isApplyingCoupon = false; 
      }
    });
  }

  removeCoupon(): void { this.cartService.clearCoupon(); }
  getItemDiscountedPrice(item: any): number { return this.cartService.getItemDiscountedValue(item); }
}
