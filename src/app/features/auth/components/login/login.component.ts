import { Component, inject, signal, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LanguageService } from '../../../../core/services/language.service';
import { environment } from '../../../../../environments/environment';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-[calc(100vh-152px)] md:min-h-[calc(100vh-72px)] bg-surface flex flex-col md:flex-row overflow-hidden" dir="rtl">

      <!-- ── Left Branding Panel (Desktop) ── -->
      <div class="hidden md:flex md:w-1/2 relative items-center justify-center p-12 overflow-hidden"
           style="background: linear-gradient(150deg, #7B1818 0%, #5A1010 50%, #3D0A0A 100%);">
        <div class="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10"
             style="background: radial-gradient(circle, #C4962A 0%, transparent 70%); transform: translate(30%,-30%);"></div>
        <div class="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10"
             style="background: radial-gradient(circle, #C4962A 0%, transparent 70%); transform: translate(-30%,30%);"></div>

        <div class="relative z-10 text-white text-center flex flex-col items-center gap-8">
          <div class="w-24 h-24 rounded-full border-4 border-white/20 bg-white/10 flex items-center justify-center"
               style="box-shadow: 0 8px 30px rgba(0,0,0,0.3);">
            <span class="material-symbols-outlined text-5xl text-white/80">church</span>
          </div>
          <div>
            <h1 class="font-black text-4xl leading-tight" style="font-family:'Cairo',sans-serif;">Kantyn<br>San Mark</h1>
            <p class="text-white/60 text-sm mt-2" style="font-family:'Tajawal',sans-serif;">كانتين سان مارك</p>
          </div>
          <p class="text-white/70 text-base max-w-xs text-center leading-relaxed" style="font-family:'Tajawal',sans-serif;">
            اطلب منتجات الكانتين بسهولة وجودة عالية. نحن هنا لخدمتكم.
          </p>
        </div>
        <div class="absolute bottom-8 text-white/30 text-xs" style="font-family:'Tajawal',sans-serif;">
          © 2026 كانتين سان مارك
        </div>
      </div>

      <!-- ── Right Form Side ── -->
      <div class="w-full md:w-1/2 flex-grow flex items-center justify-center p-6 md:p-16 bg-surface-container-lowest">
        <div class="w-full max-w-md">

          <!-- Mobile Brand -->
          <div class="flex flex-col items-center gap-3 mb-8 md:hidden">
            <div class="w-16 h-16 rounded-full border-2 border-primary/20 bg-surface-container-low flex items-center justify-center"
                 style="box-shadow: 0 4px 16px rgba(196,150,42,0.15);">
              <span class="material-symbols-outlined text-primary text-3xl">church</span>
            </div>
            <div class="text-center">
              <div class="font-black text-primary text-xl" style="font-family:'Cairo',sans-serif;">Kantyn San Mark</div>
              <div class="text-on-surface-variant text-sm" style="font-family:'Tajawal',sans-serif;">كانتين سان مارك</div>
            </div>
          </div>

          <!-- Heading -->
          <div class="mb-8">
            <h2 class="font-black text-on-surface text-2xl md:text-3xl mb-1" style="font-family:'Cairo',sans-serif;">مرحباً بعودتك</h2>
            <p class="text-on-surface-variant text-sm" style="font-family:'Tajawal',sans-serif;">سجّل دخولك للمتابعة</p>
          </div>

          <!-- Error -->
          @if (error()) {
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-lg">error</span>
                <div>
                  <p class="text-sm font-bold" style="font-family:'Tajawal',sans-serif;">{{ error() }}</p>
                  @if (showResendLink()) {
                    <a routerLink="/auth/resend-email-confirmation"
                       class="text-xs underline font-bold" style="font-family:'Cairo',sans-serif;">إعادة إرسال رابط التفعيل</a>
                  }
                </div>
              </div>
              <button (click)="clearError()" class="hover:rotate-90 transition-transform">
                <span class="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          }

          <!-- Form -->
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
            <!-- Email -->
            <div class="flex flex-col gap-1">
              <label class="text-sm font-bold text-on-surface" for="login-email" style="font-family:'Cairo',sans-serif;">البريد الإلكتروني</label>
              <div class="relative">
                <span class="material-symbols-outlined absolute top-1/2 -translate-y-1/2 right-3 text-outline-variant text-[20px]">mail</span>
                <input type="email" id="login-email" formControlName="email" placeholder="example@email.com"
                       class="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl pr-10 pl-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all"
                       style="font-family:'Tajawal',sans-serif;">
              </div>
              @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
                <p class="text-[11px] text-error font-bold" style="font-family:'Cairo',sans-serif;">بريد إلكتروني غير صحيح</p>
              }
            </div>

            <!-- Password -->
            <div class="flex flex-col gap-1">
              <label class="text-sm font-bold text-on-surface" for="login-password" style="font-family:'Cairo',sans-serif;">كلمة المرور</label>
              <div class="relative">
                <span class="material-symbols-outlined absolute top-1/2 -translate-y-1/2 right-3 text-outline-variant text-[20px]">lock</span>
                <input type="password" id="login-password" formControlName="password" placeholder="••••••••"
                       class="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl pr-10 pl-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all"
                       style="font-family:'Tajawal',sans-serif;">
              </div>
            </div>

            <!-- Forgot -->
            <div class="flex justify-start">
              <a routerLink="/auth/forgot-password"
                 class="text-primary text-xs font-bold hover:underline" style="font-family:'Cairo',sans-serif;">نسيت كلمة المرور؟</a>
            </div>

            <!-- Submit -->
            <button type="submit" [disabled]="loading() || loginForm.invalid"
                    class="w-full bg-primary text-white font-black py-3.5 rounded-xl hover:bg-primary-dim active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2"
                    style="font-family:'Cairo',sans-serif; box-shadow: 0 6px 20px rgba(123,24,24,0.3);">
              @if (loading()) {
                <span class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                جاري التحميل...
              } @else {
                <span class="material-symbols-outlined text-[20px]">login</span>
                تسجيل الدخول
              }
            </button>
          </form>

          <!-- Divider -->
          <div class="flex items-center gap-3 my-6">
            <hr class="flex-1 border-outline-variant/30">
            <span class="text-xs text-on-surface-variant font-bold" style="font-family:'Cairo',sans-serif;">أو</span>
            <hr class="flex-1 border-outline-variant/30">
          </div>

          <!-- Google -->
          <div id="google-btn" class="w-full flex justify-center"></div>

          <!-- Register -->
          <p class="text-center text-sm text-on-surface-variant mt-6" style="font-family:'Tajawal',sans-serif;">
            ليس لديك حساب؟
            <a routerLink="/auth/register"
               class="text-primary font-black hover:underline mr-1" style="font-family:'Cairo',sans-serif;">سجّل الآن</a>
          </p>

          <!-- Back -->
          <div class="flex justify-center mt-4">
            <a routerLink="/"
               class="text-on-surface-variant text-xs flex items-center gap-1 hover:text-primary transition-colors"
               style="font-family:'Cairo',sans-serif;">
              <span class="material-symbols-outlined text-sm">arrow_forward</span>
              العودة للرئيسية
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent implements AfterViewInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private languageService = inject(LanguageService);

  loading = signal(false);
  error = signal<string | null>(null);
  showResendLink = signal(false);

  get currentLang(): string { return this.languageService.currentLanguage(); }

  clearError(): void { this.error.set(null); this.showResendLink.set(false); }

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  ngAfterViewInit(): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: any) => this.handleGoogleLogin(response)
      });
      google.accounts.id.renderButton(document.getElementById('google-btn'), {
        theme: 'outline', size: 'large', shape: 'pill'
      });
    }
  }

  handleGoogleLogin(response: any): void {
    this.loading.set(true);
    this.error.set(null);
    this.authService.googleLogin({ token: response.credential }).subscribe({
      next: () => {
        this.loading.set(false);
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('فشل تسجيل الدخول بـ Google. حاول مرة أخرى.');
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    const { email, password } = this.loginForm.value;
    this.authService.login({ email: email!, password: password! }).subscribe({
      next: () => {
        this.loading.set(false);
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.loading.set(false);
        const errorData = err.error;
        let msg = 'فشل تسجيل الدخول. حاول مرة أخرى.';
        if (typeof errorData === 'string') msg = errorData;
        else if (errorData?.message) msg = errorData.message;
        else if (errorData?.title) msg = errorData.title;
        else if (errorData?.Message) msg = errorData.Message;
        else if (Array.isArray(errorData)) msg = errorData[0] || msg;
        else if (err.message) msg = err.message;
        this.error.set(msg);
        if (msg.toLowerCase().includes('email is not confirmed')) this.showResendLink.set(true);
      }
    });
  }
}
