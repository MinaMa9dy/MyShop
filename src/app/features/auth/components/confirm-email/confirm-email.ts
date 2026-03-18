import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmEmailDto } from '../../../../core/models/auth.model';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="auth-page min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
      <div class="auth-card card max-w-md w-full text-center">
        @if (loading()) {
          <div class="py-12">
            <div class="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-gray-600 font-medium">Confirming your email...</p>
          </div>
        } @else if (success()) {
          <div class="py-12">
            <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-gray-800 mb-2">Email Confirmed!</h1>
            <p class="text-gray-600 mb-8">Your email has been successfully confirmed. You can now log in to your account.</p>
            <a [routerLink]="['/ar/auth/login']" class="btn btn-primary px-8 py-3">
              Go to Login
            </a>
          </div>
        } @else {
          <div class="py-12">
            <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-gray-800 mb-2">Confirmation Failed</h1>
            <p class="text-gray-600 mb-8">{{ error() || 'The confirmation link is invalid or has expired.' }}</p>
            <div class="flex flex-col gap-4">
              <a [routerLink]="['/ar/auth/resend-email-confirmation']" class="btn btn-primary py-3">
                Resend Confirmation Link
              </a>
              <a [routerLink]="['/ar/auth/login']" class="btn btn-outline py-3">
                Back to Login
              </a>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }
  `]
})
export class ConfirmEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  
  loading = signal(true);
  success = signal(false);
  error = signal<string | null>(null);
  
  ngOnInit(): void {
    const userId = this.route.snapshot.queryParams['userId'];
    const token = this.route.snapshot.queryParams['token'];
    
    if (!userId || !token) {
      this.loading.set(false);
      this.error.set('Invalid confirmation link.');
      return;
    }
    
    const confirmDto: ConfirmEmailDto = { userId, token };
    
    this.authService.confirmEmail(confirmDto).subscribe({
      next: () => {
        this.success.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Email confirmation failed:', err);
        this.error.set(err.error?.message || 'Email confirmation failed. The link might be expired.');
        this.loading.set(false);
      }
    });
  }
}
