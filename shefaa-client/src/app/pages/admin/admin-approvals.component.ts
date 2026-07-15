import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DataService } from '../../core/services/data.service';
import { UserDto } from '../../core/models';

@Component({
  selector: 'app-admin-approvals',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, TranslateModule],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ 'ADMIN.APPROVALS.TITLE' | translate }}</h1>
        <p class="page-subtitle">{{ 'ADMIN.APPROVALS.SUBTITLE' | translate }}</p>
      </div>
      <button class="btn-secondary" (click)="load()">
        <mat-icon>refresh</mat-icon> {{ 'COMMON.REFRESH' | translate }}
      </button>
    </div>

    <!-- Loading -->
    <div *ngIf="loading()" class="flex flex-col gap-4">
      <div class="card p-5" *ngFor="let i of [1,2]">
        <div class="flex items-center gap-4">
          <div class="skeleton w-12 h-12 rounded-full"></div>
          <div class="flex-1">
            <div class="skeleton h-5 w-1/3 rounded mb-2"></div>
            <div class="skeleton h-4 w-1/4 rounded mb-2"></div>
            <div class="skeleton h-3 w-1/5 rounded"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty / All Approved -->
    <div *ngIf="!loading() && pending().length === 0" class="empty-state card p-12">
      <div class="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 flex items-center justify-center mb-4">
        <mat-icon class="text-3xl">check_circle</mat-icon>
      </div>
      <p class="text-lg font-medium text-slate-900 dark:text-white mb-1">{{ 'ADMIN.APPROVALS.NO_PENDING' | translate }}</p>
      <p class="text-sm text-slate-500 dark:text-slate-400">{{ 'ADMIN.APPROVALS.ALL_APPROVED' | translate }}</p>
    </div>

    <!-- Pending Approvals List -->
    <div *ngIf="!loading() && pending().length > 0" class="flex flex-col gap-4">
      <div *ngFor="let u of pending()" class="card card-hover p-0 overflow-hidden">
        <div class="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
          <div class="flex items-center gap-4 flex-1 min-w-0">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold text-lg shadow-md flex-shrink-0">
              {{ initials(u.fullName || (u.firstName + ' ' + u.lastName)) }}
            </div>
            <div class="min-w-0">
              <div class="font-semibold text-slate-900 dark:text-white text-lg leading-tight truncate">
                {{ u.fullName || (u.firstName + ' ' + u.lastName) }}
              </div>
              <div class="text-sm text-slate-500 dark:text-slate-400 truncate">{{ u.email }}</div>
              <div class="flex items-center gap-1.5 mt-1.5">
                <span class="badge badge-warning">
                  <mat-icon class="text-[14px]">pending</mat-icon>
                  {{ 'ADMIN.APPROVALS.REGISTERED' | translate }}
                </span>
                <span class="badge badge-info">{{ u.userType }}</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2 sm:flex-shrink-0 pl-[64px] sm:pl-0">
            <button class="btn-primary" (click)="approve(u)" [disabled]="processing()">
              <mat-icon>check</mat-icon> {{ 'ADMIN.APPROVALS.APPROVE' | translate }}
            </button>
            <button class="btn-danger" (click)="reject(u)" [disabled]="processing()">
              <mat-icon>close</mat-icon> {{ 'ADMIN.APPROVALS.REJECT' | translate }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminApprovalsComponent implements OnInit {
  private data = inject(DataService);
  private snack = inject(MatSnackBar);
  private translate = inject(TranslateService);

  loading = signal(true);
  processing = signal(false);
  pending = signal<UserDto[]>([]);

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.data.getPendingClinicAdmins().subscribe({
      next: list => { this.pending.set(list || []); this.loading.set(false); },
      error: () => { this.loading.set(false); this.snack.open(this.translate.instant('COMMON.ERROR_OCCURRED'), this.translate.instant('COMMON.OK'), { duration: 2500 }); }
    });
  }

  approve(u: UserDto) {
    const name = u.fullName || (u.firstName + ' ' + u.lastName);
    if (!confirm(this.translate.instant('ADMIN.APPROVALS.APPROVE_CONFIRM', { name }))) return;
    this.processing.set(true);
    this.data.approveClinicAdmin(u.id).subscribe({
      next: res => {
        this.processing.set(false);
        if (res.success) {
          this.snack.open(this.translate.instant('ADMIN.APPROVALS.APPROVED'), this.translate.instant('COMMON.OK'), { duration: 2000 });
          this.load();
        } else {
          this.snack.open(res.message || this.translate.instant('COMMON.SAVE_FAILED'), this.translate.instant('COMMON.OK'), { duration: 3000 });
        }
      },
      error: err => { this.processing.set(false); this.snack.open(err.error?.message || this.translate.instant('COMMON.SAVE_FAILED'), this.translate.instant('COMMON.OK'), { duration: 3000 }); }
    });
  }

  reject(u: UserDto) {
    const name = u.fullName || (u.firstName + ' ' + u.lastName);
    if (!confirm(this.translate.instant('ADMIN.APPROVALS.REJECT_CONFIRM', { name }))) return;
    this.processing.set(true);
    this.data.rejectClinicAdmin(u.id).subscribe({
      next: res => {
        this.processing.set(false);
        if (res.success) {
          this.snack.open(this.translate.instant('ADMIN.APPROVALS.REJECTED'), this.translate.instant('COMMON.OK'), { duration: 2000 });
          this.load();
        } else {
          this.snack.open(res.message || this.translate.instant('COMMON.SAVE_FAILED'), this.translate.instant('COMMON.OK'), { duration: 3000 });
        }
      },
      error: err => { this.processing.set(false); this.snack.open(err.error?.message || this.translate.instant('COMMON.SAVE_FAILED'), this.translate.instant('COMMON.OK'), { duration: 3000 }); }
    });
  }

  initials(name: string) {
    return name.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();
  }
}
