import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { DataService } from '../../core/services/data.service';
import { ClinicDto, DoctorDto, SpecialtyDto } from '../../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, TranslateModule],
  template: `
    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-500 to-blue-600 dark:from-primary-900 dark:via-primary-800 dark:to-blue-900 -z-10"></div>
      <div class="absolute inset-0 -z-10 opacity-10" style="background-image: radial-gradient(circle at 20% 50%, white 0%, transparent 50%), radial-gradient(circle at 80% 20%, white 0%, transparent 40%);"></div>
      <div class="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-white/5 dark:bg-white/3 blur-3xl"></div>
      <div class="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-blue-300/10 dark:bg-blue-400/5 blur-3xl"></div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 grid lg:grid-cols-2 gap-16 items-center">
        <div class="space-y-8">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium">
            <mat-icon class="text-[16px] leading-none">auto_awesome</mat-icon>
            {{ 'APP_TAGLINE' | translate }}
          </div>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
            {{ 'HOME.HERO_TITLE' | translate }}
          </h1>
          <p class="text-lg lg:text-xl text-white/70 max-w-lg leading-relaxed">
            {{ 'HOME.HERO_SUBTITLE' | translate }}
          </p>
          <div class="flex flex-col sm:flex-row gap-4">
            <a routerLink="/doctors" class="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white text-primary-700 dark:bg-white dark:text-primary-800 font-semibold text-base shadow-lg shadow-primary-900/25 hover:shadow-xl hover:shadow-primary-900/30 hover:-translate-y-0.5 active:scale-[0.98] transition-all">
              <mat-icon>search</mat-icon>
              {{ 'HOME.FIND_DOCTOR' | translate }}
            </a>
            <a routerLink="/auth/register" class="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border-2 border-white/30 text-white font-semibold text-base hover:bg-white/10 active:scale-[0.98] transition-all">
              {{ 'AUTH.SIGN_UP' | translate }}
              <mat-icon>arrow_forward</mat-icon>
            </a>
          </div>
        </div>

        <!-- Hero Card -->
        <div class="relative hidden lg:block">
          <div class="absolute inset-0 bg-white/10 dark:bg-white/5 rounded-3xl blur-xl -z-10 scale-105"></div>
          <div class="bg-white/15 backdrop-blur-xl border border-white/20 rounded-3xl p-8 space-y-6">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <mat-icon class="text-white text-2xl">person</mat-icon>
              </div>
              <div class="flex-1">
                <div class="text-lg font-semibold text-white">Dr. Hany Salem</div>
                <div class="text-sm text-white/60">Cardiology · 15 {{ 'DOCTORS.YEARS_EXPERIENCE' | translate }}</div>
              </div>
              <div class="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400/20">
                <mat-icon class="text-amber-300 text-base">star</mat-icon>
                <span class="text-sm font-bold text-amber-300">4.9</span>
              </div>
            </div>
            <div class="space-y-3">
              <div class="flex items-center gap-3 text-sm text-white/80">
                <mat-icon class="text-emerald-300 text-base">check_circle</mat-icon>
                <span>{{ 'HOME.AVAILABLE_TODAY' | translate }}</span>
              </div>
              <div class="flex items-center gap-3 text-sm text-white/80">
                <mat-icon class="text-emerald-300 text-base">verified</mat-icon>
                <span>EG-CARDIO-001</span>
              </div>
            </div>
            <div class="divider !border-white/10"></div>
            <div class="grid grid-cols-3 gap-3">
              <div class="text-center p-3 rounded-xl bg-white/10 border border-white/10">
                <div class="text-xs text-white/50 mb-1">Today</div>
                <div class="font-bold text-white">10:00</div>
              </div>
              <div class="text-center p-3 rounded-xl bg-white/25 border-2 border-white/40 ring-2 ring-white/10">
                <div class="text-xs text-white/60 mb-1">Tomorrow</div>
                <div class="font-bold text-white">10:00</div>
              </div>
              <div class="text-center p-3 rounded-xl bg-white/10 border border-white/10">
                <div class="text-xs text-white/50 mb-1">Wed</div>
                <div class="font-bold text-white">10:00</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Row -->
    <section class="relative -mt-8 z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 p-6 lg:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        <div class="flex items-center gap-4">
          <div class="stat-icon bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400">
            <mat-icon>people</mat-icon>
          </div>
          <div>
            <div class="stat-value">{{ stats().patients }}+</div>
            <div class="stat-label">{{ 'HOME.STATS_PATIENTS' | translate }}</div>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="stat-icon bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
            <mat-icon>medical_services</mat-icon>
          </div>
          <div>
            <div class="stat-value">{{ stats().doctors }}+</div>
            <div class="stat-label">{{ 'HOME.STATS_DOCTORS' | translate }}</div>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="stat-icon bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400">
            <mat-icon>local_hospital</mat-icon>
          </div>
          <div>
            <div class="stat-value">{{ stats().clinics }}+</div>
            <div class="stat-label">{{ 'HOME.STATS_CLINICS' | translate }}</div>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="stat-icon bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
            <mat-icon>calendar_month</mat-icon>
          </div>
          <div>
            <div class="stat-value">{{ stats().appointments }}+</div>
            <div class="stat-label">{{ 'HOME.STATS_APPOINTMENTS' | translate }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div class="text-center max-w-2xl mx-auto mb-16 space-y-4">
        <span class="inline-flex items-center gap-2 badge bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">
          <mat-icon class="text-sm">info</mat-icon>
          {{ 'HOME.HOW_IT_WORKS' | translate }}
        </span>
        <h2 class="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
          {{ 'HOME.HOW_IT_WORKS' | translate }}
        </h2>
        <p class="text-slate-500 dark:text-slate-400 text-lg">
          {{ 'HOME.HOW_IT_WORKS_SUBTITLE' | translate }}
        </p>
      </div>
      <div class="grid md:grid-cols-3 gap-8 relative">
        <div class="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-primary-200 via-emerald-200 to-amber-200 dark:from-primary-800 dark:via-emerald-800 dark:to-amber-800 -z-10"></div>
        <div class="card card-hover p-8 text-center relative group">
          <div class="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center shadow-lg shadow-primary-600/30 group-hover:scale-110 transition-transform">1</div>
          <div class="w-16 h-16 rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400 mx-auto flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
            <mat-icon class="text-2xl">search</mat-icon>
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-3">{{ 'HOME.STEP_1_TITLE' | translate }}</h3>
          <p class="text-slate-500 dark:text-slate-400 leading-relaxed">{{ 'HOME.STEP_1_DESC' | translate }}</p>
        </div>
        <div class="card card-hover p-8 text-center relative group">
          <div class="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center shadow-lg shadow-emerald-600/30 group-hover:scale-110 transition-transform">2</div>
          <div class="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400 mx-auto flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
            <mat-icon class="text-2xl">event_available</mat-icon>
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-3">{{ 'HOME.STEP_2_TITLE' | translate }}</h3>
          <p class="text-slate-500 dark:text-slate-400 leading-relaxed">{{ 'HOME.STEP_2_DESC' | translate }}</p>
        </div>
        <div class="card card-hover p-8 text-center relative group">
          <div class="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-600 text-white text-sm font-bold flex items-center justify-center shadow-lg shadow-amber-600/30 group-hover:scale-110 transition-transform">3</div>
          <div class="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400 mx-auto flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
            <mat-icon class="text-2xl">medical_services</mat-icon>
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-3">{{ 'HOME.STEP_3_TITLE' | translate }}</h3>
          <p class="text-slate-500 dark:text-slate-400 leading-relaxed">{{ 'HOME.STEP_3_DESC' | translate }}</p>
        </div>
      </div>
    </section>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="divider"></div></div>

    <!-- Featured Specialties -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div class="page-header">
        <div>
          <h2 class="page-title">{{ 'HOME.FEATURED_SPECIALTIES' | translate }}</h2>
          <p class="page-subtitle">{{ 'HOME.SPECIALTIES_SUBTITLE' | translate }}</p>
        </div>
        <a routerLink="/specialties" class="btn-ghost text-primary-600 dark:text-primary-400">
          {{ 'HOME.VIEW_ALL' | translate }}
          <mat-icon>arrow_forward</mat-icon>
        </a>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-8">
        <a *ngFor="let s of specialties(); let i = index" routerLink="/doctors" [queryParams]="{specialtyId: s.id}"
           class="card card-interactive p-5 text-center group">
          <div class="w-12 h-12 rounded-xl mx-auto flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
               [ngClass]="getSpecialtyColor(i)">
            <mat-icon class="text-xl">category</mat-icon>
          </div>
          <div class="font-semibold text-sm text-slate-900 dark:text-white mb-1">{{ s.name }}</div>
          <div class="text-xs text-slate-500 dark:text-slate-400">
            {{ s.doctorsCount }} {{ 'NAV.DOCTORS' | translate }}
          </div>
        </a>
      </div>
    </section>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="divider"></div></div>

    <!-- Top Doctors -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div class="page-header">
        <div>
          <h2 class="page-title">{{ 'HOME.TOP_DOCTORS' | translate }}</h2>
          <p class="page-subtitle">{{ 'HOME.DOCTORS_SUBTITLE' | translate }}</p>
        </div>
        <a routerLink="/doctors" class="btn-ghost text-primary-600 dark:text-primary-400">
          {{ 'HOME.VIEW_ALL_DOCTORS' | translate }}
          <mat-icon>arrow_forward</mat-icon>
        </a>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
        <a *ngFor="let d of topDoctors()" [routerLink]="['/doctors', d.id]"
           class="card card-interactive p-6 group">
          <div class="flex items-start gap-4">
            <div class="relative shrink-0">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-primary-600/20 group-hover:shadow-xl group-hover:shadow-primary-600/30 transition-shadow">
                {{ initials(d.fullName) }}
              </div>
              <div *ngIf="d.isAvailableForBooking" class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800"></div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-bold text-slate-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{{ d.fullName }}</div>
              <div class="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">{{ d.specialtyName }}</div>
              <div class="flex items-center gap-3 mt-3">
                <div class="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                  <mat-icon class="text-[12px] leading-none">star</mat-icon>
                  {{ d.rating || '5.0' }}
                </div>
                <span class="text-xs text-slate-400 dark:text-slate-500">{{ d.yearsOfExperience }}y exp</span>
              </div>
              <div *ngIf="d.defaultConsultationFee" class="mt-3 flex items-center gap-1 text-sm font-bold text-slate-900 dark:text-white">
                {{ d.defaultConsultationFee }}
                <span class="text-xs font-normal text-slate-500 dark:text-slate-400">{{ 'COMMON.CURRENCY' | translate }}</span>
              </div>
            </div>
          </div>
        </a>
      </div>
    </section>

    <!-- CTA Banner -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 to-blue-600 dark:from-primary-800 dark:to-blue-900 p-12 lg:p-16 text-center">
        <div class="absolute inset-0 -z-0 opacity-10" style="background-image: radial-gradient(circle at 30% 50%, white 0%, transparent 50%);"></div>
        <div class="relative z-10 max-w-2xl mx-auto space-y-6">
          <h2 class="text-3xl lg:text-4xl font-bold text-white tracking-tight">{{ 'HOME.CTA_TITLE' | translate }}</h2>
          <p class="text-lg text-white/70">{{ 'HOME.CTA_SUBTITLE' | translate }}</p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a routerLink="/doctors" class="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white text-primary-700 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all">
              <mat-icon>search</mat-icon>
              {{ 'HOME.FIND_DOCTOR' | translate }}
            </a>
            <a routerLink="/clinics" class="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border-2 border-white/30 text-white font-semibold hover:bg-white/10 active:scale-[0.98] transition-all">
              {{ 'NAV.CLINICS' | translate }}
              <mat-icon>local_hospital</mat-icon>
            </a>
          </div>
        </div>
      </div>
    </section>
  `
})
export class HomeComponent implements OnInit {
  private data = inject(DataService);

  specialties = signal<SpecialtyDto[]>([]);
  topDoctors = signal<DoctorDto[]>([]);
  stats = signal({ patients: 0, doctors: 0, clinics: 0, appointments: 0 });

  private readonly specialtyColors = [
    'bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400',
    'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400',
    'bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400',
    'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400',
    'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400',
    'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/50 dark:text-cyan-400',
    'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400',
    'bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400',
    'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400',
    'bg-pink-100 text-pink-600 dark:bg-pink-900/50 dark:text-pink-400',
  ];

  ngOnInit() {
    this.data.listSpecialties(1, 12).subscribe(r => this.specialties.set(r.items ?? []));
    this.data.listDoctors(1, 8, undefined, undefined, true).subscribe(r => this.topDoctors.set(r.items ?? []));
    this.data.getDashboard().subscribe(s => {
      this.stats.set({
        patients: s.totalPatients,
        doctors: s.totalDoctors,
        clinics: s.totalClinics,
        appointments: s.totalAppointments,
      });
    });
  }

  initials(name: string) {
    return name.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();
  }

  getSpecialtyColor(index: number) {
    return this.specialtyColors[index % this.specialtyColors.length];
  }
}
