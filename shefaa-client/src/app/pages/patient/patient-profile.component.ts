import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientDto } from '../../core/models';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule, TranslateModule],
  template: `
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ 'NAV.PROFILE' | translate }}</h1>
        <p class="page-subtitle">{{ auth.user()?.email }}</p>
      </div>
    </div>

    <div *ngIf="patient()" class="grid lg:grid-cols-3 gap-6">
      <!-- Sidebar: Profile Card -->
      <div class="lg:col-span-1">
        <div class="card p-6">
          <div class="flex flex-col items-center text-center">
            <div class="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center text-3xl font-bold shadow-lg mb-4">
              {{ auth.user()?.firstName?.[0] }}{{ auth.user()?.lastName?.[0] }}
            </div>
            <h3 class="text-lg font-semibold text-surface-900 dark:text-surface-50">{{ auth.user()?.fullName }}</h3>
            <p class="text-sm text-surface-500 dark:text-surface-400 mt-0.5">{{ patient()?.email }}</p>
          </div>

          <div class="divider my-5"></div>

          <div class="space-y-4">
            <div class="flex items-center justify-between text-sm">
              <span class="flex items-center gap-2 text-surface-500 dark:text-surface-400">
                <mat-icon class="!text-[18px]">badge</mat-icon>
                {{ 'PATIENT.MEDICAL_RECORD_NUMBER' | translate }}
              </span>
              <span class="font-mono font-medium text-surface-800 dark:text-surface-200">{{ patient()?.medicalRecordNumber }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="flex items-center gap-2 text-surface-500 dark:text-surface-400">
                <mat-icon class="!text-[18px]">cake</mat-icon>
                {{ 'PATIENT.DASHBOARD_TITLE' | translate }}
              </span>
              <span class="font-medium text-surface-800 dark:text-surface-200">{{ patient()?.age }} yrs</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main: Form -->
      <div class="lg:col-span-2">
        <form [formGroup]="form" (ngSubmit)="save()" class="space-y-6">

          <!-- Personal Info Section -->
          <div class="card p-6">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                <mat-icon>person</mat-icon>
              </div>
              <h3 class="text-base font-semibold text-surface-900 dark:text-surface-50">{{ 'PATIENT.PERSONAL_INFO' | translate }}</h3>
            </div>
            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <label class="label">{{ 'PATIENT.BLOOD_TYPE' | translate }}</label>
                <select formControlName="bloodType" class="input">
                  <option [ngValue]="0">{{ 'PATIENT.BLOOD_UNKNOWN' | translate }}</option>
                  <option [ngValue]="1">A+</option>
                  <option [ngValue]="2">A-</option>
                  <option [ngValue]="3">B+</option>
                  <option [ngValue]="4">B-</option>
                  <option [ngValue]="5">AB+</option>
                  <option [ngValue]="6">AB-</option>
                  <option [ngValue]="7">O+</option>
                  <option [ngValue]="8">O-</option>
                </select>
              </div>
              <div>
                <label class="label">{{ 'PATIENT.PHONE_NUMBER' | translate }}</label>
                <input formControlName="phoneNumber" class="input" [placeholder]="'PATIENT.PHONE_NUMBER' | translate">
              </div>
            </div>
            <div class="grid sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label class="label">{{ 'PATIENT.EMERGENCY_CONTACT_NAME' | translate }}</label>
                <input formControlName="emergencyContactName" class="input" [placeholder]="'COMMON.NAME' | translate">
              </div>
              <div>
                <label class="label">{{ 'PATIENT.EMERGENCY_CONTACT_PHONE' | translate }}</label>
                <input formControlName="emergencyContactPhone" class="input" [placeholder]="'PATIENT.PHONE_NUMBER' | translate">
              </div>
            </div>
          </div>

          <!-- Medical Info Section -->
          <div class="card p-6">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <mat-icon>medical_services</mat-icon>
              </div>
              <h3 class="text-base font-semibold text-surface-900 dark:text-surface-50">{{ 'PATIENT.MEDICAL_INFO' | translate }}</h3>
            </div>
            <div class="space-y-4">
              <div>
                <label class="label">{{ 'PATIENT.ALLERGIES' | translate }}</label>
                <textarea formControlName="allergies" rows="2" class="input" [placeholder]="'PATIENT.ALLERGIES_PLACEHOLDER' | translate"></textarea>
              </div>
              <div>
                <label class="label">{{ 'PATIENT.CHRONIC_DISEASES' | translate }}</label>
                <textarea formControlName="chronicDiseases" rows="2" class="input" [placeholder]="'PATIENT.CHRONIC_DISEASES_PLACEHOLDER' | translate"></textarea>
              </div>
              <div>
                <label class="label">{{ 'PATIENT.CURRENT_MEDICATIONS' | translate }}</label>
                <textarea formControlName="currentMedications" rows="2" class="input" [placeholder]="'PATIENT.CURRENT_MEDICATIONS_PLACEHOLDER' | translate"></textarea>
              </div>
            </div>
          </div>

          <!-- Insurance Section -->
          <div class="card p-6">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <mat-icon>health_and_safety</mat-icon>
              </div>
              <h3 class="text-base font-semibold text-surface-900 dark:text-surface-50">{{ 'PATIENT.INSURANCE' | translate }}</h3>
            </div>
            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <label class="label">{{ 'PATIENT.INSURANCE_PROVIDER' | translate }}</label>
                <input formControlName="insuranceProvider" class="input" [placeholder]="'PATIENT.INSURANCE_PROVIDER_PLACEHOLDER' | translate">
              </div>
              <div>
                <label class="label">{{ 'PATIENT.INSURANCE_POLICY' | translate }}</label>
                <input formControlName="insurancePolicyNumber" class="input" [placeholder]="'PATIENT.INSURANCE_POLICY_PLACEHOLDER' | translate">
              </div>
            </div>
          </div>

          <!-- Success Message -->
          <div *ngIf="saved()" class="flex items-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4 text-sm text-emerald-700 dark:text-emerald-300">
            <mat-icon>check_circle</mat-icon>
            {{ 'COMMON.SAVE_CHANGES' | translate }} — {{ 'COMMON.SAVED' | translate }}
          </div>

          <!-- Save Button -->
          <div class="flex justify-end">
            <button type="submit" [disabled]="form.invalid || saving()" class="btn-primary">
              <mat-icon>save</mat-icon>
              {{ 'COMMON.SAVE' | translate }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class PatientProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private data = inject(DataService);
  private snack = inject(MatSnackBar);
  private translate = inject(TranslateService);
  auth = inject(AuthService);

  patient = signal<PatientDto | null>(null);
  saving = signal(false);
  saved = signal(false);

  form = this.fb.nonNullable.group({
    bloodType: [0],
    allergies: [''],
    chronicDiseases: [''],
    currentMedications: [''],
    emergencyContactName: [''],
    emergencyContactPhone: [''],
    insuranceProvider: [''],
    insurancePolicyNumber: [''],
    phoneNumber: ['']
  });

  ngOnInit() {
    this.data.getPatientMe().subscribe(p => {
      this.patient.set(p);
      this.form.patchValue({
        bloodType: p.bloodType || 0,
        allergies: p.allergies || '',
        chronicDiseases: p.chronicDiseases || '',
        currentMedications: p.currentMedications || '',
        emergencyContactName: p.emergencyContactName || '',
        emergencyContactPhone: p.emergencyContactPhone || '',
        insuranceProvider: p.insuranceProvider || '',
        insurancePolicyNumber: p.insurancePolicyNumber || '',
        phoneNumber: p.phoneNumber || ''
      });
    });
  }

  save() {
    if (!this.patient()) return;
    this.saving.set(true);
    this.data.updatePatient(this.patient()!.id, this.form.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
        this.snack.open(this.translate.instant('PATIENT.SAVED_SUCCESS'), this.translate.instant('COMMON.OK'), { duration: 2000 });
      },
      error: err => { this.saving.set(false); this.snack.open(err.error?.message || err.error?.title || this.translate.instant('COMMON.SAVE_FAILED'), this.translate.instant('COMMON.OK'), { duration: 3000 }); }
    });
  }
}
