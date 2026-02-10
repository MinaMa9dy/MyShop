import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';

// Public endpoints that don't require authentication
const publicEndpoints = [
  '/Products/',
  '/Categories/',
  '/Home/',
  '/Photo/'
];

/**
 * Check if user is authenticated based on token presence
 * User is considered authenticated only if BOTH access token and refresh token exist
 */
function isUserAuthenticated(tokenService: TokenService): boolean {
  const hasAccessToken = !!tokenService.getAccessToken();
  const hasRefreshToken = !!tokenService.getRefreshToken();
  return hasAccessToken && hasRefreshToken;
}

/**
 * Check if request should be silently handled for unauthenticated users
 * GET Cart requests should not redirect unauthenticated users
 */
function shouldHandleSilentlyForUnauthenticated(req: HttpRequest<unknown>): boolean {
  return req.url.includes('/Cart') && req.method === 'GET';
}

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);
  const cartService = inject(CartService);
  const router = inject(Router);
  
  const token = tokenService.getAccessToken();
  const refreshToken = tokenService.getRefreshToken();
  const isAuthenticated = isUserAuthenticated(tokenService);
  
  // Skip for login, register, and refresh token endpoints
  const isAuthEndpoint = req.url.includes('/Account/Login') || 
                          req.url.includes('/Account/Register') ||
                          req.url.includes('/Account/RefreshToken');
  
  // Check if this is a public endpoint
  const isPublicEndpoint = publicEndpoints.some(endpoint => req.url.includes(endpoint));
  
  // Add token to request if available
  if (token && !isAuthEndpoint) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized
      if (error.status === 401 && !isAuthEndpoint) {
        
        // CASE 1: User is not authenticated (missing access token or refresh token)
        // Redirect to login immediately without attempting refresh
        if (!isAuthenticated) {
          // Special case: GET Cart requests from unauthenticated users should be silently handled
          if (shouldHandleSilentlyForUnauthenticated(req)) {
            console.log('AuthInterceptor - Unauthenticated GET Cart request, handling 401 silently');
            return throwError(() => error);
          }
          
          console.log('AuthInterceptor - User not authenticated (missing tokens), redirecting to login');
          const lang = localStorage.getItem('language') || 'en';
          router.navigate([`/${lang}/auth/login`]);
          return throwError(() => error);
        }
        
        // CASE 2: User IS authenticated (has both tokens)
        // Attempt to refresh the access token
        console.log('AuthInterceptor - Authenticated user with 401, attempting token refresh');
        
        return authService.refreshToken().pipe(
          switchMap((response) => {
            // Refresh succeeded (2xx status)
            console.log('AuthInterceptor - Token refresh succeeded');
            
            // Update tokens with new values
            const newRefreshToken = response.refreshToken || refreshToken || '';
            tokenService.setTokens(response.token, newRefreshToken);
            
            // Retry original request with new token
            const clonedReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${response.token}`
              }
            });
            return next(clonedReq);
          }),
          catchError((refreshError: HttpErrorResponse) => {
            // Only logout if refresh token ALSO returns 401
            // This indicates the session is fully compromised (both tokens invalid)
            if (refreshError.status === 401) {
              console.log('AuthInterceptor - Token refresh returned 401, logging out user');
              
              // Clear all authentication tokens
              tokenService.clearTokens();
              
              // Clear session storage
              sessionStorage.removeItem('accessToken');
              sessionStorage.removeItem('refreshToken');
              
              // Clear any auth-related cookies
              document.cookie.split(";").forEach((c) => {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
              });
              
              // Clear cart data
              cartService.clear();
              
              // Redirect to login page
              const lang = localStorage.getItem('language') || 'en';
              router.navigate([`/${lang}/auth/login`]);
            } else {
              // Refresh returned other error (404, 400, etc.)
              // Don't logout - just pass the error through
              console.log('AuthInterceptor - Token refresh returned non-401 error, passing through');
            }
            
            return throwError(() => refreshError);
          })
        );
      }
      
      // For other errors, pass through
      return throwError(() => error);
    })
  );
};
