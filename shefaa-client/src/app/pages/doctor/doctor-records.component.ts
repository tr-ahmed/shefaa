import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { DataService } from '../../core/services/data.service';
import { MedicalRecordDto } from '../../core/models';

@Component({
  selector: 'app-doctor-records',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, TranslateModule],
  template: `
    <div class="page-header animate-fade-in">
      <div>
        <h1 class="page-title">{{ 'NAV.PATIENT_RECORDS' | translate }}</h1>
        <p class="page-subtitle">{{ 'DOCTOR_PORTAL.RECORDS_SUBTITLE' | translate }}</p>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div *ngIf="loading()" class="space-y-4">
      <div *ngFor="let i of [1,2,3]" class="card p-5">
        <div class="flex items-center gap-4">
          <div class="flex-1 space-y-3">
            <div class="skeleton w-40 h-5 rounded"></div>
            <div class="skeleton w-28 h-3 rounded"></div>
          </div>
          <div class="skeleton w-6 h-6 rounded"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div *ngIf="!loading() && records().length === 0" class="empty-state card animate-fade-in">
      <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
        <mat-icon class="!w-8 !h-8 text-slate-300 dark:text-slate-500">folder_open</mat-icon>
      </div>
      <p class="font-medium text-surface-500 dark:text-surface-400">{{ 'COMMON.NO_DATA' | translate }}</p>
    </div>

    <!-- Record Cards -->
    <div *ngIf="!loading() && records().length > 0" class="space-y-3">
      <details *ngFor="let r of records(); let i = index"
               class="card overflow-hidden animate-slide-up group"
               [style.animation-delay]="(i * 40) + 'ms'">
        <summary class="cursor-pointer flex items-center justify-between p-5 list-none select-none hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
          <div class="flex items-center gap-4">
            <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-sm">
              {{ r.patientName.charAt(0) }}
            </div>
            <div>
              <div class="font-semibold text-surface-900 dark:text-white">{{ r.patientName }}</div>
              <div class="text-sm text-surface-500 dark:text-surface-400">{{ r.recordDate | date:'mediumDate' }}</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span *ngIf="r.prescriptions?.length" class="badge badge-success hidden sm:inline-flex">
              <mat-icon class="!w-3 !h-3 mr-0.5">medication</mat-icon>
              {{ r.prescriptions.length }}
            </span>
            <mat-icon class="!w-5 !h-5 text-surface-400 dark:text-surface-500 transition-transform duration-200 group-open:rotate-180">expand_more</mat-icon>
          </div>
        </summary>

        <div class="px-5 pb-5 border-t border-surface-100 dark:border-surface-700">
          <div class="grid md:grid-cols-2 gap-4 text-sm pt-4">
            <div *ngIf="r.chiefComplaint" class="space-y-1">
              <div class="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider">{{ 'DOCTOR_PORTAL.CHIEF_COMPLAINT' | translate }}</div>
              <div class="text-surface-700 dark:text-surface-300">{{ r.chiefComplaint }}</div>
            </div>
            <div *ngIf="r.diagnosis" class="space-y-1">
              <div class="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider">{{ 'DOCTOR_PORTAL.DIAGNOSIS' | translate }}</div>
              <div class="text-surface-700 dark:text-surface-300">{{ r.diagnosis }}</div>
            </div>
            <div *ngIf="r.treatmentPlan" class="space-y-1">
              <div class="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider">{{ 'DOCTOR_PORTAL.TREATMENT_PLAN' | translate }}</div>
              <div class="text-surface-700 dark:text-surface-300">{{ r.treatmentPlan }}</div>
            </div>
            <div *ngIf="r.notes" class="space-y-1">
              <div class="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider">{{ 'DOCTOR_PORTAL.NOTES' | translate }}</div>
              <div class="text-surface-700 dark:text-surface-300">{{ r.notes }}</div>
            </div>
          </div>

          <!-- Prescriptions -->
          <div *ngIf="r.prescriptions.length > 0" class="mt-4 pt-4 border-t border-surface-100 dark:border-surface-700">
            <div class="flex items-center gap-2 mb-3">
              <mat-icon class="!w-4 !h-4 text-emerald-600 dark:text-emerald-400">medication</mat-icon>
              <span class="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider">{{ 'DOCTOR_PORTAL.PRESCRIPTIONS' | translate }}</span>
            </div>
            <div class="space-y-2">
              <div *ngFor="let p of r.prescriptions"
                   class="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40">
                <div class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                  <mat-icon class="!w-4 !h-4 text-emerald-600 dark:text-emerald-400">medication_liquid</mat-icon>
                </div>
                <div class="flex-1 min-w-0">
                  <span class="font-semibold text-sm text-emerald-800 dark:text-emerald-300">{{ p.medicationName }}</span>
                  <span class="text-xs text-emerald-600 dark:text-emerald-400 ml-2">{{ p.dosage }}</span>
                </div>
                <div class="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 shrink-0">
                  <span class="badge badge-success text-[10px] py-0">{{ p.frequency }}</span>
                  <span class="text-emerald-400 dark:text-emerald-500">·</span>
                  <span>{{ p.duration }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </details>
    </div>
  `
})
export class DoctorRecordsComponent implements OnInit {
  private data = inject(DataService);

  loading = signal(true);
  records = signal<MedicalRecordDto[]>([]);

  ngOnInit() {
    this.data.getDoctorMe().subscribe({
      next: doctor => {
        this.data.getDoctorMedicalRecords(doctor.id).subscribe({
          next: records => {
            records.sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime());
            this.records.set(records);
            this.loading.set(false);
          },
          error: () => this.loading.set(false)
        });
      },
      error: () => this.loading.set(false)
    });
  }
}
