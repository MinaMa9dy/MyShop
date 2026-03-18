import { Component, inject, signal, AfterViewInit } from '@angular/core';
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
    <div class="auth-page min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
      <div class="auth-card card max-w-md w-full">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">{{ 'auth.login' | translate }}</h1>
          <p class="text-gray-500">{{ 'auth.login' | translate }}</p>
        </div>
        
        @if (error()) {
          <div class="error-alert bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 relative">
            <div class="flex items-start">
              <svg class="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <div class="flex-1">
                <p class="font-medium">Error</p>
                <p class="text-sm">{{ error() }}</p>
                @if (showResendLink()) {
                  <div class="mt-2 text-sm">
                    <a [routerLink]="'/' + currentLang + '/auth/resend-email-confirmation'" class="underline font-semibold hover:text-red-800">
                      {{ 'auth.resendConfirmationLink' | translate }}
                    </a>
                  </div>
                }
              </div>
              <button type="button" (click)="clearError()" class="text-red-500 hover:text-red-700 ml-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>
        }
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">{{ 'auth.email' | translate }}</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email"
              class="input"
              [class.input-error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
              [placeholder]="'auth.email' | translate">
            @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
              <p class="error">{{ 'auth.email' | translate }}</p>
            }
          </div>
          
          <div class="form-group">
            <label for="password">{{ 'auth.password' | translate }}</label>
            <input 
              type="password" 
              id="password" 
              formControlName="password"
              class="input"
              [class.input-error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
              [placeholder]="'auth.password' | translate">
            @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
              <p class="error">{{ 'auth.password' | translate }}</p>
            }
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary w-full py-3 mt-4"
            [disabled]="loading() || loginForm.invalid">
            @if (loading()) {
              <span class="loading-spinner mr-2"></span>
              {{ 'common.loading' | translate }}
            } @else {
              {{ 'auth.loginButton' | translate }}
            }
          </button>
        </form>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div class="mt-6 flex justify-center">
            <div id="google-btn"></div>
          </div>
        </div>
        
        <div class="mt-6 text-center">
          <p class="text-gray-500">
            {{ 'auth.noAccount' | translate }}
            <a [routerLink]="'/' + currentLang + '/auth/register'" class="text-blue-600 hover:text-blue-700 font-medium">
              {{ 'auth.registerLink' | translate }}
            </a>
          </p>
        </div>
        
        <div class="mt-4 text-center">
          <a [routerLink]="'/' + currentLang + '/'" class="text-gray-500 hover:text-gray-700 text-sm">
            ← {{ 'common.backToProducts' | translate }}
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }
  `]
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
        { theme: 'outline', size: 'large', width: '100%' }
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
