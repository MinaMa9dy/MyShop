import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ResetPasswordDto } from '../../../../core/models/auth.model';
import { LanguageService } from '../../../../core/services/language.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <main class="min-h-screen flex items-center justify-center bg-surface px-6 py-20 overflow-hidden relative" [dir]="currentLang === 'ar' ? 'rtl' : 'ltr'">
      <!-- Dynamic Background Elements -->
      <div class="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -ml-40 -mt-40 animate-pulse"></div>
      <div class="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] -mr-40 -mb-40 animate-pulse" style="animation-delay: 2s"></div>

      <div class="max-w-xl w-full relative z-10 animate-fade-in">
        <!-- Header Area -->
        <div class="text-center mb-12">
           <div class="w-20 h-20 bg-surface-container-low rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl border border-outline-variant/10 relative group overflow-hidden">
              <span class="material-symbols-outlined text-4xl text-primary transition-transform group-hover:scale-110">security</span>
              <div class="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
           </div>
           <h1 class="font-headline text-5xl font-black tracking-tighter text-on-surface mb-3">Protocol Reset</h1>
           <p class="font-body text-on-surface-variant opacity-70 max-w-sm mx-auto">Define a new security sequence for your entity profile.</p>
        </div>

        <div class="bg-surface-container-lowest p-10 md:p-14 rounded-[48px] shadow-2xl border border-outline-variant/10 backdrop-blur-xl relative overflow-hidden text-start">
          @if (success()) {
            <div class="text-center py-10 space-y-8 animate-scale-in">
              <div class="w-24 h-24 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto shadow-inner border border-success/20">
                <span class="material-symbols-outlined text-5xl">verified</span>
              </div>
              <div>
                <h3 class="font-headline text-2xl font-black text-on-surface mb-2">Sequence Verified</h3>
                <p class="font-body text-on-surface-variant opacity-60">Your credentials have been successfully updated in the main vault.</p>
              </div>
              <a [routerLink]="['/' + currentLang + '/auth/login']" 
                 class="inline-block py-5 px-12 bg-on-surface text-surface rounded-[32px] font-headline font-bold text-lg shadow-xl hover:scale-[1.05] transition-all">
                Access Profile
              </a>
            </div>
          } @else {
            <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="space-y-10">
              @if (error()) {
                <div class="p-6 rounded-3xl bg-error/10 border border-error/20 text-error flex items-start gap-4 animate-scale-in">
                  <span class="material-symbols-outlined">report</span>
                  <p class="text-xs font-black uppercase tracking-widest">{{ error() }}</p>
                </div>
              }

              <div class="space-y-8">
                <div class="space-y-3">
                  <label class="text-[10px] font-black uppercase tracking-widest text-outline px-2 block">New Cipher Sequence</label>
                  <div class="relative group">
                    <span class="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1-2 text-outline-variant group-focus-within:text-primary transition-colors">key</span>
                    <input type="password" formControlName="password"
                           class="w-full bg-surface-container-low px-16 py-5 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-body text-sm text-on-surface transition-all"
                           [class.border-error/20]="resetForm.get('password')?.invalid && resetForm.get('password')?.touched"
                           placeholder="Enter robust password">
                  </div>
                </div>

                <div class="space-y-3">
                  <label class="text-[10px] font-black uppercase tracking-widest text-outline px-2 block">Confirm Cipher Sequence</label>
                  <div class="relative group">
                    <span class="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1-2 text-outline-variant group-focus-within:text-primary transition-colors">lock</span>
                    <input type="password" formControlName="confirmPassword"
                           class="w-full bg-surface-container-low px-16 py-5 rounded-2xl border-2 border-transparent focus:border-primary/20 outline-none font-body text-sm text-on-surface transition-all"
                           [class.border-error/20]="resetForm.get('confirmPassword')?.invalid && resetForm.get('confirmPassword')?.touched"
                           placeholder="Verify password">
                  </div>
                </div>
              </div>

              <div class="space-y-6">
                <button type="submit" [disabled]="loading() || resetForm.invalid"
                        class="w-full py-6 bg-primary text-on-primary rounded-[32px] font-headline font-bold text-lg shadow-[0_20px_40px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 group">
                  @if (loading()) {
                    <span class="w-6 h-6 border-4 border-on-primary/30 border-t-white rounded-full animate-spin"></span>
                    <span class="font-black uppercase tracking-widest text-xs">Authenticating Change...</span>
                  } @else {
                    <span>Authorize Reset</span>
                    <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">encrypted</span>
                  }
                </button>

                <div class="text-center">
                   <a [routerLink]="['/' + currentLang + '/auth/login']" class="text-[10px] font-black uppercase tracking-widest text-outline hover:text-primary transition-colors">
                      Back to Secure Gate
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
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private languageService = inject(LanguageService);
  
  loading = signal(false);
  success = signal(false);
  error = signal<string | null>(null);
  
  userId = '';
  token = '';
  get currentLang(): string { return this.languageService.currentLanguage(); }
  
  resetForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });
  
  ngOnInit(): void {
    this.userId = this.route.snapshot.queryParams['userId'];
    this.token = this.route.snapshot.queryParams['token'];
    if (!this.userId || !this.token) this.error.set('Invalid restoration protocol link.');
  }
  
  onSubmit(): void {
    if (this.resetForm.invalid || !this.userId || !this.token) return;
    const { password, confirmPassword } = this.resetForm.value;
    if (password !== confirmPassword) { this.error.set('Sequence mismatch within verification.'); return; }
    
    this.loading.set(true); this.error.set(null);
    const resetDto: ResetPasswordDto = { userId: this.userId, token: this.token, newPassword: password || '', confirmNewPassword: confirmPassword || '' };
    
    this.authService.resetPassword(resetDto).subscribe({
      next: () => { this.success.set(true); this.loading.set(false); },
      error: (err) => { this.error.set(err.error?.message || 'Authorization failed. Protocol link potentially expired.'); this.loading.set(false); }
    });
  }
}
