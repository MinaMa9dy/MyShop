import { Component, inject, signal, AfterViewInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LanguageService } from '../../../../core/services/language.service';
import { TranslatePipe } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  template: `
    <div class="min-h-screen bg-surface flex flex-col md:flex-row overflow-hidden" [dir]="currentLang === 'ar' ? 'rtl' : 'ltr'">
      <!-- Left Branding Side -->
      <div class="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary to-primary-dim relative items-center justify-center p-12 overflow-hidden">
        <!-- Abstract Topo Background -->
        <div class="absolute inset-0 opacity-10 pointer-events-none" 
             style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCrToAN7K9bxCYHNmah4SPbCguXNVlpK-DeQWeEBnHb8hhrK_YwTkoUXoEOh-RgjYVbFZj2ZzFPFjqLgEqS81zBG3mBRaFpNCTpPthaRKkjbY6cN5ywiH6wrgPH-fov4huJ80NbYSMgUyawNMMrAIHqttsqobdz8M4Yk_ERm3md8eXwLlW4PLs3aIXrOye6hD6Mc0OtdU9LpkjMLI7eeChndSjrvjUUdPvpHGIlYDvLm3UBFRbdvqH0krtaLiZxlv72URSOjaoPfUbP'); background-size: cover; background-position: center;">
        </div>
        
        <div class="relative z-10 text-on-primary animate-fade-in text-center">
            <h1 class="font-headline text-6xl font-black tracking-tighter mb-4">MyShop</h1>
            <p class="font-body text-xl opacity-80 max-w-sm mx-auto leading-relaxed">
              Curating architectural precision for the modern lifestyle.
            </p>
            <div class="mt-12 flex justify-center">
              <span class="material-symbols-outlined text-8xl opacity-20 animate-float">shopping_bag</span>
            </div>
        </div>
        
        <!-- Bottom Attribution -->
        <div class="absolute bottom-10 left-10 text-[10px] text-on-primary/60 uppercase tracking-widest font-black">
          © 2026 PRECISION SERIES
        </div>
      </div>

      <!-- Right Form Side -->
      <div class="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 bg-surface-container-lowest">
        <div class="w-full max-w-md animate-slide-up">
          <div class="text-start mb-10">
            <h2 class="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-2">
              {{ 'auth.welcomeBack' | translate }}
            </h2>
            <p class="text-on-surface-variant font-body">{{ 'auth.welcomeBackSubtitle' | translate }}</p>
          </div>

          @if (error()) {
            <div class="bg-error/10 border border-error/20 text-error px-6 py-4 rounded-2xl mb-8 flex items-center justify-between group transition-all">
              <div class="flex items-center gap-3 text-start">
                <span class="material-symbols-outlined text-xl">error</span>
                <div class="flex flex-col">
                  <p class="text-sm font-bold">{{ error() }}</p>
                  @if (showResendLink()) {
                    <a [routerLink]="'/' + currentLang + '/auth/resend-email-confirmation'" class="text-xs underline font-black hover:opacity-80 transition-opacity">
                      {{ 'auth.resendConfirmationLink' | translate }}
                    </a>
                  }
                </div>
              </div>
              <button (click)="clearError()" class="hover:rotate-90 transition-transform duration-300">
                <span class="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div class="form-input-container">
               <input type="email" 
                      id="email" 
                      formControlName="email" 
                      placeholder=" "
                      class="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary px-4 py-4 rounded-t-xl outline-none transition-all font-body text-on-surface">
               <label for="email">
                 <span class="material-symbols-outlined text-lg">mail</span>
                 {{ 'auth.email' | translate }}
               </label>
               @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
                 <p class="text-[10px] text-error font-bold uppercase tracking-widest mt-2 ml-4 text-start">Invalid email focus</p>
               }
            </div>

            <div class="form-input-container">
               <input type="password" 
                      id="password" 
                      formControlName="password" 
                      placeholder=" "
                      class="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary px-4 py-4 rounded-t-xl outline-none transition-all font-body text-on-surface">
               <label for="password">
                 <span class="material-symbols-outlined text-lg">lock</span>
                 {{ 'auth.password' | translate }}
               </label>
            </div>

            <div class="flex justify-end text-end">
              <a [routerLink]="'/' + currentLang + '/auth/forgot-password'" 
                 class="text-xs font-black text-primary uppercase tracking-widest hover:opacity-80 transition-opacity">
                {{ 'auth.forgotPassword' | translate }}
              </a>
            </div>

            <button type="submit" 
                    [disabled]="loading() || loginForm.invalid"
                    class="w-full bg-primary text-on-primary font-headline font-bold py-5 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all duration-300 flex items-center justify-center gap-3">
              @if (loading()) {
                <span class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              } @else {
                {{ 'auth.loginButton' | translate }}
                <span class="material-symbols-outlined">login</span>
              }
            </button>
          </form>

          <div class="mt-10 flex flex-col items-center gap-6">
            <div class="flex items-center gap-4 w-full text-outline-variant">
              <hr class="flex-grow border-outline-variant/30">
              <span class="text-[10px] uppercase font-black tracking-widest">Global Protocol</span>
              <hr class="flex-grow border-outline-variant/30">
            </div>

            <!-- Google Login Container -->
            <div id="google-btn" class="w-full flex justify-center py-2 transition-all"></div>

            <p class="text-on-surface-variant font-body text-sm mt-4 text-center">
              {{ 'auth.noAccount' | translate }}
              <a [routerLink]="'/' + currentLang + '/auth/register'" class="text-primary font-black hover:underline px-1">
                {{ 'auth.registerLink' | translate }}
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
export class LoginComponent implements AfterViewInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private languageService = inject(LanguageService);
  
  loading = signal(false);
  error = signal<string | null>(null);
  showResendLink = signal(false);
  
  // Get current language for routerLink
  get currentLang(): string {
    return this.languageService.currentLanguage();
  }
  
  clearError(): void {
    this.error.set(null);
    this.showResendLink.set(false);
  }
  
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

      google.accounts.id.renderButton(
        document.getElementById('google-btn'),
        { 
          theme: 'outline', 
          size: 'large', 
          shape: 'pill'
        }
      );
    }
  }

  handleGoogleLogin(response: any): void {
    this.loading.set(true);
    this.error.set(null);

    this.authService.googleLogin({
      token: response.credential
    }).subscribe({
      next: (res) => {
        console.log('Google login successful:', res);
        this.loading.set(false);
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/' + this.currentLang + '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        console.error('Google login failed:', err);
        this.loading.set(false);
        this.error.set('Google sign-in failed. Please try again.');
      }
    });
  }
  
  onSubmit(): void {
    if (this.loginForm.invalid) return;
    
    this.loading.set(true);
    this.error.set(null);
    
    const { email, password } = this.loginForm.value;
    
    this.authService.login({ email: email!, password: password! }).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.loading.set(false);
        
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/' + this.currentLang + '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        console.error('Login failed:', err);
        this.loading.set(false);
        
        // Let the global interceptor handle the toast notification
        // Just show local error for this form
        let errorMessage = 'Login failed. Please try again.';
        // Try to extract exact error message from the backend response
        const errorData = err.error;
        if (errorData) {
          // If the backend returns a ResultPattern format, the error will often be in errorData directly if it's a string, or inside an Error object
          if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.title) {
            errorMessage = errorData.title; // for standard ProblemDetails
          } else if (errorData.Message) {
            errorMessage = errorData.Message;
          } else if (Array.isArray(errorData)) {
            errorMessage = errorData[0] || errorMessage;
          }
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        this.error.set(errorMessage);
        if (errorMessage.toLowerCase().includes('email is not confirmed')) {
          this.showResendLink.set(true);
        }
      }
    });
  }
}
