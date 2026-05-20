import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as string[] | undefined;
  const hasToken = !!tokenService.getAccessToken();
  const hasRefreshToken = !!tokenService.getRefreshToken();

  if (!hasToken || !hasRefreshToken) {
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: route.url.map(segment => segment.path).join('/') }
    });
    return false;
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const hasRole = requiredRoles.some(role => authService.hasRole(role));
    if (!hasRole) {
      router.navigate(['/']);
      return false;
    }
  }

  return true;
};
