import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DataService } from '../../core/services/data.service';
import { DoctorDto, DoctorScheduleDto } from '../../core/models';

@Component({
  selector: 'app-doctor-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, TranslateModule],
  template: `
    <div class="page-header animate-fade-in">
      <div>
        <h1 class="page-title">{{ 'DOCTOR_PORTAL.SCHEDULE_TITLE' | translate }}</h1>
        <p class="page-subtitle">{{ 'COMMON.DURATION' | translate }}: {{ doctor()?.defaultAppointmentDurationMinutes || 30 }} {{ 'COMMON.MINUTES' | translate }}</p>
      </div>
      <button (click)="openAdd()" class="btn-primary" [disabled]="loading() || profileError() || !doctor()">
        <mat-icon>add</mat-icon> {{ 'DOCTOR_PORTAL.ADD_SCHEDULE' | translate }}
      </button>
    </div>

    <!-- Loading Skeleton -->
    <div *ngIf="loading()" class="card overflow-hidden">
      <div class="p-5 space-y-4">
        <div *ngFor="let i of [1,2,3]" class="flex items-center gap-4">
          <div class="skeleton w-24 h-5 rounded"></div>
          <div class="skeleton w-20 h-5 rounded"></div>
          <div class="skeleton w-20 h-5 rounded"></div>
          <div class="skeleton w-24 h-5 rounded"></div>
          <div class="skeleton flex-1 h-5 rounded"></div>
          <div class="skeleton w-8 h-8 rounded-lg"></div>
        </div>
      </div>
    </div>

    <!-- Profile Error -->
    <div *ngIf="!loading() && profileError()" class="error-box flex items-start gap-3 p-5">
      <mat-icon class="mt-0.5">error_outline</mat-icon>
      <div>
        <h3 class="font-semibold mb-1">{{ 'DOCTOR_PORTAL.PROFILE_NOT_FOUND' | translate }}</h3>
        <p class="text-sm opacity-80">{{ 'DOCTOR_PORTAL.PROFILE_NOT_FOUND_HINT' | translate }}</p>
      </div>
    </div>

    <!-- Empty State -->
    <div *ngIf="!loading() && !profileError() && schedules().length === 0" class="empty-state card animate-fade-in">
      <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
        <mat-icon class="!w-8 !h-8 text-slate-300 dark:text-slate-500">schedule</mat-icon>
      </div>
      <p class="font-medium text-surface-500 dark:text-surface-400">{{ 'COMMON.NO_DATA' | translate }}</p>
    </div>

    <!-- Weekly Schedule Grid -->
    <div *ngIf="!loading() && !profileError() && schedules().length > 0" class="animate-fade-in">
      <!-- Desktop Table -->
      <div class="card overflow-hidden hidden md:block">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-surface-100 dark:border-surface-700">
              <th class="px-5 py-3.5 text-start font-semibold text-surface-600 dark:text-surface-300 uppercase text-xs tracking-wider">{{ 'DOCTOR_PORTAL.DAY_OF_WEEK' | translate }}</th>
              <th class="px-5 py-3.5 text-start font-semibold text-surface-600 dark:text-surface-300 uppercase text-xs tracking-wider">{{ 'DOCTOR_PORTAL.START_TIME' | translate }}</th>
              <th class="px-5 py-3.5 text-start font-semibold text-surface-600 dark:text-surface-300 uppercase text-xs tracking-wider">{{ 'DOCTOR_PORTAL.END_TIME' | translate }}</th>
              <th class="px-5 py-3.5 text-start font-semibold text-surface-600 dark:text-surface-300 uppercase text-xs tracking-wider">{{ 'DOCTOR_PORTAL.SLOT_DURATION' | translate }}</th>
              <th class="px-5 py-3.5 text-start font-semibold text-surface-600 dark:text-surface-300 uppercase text-xs tracking-wider">{{ 'NAV.CLINICS' | translate }}</th>
              <th class="px-5 py-3.5 w-12"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of schedules(); let i = index"
                class="border-t border-surface-100 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-2.5">
                  <div class="w-2 h-2 rounded-full" [ngClass]="{
                    'bg-primary-500': s.dayOfWeek === 'Monday',
                    'bg-emerald-500': s.dayOfWeek === 'Tuesday',
                    'bg-amber-500': s.dayOfWeek === 'Wednesday',
                    'bg-rose-500': s.dayOfWeek === 'Thursday',
                    'bg-violet-500': s.dayOfWeek === 'Friday',
                    'bg-cyan-500': s.dayOfWeek === 'Saturday',
                    'bg-orange-500': s.dayOfWeek === 'Sunday'
                  }"></div>
                  <span class="font-medium text-surface-900 dark:text-white">{{ 'DAYS.' + s.dayOfWeek | translate }}</span>
                </div>
              </td>
              <td class="px-5 py-3.5 text-surface-600 dark:text-surface-300 font-mono text-xs">{{ s.startTime }}</td>
              <td class="px-5 py-3.5 text-surface-600 dark:text-surface-300 font-mono text-xs">{{ s.endTime }}</td>
              <td class="px-5 py-3.5">
                <span class="badge badge-info">{{ s.slotDurationMinutes }} {{ 'COMMON.MINUTES' | translate }}</span>
              </td>
              <td class="px-5 py-3.5 text-surface-500 dark:text-surface-400">{{ s.clinicName || '—' }}</td>
              <td class="px-5 py-3.5 text-end">
                <button (click)="remove(s)"
                        class="p-2 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                  <mat-icon class="!w-5 !h-5">delete_outline</mat-icon>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards -->
      <div class="md:hidden space-y-3">
        <div *ngFor="let s of schedules()" class="card p-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 rounded-full" [ngClass]="{
                'bg-primary-500': s.dayOfWeek === 'Monday',
                'bg-emerald-500': s.dayOfWeek === 'Tuesday',
                'bg-amber-500': s.dayOfWeek === 'Wednesday',
                'bg-rose-500': s.dayOfWeek === 'Thursday',
                'bg-violet-500': s.dayOfWeek === 'Friday',
                'bg-cyan-500': s.dayOfWeek === 'Saturday',
                'bg-orange-500': s.dayOfWeek === 'Sunday'
              }"></div>
              <span class="font-semibold text-surface-900 dark:text-white">{{ 'DAYS.' + s.dayOfWeek | translate }}</span>
            </div>
            <button (click)="remove(s)"
                    class="p-2 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
              <mat-icon class="!w-5 !h-5">delete_outline</mat-icon>
            </button>
          </div>
          <div class="flex items-center gap-4 text-sm text-surface-600 dark:text-surface-300">
            <span class="flex items-center gap-1">
              <mat-icon class="!w-3.5 !h-3.5">schedule</mat-icon> {{ s.startTime }} — {{ s.endTime }}
            </span>
            <span class="badge badge-info">{{ s.slotDurationMinutes }}m</span>
          </div>
          <div *ngIf="s.clinicName" class="mt-2 text-xs text-surface-500 dark:text-surface-400">{{ s.clinicName }}</div>
        </div>
      </div>
    </div>

    <!-- Add Modal -->
    <div *ngIf="adding()" class="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in" (click)="adding.set(false)">
      <div class="card p-6 max-w-md w-full animate-scale-in" (click)="$event.stopPropagation()">
        <div class="flex items-center gap-3 mb-5">
          <div class="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
            <mat-icon class="text-primary-600 dark:text-primary-400">add_circle</mat-icon>
          </div>
          <h2 class="font-semibold text-lg text-surface-900 dark:text-white">{{ 'DOCTOR_PORTAL.ADD_SCHEDULE' | translate }}</h2>
        </div>
        <div class="space-y-4">
          <div>
            <label class="label">{{ 'DOCTOR_PORTAL.DAY_OF_WEEK' | translate }}</label>
            <select [(ngModel)]="newSched.dayOfWeek" class="input">
              <option *ngFor="let d of dayOptions" [ngValue]="d.value">{{ d.label | translate }}</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">{{ 'DOCTOR_PORTAL.START_TIME' | translate }}</label>
              <input type="time" [(ngModel)]="newSched.startTime" class="input">
            </div>
            <div>
              <label class="label">{{ 'DOCTOR_PORTAL.END_TIME' | translate }}</label>
              <input type="time" [(ngModel)]="newSched.endTime" class="input">
            </div>
          </div>
          <div>
            <label class="label">{{ 'DOCTOR_PORTAL.SLOT_DURATION' | translate }} ({{ 'COMMON.MINUTES' | translate }})</label>
            <input type="number" [(ngModel)]="newSched.slotDurationMinutes" class="input" min="5" max="240">
          </div>
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
export class DoctorScheduleComponent implements OnInit {
  private data = inject(DataService);
  private snack = inject(MatSnackBar);
  private translate = inject(TranslateService);

  doctor = signal<DoctorDto | null>(null);
  schedules = signal<DoctorScheduleDto[]>([]);
  loading = signal(true);
  adding = signal(false);
  saving = signal(false);
  profileError = signal(false);

  newSched: { dayOfWeek: string; startTime: string; endTime: string; slotDurationMinutes: number; clinicId?: number } = {
    dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30
  };

  dayOptions = [
    { value: 'Sunday', label: 'DAYS.Sunday' },
    { value: 'Monday', label: 'DAYS.Monday' },
    { value: 'Tuesday', label: 'DAYS.Tuesday' },
    { value: 'Wednesday', label: 'DAYS.Wednesday' },
    { value: 'Thursday', label: 'DAYS.Thursday' },
    { value: 'Friday', label: 'DAYS.Friday' },
    { value: 'Saturday', label: 'DAYS.Saturday' }
  ];

  ngOnInit() {
    this.data.getDoctorMe().subscribe({
      next: d => {
        this.doctor.set(d);
        this.profileError.set(false);
        this.load();
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 404) {
          this.profileError.set(true);
        } else {
          this.snack.open(
            this.translate.instant('COMMON.SAVE_FAILED'),
            this.translate.instant('COMMON.OK'),
            { duration: 3000 }
          );
        }
      }
    });
  }

  load() {
    const id = this.doctor()?.id;
    if (!id) return;
    this.loading.set(true);
    this.data.getSchedules(id).subscribe({
      next: s => { this.schedules.set(s); this.loading.set(false); },
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
    this.newSched = { dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30 };
    this.adding.set(true);
  }

  save() {
    const id = this.doctor()?.id;
    if (!id) {
      this.snack.open(
        this.translate.instant('DOCTOR_PORTAL.PROFILE_NOT_FOUND'),
        this.translate.instant('COMMON.OK'),
        { duration: 3000 }
      );
      return;
    }
    if (this.saving()) return;
    if (!this.newSched.startTime || !this.newSched.endTime || this.newSched.startTime >= this.newSched.endTime) {
      this.snack.open(this.translate.instant('COMMON.VALIDATION_ERROR'), this.translate.instant('COMMON.OK'), { duration: 3000 });
      return;
    }
    if (this.newSched.slotDurationMinutes < 5 || this.newSched.slotDurationMinutes > 240) {
      this.snack.open(this.translate.instant('COMMON.VALIDATION_ERROR'), this.translate.instant('COMMON.OK'), { duration: 3000 });
      return;
    }

    this.saving.set(true);
    this.data.addSchedule(id, this.newSched).subscribe({
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
        const msg = err.error?.message || err.error?.title ||
          (err.error?.errors ? (Array.isArray(err.error.errors) ? err.error.errors.join(', ') : JSON.stringify(err.error.errors)) : '') ||
          this.translate.instant('COMMON.SAVE_FAILED');
        this.snack.open(msg, this.translate.instant('COMMON.OK'), { duration: 4000 });
      }
    });
  }

  remove(s: DoctorScheduleDto) {
    const id = this.doctor()?.id;
    if (!id) return;
    const dayStr = this.translate.instant('DAYS.' + s.dayOfWeek);
    if (!confirm(this.translate.instant('ADMIN.CLINIC_STAFF.DELETE_CONFIRM', { name: `${dayStr} (${s.startTime} - ${s.endTime})` }))) return;
    this.data.deleteSchedule(id, s.id).subscribe({
      next: () => { this.snack.open(this.translate.instant('COMMON.DELETED'), this.translate.instant('COMMON.OK'), { duration: 2000 }); this.load(); },
      error: err => {
        this.snack.open(err.error?.message || this.translate.instant('COMMON.SAVE_FAILED'), this.translate.instant('COMMON.OK'), { duration: 3000 });
      }
    });
  }

  dayNameEn(d: string) { return d; }
}
