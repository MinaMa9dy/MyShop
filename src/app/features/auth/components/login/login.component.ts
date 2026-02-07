import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LanguageService } from '../../../../core/services/language.service';
import { TranslatePipe } from '@ngx-translate/core';

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
          <div class="error-alert bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {{ error() }}
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
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private languageService = inject(LanguageService);
  
  loading = signal(false);
  error = signal<string | null>(null);
  
  // Get current language for routerLink
  get currentLang(): string {
    return this.languageService.currentLanguage();
  }
  
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });
  
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
      error: (error) => {
        console.error('Login failed:', error);
        this.loading.set(false);
        // Try to extract error message from backend response
        let errorMessage = 'Login failed. Please try again.';
        if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.error && error.error.Message) {
          errorMessage = error.error.Message;
        } else if (error.status === 400) {
          errorMessage = 'Invalid email or password';
        } else if (error.status === 0) {
          errorMessage = 'Cannot connect to server. Please check your connection.';
        }
        this.error.set(errorMessage);
      }
    });
  }
}
