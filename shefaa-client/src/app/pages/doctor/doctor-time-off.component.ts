import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DataService } from '../../core/services/data.service';
import { DoctorDto } from '../../core/models';

@Component({
  selector: 'app-doctor-time-off',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, TranslateModule],
  template: `
    <div class="page-header animate-fade-in">
      <div>
        <h1 class="page-title">{{ 'DOCTOR_PORTAL.TIME_OFF_TITLE' | translate }}</h1>
        <p class="page-subtitle">{{ 'DOCTOR_PORTAL.ADD_TIME_OFF' | translate }}</p>
      </div>
      <button (click)="openAdd()" class="btn-primary" [disabled]="loading() || !doctor()">
        <mat-icon>add</mat-icon> {{ 'DOCTOR_PORTAL.ADD_TIME_OFF' | translate }}
      </button>
    </div>

    <!-- Profile Error -->
    <div *ngIf="!loading() && !doctor()" class="error-box flex items-start gap-3 p-5">
      <mat-icon class="mt-0.5">error_outline</mat-icon>
      <div>
        <h3 class="font-semibold mb-1">{{ 'DOCTOR_PORTAL.PROFILE_NOT_FOUND' | translate }}</h3>
        <p class="text-sm opacity-80">{{ 'DOCTOR_PORTAL.PROFILE_NOT_FOUND_HINT' | translate }}</p>
      </div>
    </div>

    <!-- Content -->
    <div *ngIf="doctor()" class="card p-6 animate-fade-in">
      <!-- Loading Skeleton -->
      <div *ngIf="loading()" class="space-y-3">
        <div *ngFor="let i of [1,2,3]" class="flex items-center gap-4 p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
          <div class="skeleton w-10 h-10 rounded-xl"></div>
          <div class="flex-1 space-y-2">
            <div class="skeleton w-48 h-4 rounded"></div>
            <div class="skeleton w-32 h-3 rounded"></div>
          </div>
          <div class="skeleton w-8 h-8 rounded-lg"></div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading() && items().length === 0" class="empty-state !py-12">
        <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
          <mat-icon class="!w-8 !h-8 text-slate-300 dark:text-slate-500">event_busy</mat-icon>
        </div>
        <p class="font-medium text-surface-500 dark:text-surface-400">{{ 'COMMON.NO_DATA' | translate }}</p>
      </div>

      <!-- Time Off List -->
      <div *ngIf="items().length > 0" class="space-y-3">
        <div *ngFor="let t of items(); let i = index"
             class="group flex items-center gap-4 p-4 rounded-xl border border-surface-100 dark:border-surface-700 hover:border-surface-200 dark:hover:border-surface-600 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-all duration-200 animate-slide-up"
             [style.animation-delay]="(i * 40) + 'ms'">
          <div class="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <mat-icon>event_busy</mat-icon>
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-medium text-surface-900 dark:text-white text-sm">
              {{ t.startAt | date:'medium' }} → {{ t.endAt | date:'shortTime' }}
            </div>
            <div class="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400 mt-0.5">
              <span *ngIf="t.reason">{{ t.reason }}</span>
              <span *ngIf="t.isFullDay" class="badge badge-warning text-[10px] py-0 px-1.5">{{ 'DOCTOR_PORTAL.FULL_DAY' | translate }}</span>
            </div>
          </div>
          <button (click)="remove(t)"
                  class="p-2 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100">
            <mat-icon class="!w-5 !h-5">delete_outline</mat-icon>
          </button>
        </div>
      </div>
    </div>

    <!-- Add Modal -->
    <div *ngIf="adding()" class="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in" (click)="adding.set(false)">
      <div class="card p-6 max-w-md w-full animate-scale-in" (click)="$event.stopPropagation()">
        <div class="flex items-center gap-3 mb-5">
          <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
            <mat-icon class="text-amber-600 dark:text-amber-400">event_busy</mat-icon>
          </div>
          <h2 class="font-semibold text-lg text-surface-900 dark:text-white">{{ 'DOCTOR_PORTAL.ADD_TIME_OFF' | translate }}</h2>
        </div>
        <div class="space-y-4">
          <div>
            <label class="label">{{ 'DOCTOR_PORTAL.FROM' | translate }}</label>
            <input type="datetime-local" [(ngModel)]="start" class="input">
          </div>
          <div>
            <label class="label">{{ 'DOCTOR_PORTAL.TO' | translate }}</label>
            <input type="datetime-local" [(ngModel)]="end" class="input">
          </div>
          <div>
            <label class="label">{{ 'DOCTOR_PORTAL.REASON' | translate }}</label>
            <input [(ngModel)]="reason" class="input">
          </div>
          <label class="flex items-center gap-2.5 text-sm cursor-pointer p-3 rounded-xl bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
            <input type="checkbox" [(ngModel)]="fullDay" class="w-4 h-4 rounded border-surface-300 dark:border-surface-600 text-primary-600 focus:ring-primary-500/20">
            <span class="text-surface-700 dark:text-surface-300 font-medium">{{ 'DOCTOR_PORTAL.FULL_DAY' | translate }}</span>
          </label>
        </div>
        <div class="flex justify-end gap-2 mt-6 pt-4 border-t border-surface-100 dark:border-surface-700">
          <button (click)="adding.set(false)" class="btn-secondary btn-sm" [disabled]="saving()">{{ 'COMMON.CANCEL' | translate }}</button>
          <button (click)="save()" class="btn-primary btn-sm" [disabled]="saving()">
            <mat-icon *ngIf="saving()" class="!w-4 !h-4 animate-spin">refresh</mat-icon>
            <span *ngIf="saving()">{{ 'COMMON.LOADING' | translate }}...</span>
            <span *ngIf="!saving()">{{ 'COMMON.SAVE' | translate }}</span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class DoctorTimeOffComponent implements OnInit {
  private data = inject(DataService);
  private snack = inject(MatSnackBar);
  private translate = inject(TranslateService);

  doctor = signal<DoctorDto | null>(null);
  items = signal<any[]>([]);
  loading = signal(true);
  adding = signal(false);
  saving = signal(false);
  start = '';
  end = '';
  reason = '';
  fullDay = false;

  ngOnInit() {
    this.data.getDoctorMe().subscribe({
      next: d => {
        this.doctor.set(d);
        this.load();
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  load() {
    const id = this.doctor()?.id;
    if (!id) return;
    this.loading.set(true);
    this.data.getTimeOff(id).subscribe({
      next: s => { this.items.set(s); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openAdd() {
    if (!this.doctor()?.id) {
      this.snack.open(
        this.translate.instant('DOCTOR_PORTAL.PROFILE_NOT_FOUND'),
        this.translate.instant('COMMON.OK'),
        { duration: 3000 }
      );
      return;
    }
    this.start = '';
    this.end = '';
    this.reason = '';
    this.fullDay = false;
    this.adding.set(true);
  }

  save() {
    const id = this.doctor()?.id;
    if (!id) return;
    if (this.saving()) return;
    if (!this.start || !this.end) {
      this.snack.open(this.translate.instant('COMMON.VALIDATION_ERROR'), this.translate.instant('COMMON.OK'), { duration: 3000 });
      return;
    }
    const startDt = new Date(this.start);
    const endDt = new Date(this.end);
    if (isNaN(startDt.getTime()) || isNaN(endDt.getTime()) || endDt <= startDt) {
      this.snack.open(this.translate.instant('COMMON.VALIDATION_ERROR'), this.translate.instant('COMMON.OK'), { duration: 3000 });
      return;
    }
    this.saving.set(true);
    this.data.addTimeOff(id, {
      startAt: startDt.toISOString(),
      endAt: endDt.toISOString(),
      reason: this.reason,
      isFullDay: this.fullDay
    }).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res?.success === false) {
          this.snack.open(res.message || this.translate.instant('COMMON.SAVE_FAILED'), this.translate.instant('COMMON.OK'), { duration: 3000 });
          return;
        }
        this.snack.open(this.translate.instant('COMMON.SAVED'), this.translate.instant('COMMON.OK'), { duration: 2000 });
        this.adding.set(false);
        this.load();
      },
      error: err => {
        this.saving.set(false);
        this.snack.open(err.error?.message || err.error?.title || this.translate.instant('COMMON.SAVE_FAILED'), this.translate.instant('COMMON.OK'), { duration: 3000 });
      }
    });
  }

  remove(t: any) {
    const docId = this.doctor()?.id;
    if (!docId) return;
    const timeDesc = `${new Date(t.startAt).toLocaleDateString()} ${t.reason ? `(${t.reason})` : ''}`;
    if (!confirm(this.translate.instant('ADMIN.CLINIC_STAFF.DELETE_CONFIRM', { name: timeDesc }))) return;
    this.data.deleteTimeOff(docId, t.id).subscribe({
      next: () => { this.snack.open(this.translate.instant('COMMON.DELETED'), this.translate.instant('COMMON.OK'), { duration: 2000 }); this.load(); },
      error: err => {
        this.snack.open(err.error?.message || this.translate.instant('COMMON.SAVE_FAILED'), this.translate.instant('COMMON.OK'), { duration: 3000 });
      }
    });
  }
}
