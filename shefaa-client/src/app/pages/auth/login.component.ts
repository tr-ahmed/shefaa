import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule, TranslateModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-primary-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 px-4 py-12">
      <div class="w-full max-w-md">

        <!-- Pending Approval -->
        <div *ngIf="pendingApproval()" class="card p-8 text-center">
          <div class="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-5">
            <mat-icon class="text-4xl">hourglass_top</mat-icon>
          </div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">{{ 'AUTH.REGISTRATION_PENDING_TITLE' | translate }}</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">{{ 'AUTH.REGISTRATION_PENDING_HINT' | translate }}</p>
          <a routerLink="/auth/login" class="btn-primary inline-flex items-center justify-center gap-2 w-full" (click)="pendingApproval.set(false)">
            <mat-icon class="text-lg">login</mat-icon> {{ 'AUTH.SIGN_IN' | translate }}
          </a>
        </div>

        <!-- Login Card -->
        <div *ngIf="!pendingApproval()" class="card p-8 sm:p-10">

          <!-- Logo & Heading -->
          <div class="text-center mb-8">
            <div class="w-14 h-14 rounded-2xl bg-primary-600 text-white mx-auto flex items-center justify-center mb-4 shadow-lg shadow-primary-600/25">
              <mat-icon class="text-2xl">local_hospital</mat-icon>
            </div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ 'AUTH.LOGIN_TITLE' | translate }}</h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1.5">{{ 'AUTH.LOGIN_SUBTITLE' | translate }}</p>
          </div>

          <!-- Form -->
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
            <div>
              <label class="label">{{ 'AUTH.EMAIL' | translate }} *</label>
              <input formControlName="email" type="email" class="input" placeholder="name&#64;example.com" autocomplete="email">
              <small class="text-red-600 dark:text-red-400" *ngIf="fieldError('email')">{{ fieldError('email') }}</small>
            </div>

            <div>
              <div class="flex justify-between items-center mb-1.5">
                <label class="label !mb-0">{{ 'AUTH.PASSWORD' | translate }} *</label>
                <a routerLink="/auth/forgot-password" class="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors">{{ 'AUTH.FORGOT_PASSWORD' | translate }}</a>
              </div>
              <div class="relative">
                <input formControlName="password" [type]="showPwd() ? 'text' : 'password'" class="input pe-10" autocomplete="current-password">
                <button type="button" (click)="showPwd.set(!showPwd())" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                  <mat-icon class="text-xl">{{ showPwd() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </div>
              <small class="text-red-600 dark:text-red-400" *ngIf="fieldError('password')">{{ fieldError('password') }}</small>
            </div>

            <div *ngIf="error()" class="error-box">{{ error() }}</div>

            <button type="submit" [disabled]="form.invalid || loading()" class="btn-primary w-full !py-3 flex items-center justify-center gap-2">
              <span *ngIf="loading()" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span *ngIf="!loading()">{{ 'AUTH.SIGN_IN' | translate }}</span>
            </button>
          </form>

          <div class="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            {{ 'AUTH.NO_ACCOUNT' | translate }}
            <a routerLink="/auth/register" class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-semibold ms-1 transition-colors">{{ 'AUTH.SIGN_UP' | translate }}</a>
          </div>
        </div>

        <!-- Footer -->
        <p class="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">{{ 'AUTH.LOGIN_FOOTER' | translate }}</p>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  loading = signal(false);
  error = signal<string | null>(null);
  showPwd = signal(false);
  pendingApproval = signal(false);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  }, { updateOn: 'change' });

  fieldError(name: string): string | null {
    const c = this.form.get(name);
    if (!c || !(c.dirty || c.touched) || c.valid) return null;
    if (c.errors?.['required']) return this.translate.instant('COMMON.FIELD_REQUIRED');
    if (c.errors?.['email']) return this.translate.instant('COMMON.INVALID_EMAIL');
    if (c.errors?.['minlength']) return this.translate.instant('COMMON.MIN_LENGTH', { min: c.errors['minlength'].requiredLength });
    return this.translate.instant('COMMON.INVALID_VALUE');
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set(null);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) this.auth.redirectByRole();
        else {
          if (res.message?.includes('pending approval')) {
            this.pendingApproval.set(true);
          } else {
            this.error.set(res.message || this.translate.instant('AUTH.INVALID_CREDENTIALS'));
          }
        }
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 429) this.error.set(this.translate.instant('AUTH.TOO_MANY_ATTEMPTS'));
        else if (err.error?.message) this.error.set(err.error.message);
        else if (err.status === 401) this.error.set(this.translate.instant('AUTH.INVALID_CREDENTIALS'));
        else this.error.set(this.translate.instant('COMMON.ERROR_OCCURRED'));
      }
    });
  }
}
