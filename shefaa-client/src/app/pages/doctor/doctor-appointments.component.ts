import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DataService } from '../../core/services/data.service';
import { AppointmentDto } from '../../core/models';
import { AddRecordDialogComponent } from '../../shared/components/add-record-dialog.component';

@Component({
  selector: 'app-doctor-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatDialogModule, TranslateModule],
  template: `
    <div class="page-header animate-fade-in">
      <div>
        <h1 class="page-title">{{ 'NAV.APPOINTMENTS' | translate }}</h1>
        <p class="page-subtitle">{{ 'DOCTOR_PORTAL.UPCOMING_APPOINTMENTS' | translate }}</p>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="flex flex-wrap gap-2 mb-6 animate-fade-in">
      <button (click)="setFilter('')" class="btn-sm transition-all"
              [class]="filter === '' ? 'btn-primary' : 'btn-ghost'">
        {{ 'COMMON.ALL' | translate }}
      </button>
      <button (click)="setFilter('Pending')" class="btn-sm transition-all"
              [class]="filter === 'Pending' ? 'btn-primary' : 'btn-ghost'">
        {{ 'STATUS.Pending' | translate }}
      </button>
      <button (click)="setFilter('Confirmed')" class="btn-sm transition-all"
              [class]="filter === 'Confirmed' ? 'btn-primary' : 'btn-ghost'">
        {{ 'STATUS.Confirmed' | translate }}
      </button>
      <button (click)="setFilter('Completed')" class="btn-sm transition-all"
              [class]="filter === 'Completed' ? 'btn-primary' : 'btn-ghost'">
        {{ 'STATUS.Completed' | translate }}
      </button>
    </div>

    <!-- Loading Skeleton -->
    <div *ngIf="loading()" class="space-y-4">
      <div *ngFor="let i of [1,2,3]" class="card p-5">
        <div class="flex items-center gap-4">
          <div class="skeleton w-16 h-16 rounded-xl"></div>
          <div class="flex-1 space-y-3">
            <div class="skeleton w-40 h-5 rounded"></div>
            <div class="skeleton w-60 h-4 rounded"></div>
            <div class="skeleton w-28 h-3 rounded"></div>
          </div>
          <div class="skeleton w-24 h-9 rounded-xl"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div *ngIf="!loading() && appointments().length === 0" class="empty-state card animate-fade-in">
      <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
        <mat-icon class="!w-8 !h-8 text-slate-300 dark:text-slate-500">event_note</mat-icon>
      </div>
      <p class="font-medium text-surface-500 dark:text-surface-400">{{ 'COMMON.NO_DATA' | translate }}</p>
    </div>

    <!-- Appointment Cards -->
    <div *ngIf="!loading() && appointments().length > 0" class="space-y-3">
      <div *ngFor="let a of appointments(); let i = index"
           class="card-hover p-0 overflow-hidden animate-slide-up"
           [style.animation-delay]="(i * 40) + 'ms'">
        <div class="flex flex-col md:flex-row">
          <!-- Date Block -->
          <div class="flex md:flex-col items-center justify-center gap-2 md:gap-0 px-5 py-4 md:py-0 md:w-24 bg-gradient-to-br from-primary-500 to-primary-600 text-white shrink-0">
            <span class="text-xs font-semibold uppercase tracking-wider opacity-80">{{ formatMonth(a.scheduledStart) }}</span>
            <span class="text-2xl md:text-3xl font-bold leading-none">{{ formatDay(a.scheduledStart) }}</span>
          </div>

          <!-- Content -->
          <div class="flex-1 p-5 min-w-0">
            <div class="flex items-start justify-between gap-3 mb-2">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-bold shrink-0">
                  {{ a.patientName.charAt(0) }}
                </div>
                <div>
                  <div class="font-semibold text-surface-900 dark:text-white">{{ a.patientName }}</div>
                  <div class="flex items-center gap-3 text-sm text-surface-500 dark:text-surface-400">
                    <span class="flex items-center gap-1">
                      <mat-icon class="!w-3.5 !h-3.5">schedule</mat-icon> {{ formatTime(a.scheduledStart) }}
                    </span>
                    <span class="flex items-center gap-1">
                      <mat-icon class="!w-3.5 !h-3.5">place</mat-icon> {{ a.clinicName }}
                    </span>
                  </div>
                </div>
              </div>
              <span class="badge" [ngClass]="badge(a.status)">{{ ('STATUS.' + a.status) | translate }}</span>
            </div>
            <div *ngIf="a.reasonForVisit" class="text-xs text-surface-500 dark:text-surface-400 ml-13 mt-1">{{ a.reasonForVisit }}</div>

            <!-- Actions -->
            <div class="flex flex-wrap gap-2 mt-4 pt-3 border-t border-surface-100 dark:border-surface-700">
              <button *ngIf="a.status === 'Confirmed' || a.status === 'Pending'"
                      (click)="checkIn(a)" class="btn-secondary btn-sm">
                <mat-icon>how_to_reg</mat-icon> {{ 'STATUS.CheckedIn' | translate }}
              </button>
              <button *ngIf="a.status === 'CheckedIn' || a.status === 'InProgress'"
                      (click)="complete(a)" class="btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-sm">
                <mat-icon class="!text-[16px]">check_circle</mat-icon> {{ 'APPOINTMENT.MARK_COMPLETE' | translate }}
              </button>
              <button *ngIf="a.status !== 'Completed' && a.status !== 'Cancelled' && a.status !== 'NoShow'"
                      (click)="noShow(a)" class="btn-danger btn-sm">
                <mat-icon class="!text-[16px]">person_off</mat-icon> {{ 'APPOINTMENT.MARK_NO_SHOW' | translate }}
              </button>
              <button (click)="openRecord(a)" class="btn-primary btn-sm">
                <mat-icon>note_add</mat-icon> {{ 'DOCTOR_PORTAL.ADD_RECORD' | translate }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DoctorAppointmentsComponent implements OnInit {
  private data = inject(DataService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);
  private translate = inject(TranslateService);

  loading = signal(true);
  appointments = signal<AppointmentDto[]>([]);
  filter = '';

  ngOnInit() { this.load(); }

  setFilter(f: string) {
    this.filter = f;
    this.load();
  }

  load() {
    this.loading.set(true);
    this.data.listAppointments(1, 200, { status: this.filter || undefined }).subscribe({
      next: r => { this.appointments.set(r.items || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  checkIn(a: AppointmentDto) {
    this.data.updateAppointmentStatus(a.id, 'CheckedIn').subscribe({
      next: () => {
        this.snack.open(this.translate.instant('STATUS.CheckedIn'), this.translate.instant('COMMON.OK'), { duration: 2000 });
        this.load();
      },
      error: err => {
        this.snack.open(err.error?.message || this.translate.instant('COMMON.SAVE_FAILED'), this.translate.instant('COMMON.OK'), { duration: 3000 });
      }
    });
  }

  complete(a: AppointmentDto) {
    this.data.updateAppointmentStatus(a.id, 'Completed').subscribe({
      next: () => {
        this.snack.open(this.translate.instant('APPOINTMENT.COMPLETED'), this.translate.instant('COMMON.OK'), { duration: 2000 });
        this.load();
      },
      error: err => {
        this.snack.open(err.error?.message || this.translate.instant('COMMON.SAVE_FAILED'), this.translate.instant('COMMON.OK'), { duration: 3000 });
      }
    });
  }

  noShow(a: AppointmentDto) {
    this.data.updateAppointmentStatus(a.id, 'NoShow').subscribe({
      next: () => {
        this.snack.open(this.translate.instant('APPOINTMENT.NO_SHOW_MARKED'), this.translate.instant('COMMON.OK'), { duration: 2000 });
        this.load();
      },
      error: err => {
        this.snack.open(err.error?.message || this.translate.instant('COMMON.SAVE_FAILED'), this.translate.instant('COMMON.OK'), { duration: 3000 });
      }
    });
  }

  openRecord(a: AppointmentDto) {
    const ref = this.dialog.open(AddRecordDialogComponent, { data: a, width: '720px' });
    ref.afterClosed().subscribe(() => this.load());
  }

  badge(s: string) {
    switch (s) {
      case 'Pending': return 'badge-warning';
      case 'Confirmed': case 'CheckedIn': return 'badge-info';
      case 'Completed': return 'badge-success';
      case 'Cancelled': case 'NoShow': return 'badge-danger';
      default: return 'badge-muted';
    }
  }
  formatMonth(iso: string) { return new Date(iso).toLocaleString('en-US', { month: 'short' }); }
  formatDay(iso: string) { return new Date(iso).getDate(); }
  formatTime(iso: string) { return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }); }
}
