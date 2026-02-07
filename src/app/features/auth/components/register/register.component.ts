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
    <div class="auth-page min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
      <div class="auth-card card max-w-md w-full">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">{{ 'auth.register' | translate }}</h1>
          <p class="text-gray-500">{{ 'auth.register' | translate }}</p>
        </div>
        
        @if (error()) {
          <div class="error-alert bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {{ error() }}
          </div>
        }
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group">
              <label for="firstName">{{ 'auth.firstName' | translate }}</label>
              <input 
                type="text" 
                id="firstName" 
                formControlName="firstName"
                class="input"
                [class.input-error]="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched"
                [placeholder]="'auth.firstName' | translate">
              @if (registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched) {
                <p class="error">{{ 'auth.firstName' | translate }}</p>
              }
            </div>
            
            <div class="form-group">
              <label for="lastName">{{ 'auth.lastName' | translate }}</label>
              <input 
                type="text" 
                id="lastName" 
                formControlName="lastName"
                class="input"
                [class.input-error]="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched"
                [placeholder]="'auth.lastName' | translate">
              @if (registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched) {
                <p class="error">{{ 'auth.lastName' | translate }}</p>
              }
            </div>
          </div>
          
          <div class="form-group">
            <label for="email">{{ 'auth.email' | translate }}</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email"
              class="input"
              [class.input-error]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
              [placeholder]="'auth.email' | translate">
            @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
              <p class="error">{{ 'auth.email' | translate }}</p>
            }
          </div>
          
          <div class="form-group">
            <label for="phoneNumber">{{ 'auth.phoneNumber' | translate }}</label>
            <input 
              type="tel" 
              id="phoneNumber" 
              formControlName="phoneNumber"
              class="input"
              [class.input-error]="registerForm.get('phoneNumber')?.invalid && registerForm.get('phoneNumber')?.touched"
              [placeholder]="'auth.phoneNumber' | translate">
            @if (registerForm.get('phoneNumber')?.invalid && registerForm.get('phoneNumber')?.touched) {
              <p class="error">{{ 'auth.phoneNumber' | translate }}</p>
            }
          </div>
          
          <div class="form-group">
            <label>{{ 'auth.gender' | translate }}</label>
            <div class="flex gap-4 mt-2">
              <label class="flex items-center">
                <input type="radio" formControlName="gender" [value]="false" class="mr-2">
                <span>{{ 'auth.male' | translate }}</span>
              </label>
              <label class="flex items-center">
                <input type="radio" formControlName="gender" [value]="true" class="mr-2">
                <span>{{ 'auth.female' | translate }}</span>
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label for="password">{{ 'auth.password' | translate }}</label>
            <input 
              type="password" 
              id="password" 
              formControlName="password"
              class="input"
              [class.input-error]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
              [placeholder]="'auth.password' | translate">
            @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
              <p class="error">{{ 'auth.password' | translate }}</p>
            }
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">{{ 'auth.confirmPassword' | translate }}</label>
            <input 
              type="password" 
              id="confirmPassword" 
              formControlName="confirmPassword"
              class="input"
              [class.input-error]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched"
              [placeholder]="'auth.confirmPassword' | translate">
            @if (registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched) {
              <p class="error">{{ 'auth.confirmPassword' | translate }}</p>
            }
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary w-full py-3 mt-4"
            [disabled]="loading() || registerForm.invalid">
            @if (loading()) {
              <span class="loading-spinner mr-2"></span>
              {{ 'common.loading' | translate }}
            } @else {
              {{ 'auth.registerButton' | translate }}
            }
          </button>
        </form>
        
        <div class="mt-6 text-center">
          <p class="text-gray-500">
            {{ 'auth.hasAccount' | translate }}
            <a [routerLink]="'/' + currentLang + '/auth/login'" class="text-blue-600 hover:text-blue-700 font-medium">
              {{ 'auth.loginLink' | translate }}
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
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private languageService = inject(LanguageService);
  
  loading = signal(false);
  error = signal<string | null>(null);
  
  // Get current language for routerLink
  get currentLang(): string {
    return this.languageService.currentLanguage();
  }
  
  registerForm = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required]],
    gender: [false, [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    confirmPassword: ['', [Validators.required]]
  });
  
  onSubmit(): void {
    if (this.registerForm.invalid) return;
    
    this.loading.set(true);
    this.error.set(null);
    
    const { confirmPassword, ...registerData } = this.registerForm.value;
    
    if (registerData.password !== confirmPassword) {
      this.error.set('Passwords do not match');
      this.loading.set(false);
      return;
    }
    
    this.authService.register(registerData as any).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.loading.set(false);
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        console.error('Registration failed:', error);
        this.loading.set(false);
        this.error.set(error.message || 'Registration failed. Please try again.');
      }
    });
  }
}
