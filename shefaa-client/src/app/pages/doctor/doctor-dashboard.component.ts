import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { AppointmentDto, DoctorDto, PatientDto } from '../../core/models';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, TranslateModule],
  template: `
    <div class="page-header animate-fade-in">
      <div>
        <h1 class="page-title">{{ 'DOCTOR_PORTAL.DASHBOARD_TITLE' | translate }}</h1>
        <p class="page-subtitle">{{ auth.user()?.fullName }} <span *ngIf="doctor()?.specialtyName">· {{ doctor()?.specialtyName }}</span></p>
      </div>
    </div>

    <!-- Profile Error Banner -->
    <div *ngIf="profileError()" class="error-box mb-6 flex items-start gap-3 p-5">
      <mat-icon class="mt-0.5">error_outline</mat-icon>
      <div>
        <h3 class="font-semibold mb-1">{{ 'DOCTOR_PORTAL.PROFILE_NOT_FOUND' | translate }}</h3>
        <p class="text-sm opacity-90">{{ 'DOCTOR_PORTAL.PROFILE_NOT_FOUND_HINT' | translate }}</p>
      </div>
    </div>

    <!-- Stat Cards -->
    <div *ngIf="!profileError()" class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="stat-card card-hover animate-slide-up" style="animation-delay: 0ms">
        <div class="stat-icon bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400">
          <mat-icon>today</mat-icon>
        </div>
        <div>
          <div class="stat-value">{{ todayCount() }}</div>
          <div class="stat-label">{{ 'DOCTOR_PORTAL.TODAY_APPOINTMENTS' | translate }}</div>
        </div>
      </div>
      <div class="stat-card card-hover animate-slide-up" style="animation-delay: 50ms">
        <div class="stat-icon bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
          <mat-icon>check_circle</mat-icon>
        </div>
        <div>
          <div class="stat-value">{{ completedCount() }}</div>
          <div class="stat-label">{{ 'STATUS.Completed' | translate }}</div>
        </div>
      </div>
      <div class="stat-card card-hover animate-slide-up" style="animation-delay: 100ms">
        <div class="stat-icon bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
          <mat-icon>people</mat-icon>
        </div>
        <div>
          <div class="stat-value">{{ upcoming().length }}</div>
          <div class="stat-label">{{ 'DOCTOR_PORTAL.UPCOMING_APPOINTMENTS' | translate }}</div>
        </div>
      </div>
      <div class="stat-card card-hover animate-slide-up" style="animation-delay: 150ms">
        <div class="stat-icon bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
          <mat-icon>star</mat-icon>
        </div>
        <div>
          <div class="stat-value">{{ doctor()?.rating || '—' }}</div>
          <div class="stat-label">{{ 'COMMON.RATING' | translate }} ({{ doctor()?.totalReviews || 0 }})</div>
        </div>
      </div>
    </div>

    <!-- Today's Schedule -->
    <div *ngIf="!profileError()" class="card p-6 animate-fade-in">
      <div class="flex items-center justify-between mb-5">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
            <mat-icon class="text-primary-600 dark:text-primary-400">timeline</mat-icon>
          </div>
          <h2 class="font-semibold text-slate-900 dark:text-white">{{ 'DOCTOR_PORTAL.TODAY_APPOINTMENTS' | translate }}</h2>
        </div>
        <a routerLink="/doctor/appointments"
           class="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors">
          {{ 'COMMON.VIEW_ALL' | translate }} →
        </a>
      </div>

      <!-- Loading skeleton -->
      <div *ngIf="loading()" class="space-y-3">
        <div *ngFor="let i of [1,2,3]" class="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div class="skeleton w-16 h-8 rounded-lg"></div>
          <div class="skeleton w-10 h-10 rounded-full"></div>
          <div class="flex-1 space-y-2">
            <div class="skeleton w-32 h-4 rounded"></div>
            <div class="skeleton w-20 h-3 rounded"></div>
          </div>
          <div class="skeleton w-16 h-6 rounded-full"></div>
        </div>
      </div>

      <!-- Empty state -->
      <div *ngIf="!loading() && todayAppointments().length === 0" class="empty-state !py-12">
        <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
          <mat-icon class="!w-8 !h-8 text-slate-300 dark:text-slate-500">event_available</mat-icon>
        </div>
        <p class="text-slate-400 dark:text-slate-500 font-medium">{{ 'COMMON.NO_DATA' | translate }}</p>
      </div>

      <!-- Timeline -->
      <div *ngIf="todayAppointments().length > 0" class="relative">
        <div class="absolute left-[3.25rem] top-3 bottom-3 w-px bg-surface-200 dark:bg-surface-700"></div>
        <div class="space-y-1">
          <div *ngFor="let a of todayAppointments(); let last = last"
               class="relative flex items-center gap-4 p-3 rounded-xl transition-all duration-200 hover:bg-surface-50 dark:hover:bg-surface-800 group">
            <!-- Time -->
            <div class="w-16 text-center z-10">
              <div class="text-xs font-semibold text-surface-600 dark:text-surface-300">{{ formatTime(a.scheduledStart) }}</div>
            </div>
            <!-- Dot -->
            <div class="w-3 h-3 rounded-full bg-primary-500 dark:bg-primary-400 ring-4 ring-white dark:ring-surface-900 z-10 shrink-0 shadow-sm group-hover:scale-110 transition-transform"></div>
            <!-- Patient avatar -->
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
              {{ initials(a.patientName) }}
            </div>
            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="font-medium text-surface-900 dark:text-white truncate">{{ a.patientName }}</div>
              <div class="text-xs text-surface-500 dark:text-surface-400 truncate">{{ a.reasonForVisit || '—' }}</div>
            </div>
            <!-- Badge -->
            <span class="badge" [ngClass]="badge(a.status)">{{ ('STATUS.' + a.status) | translate }}</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DoctorDashboardComponent implements OnInit {
  private data = inject(DataService);
  auth = inject(AuthService);

  doctor = signal<DoctorDto | null>(null);
  appointments = signal<AppointmentDto[]>([]);
  loading = signal(true);
  profileError = signal(false);

  todayAppointments = computed(() => {
    const today = new Date().toISOString().slice(0, 10);
    return this.appointments().filter(a => a.scheduledStart.startsWith(today));
  });
  upcoming = computed(() => this.appointments().filter(a => new Date(a.scheduledStart) >= new Date() && a.status !== 'Cancelled' && a.status !== 'NoShow'));
  todayCount = computed(() => this.todayAppointments().length);
  completedCount = computed(() => this.appointments().filter(a => a.status === 'Completed').length);

  ngOnInit() {
    this.data.getDoctorMe().subscribe({
      next: d => {
        this.doctor.set(d);
        this.profileError.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 404) {
          this.profileError.set(true);
        }
      }
    });

    this.data.listAppointments(1, 200).subscribe({
      next: r => { this.appointments.set(r.items || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
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
  initials(n: string) { return n.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase(); }
  formatTime(iso: string) { return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }); }
}
