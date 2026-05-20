import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../../core/services/auth.service';
import { LanguageService } from '../../../../core/services/language.service';
import { ForgotPasswordDto } from '../../../../core/models/auth.model';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  template: `
    <main class="min-h-[calc(100vh-152px)] md:min-h-[calc(100vh-72px)] flex items-center justify-center bg-surface px-6 py-20 overflow-hidden relative" [dir]="currentLang === 'ar' ? 'rtl' : 'ltr'">
      <!-- Dynamic Background Elements -->
      <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -mr-40 -mt-40 animate-pulse"></div>
      <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-tertiary/5 rounded-full blur-[100px] -ml-40 -mb-40 animate-pulse" style="animation-delay: 2s"></div>

      <div class="max-w-xl w-full relative z-10 animate-fade-in">
        <!-- Logo/Header Area -->
        <div class="text-center mb-12">
           <div class="w-20 h-20 bg-surface-container-low rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl border border-outline-variant/10 relative group overflow-hidden">
              <span class="material-symbols-outlined text-4xl text-primary transition-transform group-hover:scale-110">lock_reset</span>
              <div class="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
           </div>
           <h1 class="font-headline text-5xl font-black tracking-tighter text-on-surface mb-3">{{ 'auth.passwordRecovery' | translate }}</h1>
           <p class="font-body text-on-surface-variant opacity-70 max-w-sm mx-auto">{{ 'auth.forgotPasswordDesc' | translate }}</p>
        </div>

        <div class="bg-surface-container-lowest p-10 md:p-14 rounded-[48px] shadow-2xl border border-outline-variant/10 backdrop-blur-xl relative overflow-hidden">
          <form class="space-y-10" [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()">
            
            @if (successMessage()) {
              <div class="p-6 rounded-3xl bg-success/10 border border-success/20 text-success flex items-start gap-4 animate-scale-in">
                <span class="material-symbols-outlined">verified</span>
                <p class="text-xs font-black uppercase tracking-widest text-start">{{ successMessage() }}</p>
              </div>
            }

            @if (errorMessage()) {
              <div class="p-6 rounded-3xl bg-error/10 border border-error/20 text-error flex items-start gap-4 animate-scale-in">
                <span class="material-symbols-outlined">report</span>
                <p class="text-xs font-black uppercase tracking-widest text-start">{{ errorMessage() }}</p>
              </div>
            }

            <div class="space-y-8">
              <div class="space-y-3">
                <label class="text-[10px] font-black uppercase tracking-widest text-outline px-2 text-start block">{{ 'auth.email' | translate }}</label>
                <div class="relative group">
                  <span class="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors">alternate_email</span>
                  <input formControlName="email" type="email" autocomplete="email" required
                         class="w-full bg-surface-container-low px-16 py-5 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-body text-sm text-on-surface transition-all"
                         [class.border-error/20]="forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched"
                         placeholder="you@example.com">
                </div>
                @if (forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched) {
                  <p class="text-[10px] font-black text-error uppercase px-2 text-start">{{ 'auth.invalidEmail' | translate }}</p>
                }
              </div>
            </div>

            <div class="space-y-6">
              <button type="submit" [disabled]="forgotPasswordForm.invalid || submitting()"
                class="w-full py-6 bg-primary text-on-primary rounded-[32px] font-headline font-bold text-lg shadow-[0_20px_40px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 group">
                @if (submitting()) {
                  <span class="w-6 h-6 border-4 border-on-primary/30 border-t-white rounded-full animate-spin"></span>
                  <span class="font-black uppercase tracking-widest text-xs">{{ 'auth.sending' | translate }}</span>
                } @else {
                   <span>{{ 'auth.initiateReset' | translate }}</span>
                  <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">send</span>
                }
              </button>

              <div class="text-center">
                <a routerLink="/auth/login" class="text-[10px] font-black uppercase tracking-widest text-outline hover:text-primary transition-colors flex items-center justify-center gap-2 group">
                  <span class="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                  <span>{{ 'auth.backToLogin' | translate }}</span>
                </a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  `,
  styles: []
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private languageService = inject(LanguageService);
  private translate = inject(TranslateService);

  forgotPasswordForm: FormGroup = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  submitting = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  get currentLang(): string { return this.languageService.currentLanguage(); }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) { this.forgotPasswordForm.markAllAsTouched(); return; }
    this.submitting.set(true); this.successMessage.set(null); this.errorMessage.set(null);
    const clientURI = `${window.location.origin}/auth/reset-password`;

    this.authService.forgotPassword({ email: this.forgotPasswordForm.value.email, clientURI }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.successMessage.set(this.translate.instant('auth.resetLinkSent'));
        this.forgotPasswordForm.reset();
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(err.error?.message || err.error?.error || 'Failed to send reset link.');
      }
    });
  }
}
