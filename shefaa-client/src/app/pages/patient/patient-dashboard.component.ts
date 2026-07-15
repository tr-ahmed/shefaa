import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { AppointmentDto, PatientDto } from '../../core/models';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, TranslateModule],
  template: `
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ 'PATIENT.DASHBOARD_TITLE' | translate }}</h1>
        <p class="page-subtitle">{{ 'PATIENT.WELCOME' | translate }}, {{ auth.user()?.firstName }}</p>
      </div>
      <a routerLink="/patient/book" class="btn-primary">
        <mat-icon>add</mat-icon>
        {{ 'PATIENT.QUICK_BOOK' | translate }}
      </a>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      <div class="stat-card card-hover">
        <div class="stat-icon bg-primary-50 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400">
          <mat-icon>event</mat-icon>
        </div>
        <div>
          <div class="stat-value">{{ upcoming().length }}</div>
          <div class="stat-label">{{ 'PATIENT.UPCOMING' | translate }}</div>
        </div>
      </div>
      <div class="stat-card card-hover">
        <div class="stat-icon bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
          <mat-icon>check_circle</mat-icon>
        </div>
        <div>
          <div class="stat-value">{{ completed().length }}</div>
          <div class="stat-label">{{ 'PATIENT.PAST' | translate }}</div>
        </div>
      </div>
      <div class="stat-card card-hover">
        <div class="stat-icon bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
          <mat-icon>receipt_long</mat-icon>
        </div>
        <div>
          <div class="stat-value">{{ recordsCount() }}</div>
          <div class="stat-label">{{ 'NAV.MY_PRESCRIPTIONS' | translate }}</div>
        </div>
      </div>
      <div class="stat-card card-hover">
        <div class="stat-icon bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
          <mat-icon>badge</mat-icon>
        </div>
        <div>
          <div class="text-sm font-bold text-surface-800 dark:text-surface-200 truncate">{{ patient()?.medicalRecordNumber || '—' }}</div>
          <div class="stat-label">{{ 'PATIENT.MEDICAL_RECORD_NUMBER' | translate }}</div>
        </div>
      </div>
    </div>

    <!-- Upcoming Appointments -->
    <div class="card p-6">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-50">{{ 'PATIENT.UPCOMING' | translate }}</h2>
        <a routerLink="/patient/appointments"
           class="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
          {{ 'COMMON.VIEW_ALL' | translate }}
          <mat-icon class="text-[16px] align-middle ms-0.5">arrow_forward</mat-icon>
        </a>
      </div>

      <!-- Empty State -->
      <div *ngIf="upcoming().length === 0" class="empty-state py-12">
        <div class="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center mb-4">
          <mat-icon class="!w-8 !h-8 text-surface-400 dark:text-surface-500">event_busy</mat-icon>
        </div>
        <p class="text-surface-500 dark:text-surface-400 mb-4">{{ 'PATIENT.NO_UPCOMING' | translate }}</p>
        <a routerLink="/patient/book" class="btn-primary">
          <mat-icon>add</mat-icon>
          {{ 'PATIENT.BOOK_NOW' | translate }}
        </a>
      </div>

      <!-- Appointments List -->
      <div *ngIf="upcoming().length > 0" class="space-y-3">
        <div *ngFor="let a of upcoming().slice(0, 5)"
             class="card-interactive p-4 !bg-surface-50/50 dark:!bg-surface-700/50">
          <div class="flex flex-col sm:flex-row sm:items-center gap-4">
            <!-- Date Pill -->
            <div class="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex flex-col items-center justify-center font-semibold shrink-0">
              <span class="text-[10px] uppercase tracking-wider">{{ formatMonth(a.scheduledStart) }}</span>
              <span class="text-xl leading-none">{{ formatDay(a.scheduledStart) }}</span>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                <span class="font-semibold text-surface-900 dark:text-surface-50 truncate">{{ a.doctorName }}</span>
                <span class="badge badge-info">{{ a.doctorSpecialty }}</span>
              </div>
              <div class="flex items-center gap-4 text-sm text-surface-500 dark:text-surface-400">
                <span class="flex items-center gap-1.5">
                  <mat-icon class="!text-[15px]">schedule</mat-icon>
                  {{ formatTime(a.scheduledStart) }}
                </span>
                <span class="flex items-center gap-1.5">
                  <mat-icon class="!text-[15px]">place</mat-icon>
                  {{ a.clinicName }}
                </span>
              </div>
            </div>

            <!-- Status & Action -->
            <div class="flex items-center gap-3">
              <span class="badge" [ngClass]="statusBadge(a.status)">{{ ('STATUS.' + a.status) | translate }}</span>
              <a [routerLink]="['/patient/appointments']" class="btn-secondary btn-sm">
                <mat-icon class="!text-[16px]">visibility</mat-icon>
                {{ 'DOCTORS.VIEW_PROFILE' | translate }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PatientDashboardComponent implements OnInit {
  private data = inject(DataService);
  auth = inject(AuthService);

  patient = signal<PatientDto | null>(null);
  appointments = signal<AppointmentDto[]>([]);
  recordsCount = signal(0);

  upcoming = computed(() => this.appointments().filter(a => new Date(a.scheduledStart) >= new Date() && a.status !== 'Cancelled' && a.status !== 'NoShow'));
  completed = computed(() => this.appointments().filter(a => a.status === 'Completed'));

  ngOnInit() {
    this.data.getPatientMe().subscribe(p => {
      this.patient.set(p);
      this.data.getMedicalRecords(p.id).subscribe(rs => this.recordsCount.set(rs.length));
    });
    this.data.listAppointments(1, 100).subscribe(r => {
      this.appointments.set(r.items ?? []);
    });
  }

  statusBadge(status: string) {
    switch (status) {
      case 'Pending': return 'badge-warning';
      case 'Confirmed': case 'CheckedIn': return 'badge-info';
      case 'Completed': return 'badge-success';
      case 'Cancelled': case 'NoShow': return 'badge-danger';
      case 'InProgress': return 'badge-info';
      case 'Rescheduled': return 'badge-muted';
      default: return 'badge-muted';
    }
  }

  formatMonth(iso: string) {
    return new Date(iso).toLocaleString('en-US', { month: 'short' });
  }
  formatDay(iso: string) {
    return new Date(iso).getDate();
  }
  formatTime(iso: string) {
    return new Date(iso).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
}
