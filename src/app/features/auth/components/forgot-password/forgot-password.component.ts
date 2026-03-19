import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../../core/services/auth.service';
import { LanguageService } from '../../../../core/services/language.service';
import { ForgotPasswordDto } from '../../../../core/models/auth.model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  template: `
    <div class="auth-page min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div class="text-center">
          <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm">
            🔒
          </div>
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
            {{ 'auth.forgotPassword' | translate }}
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            {{ 'auth.forgotPasswordDesc' | translate }}
          </p>
        </div>

        @if (successMessage()) {
          <div class="p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 animate-fade-in">
            <div class="flex">
              <svg class="h-5 w-5 text-green-400 mr-2 rtl:ml-2 rtl:mr-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span>{{ successMessage() }}</span>
            </div>
          </div>
        }

        @if (errorMessage()) {
          <div class="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 animate-fade-in">
            <div class="flex">
              <svg class="h-5 w-5 text-red-400 mr-2 rtl:ml-2 rtl:mr-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <span>{{ errorMessage() }}</span>
            </div>
          </div>
        }

        <form class="mt-8 space-y-6" [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              {{ 'auth.email' | translate }}
            </label>
            <div class="mt-1 relative">
              <div class="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <input formControlName="email" id="email" name="email" type="email" autocomplete="email" required
                class="appearance-none block w-full px-3 py-3 ps-10 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                [class.border-red-300]="forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched"
                placeholder="you@example.com">
            </div>
            @if (forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched) {
              <p class="mt-2 text-sm text-red-600">Please enter a valid email address.</p>
            }
          </div>

          <div>
            <button type="submit"
              [disabled]="forgotPasswordForm.invalid || submitting()"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              @if (submitting()) {
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ 'auth.sending' | translate }}
              } @else {
                {{ 'auth.sendResetLink' | translate }}
              }
            </button>
          </div>
          
          <div class="text-sm text-center">
            <span class="text-gray-500">{{ 'auth.remembered' | translate }} </span>
            <a [routerLink]="['/' + currentLang + '/auth/login']" class="font-medium text-blue-600 hover:text-blue-500 transition-colors">
              {{ 'auth.backToLogin' | translate }}
            </a>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private languageService = inject(LanguageService);
  private translate = inject(TranslateService);

  forgotPasswordForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  submitting = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  get currentLang(): string {
    return this.languageService.currentLanguage();
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    // Current URI to redirect back for resetting 
    // Usually the base url + language + /auth/reset-password
    const clientURI = `${window.location.origin}/${this.currentLang}/auth/reset-password`;
    
    const request: ForgotPasswordDto = {
      email: this.forgotPasswordForm.value.email,
      clientURI: clientURI
    };

    this.authService.forgotPassword(request).subscribe({
      next: () => {
        this.submitting.set(false);
        this.successMessage.set(this.translate.instant('auth.resetLinkSent'));
        this.forgotPasswordForm.reset();
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(err.error?.message || err.error?.error || 'Failed to send reset link. Please try again.');
        console.error('Forgot password error:', err);
      }
    });
  }
}
