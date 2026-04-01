import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LanguageService } from '../../../../core/services/language.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-resend-email-confirmation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  template: `
    <main class="min-h-screen flex items-center justify-center bg-surface px-6 py-20 overflow-hidden relative" [dir]="currentLang === 'ar' ? 'rtl' : 'ltr'">
      <!-- Dynamic Background Elements -->
      <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -mr-40 -mt-40 animate-pulse"></div>
      <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-tertiary/5 rounded-full blur-[100px] -ml-40 -mb-40 animate-pulse" style="animation-delay: 2s"></div>

      <div class="max-w-xl w-full relative z-10 animate-fade-in">
        <!-- Header Area -->
        <div class="text-center mb-12">
           <div class="w-20 h-20 bg-surface-container-low rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl border border-outline-variant/10 relative group overflow-hidden">
              <span class="material-symbols-outlined text-4xl text-primary transition-transform group-hover:scale-110">forward_to_inbox</span>
              <div class="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
           </div>
           <h1 class="font-headline text-5xl font-black tracking-tighter text-on-surface mb-3">{{ 'auth.resendConfirmation' | translate }}</h1>
           <p class="font-body text-on-surface-variant opacity-70 max-w-sm mx-auto">{{ 'auth.resendConfirmationDesc' | translate }}</p>
        </div>

        <div class="bg-surface-container-lowest p-10 md:p-14 rounded-[48px] shadow-2xl border border-outline-variant/10 backdrop-blur-xl relative overflow-hidden text-start">
          @if (success()) {
            <div class="text-center py-10 space-y-8 animate-scale-in">
               <div class="w-24 h-24 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto shadow-inner border border-success/20">
                  <span class="material-symbols-outlined text-5xl">mark_email_read</span>
               </div>
               <div>
                  <h3 class="font-headline text-2xl font-black text-on-surface mb-2">Transmission Successful</h3>
                  <p class="font-body text-on-surface-variant opacity-60">A new verification vector has been dispatched to your terminal.</p>
               </div>
               <div class="pt-6">
                  <button (click)="success.set(false)" class="text-[10px] font-black uppercase tracking-widest text-outline hover:text-primary transition-colors">
                     Resend Email
                  </button>
               </div>
            </div>
          } @else {
            <form [formGroup]="resendForm" (ngSubmit)="onSubmit()" class="space-y-10">
              @if (error()) {
                <div class="p-6 rounded-3xl bg-error/10 border border-error/20 text-error flex items-start gap-4 animate-scale-in">
                   <span class="material-symbols-outlined">report</span>
                   <p class="text-xs font-black uppercase tracking-widest">{{ error() }}</p>
                   <button type="button" (click)="error.set(null)" class="ms-auto opacity-40 hover:opacity-100">
                      <span class="material-symbols-outlined text-sm">close</span>
                   </button>
                </div>
              }

              <div class="space-y-8">
                <div class="space-y-3">
                  <label class="text-[10px] font-black uppercase tracking-widest text-outline px-2 block">{{ 'auth.email' | translate }}</label>
                  <div class="relative group">
                    <span class="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors">alternate_email</span>
                    <input type="email" formControlName="email" required
                           class="w-full bg-surface-container-low px-16 py-5 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-body text-sm text-on-surface transition-all"
                           [class.border-error/20]="resendForm.get('email')?.invalid && resendForm.get('email')?.touched"
                           placeholder="you@example.com">
                  </div>
                  @if (resendForm.get('email')?.invalid && resendForm.get('email')?.touched) {
                    <p class="text-[10px] font-black text-error uppercase px-2">Invalid Identification Parameter</p>
                  }
                </div>
              </div>

              <div class="space-y-6">
                <button type="submit" [disabled]="loading() || resendForm.invalid"
                        class="w-full py-6 bg-primary text-on-primary rounded-[32px] font-headline font-bold text-lg shadow-[0_20px_40px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 group">
                  @if (loading()) {
                    <span class="w-6 h-6 border-4 border-on-primary/30 border-t-white rounded-full animate-spin"></span>
                    <span class="font-black uppercase tracking-widest text-xs">Transmitting...</span>
                  } @else {
                    <span>Send Email</span>
                    <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">send_and_archive</span>
                  }
                </button>

                <div class="text-center pt-2">
                   <a [routerLink]="'/' + currentLang + '/auth/login'" class="text-[10px] font-black uppercase tracking-widest text-outline hover:text-primary transition-colors flex items-center justify-center gap-2 group">
                      <span class="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                      <span>{{ 'auth.backToLogin' | translate }}</span>
                   </a>
                </div>
              </div>
            </form>
          }
        </div>
      </div>
    </main>
  `,
  styles: []
})
export class ResendEmailConfirmationComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private languageService = inject(LanguageService);
  
  loading = signal(false);
  success = signal(false);
  error = signal<string | null>(null);
  
  resendForm = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  get currentLang(): string { return this.languageService.currentLanguage(); }
  
  onSubmit(): void {
    if (this.resendForm.invalid) return;
    this.loading.set(true); this.error.set(null);
    const email = this.resendForm.value.email!;
    
    this.authService.resendEmailConfirmation({ 
      email: email, clientURI: `${window.location.origin}/${this.currentLang}/auth/confirm-email`
    }).subscribe({
      next: () => { this.loading.set(false); this.success.set(true); },
      error: (err) => { this.loading.set(false); this.error.set(err.error?.message || 'Submission failed.'); }
    });
  }
}
