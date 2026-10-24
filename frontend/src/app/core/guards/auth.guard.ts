import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If the user has a token, allow them to access the route
  if (authService.isLoggedIn()) {
    return true;
  }

  // Otherwise, redirect them back to the login page
  router.navigate(['/login']);
  return false;
};