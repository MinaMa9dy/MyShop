import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { isResultPattern } from '../models/result.model';

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const toastService = inject(ToastService);
  
  // Skip error handling for translation file requests
  if (req.url.includes('/assets/i18n/')) {
    return next(req);
  }
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Skip 401 errors - let auth interceptor handle them
      if (error.status === 401) {
        console.log('ErrorInterceptor - 401 received, letting auth interceptor handle it');
        return throwError(() => error);
      }
      
      let errorMessage = 'An error occurred';
      
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = error.error.message;
      } else if (typeof error.error === 'string') {
        // Plain string response (e.g., from StatusCode(400, "message"))
        errorMessage = error.error;
      } else if (error.error && isResultPattern(error.error) && !error.error.isSuccess) {
        // Server-side error - check for Result pattern first
        errorMessage = error.error.error?.message || 'An error occurred';
      } else if (error.error?.message) {
        // Check for message property
        errorMessage = error.error.message;
      } else if (error.error?.Message) {
        // Check for Message property (PascalCase)
        errorMessage = error.error.Message;
      } else if (Array.isArray(error.error) && error.error.length > 0) {
        // Check for ModelState array errors
        errorMessage = typeof error.error[0] === 'string' 
          ? error.error[0] 
          : error.error[0]?.errorMessage || error.error[0]?.message;
      } else {
        // Fallback to status-based messages
        switch (error.status) {
          case 403:
            errorMessage = 'Forbidden. You do not have permission to access this resource.';
            break;
          case 404:
            errorMessage = 'Resource not found.';
            break;
          case 400:
            errorMessage = 'Bad request. Please check your input.';
            break;
          case 500:
            errorMessage = 'Internal server error. Please try again later.';
            break;
          case 0:
            errorMessage = 'Cannot connect to server. Please check your connection.';
            break;
          default:
            errorMessage = error.message || `Error: ${error.status}`;
        }
      }
      
      // Log error to console in development
      console.error('HTTP Error:', errorMessage, error);
      
      // Show toast notification for the error
      toastService.showError(errorMessage);
      
      // Re-throw the error so components can handle it if needed
      return throwError(() => error);
    })
  );
};
