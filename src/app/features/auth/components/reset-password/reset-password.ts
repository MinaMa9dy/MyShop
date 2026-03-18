import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ResetPasswordDto } from '../../../../core/models/auth.model';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
      <div class="auth-card card max-w-md w-full">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">Reset Password</h1>
          <p class="text-gray-500">Enter your new password below</p>
        </div>
        
        @if (success()) {
          <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-6 rounded-lg text-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <p class="font-bold text-lg mb-2">Password Reset Successful!</p>
            <p class="mb-6">Your password has been changed. You can now login with your new password.</p>
            <a [routerLink]="['/ar/auth/login']" class="btn btn-primary px-8">
              Login
            </a>
          </div>
        } @else {
          @if (error()) {
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <span>{{ error() }}</span>
            </div>
          }
          
          <form [formGroup]="resetForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="password">New Password</label>
              <input 
                type="password" 
                id="password" 
                formControlName="password"
                class="input"
                [class.input-error]="resetForm.get('password')?.invalid && resetForm.get('password')?.touched"
                placeholder="Enter new password">
            </div>
            
            <div class="form-group">
              <label for="confirmPassword">Confirm New Password</label>
              <input 
                type="password" 
                id="confirmPassword" 
                formControlName="confirmPassword"
                class="input"
                [class.input-error]="resetForm.get('confirmPassword')?.invalid && resetForm.get('confirmPassword')?.touched"
                placeholder="Confirm new password">
            </div>
            
            <button 
              type="submit" 
              class="btn btn-primary w-full py-3 mt-4"
              [disabled]="loading() || resetForm.invalid">
              @if (loading()) {
                <span class="loading-spinner mr-2"></span>
                Processing...
              } @else {
                Reset Password
              }
            </button>
          </form>
          
          <div class="mt-6 text-center">
            <a [routerLink]="['/ar/auth/login']" class="text-blue-600 hover:text-blue-700 font-medium">
              Back to Login
            </a>
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
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  loading = signal(false);
  success = signal(false);
  error = signal<string | null>(null);
  
  userId = '';
  token = '';
  
  resetForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });
  
  ngOnInit(): void {
    this.userId = this.route.snapshot.queryParams['userId'];
    this.token = this.route.snapshot.queryParams['token'];
    
    if (!this.userId || !this.token) {
      this.error.set('Invalid password reset link.');
    }
  }
  
  onSubmit(): void {
    if (this.resetForm.invalid || !this.userId || !this.token) return;
    
    const { password, confirmPassword } = this.resetForm.value;
    
    if (password !== confirmPassword) {
      this.error.set('Passwords do not match');
      return;
    }
    
    this.loading.set(true);
    this.error.set(null);
    
    const resetDto: ResetPasswordDto = {
      userId: this.userId,
      token: this.token,
      newPassword: password || '',
      confirmNewPassword: confirmPassword || ''
    };
    
    this.authService.resetPassword(resetDto).subscribe({
      next: () => {
        this.success.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Password reset failed:', err);
        this.error.set(err.error?.message || 'Password reset failed. The link might be expired.');
        this.loading.set(false);
      }
    });
  }
}
