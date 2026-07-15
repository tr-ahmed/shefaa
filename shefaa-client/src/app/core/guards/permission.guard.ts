import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Route guard that verifies the authenticated user holds at least one
 * of the required fine-grained permissions (e.g. 'admin.doctors.manage').
 *
 * Permissions are populated from the JWT via AuthorizationCatalog on the backend
 * and stored in UserDto.permissions after login/register.
 *
 * Usage in routes:
 *   canActivate: [permissionGuard('admin.doctors.manage')]
 */
export const permissionGuard = (...requiredPerms: string[]): CanActivateFn => (route, state) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  if (auth.hasAnyPermission(...requiredPerms)) {
    return true;
  }

  router.navigate(['/forbidden']);
  return false;
};
