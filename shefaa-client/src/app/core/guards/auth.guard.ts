import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

export const roleGuard = (...roles: string[]): CanActivateFn => (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
  if (auth.hasAnyRole(...roles)) return true;
  router.navigate(['/forbidden']);
  return false;
};

/** Only SystemAdmin – used for specialties, approvals, etc. */
export const systemAdminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
  if (auth.hasRole('SystemAdmin')) return true;
  router.navigate(['/forbidden']);
  return false;
};

/** SystemAdmin + ClinicAdmin – excludes ClinicStaff. */
export const adminOnlyGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
  if (auth.hasAnyRole('SystemAdmin', 'ClinicAdmin')) return true;
  router.navigate(['/forbidden']);
  return false;
};