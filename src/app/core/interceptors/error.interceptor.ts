import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
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
      } else {
        // Server-side error
        switch (error.status) {
          case 403:
            errorMessage = 'Forbidden. You do not have permission to access this resource.';
            break;
          case 404:
            errorMessage = 'Resource not found.';
            break;
          case 400:
            errorMessage = error.error?.message || 'Bad request.';
            break;
          case 500:
            errorMessage = 'Internal server error. Please try again later.';
            break;
          default:
            errorMessage = error.message || `Error: ${error.status}`;
        }
      }
      
      // Log error to console in development
      console.error('HTTP Error:', errorMessage, error);
      
      return throwError(() => new Error(errorMessage));
    })
  );
};
