import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule, TranslateModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-primary-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 px-4 py-12">
      <div class="w-full max-w-md">
        <div class="card p-8 sm:p-10">

          <!-- Logo & Heading -->
          <div class="text-center mb-8">
            <div class="w-14 h-14 rounded-2xl bg-primary-600 text-white mx-auto flex items-center justify-center mb-4 shadow-lg shadow-primary-600/25">
              <mat-icon class="text-2xl">lock_reset</mat-icon>
            </div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ 'AUTH.FORGOT_TITLE' | translate }}</h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{{ 'AUTH.FORGOT_SUBTITLE' | translate }}</p>
          </div>

          <!-- Form -->
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
            <div>
              <label class="label">{{ 'AUTH.EMAIL' | translate }} *</label>
              <input formControlName="email" type="email" class="input" placeholder="name&#64;example.com" autocomplete="email">
              <small class="text-red-600 dark:text-red-400" *ngIf="fieldError('email')">{{ fieldError('email') }}</small>
            </div>

            <button type="submit" [disabled]="form.invalid || loading()" class="btn-primary w-full !py-3 flex items-center justify-center gap-2">
              <span *ngIf="loading()" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span *ngIf="!loading()">{{ 'AUTH.SEND_RESET_LINK' | translate }}</span>
            </button>
          </form>

          <!-- Success Message -->
          <div *ngIf="sent()" class="mt-5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 p-4 flex items-start gap-3">
            <mat-icon class="text-emerald-500 dark:text-emerald-400 mt-0.5">check_circle</mat-icon>
            <div>
              <p class="text-sm font-medium text-emerald-700 dark:text-emerald-300">{{ 'AUTH.RESET_EMAIL_SENT' | translate }}</p>
              <p class="text-xs text-emerald-600 dark:text-emerald-400 mt-1">{{ 'AUTH.CHECK_INBOX' | translate }}</p>
            </div>
          </div>

          <!-- Back to Login -->
          <div class="mt-6 pt-5 border-t border-slate-100 dark:border-slate-700 text-center text-sm">
            <a routerLink="/auth/login" class="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors">
              <mat-icon class="text-lg">arrow_back</mat-icon>
              {{ 'AUTH.BACK_TO_LOGIN' | translate }}
            </a>
          </div>
        </div>

        <!-- Footer -->
        <p class="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">{{ 'AUTH.LOGIN_FOOTER' | translate }}</p>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private translate = inject(TranslateService);

  loading = signal(false);
  sent = signal(false);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  }, { updateOn: 'change' });

  fieldError(name: string): string | null {
    const c = this.form.get(name);
    if (!c || !(c.dirty || c.touched) || c.valid) return null;
    if (c.errors?.['required']) return this.translate.instant('COMMON.FIELD_REQUIRED');
    if (c.errors?.['email']) return this.translate.instant('COMMON.INVALID_EMAIL');
    return this.translate.instant('COMMON.INVALID_VALUE');
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.auth.forgotPassword(this.form.getRawValue()).subscribe({
      next: () => { this.loading.set(false); this.sent.set(true); },
      error: () => { this.loading.set(false); this.sent.set(true); }
    });
  }
}
