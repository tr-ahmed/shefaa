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
    <!-- New Hero Section -->
    <section class="relative overflow-hidden bg-gradient-to-br from-[#0B4F6C] via-[#1A7A9E] to-[#2BA8D4]">
      <div class="absolute inset-0 opacity-[0.08]">
        <svg viewBox="0 0 1440 600" preserveAspectRatio="none" class="w-full h-full">
          <path d="M0,300 C360,100 720,500 1080,200 C1260,100 1350,300 1440,250 L1440,600 L0,600 Z" fill="white"/>
          <path d="M0,350 C240,200 480,450 720,300 C960,150 1200,400 1440,280 L1440,600 L0,600 Z" fill="white" opacity="0.6"/>
        </svg>
      </div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 lg:pb-20">
        <!-- Social Proof Bar -->
        <div class="flex flex-wrap items-center justify-center gap-6 md:gap-10 mb-10 lg:mb-14 pt-4">
          <div class="flex items-center gap-3">
            <div class="flex -space-x-2">
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 border-2 border-white/30 flex items-center justify-center text-[10px] font-bold text-white shadow-md">SA</div>
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-300 to-emerald-500 border-2 border-white/30 flex items-center justify-center text-[10px] font-bold text-white shadow-md">MK</div>
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 border-2 border-white/30 flex items-center justify-center text-[10px] font-bold text-white shadow-md">RJ</div>
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-300 to-purple-500 border-2 border-white/30 flex items-center justify-center text-[10px] font-bold text-white shadow-md">+</div>
            </div>
            <div>
              <span class="text-white font-bold text-lg">{{ stats().patients || '5,000' }}+</span>
              <span class="text-white/70 text-xs block">{{ 'HOME.SOCIAL_PATIENTS' | translate }}</span>
            </div>
          </div>
          <div class="w-px h-10 bg-white/20 hidden md:block"></div>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center">
              <mat-icon class="text-amber-300 text-lg">star</mat-icon>
            </div>
            <div>
              <span class="text-white font-bold text-lg">98%</span>
              <span class="text-white/70 text-xs block">{{ 'HOME.SOCIAL_SATISFACTION' | translate }}</span>
            </div>
          </div>
          <div class="w-px h-10 bg-white/20 hidden md:block"></div>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-emerald-400/20 flex items-center justify-center">
              <mat-icon class="text-emerald-300 text-lg">verified</mat-icon>
            </div>
            <div>
              <span class="text-white font-bold text-lg">{{ maxExperience() }}+</span>
              <span class="text-white/70 text-xs block">{{ 'HOME.SOCIAL_EXPERIENCE' | translate }}</span>
            </div>
          </div>
        </div>

        <!-- Main Hero Content -->
        <div class="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <!-- Left Column -->
          <div class="relative">
            <h1 class="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight">
              <span class="block">{{ 'HOME.HERO_HEADLINE_LEFT' | translate }}</span>
            </h1>

            <!-- Doctor Image Placeholder (Centered between headlines) -->
            <div class="my-6 lg:my-8 flex justify-center">
              <div class="relative w-56 h-56 lg:w-64 lg:h-64">
                <div class="absolute inset-0 bg-white/10 rounded-full blur-2xl"></div>
                <div class="relative w-full h-full rounded-full bg-gradient-to-br from-white/20 to-white/5 border-2 border-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                  <div class="text-center">
                    <div class="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center border-4 border-white/30 shadow-lg mb-2">
                      <mat-icon class="text-white text-3xl">medical_services</mat-icon>
                    </div>
                    <div class="text-white/90 font-semibold text-sm">{{ 'NAV.DOCTORS' | translate }}</div>
                    <div class="flex items-center justify-center gap-1 mt-1 text-amber-300 text-xs">
                      <mat-icon class="text-[12px]">star</mat-icon>
                      <span>4.9</span>
                    </div>
                  </div>
                </div>
                <!-- Stethoscope decorative element -->
                <div class="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-300 border-2 border-white/40 flex items-center justify-center shadow-lg">
                  <mat-icon class="text-slate-600 text-lg">pulse_sensor</mat-icon>
                </div>
                <!-- Cross decorative element -->
                <div class="absolute -bottom-2 -left-2 w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-300 to-emerald-500 border-2 border-white/40 flex items-center justify-center shadow-lg">
                  <mat-icon class="text-white text-base">add</mat-icon>
                </div>
              </div>
            </div>

            <h1 class="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-4">
              <span class="block">{{ 'HOME.HERO_HEADLINE_RIGHT' | translate }}</span>
            </h1>

            <p class="text-white/75 text-base lg:text-lg max-w-lg leading-relaxed mb-6">
              {{ 'HOME.HERO_PARAGRAPH' | translate }}
            </p>

            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <a routerLink="/doctors" class="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white text-[#0B4F6C] font-bold text-base shadow-lg shadow-black/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all">
                {{ 'HOME.BOOK_APPOINTMENT' | translate }}
                <mat-icon>arrow_forward</mat-icon>
              </a>
              <button class="inline-flex items-center gap-3 text-white/80 hover:text-white transition-colors group">
                <div class="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center group-hover:border-white/60 transition-colors">
                  <mat-icon class="text-lg">play_arrow</mat-icon>
                </div>
                <span class="text-sm font-medium">{{ 'HOME.WATCH_VIDEO' | translate }}</span>
              </button>
            </div>
          </div>

          <!-- Right Column -->
          <div class="relative hidden lg:block">
            <div class="relative">
              <div class="absolute -inset-4 bg-white/5 rounded-3xl blur-2xl"></div>
              <div class="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                <div class="aspect-[4/3] bg-gradient-to-br from-blue-400/30 to-cyan-500/30 backdrop-blur-sm flex items-center justify-center">
                  <div class="text-center p-8">
                    <div class="w-24 h-24 mx-auto rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                      <mat-icon class="text-white text-4xl">groups</mat-icon>
                    </div>
                    <div class="text-white font-semibold text-lg mb-2">{{ 'HOME.STATS_PATIENTS' | translate }}</div>
                    <div class="text-white/60 text-sm">{{ 'HOME.STATS_DOCTORS' | translate }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Floating stat card -->
            <div class="absolute -bottom-4 -left-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-xl">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-400/20 flex items-center justify-center">
                  <mat-icon class="text-emerald-300">trending_up</mat-icon>
                </div>
                <div>
                  <div class="text-white font-bold text-sm">{{ stats().appointments || '0' }}+</div>
                  <div class="text-white/60 text-xs">{{ 'HOME.STATS_APPOINTMENTS' | translate }}</div>
                </div>
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
            <div class="stat-value">{{ stats().patients || '5,000' }}+</div>
            <div class="stat-label">{{ 'HOME.STATS_PATIENTS' | translate }}</div>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="stat-icon bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
            <mat-icon>medical_services</mat-icon>
          </div>
          <div>
            <div class="stat-value">{{ stats().doctors || '500' }}+</div>
            <div class="stat-label">{{ 'HOME.STATS_DOCTORS' | translate }}</div>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="stat-icon bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400">
            <mat-icon>local_hospital</mat-icon>
          </div>
          <div>
            <div class="stat-value">{{ stats().clinics || '50' }}+</div>
            <div class="stat-label">{{ 'HOME.STATS_CLINICS' | translate }}</div>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="stat-icon bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
            <mat-icon>calendar_month</mat-icon>
          </div>
          <div>
            <div class="stat-value">{{ stats().appointments || '15,000' }}+</div>
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
  maxExperience = signal(0);
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

    this.data.listDoctors(1, 8, undefined, undefined, true).subscribe(r => {
      this.topDoctors.set(r.items ?? []);
      const yrs = r.items?.map(d => d.yearsOfExperience ?? 0) ?? [];
      this.maxExperience.set(Math.max(...yrs, 10));
    });

    this.data.listDoctors(1, 1).subscribe(r => {
      this.stats.update(s => ({ ...s, doctors: r.totalCount || 0 }));
    });

    this.data.listClinics(1, 1).subscribe(r => {
      this.stats.update(s => ({ ...s, clinics: r.totalCount || 0 }));
    });
  }

  initials(name: string) {
    return name.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();
  }

  getSpecialtyColor(index: number) {
    return this.specialtyColors[index % this.specialtyColors.length];
  }
}
