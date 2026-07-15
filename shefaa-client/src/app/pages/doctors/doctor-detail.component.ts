import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule } from '@ngx-translate/core';
import { DataService } from '../../core/services/data.service';
import { DoctorDto, DoctorScheduleDto, ReviewDto, TimeSlotDto } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-doctor-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatTabsModule, TranslateModule],
  template: `
    <section class="max-w-7xl mx-auto px-4 lg:px-8 py-10" *ngIf="doctor() as d">

      <!-- Hero Section -->
      <div class="card p-0 overflow-hidden mb-6">
        <div class="relative bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 px-8 py-10 md:py-14">
          <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>
          <div class="relative flex flex-col md:flex-row items-center gap-6">
            <div class="w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center text-4xl font-bold ring-4 ring-white/30 shadow-xl flex-shrink-0">
              {{ initials(d.fullName) }}
            </div>
            <div class="text-center md:text-left text-white">
              <h1 class="text-3xl md:text-4xl font-bold">{{ d.fullName }}</h1>
              <p class="text-white/80 text-lg mt-1">{{ d.specialtyName }}</p>
              <div class="flex items-center gap-1 justify-center md:justify-start mt-2">
                <mat-icon class="text-amber-300 text-base">star</mat-icon>
                <span class="text-white font-semibold">{{ d.rating || '5.0' }}</span>
                <span class="text-white/60 text-sm ms-1">({{ d.totalReviews }} {{ 'NAV.REVIEWS' | translate }})</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Bar -->
        <div class="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-700/50">
          <div class="p-5 text-center">
            <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">{{ d.yearsOfExperience }}</div>
            <div class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ 'DOCTORS.YEARS_EXPERIENCE' | translate }}</div>
          </div>
          <div class="p-5 text-center">
            <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">{{ d.defaultConsultationFee || '-' }}</div>
            <div class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ 'COMMON.CURRENCY' | translate }} / {{ 'COMMON.MINUTES' | translate }}</div>
          </div>
          <div class="p-5 text-center">
            <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">{{ d.defaultAppointmentDurationMinutes || 30 }}</div>
            <div class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ 'COMMON.DURATION' | translate }} ({{ 'COMMON.MINUTES' | translate }})</div>
          </div>
        </div>
      </div>

      <div class="grid lg:grid-cols-3 gap-6">

        <!-- Sidebar: Booking CTA -->
        <div class="lg:col-span-1 space-y-6">
          <div class="card p-6">
            <h3 class="font-semibold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wider">{{ 'DOCTORS.BOOK' | translate }}</h3>
            <button *ngIf="auth.isAuthenticated() && auth.hasRole('Patient') && d.isAvailableForBooking"
                    (click)="book(d.id)"
                    class="btn-primary w-full !py-3">
              <mat-icon>event_available</mat-icon>
              {{ 'DOCTORS.BOOK' | translate }} {{ 'NAV.APPOINTMENTS' | translate }}
            </button>
            <a *ngIf="!auth.isAuthenticated()" routerLink="/auth/login"
               class="btn-primary w-full !py-3 text-center block">
              {{ 'NAV.LOGIN' | translate }} {{ 'DOCTORS.BOOK' | translate }}
            </a>
          </div>

          <!-- Schedule Card -->
          <div class="card p-6">
            <h3 class="font-semibold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wider">{{ 'DOCTOR_PORTAL.SCHEDULE_TITLE' | translate }}</h3>
            <div *ngIf="schedules().length === 0" class="empty-state !py-6">
              <mat-icon class="text-3xl text-slate-300 dark:text-slate-600">event_busy</mat-icon>
              <p class="text-sm text-slate-500 dark:text-slate-400">{{ 'COMMON.NO_DATA' | translate }}</p>
            </div>
            <div *ngIf="schedules().length > 0" class="space-y-2">
              <div *ngFor="let s of schedules()" class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                <div class="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center flex-shrink-0">
                  <mat-icon class="text-base">schedule</mat-icon>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-sm text-slate-900 dark:text-white">{{ dayName(s.dayOfWeek) }}</div>
                  <div class="text-xs text-slate-500 dark:text-slate-400">{{ s.startTime }} – {{ s.endTime }} · {{ s.slotDurationMinutes }}m</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">

          <!-- About / Biography -->
          <div class="card p-6">
            <h2 class="font-semibold text-slate-900 dark:text-white mb-4 text-lg">{{ 'DOCTORS.BIOGRAPHY' | translate }}</h2>
            <p class="text-slate-600 dark:text-slate-300 leading-relaxed" *ngIf="d.biography">{{ d.biography }}</p>
            <p class="text-slate-400 dark:text-slate-500 italic" *ngIf="!d.biography">—</p>
            <div *ngIf="d.education" class="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
              <div class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{{ 'DOCTOR_PORTAL.NOTES' | translate }}</div>
              <p class="text-sm text-slate-700 dark:text-slate-300">{{ d.education }}</p>
            </div>
          </div>

          <!-- Reviews -->
          <div class="card p-6">
            <div class="flex items-center justify-between mb-5">
              <h2 class="font-semibold text-slate-900 dark:text-white text-lg">{{ 'NAV.REVIEWS' | translate }}</h2>
              <span class="badge badge-info" *ngIf="reviews().length > 0">{{ reviews().length }}</span>
            </div>

            <div *ngIf="reviews().length === 0" class="empty-state !py-10">
              <mat-icon class="text-4xl text-slate-300 dark:text-slate-600 mb-2">rate_review</mat-icon>
              <p class="text-slate-500 dark:text-slate-400">{{ 'COMMON.NO_DATA' | translate }}</p>
            </div>

            <div *ngIf="reviews().length > 0" class="space-y-4">
              <div *ngFor="let r of reviews()" class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:border-slate-200 dark:hover:border-slate-600 transition-colors">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full bg-gradient-to-br from-slate-400 to-slate-300 dark:from-slate-600 dark:to-slate-500 text-white flex items-center justify-center text-xs font-bold">
                      {{ (r.patientDisplayName || '?').charAt(0) }}
                    </div>
                    <span class="font-medium text-sm text-slate-900 dark:text-white">{{ r.patientDisplayName || 'Anonymous' }}</span>
                  </div>
                  <div class="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                    <mat-icon class="text-amber-500 text-sm leading-none">star</mat-icon>
                    <span class="text-sm font-semibold text-amber-700 dark:text-amber-400">{{ r.rating }}/5</span>
                  </div>
                </div>
                <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{{ r.comment }}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  `
})
export class DoctorDetailComponent implements OnInit {
  private data = inject(DataService);
  private route = inject(ActivatedRoute);
  auth = inject(AuthService);

  doctor = signal<DoctorDto | null>(null);
  schedules = signal<DoctorScheduleDto[]>([]);
  reviews = signal<ReviewDto[]>([]);

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.data.getDoctor(id).subscribe(d => { this.doctor.set(d); });
    this.data.getSchedules(id).subscribe(s => this.schedules.set(s));
    this.data.getDoctorReviews(id, 1, 20).subscribe(r => { this.reviews.set(r.items ?? []); });
  }

  book(doctorId: number) {
    window.location.href = `/patient/book?doctorId=${doctorId}`;
  }

  initials(name: string) {
    return name.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();
  }

  dayName(d: string) { return d; }
}
