import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LanguageService } from '../../../../core/services/language.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  template: `
    <div class="min-h-screen bg-surface flex flex-col md:flex-row overflow-hidden" [dir]="currentLang === 'ar' ? 'rtl' : 'ltr'">
      <!-- Left Branding Side -->
      <div class="hidden md:flex md:w-1/2 bg-gradient-to-br from-secondary to-secondary-dim relative items-center justify-center p-12 overflow-hidden">
        <!-- Abstract Topo Background -->
        <div class="absolute inset-0 opacity-10 pointer-events-none" 
             style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCrToAN7K9bxCYHNmah4SPbCguXNVlpK-DeQWeEBnHb8hhrK_YwTkoUXoEOh-RgjYVbFZj2ZzFPFjqLgEqS81zBG3mBRaFpNCTpPthaRKkjbY6cN5ywiH6wrgPH-fov4huJ80NbYSMgUyawNMMrAIHqttsqobdz8M4Yk_ERm3md8eXwLlW4PLs3aIXrOye6hD6Mc0OtdU9LpkjMLI7eeChndSjrvjUUdPvpHGIlYDvLm3UBFRbdvqH0krtaLiZxlv72URSOjaoPfUbP'); background-size: cover; background-position: center;">
        </div>
        
        <div class="relative z-10 text-on-secondary animate-fade-in text-center">
            <h1 class="font-headline text-6xl font-black tracking-tighter mb-4">Precision</h1>
            <p class="font-body text-xl opacity-80 max-w-sm mx-auto leading-relaxed text-center">
              Join the elite circle of curated aesthetics and architectural lifestyle.
            </p>
            <div class="mt-12 flex justify-center">
              <span class="material-symbols-outlined text-8xl opacity-20 animate-float">person_add</span>
            </div>
        </div>
        
        <!-- Bottom Attribution -->
        <div class="absolute bottom-10 left-10 text-[10px] text-on-secondary/60 uppercase tracking-widest font-black">
          © 2026 PRECISION SERIES
        </div>
      </div>

      <!-- Right Form Side -->
      <div class="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 bg-surface-container-lowest overflow-y-auto">
        <div class="w-full max-w-lg animate-slide-up py-10">
          <div class="text-start mb-10">
            <h2 class="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-2">
              {{ 'auth.createAccount' | translate }}
            </h2>
            <p class="text-on-surface-variant font-body">Start your journey with curated precision</p>
          </div>

          @if (successMessage()) {
            <div class="bg-primary/10 border border-primary/20 text-primary px-6 py-4 rounded-2xl mb-8 flex items-center justify-between group animate-fade-in">
              <div class="flex items-center gap-3 text-start">
                <span class="material-symbols-outlined text-xl">verified</span>
                <div class="flex flex-col">
                  <p class="text-sm font-bold">{{ successMessage() }}</p>
                  <a [routerLink]="'/' + currentLang + '/auth/resend-email-confirmation'" class="text-xs underline font-black hover:opacity-80 transition-opacity">
                    {{ 'auth.resendConfirmationLink' | translate }}
                  </a>
                </div>
              </div>
              <button (click)="clearError()" class="hover:rotate-90 transition-transform duration-300">
                <span class="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          }

          @if (error()) {
            <div class="bg-error/10 border border-error/20 text-error px-6 py-4 rounded-2xl mb-8 flex items-center justify-between group animate-shake">
              <div class="flex items-center gap-3 text-start">
                <span class="material-symbols-outlined text-xl">error</span>
                <p class="text-sm font-bold">{{ error() }}</p>
              </div>
              <button (click)="clearError()" class="hover:rotate-90 transition-transform duration-300">
                <span class="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          }

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div class="form-input-container">
                 <input type="text" id="firstName" formControlName="firstName" placeholder=" "
                        class="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary px-4 py-4 rounded-t-xl outline-none transition-all font-body text-on-surface">
                 <label for="firstName">{{ 'auth.firstName' | translate }}</label>
              </div>
              <div class="form-input-container">
                 <input type="text" id="lastName" formControlName="lastName" placeholder=" "
                        class="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary px-4 py-4 rounded-t-xl outline-none transition-all font-body text-on-surface">
                 <label for="lastName">{{ 'auth.lastName' | translate }}</label>
              </div>
            </div>

            <div class="form-input-container">
               <input type="email" id="email" formControlName="email" placeholder=" "
                      class="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary px-4 py-4 rounded-t-xl outline-none transition-all font-body text-on-surface">
               <label for="email">
                 <span class="material-symbols-outlined text-lg">mail</span>
                 {{ 'auth.email' | translate }}
               </label>
            </div>

            <div class="form-input-container">
               <input type="tel" id="phoneNumber" formControlName="phoneNumber" placeholder=" "
                      class="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary px-4 py-4 rounded-t-xl outline-none transition-all font-body text-on-surface">
               <label for="phoneNumber">
                 <span class="material-symbols-outlined text-lg">call</span>
                 {{ 'auth.phoneNumber' | translate }}
               </label>
            </div>

            <div class="px-4 py-4 bg-surface-container-low rounded-xl flex items-center justify-between">
              <span class="text-xs font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                <span class="material-symbols-outlined text-lg">wc</span>
                {{ 'auth.gender' | translate }}
              </span>
              <div class="flex gap-4">
                <label class="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" formControlName="gender" [value]="true" class="hidden peer">
                  <div class="w-4 h-4 rounded-full border-2 border-outline-variant peer-checked:border-primary peer-checked:bg-primary transition-all"></div>
                  <span class="text-sm font-bold text-on-surface-variant group-hover:text-primary transition-colors">{{ 'auth.male' | translate }}</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" formControlName="gender" [value]="false" class="hidden peer">
                  <div class="w-4 h-4 rounded-full border-2 border-outline-variant peer-checked:border-primary peer-checked:bg-primary transition-all"></div>
                  <span class="text-sm font-bold text-on-surface-variant group-hover:text-primary transition-colors">{{ 'auth.female' | translate }}</span>
                </label>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div class="form-input-container">
                 <input type="password" id="password" formControlName="password" placeholder=" "
                        class="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary px-4 py-4 rounded-t-xl outline-none transition-all font-body text-on-surface">
                 <label for="password">{{ 'auth.password' | translate }}</label>
              </div>
              <div class="form-input-container">
                 <input type="password" id="confirmPassword" formControlName="confirmPassword" placeholder=" "
                        class="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary px-4 py-4 rounded-t-xl outline-none transition-all font-body text-on-surface">
                 <label for="confirmPassword">{{ 'auth.confirmPassword' | translate }}</label>
              </div>
            </div>

            <button type="submit" 
                    [disabled]="loading() || registerForm.invalid"
                    class="w-full bg-secondary text-on-secondary font-headline font-bold py-5 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all duration-300 flex items-center justify-center gap-3 group">
              @if (loading()) {
                <span class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              } @else {
                {{ 'auth.registerButton' | translate }}
                <span class="material-symbols-outlined transform group-hover:translate-x-1 transition-transform">how_to_reg</span>
              }
            </button>
          </form>

          <div class="mt-10 flex flex-col items-center gap-6">
            <p class="text-on-surface-variant font-body text-sm text-center">
              {{ 'auth.hasAccount' | translate }}
              <a [routerLink]="'/' + currentLang + '/auth/login'" class="text-primary font-black hover:underline px-1">
                {{ 'auth.loginLink' | translate }}
              </a>
            </p>
            
            <a [routerLink]="'/' + currentLang + '/'" class="text-on-surface-variant text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">arrow_back</span>
              {{ 'common.backToProducts' | translate }}
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private languageService = inject(LanguageService);
  
  loading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  
  get currentLang(): string {
    return this.languageService.currentLanguage();
  }
  
  clearError(): void {
    this.error.set(null);
    this.successMessage.set(null);
  }

  registerForm = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required]],
    gender: [true, [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    confirmPassword: ['', [Validators.required]]
  });
  
  onSubmit(): void {
    if (this.registerForm.invalid) return;
    
    this.loading.set(true);
    this.error.set(null);
    
    const formValue = this.registerForm.value;
    const registerData = {
      firstName: formValue.firstName || '',
      lastName: formValue.lastName || '',
      email: formValue.email || '',
      phoneNumber: formValue.phoneNumber || '',
      gender: formValue.gender ?? true,
      password: formValue.password || '',
      confirmPassword: formValue.confirmPassword || ''
    };
    
    if (registerData.password !== registerData.confirmPassword) {
      this.error.set('Passwords do not match');
      this.loading.set(false);
      return;
    }
    
    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.requiresEmailConfirmation) {
          this.successMessage.set(response.message || 'Registration successful. Please check your email to confirm your account.');
          this.registerForm.reset();
        } else {
          this.router.navigate([`/${this.currentLang}/dashboard`]);
        }
      },
      error: (err) => {
        this.loading.set(false);
        let errorMessage = 'Registration failed. Please try again.';
        const errorData = err.error;
        if (errorData) {
          if (typeof errorData === 'string') errorMessage = errorData;
          else if (errorData.message) errorMessage = errorData.message;
          else if (errorData.title) errorMessage = errorData.title;
        }
        this.error.set(errorMessage);
      }
    });
  }
}
