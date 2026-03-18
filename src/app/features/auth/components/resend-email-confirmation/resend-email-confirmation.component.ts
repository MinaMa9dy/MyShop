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
    <div class="auth-page min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
      <div class="auth-card card max-w-md w-full">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">{{ 'auth.resendConfirmation' | translate }}</h1>
          <p class="text-gray-500">{{ 'auth.resendConfirmationDesc' | translate }}</p>
        </div>
        
        @if (success()) {
          <div class="success-alert bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-center">
            <svg class="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <p class="font-medium">Success!</p>
            <p class="text-sm">{{ 'auth.resendConfirmationSuccess' | translate }}</p>
            <button (click)="success.set(false)" class="mt-4 text-green-600 hover:text-green-800 text-sm font-medium">
              {{ 'auth.resendConfirmationButton' | translate }}
            </button>
          </div>
        } @else {
          @if (error()) {
            <div class="error-alert bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 relative">
              <div class="flex items-start">
                <div class="flex-1">
                  <p class="text-sm">{{ error() }}</p>
                </div>
                <button type="button" (click)="error.set(null)" class="text-red-500 hover:text-red-700 ml-2">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                </button>
              </div>
            </div>
          }
          
          <form [formGroup]="resendForm" (ngSubmit)="onSubmit()">
            <div class="form-group mb-4">
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">{{ 'auth.email' | translate }}</label>
              <input 
                type="email" 
                id="email" 
                formControlName="email"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                [class.border-red-500]="resendForm.get('email')?.invalid && resendForm.get('email')?.touched"
                [placeholder]="'auth.email' | translate">
              @if (resendForm.get('email')?.invalid && resendForm.get('email')?.touched) {
                <p class="text-red-500 text-xs mt-1">{{ 'auth.email' | translate }}</p>
              }
            </div>
            
            <button 
              type="submit" 
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md transition-colors duration-200 flex items-center justify-center"
              [disabled]="loading() || resendForm.invalid">
              @if (loading()) {
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ 'common.loading' | translate }}
              } @else {
                {{ 'auth.resendConfirmationButton' | translate }}
              }
            </button>
          </form>
        }
        
        <div class="mt-6 text-center">
          <p class="text-gray-500">
            {{ 'auth.remembered' | translate }} 
            <a [routerLink]="'/' + currentLang + '/auth/login'" class="text-blue-600 hover:text-blue-700 font-medium">
              {{ 'auth.backToLogin' | translate }}
            </a>
          </p>
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
export class ResendEmailConfirmationComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private languageService = inject(LanguageService);
  
  loading = signal(false);
  success = signal(false);
  error = signal<string | null>(null);
  
  resendForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  get currentLang(): string {
    return this.languageService.currentLanguage();
  }
  
  onSubmit(): void {
    if (this.resendForm.invalid) return;
    
    this.loading.set(true);
    this.error.set(null);
    
    const email = this.resendForm.value.email!;
    
    this.authService.resendEmailConfirmation({ 
      email: email,
      clientURI: `${window.location.origin}/${this.currentLang}/auth/confirm-email`
    }).subscribe({
      next: (response) => {
        console.log('Resend email response:', response);
        this.loading.set(false);
        this.success.set(true);
      },
      error: (err) => {
        console.error('Resend email failed:', err);
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to resend confirmation email. Please try again later.');
      }
    });
  }
}
