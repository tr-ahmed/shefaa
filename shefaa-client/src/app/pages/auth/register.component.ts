import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';

const PUBLIC_ROLES: { key: string; icon: string; labelKey: string; descKey: string }[] = [
  { key: 'Patient',     icon: 'person',          labelKey: 'AUTH.PATIENT',         descKey: 'AUTH.PATIENT_DESC' },
  { key: 'ClinicAdmin', icon: 'local_hospital',  labelKey: 'AUTH.CLINIC_OWNER',    descKey: 'AUTH.CLINIC_OWNER_DESC' },
];

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule, TranslateModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-primary-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 px-4 py-12">
      <div class="w-full max-w-lg">

        <!-- Pending Approval -->
        <div *ngIf="pendingApproval" class="card p-8 text-center">
          <div class="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-5">
            <mat-icon class="text-4xl">hourglass_top</mat-icon>
          </div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">{{ 'AUTH.REGISTRATION_PENDING_TITLE' | translate }}</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">{{ 'AUTH.REGISTRATION_PENDING_MSG' | translate }}</p>
          <a routerLink="/auth/login" class="btn-primary inline-flex items-center justify-center gap-2 w-full">
            <mat-icon class="text-lg">login</mat-icon> {{ 'AUTH.SIGN_IN' | translate }}
          </a>
        </div>

        <!-- Register Card -->
        <div *ngIf="!pendingApproval" class="card p-8 sm:p-10">

          <!-- Logo & Heading -->
          <div class="text-center mb-8">
            <div class="w-14 h-14 rounded-2xl bg-primary-600 text-white mx-auto flex items-center justify-center mb-4 shadow-lg shadow-primary-600/25">
              <mat-icon class="text-2xl">local_hospital</mat-icon>
            </div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ 'AUTH.REGISTER_TITLE' | translate }}</h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1.5">{{ 'AUTH.REGISTER_SUBTITLE' | translate }}</p>
          </div>

          <!-- Social Login -->
          <div class="grid grid-cols-2 gap-3 mb-6">
            <button type="button" class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
              <svg class="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
            <button type="button" class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </button>
          </div>

          <div class="divider mb-6">
            <span class="px-3 text-xs text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 uppercase tracking-wide">{{ 'AUTH.OR_CONTINUE_WITH' | translate }}</span>
          </div>

          <!-- Form -->
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">

            <!-- Name row -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="label">{{ 'AUTH.FIRST_NAME' | translate }} *</label>
                <input formControlName="firstName" class="input" autocomplete="given-name">
                <small class="text-red-600 dark:text-red-400" *ngIf="fieldError('firstName')">{{ fieldError('firstName') }}</small>
              </div>
              <div>
                <label class="label">{{ 'AUTH.LAST_NAME' | translate }} *</label>
                <input formControlName="lastName" class="input" autocomplete="family-name">
                <small class="text-red-600 dark:text-red-400" *ngIf="fieldError('lastName')">{{ fieldError('lastName') }}</small>
              </div>
            </div>

            <!-- Email -->
            <div>
              <label class="label">{{ 'AUTH.EMAIL' | translate }} *</label>
              <input formControlName="email" type="email" class="input" placeholder="name&#64;example.com" autocomplete="email">
              <small class="text-red-600 dark:text-red-400" *ngIf="fieldError('email')">{{ fieldError('email') }}</small>
            </div>

            <!-- Phone -->
            <div>
              <label class="label">{{ 'AUTH.PHONE' | translate }}</label>
              <input formControlName="phoneNumber" type="tel" class="input" placeholder="+20 100 000 0000" autocomplete="tel">
              <small class="text-red-600 dark:text-red-400" *ngIf="fieldError('phoneNumber')">{{ fieldError('phoneNumber') }}</small>
            </div>

            <!-- Password -->
            <div>
              <label class="label">{{ 'AUTH.PASSWORD' | translate }} *</label>
              <input formControlName="password" type="password" class="input" autocomplete="new-password">
              <p class="text-xs text-slate-400 dark:text-slate-500 mt-1.5">{{ 'AUTH.WEAK_PASSWORD' | translate }}</p>
              <small class="text-red-600 dark:text-red-400" *ngIf="fieldError('password')">{{ fieldError('password') }}</small>
            </div>

            <!-- Role Selection -->
            <div>
              <label class="label">{{ 'AUTH.I_AM_A' | translate }}</label>
              <p class="text-xs text-slate-400 dark:text-slate-500 mb-3">{{ 'AUTH.ROLE_HINT' | translate }}</p>

              <div class="grid grid-cols-2 gap-3">
                <label
                  *ngFor="let role of publicRoles"
                  class="cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    class="sr-only peer"
                    [checked]="isRoleSelected(role.key)"
                    (change)="toggleRole(role.key)"
                  >
                  <div class="rounded-xl border-2 p-4 text-center transition-all duration-150
                              border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700
                              peer-checked:border-primary-500 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900/30
                              hover:border-primary-300 dark:hover:border-primary-600
                              shadow-sm hover:shadow-md peer-checked:shadow-md peer-checked:shadow-primary-500/10">
                    <mat-icon class="text-slate-400 dark:text-slate-500 peer-checked:text-primary-600 text-2xl"
                              [class.text-primary-600]="isRoleSelected(role.key)">
                      {{ role.icon }}
                    </mat-icon>
                    <div class="font-semibold mt-1 text-sm text-slate-800 dark:text-white">
                      {{ role.labelKey | translate }}
                    </div>
                    <div class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {{ role.descKey | translate }}
                    </div>
                    <div class="mt-2 h-5 flex justify-center">
                      <mat-icon
                        *ngIf="isRoleSelected(role.key)"
                        class="text-primary-600 text-base leading-none"
                      >check_circle</mat-icon>
                    </div>
                  </div>
                </label>
              </div>

              <small class="text-red-600 dark:text-red-400" *ngIf="rolesError">
                {{ 'AUTH.SELECT_AT_LEAST_ONE_ROLE' | translate }}
              </small>
            </div>

            <div *ngIf="error()" class="error-box">{{ error() }}</div>

            <button
              type="submit"
              [disabled]="form.invalid || selectedRoles().length === 0 || loading()"
              class="btn-primary w-full !py-3 flex items-center justify-center gap-2"
            >
              <span *ngIf="loading()" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span *ngIf="!loading()">{{ 'AUTH.SIGN_UP' | translate }}</span>
            </button>
          </form>

          <div class="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            {{ 'AUTH.ALREADY_HAVE_ACCOUNT' | translate }}
            <a routerLink="/auth/login" class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-semibold ms-1 transition-colors">
              {{ 'AUTH.SIGN_IN' | translate }}
            </a>
          </div>
        </div>

        <!-- Footer -->
        <p class="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">{{ 'AUTH.LOGIN_FOOTER' | translate }}</p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  loading = signal(false);
  error = signal<string | null>(null);
  pendingApproval = false;

  selectedRoles = signal<string[]>(['Patient']);

  readonly publicRoles = PUBLIC_ROLES;

  form = this.fb.nonNullable.group({
    firstName:   ['', [Validators.required, Validators.minLength(2)]],
    lastName:    ['', [Validators.required, Validators.minLength(2)]],
    email:       ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.pattern(/^[+\d\s()-]{6,20}$/)]],
    password:    ['', [Validators.required, Validators.minLength(8)]],
    gender:      [0, Validators.required]
  }, { updateOn: 'change' });

  get rolesError(): boolean {
    return this._submitted && this.selectedRoles().length === 0;
  }
  private _submitted = false;

  isRoleSelected(roleKey: string): boolean {
    return this.selectedRoles().includes(roleKey);
  }

  toggleRole(roleKey: string): void {
    const current = this.selectedRoles();
    if (current.includes(roleKey)) {
      this.selectedRoles.set(current.filter(r => r !== roleKey));
    } else {
      this.selectedRoles.set([...current, roleKey]);
    }
  }

  fieldError(name: string): string | null {
    const c = this.form.get(name);
    if (!c || !(c.dirty || c.touched) || c.valid) return null;
    if (c.errors?.['required'])   return this.translate.instant('COMMON.FIELD_REQUIRED');
    if (c.errors?.['email'])      return this.translate.instant('COMMON.INVALID_EMAIL');
    if (c.errors?.['minlength'])  return this.translate.instant('COMMON.MIN_LENGTH', { min: c.errors['minlength'].requiredLength });
    if (c.errors?.['pattern'])    return this.translate.instant('COMMON.INVALID_FORMAT');
    return this.translate.instant('COMMON.INVALID_VALUE');
  }

  submit() {
    this._submitted = true;
    if (this.form.invalid || this.selectedRoles().length === 0) {
      this.form.markAllAsTouched();
      return;
    }

    const roles = this.selectedRoles();
    const userType = this.resolveUserType(roles);

    this.loading.set(true);
    this.error.set(null);

    const raw = this.form.getRawValue();
    this.auth.register({ ...raw, roles, userType }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          if (roles.includes('ClinicAdmin')) {
            this.pendingApproval = true;
          } else {
            this.auth.redirectByRole();
          }
        } else {
          this.error.set(res.message || this.translate.instant('COMMON.SAVE_FAILED'));
        }
      },
      error: (err) => {
        this.loading.set(false);
        if (err.error?.errors?.length) this.error.set(err.error.errors.join(', '));
        else if (err.error?.message)   this.error.set(err.error.message);
        else                           this.error.set(this.translate.instant('COMMON.ERROR_OCCURRED'));
      }
    });
  }

  private resolveUserType(roles: string[]): number {
    if (roles.includes('SystemAdmin')) return 5;
    if (roles.includes('ClinicAdmin')) return 4;
    if (roles.includes('ClinicStaff')) return 3;
    if (roles.includes('Doctor'))      return 2;
    return 1;
  }
}
