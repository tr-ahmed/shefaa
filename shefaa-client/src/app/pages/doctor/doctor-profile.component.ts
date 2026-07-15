import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DataService } from '../../core/services/data.service';
import { DoctorDto, DoctorScheduleDto, SpecialtyDto } from '../../core/models';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, TranslateModule],
  template: `
    <div class="page-header animate-fade-in">
      <div>
        <h1 class="page-title">{{ 'DOCTOR_PORTAL.PROFILE_TITLE' | translate }}</h1>
        <p class="page-subtitle">{{ 'DOCTOR_PORTAL.PROFILE_SUBTITLE' | translate }}</p>
      </div>
    </div>

    <!-- Loading -->
    <div *ngIf="loading()" class="space-y-4">
      <div class="card p-6"><div class="skeleton h-8 w-48 rounded mb-4"></div><div class="skeleton h-40 w-full rounded-xl"></div></div>
    </div>

    <!-- Profile Not Found -->
    <div *ngIf="!loading() && profileError()" class="error-box flex items-start gap-3 p-5">
      <mat-icon class="mt-0.5">error_outline</mat-icon>
      <div>
        <h3 class="font-semibold mb-1">{{ 'DOCTOR_PORTAL.PROFILE_NOT_FOUND' | translate }}</h3>
        <p class="text-sm opacity-90">{{ 'DOCTOR_PORTAL.PROFILE_NOT_FOUND_HINT' | translate }}</p>
      </div>
    </div>

    <!-- Profile Form -->
    <div *ngIf="!loading() && !profileError() && doctor()" class="space-y-6 animate-fade-in">
      <!-- Hero Card -->
      <div class="card p-0 overflow-hidden">
        <div class="bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 px-8 py-8">
          <div class="flex items-center gap-5">
            <div class="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center text-3xl font-bold ring-4 ring-white/30 shadow-xl shrink-0">
              {{ initials(doctor()!.fullName) }}
            </div>
            <div class="text-white">
              <h2 class="text-2xl font-bold">{{ doctor()!.fullName }}</h2>
              <p class="text-white/80 mt-0.5">{{ doctor()!.specialtyName }} · {{ doctor()!.licenseNumber }}</p>
              <div class="flex items-center gap-1 mt-2">
                <mat-icon class="text-amber-300 text-base">star</mat-icon>
                <span class="font-semibold">{{ doctor()!.rating || '5.0' }}</span>
                <span class="text-white/60 text-sm ms-1">({{ doctor()!.totalReviews }} {{ 'DOCTORS.VIEWS_REVIEWS' | translate }})</span>
              </div>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100 dark:divide-slate-700/50">
          <div class="p-4 text-center">
            <div class="text-xl font-bold text-primary-600 dark:text-primary-400">{{ doctor()!.yearsOfExperience }}</div>
            <div class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ 'DOCTORS.YEARS_EXPERIENCE' | translate }}</div>
          </div>
          <div class="p-4 text-center">
            <div class="text-xl font-bold text-primary-600 dark:text-primary-400">{{ doctor()!.defaultConsultationFee || '-' }}</div>
            <div class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ 'COMMON.CURRENCY' | translate }} {{ 'DOCTORS.EGP_PER_VISIT' | translate }}</div>
          </div>
          <div class="p-4 text-center">
            <div class="text-xl font-bold text-primary-600 dark:text-primary-400">{{ doctor()!.defaultAppointmentDurationMinutes || 30 }}m</div>
            <div class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ 'DOCTORS.DURATION' | translate }}</div>
          </div>
          <div class="p-4 text-center">
            <div class="w-12 h-12 rounded-full mx-auto mt-1 flex items-center justify-center" [ngClass]="doctor()!.isAvailableForBooking ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'">
              <mat-icon>{{ doctor()!.isAvailableForBooking ? 'check_circle' : 'cancel' }}</mat-icon>
            </div>
            <div class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ (doctor()!.isAvailableForBooking ? 'DOCTORS.AVAILABLE' : 'DOCTORS.UNAVAILABLE') | translate }}</div>
          </div>
        </div>
      </div>

      <!-- Edit Form -->
      <div class="card p-6">
        <h3 class="font-semibold text-surface-900 dark:text-white mb-5 text-lg">{{ 'DOCTOR_PORTAL.EDIT_PROFILE' | translate }}</h3>
        <div class="grid md:grid-cols-2 gap-5">
          <div>
            <label class="label">{{ 'DOCTORS.SPECIALTY' | translate }}</label>
            <select [(ngModel)]="form.specialtyId" class="input">
              <option *ngFor="let s of specialties()" [ngValue]="s.id">{{ s.name }}</option>
            </select>
          </div>
          <div>
            <label class="label">{{ 'DOCTORS.LICENSE' | translate }}</label>
            <input [(ngModel)]="form.licenseNumber" class="input">
          </div>
          <div>
            <label class="label">{{ 'DOCTORS.YEARS_EXPERIENCE' | translate }}</label>
            <input type="number" [(ngModel)]="form.yearsOfExperience" class="input">
          </div>
          <div>
            <label class="label">{{ 'DOCTORS.FEE' | translate }} ({{ 'COMMON.CURRENCY' | translate }})</label>
            <input type="number" [(ngModel)]="form.defaultConsultationFee" class="input">
          </div>
          <div>
            <label class="label">{{ 'DOCTORS.DURATION' | translate }} (min)</label>
            <input type="number" [(ngModel)]="form.defaultAppointmentDurationMinutes" class="input">
          </div>
          <div class="flex items-end gap-3">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" [(ngModel)]="form.isAvailableForBooking" class="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500">
              <span class="label !mb-0">{{ 'DOCTORS.AVAILABLE_FOR_BOOKING' | translate }}</span>
            </label>
          </div>
          <div class="md:col-span-2">
            <label class="label">{{ 'DOCTORS.BIOGRAPHY' | translate }}</label>
            <textarea [(ngModel)]="form.biography" rows="4" class="input"></textarea>
          </div>
          <div class="md:col-span-2">
            <label class="label">{{ 'DOCTORS.EDUCATION' | translate }}</label>
            <textarea [(ngModel)]="form.education" rows="3" class="input"></textarea>
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-6 pt-4 border-t border-surface-100 dark:border-surface-700">
          <button (click)="loadProfile()" class="btn-secondary">{{ 'COMMON.CANCEL' | translate }}</button>
          <button (click)="save()" [disabled]="saving()" class="btn-primary">
            <mat-icon *ngIf="saving()" class="animate-spin !text-[18px]">refresh</mat-icon>
            {{ 'COMMON.SAVE' | translate }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class DoctorProfileComponent implements OnInit {
  private data = inject(DataService);
  private snack = inject(MatSnackBar);
  private translate = inject(TranslateService);

  loading = signal(true);
  saving = signal(false);
  profileError = signal(false);
  doctor = signal<DoctorDto | null>(null);
  specialties = signal<SpecialtyDto[]>([]);

  form = {
    specialtyId: 0,
    licenseNumber: '',
    yearsOfExperience: 0,
    biography: '',
    education: '',
    defaultConsultationFee: 0,
    defaultAppointmentDurationMinutes: 30,
    isAvailableForBooking: true
  };

  ngOnInit() { this.loadProfile(); }

  loadProfile() {
    this.loading.set(true);
    this.data.getDoctorMe().subscribe({
      next: d => {
        this.doctor.set(d);
        this.form.specialtyId = d.specialtyId;
        this.form.licenseNumber = d.licenseNumber;
        this.form.yearsOfExperience = d.yearsOfExperience;
        this.form.biography = d.biography || '';
        this.form.education = d.education || '';
        this.form.defaultConsultationFee = d.defaultConsultationFee || 0;
        this.form.defaultAppointmentDurationMinutes = d.defaultAppointmentDurationMinutes || 30;
        this.form.isAvailableForBooking = d.isAvailableForBooking;
        this.profileError.set(false);
        this.loading.set(false);
      },
      error: () => { this.profileError.set(true); this.loading.set(false); }
    });
    this.data.listSpecialties(1, 200).subscribe({
      next: r => this.specialties.set(r.items || [])
    });
  }

  save() {
    if (!this.doctor()) return;
    this.saving.set(true);
    this.data.updateDoctor(this.doctor()!.id, this.form).subscribe({
      next: () => {
        this.snack.open(this.translate.instant('COMMON.SAVED'), this.translate.instant('COMMON.OK'), { duration: 3000 });
        this.saving.set(false);
        this.loadProfile();
      },
      error: err => {
        this.snack.open(err.error?.message || this.translate.instant('COMMON.SAVE_FAILED'), this.translate.instant('COMMON.OK'), { duration: 4000 });
        this.saving.set(false);
      }
    });
  }

  initials(name: string) {
    return name.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();
  }
}
