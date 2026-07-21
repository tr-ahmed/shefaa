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
                    type="radio"
                    name="selectedRole"
                    class="sr-only peer"
                    [checked]="selectedRole() === role.key"
                    (change)="selectRole(role.key)"
                  >
                  <div class="rounded-xl border-2 p-4 text-center transition-all duration-150
                              border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700
                              peer-checked:border-primary-500 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900/30
                              hover:border-primary-300 dark:hover:border-primary-600
                              shadow-sm hover:shadow-md peer-checked:shadow-md peer-checked:shadow-primary-500/10">
                    <mat-icon class="text-slate-400 dark:text-slate-500 peer-checked:text-primary-600 text-2xl"
                              [class.text-primary-600]="selectedRole() === role.key">
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
                        *ngIf="selectedRole() === role.key"
                        class="text-primary-600 text-base leading-none"
                      >check_circle</mat-icon>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div *ngIf="error()" class="error-box">{{ error() }}</div>

            <button
              type="submit"
              [disabled]="form.invalid || !selectedRole() || loading()"
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

  selectedRole = signal<string>('Patient');

  readonly publicRoles = PUBLIC_ROLES;

  form = this.fb.nonNullable.group({
    firstName:   ['', [Validators.required, Validators.minLength(2)]],
    lastName:    ['', [Validators.required, Validators.minLength(2)]],
    email:       ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.pattern(/^[+\d\s()-]{6,20}$/)]],
    password:    ['', [Validators.required, Validators.minLength(8)]],
    gender:      [0, Validators.required]
  }, { updateOn: 'change' });

  selectRole(roleKey: string): void {
    this.selectedRole.set(roleKey);
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
    if (this.form.invalid || !this.selectedRole()) {
      this.form.markAllAsTouched();
      return;
    }

    const roles = [this.selectedRole()];
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
