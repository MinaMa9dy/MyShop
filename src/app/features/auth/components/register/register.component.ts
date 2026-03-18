import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LanguageService } from '../../../../core/services/language.service';
import { TranslatePipe } from '@ngx-translate/core';
import { RegisterDto } from '../../../../core/models/auth.model';

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
        
        @if (successMessage()) {
          <div class="success-alert bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 relative">
            <div class="flex items-start">
              <svg class="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
              </svg>
              <div class="flex-1">
                <p class="font-medium">Success</p>
                <p class="text-sm">{{ successMessage() }}</p>
                <div class="mt-2 text-xs">
                  <a [routerLink]="'/' + currentLang + '/auth/resend-email-confirmation'" class="underline font-semibold hover:text-green-800">
                    {{ 'auth.resendConfirmationLink' | translate }}
                  </a>
                </div>
              </div>
              <button type="button" (click)="clearError()" class="text-green-500 hover:text-green-700 ml-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>
        }
        
        @if (error()) {
          <div class="error-alert bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 relative">
            <div class="flex items-start">
              <svg class="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <div class="flex-1">
                <p class="font-medium">Error</p>
                <p class="text-sm">{{ error() }}</p>
              </div>
              <button type="button" (click)="clearError()" class="text-red-500 hover:text-red-700 ml-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </button>
            </div>
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
                <input type="radio" formControlName="gender" [value]="true" class="mr-2">
                <span>{{ 'auth.male' | translate }}</span>
              </label>
              <label class="flex items-center">
                <input type="radio" formControlName="gender" [value]="false" class="mr-2">
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
  successMessage = signal<string | null>(null);
  
  // Get current language for routerLink
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
    if (this.registerForm.invalid) {
      console.log('Form is invalid:', this.registerForm.errors);
      console.log('Form values:', this.registerForm.value);
      return;
    }
    
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
    
    console.log('Sending register data:', registerData);
    
    this.authService.register(registerData).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.loading.set(false);
        
        if (response.requiresEmailConfirmation) {
          this.successMessage.set(response.message || 'Registration successful. Please check your email to confirm your account.');
          this.registerForm.reset();
        } else {
          this.router.navigate([`/${this.currentLang}/dashboard`]);
        }
      },
      error: (err) => {
        console.error('Registration failed:', err);
        this.loading.set(false);
        
        // Let the global interceptor handle the toast notification
        // Just show local error for this form
        let errorMessage = 'Registration failed. Please try again.';
        // Try to extract exact error message from the backend response
        const errorData = err.error;
        if (errorData) {
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
      }
    });
  }
}
