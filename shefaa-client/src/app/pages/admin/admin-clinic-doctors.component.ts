import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { ClinicDto, ClinicDoctorDto, DoctorDto } from '../../core/models';

@Component({
  selector: 'app-admin-clinic-doctors',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, TranslateModule],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ 'ADMIN.CLINIC_DOCTORS.TITLE' | translate }}</h1>
        <p class="page-subtitle">{{ 'ADMIN.CLINIC_DOCTORS.SUBTITLE' | translate }}</p>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-6">
      <!-- Left: Clinic selector + assign form -->
      <div class="lg:col-span-1">
        <div class="card p-0 overflow-hidden">
          <div class="relative h-1.5 bg-gradient-to-r from-primary-500 to-emerald-400"></div>
          <div class="p-5">
            <div class="flex items-center gap-2.5 mb-4">
              <div class="w-9 h-9 rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 flex items-center justify-center">
                <mat-icon class="text-xl">local_hospital</mat-icon>
              </div>
              <span class="font-semibold text-slate-900 dark:text-white">{{ 'ADMIN.CLINIC_DOCTORS.SELECT_CLINIC' | translate }}</span>
            </div>
            <label class="label">{{ 'ADMIN.CLINIC_DOCTORS.CLINIC_LABEL' | translate }}</label>
            <select class="input" [ngModel]="clinicId()" (ngModelChange)="onClinicChange($event)" name="clinicId">
              <option [ngValue]="null">{{ '-- Select --' }}</option>
              <option *ngFor="let c of clinics()" [ngValue]="c.id">{{ c.name }}{{ c.city ? ' - ' + c.city : '' }}</option>
            </select>
          </div>

          <div class="divider my-0"></div>

          <div class="p-5">
            <h2 class="font-semibold text-slate-900 dark:text-white mb-4">{{ 'ADMIN.CLINIC_DOCTORS.ASSIGN_TITLE' | translate }}</h2>

            <div class="flex flex-col gap-4">
              <div>
                <label class="label">{{ 'ADMIN.CLINIC_DOCTORS.SELECT_DOCTOR' | translate }} <span class="text-red-500">*</span></label>
                <select class="input" [(ngModel)]="selectedDoctorId" name="doctorId">
                  <option [ngValue]="null">{{ '-- Select --' }}</option>
                  <option *ngFor="let d of availableDoctors()" [ngValue]="d.id">{{ d.fullName }} ({{ d.specialtyName }})</option>
                </select>
              </div>
              <div>
                <label class="label">{{ 'ADMIN.CLINIC_DOCTORS.CONSULTATION_FEE' | translate }} ({{ 'COMMON.CURRENCY' | translate }})</label>
                <input type="number" class="input" [(ngModel)]="consultationFee" [placeholder]="'ADMIN.CLINIC_DOCTORS.FEE_PLACEHOLDER' | translate" min="0">
              </div>
              <label class="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                <input type="checkbox" [(ngModel)]="isPrimary" class="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500">
                {{ 'ADMIN.CLINIC_DOCTORS.IS_PRIMARY' | translate }}
              </label>
              <button class="btn-primary w-full" [disabled]="!clinicId() || !selectedDoctorId || saving()" (click)="assign()">
                <mat-icon>person_add</mat-icon>
                {{ 'ADMIN.CLINIC_DOCTORS.ASSIGN_BTN' | translate }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Assigned doctors list -->
      <div class="lg:col-span-2">
        <div class="card p-0 overflow-hidden">
          <div class="p-5 border-b border-slate-200 dark:border-slate-700">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="font-semibold text-slate-900 dark:text-white">{{ 'ADMIN.CLINIC_DOCTORS.ASSIGNED_TITLE' | translate }}</h2>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5" *ngIf="clinicName()">{{ clinicName() }}</p>
              </div>
              <button type="button" class="btn-secondary btn-sm" (click)="loadDoctors()">
                <mat-icon>refresh</mat-icon>
                {{ 'COMMON.REFRESH' | translate }}
              </button>
            </div>
          </div>

          <div class="p-5">
            <div *ngIf="loadingDoctors()" class="flex flex-col gap-3">
              <div class="flex items-center gap-3 p-4" *ngFor="let i of [1,2]">
                <div class="skeleton w-10 h-10 rounded-full"></div>
                <div class="flex-1">
                  <div class="skeleton h-5 w-1/3 rounded mb-2"></div>
                  <div class="skeleton h-4 w-1/4 rounded"></div>
                </div>
              </div>
            </div>

            <div *ngIf="!loadingDoctors() && !clinicId()" class="empty-state py-10">
              <mat-icon class="text-4xl text-slate-300 dark:text-slate-600 mb-2">local_hospital</mat-icon>
              <p class="text-slate-500 dark:text-slate-400">{{ 'ADMIN.CLINIC_DOCTORS.SELECT_HINT' | translate }}</p>
            </div>

            <div *ngIf="!loadingDoctors() && clinicId() && doctors().length === 0" class="empty-state py-10">
              <mat-icon class="text-4xl text-slate-300 dark:text-slate-600 mb-2">person_search</mat-icon>
              <p class="text-slate-500 dark:text-slate-400">{{ 'ADMIN.CLINIC_DOCTORS.NO_DATA' | translate }}</p>
            </div>

            <div *ngIf="!loadingDoctors() && doctors().length > 0" class="flex flex-col gap-3">
              <div *ngFor="let d of doctors()" class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                    {{ initials(d.doctorName) }}
                  </div>
                  <div>
                    <div class="font-semibold text-slate-900 dark:text-white">{{ d.doctorName }}</div>
                    <div class="text-sm text-slate-500 dark:text-slate-400">{{ d.specialtyName || '---' }}</div>
                  </div>
                </div>
                <div class="flex items-center gap-3 pl-[52px] sm:pl-0">
                  <span class="text-sm font-medium text-slate-600 dark:text-slate-300" *ngIf="d.consultationFee">
                    {{ d.consultationFee | number }} {{ 'COMMON.CURRENCY' | translate }}
                  </span>
                  <span class="badge badge-success" *ngIf="d.isPrimary">
                    <mat-icon class="text-[14px]">star</mat-icon>
                    {{ 'ADMIN.CLINIC_DOCTORS.PRIMARY' | translate }}
                  </span>
                  <button class="btn-ghost btn-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" (click)="remove(d)">
                    <mat-icon>person_remove</mat-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminClinicDoctorsComponent implements OnInit {
  private data = inject(DataService);
  private auth = inject(AuthService);
  private snack = inject(MatSnackBar);
  private translate = inject(TranslateService);

  clinics = signal<ClinicDto[]>([]);
  allDoctors = signal<DoctorDto[]>([]);
  doctors = signal<ClinicDoctorDto[]>([]);
  availableDoctors = signal<DoctorDto[]>([]);

  clinicId = signal<number | null>(null);
  clinicName = signal('');
  loadingDoctors = signal(false);
  saving = signal(false);

  selectedDoctorId: number | null = null;
  consultationFee: number | null = null;
  isPrimary = false;

  ngOnInit() {
    if (this.auth.hasRole('ClinicAdmin')) {
      this.data.getMyClinic().subscribe({
        next: clinic => {
          if (clinic) {
            this.clinics.set([clinic]);
            this.onClinicChange(clinic.id);
          }
        }
      });
    } else {
      this.data.listClinics(1, 100, undefined, undefined, false).subscribe({
        next: r => {
          const items = r.items || [];
          this.clinics.set(items);
          if (items.length > 0 && !this.clinicId()) {
            this.onClinicChange(items[0].id);
          }
        }
      });
    }

    this.data.listDoctors(1, 200).subscribe({
      next: r => this.allDoctors.set(r.items || [])
    });
  }

  onClinicChange(id: number | null) {
    this.clinicId.set(id);
    const clinic = this.clinics().find(c => c.id === id) ?? null;
    this.clinicName.set(clinic?.name ?? '');
    this.selectedDoctorId = null;
    this.consultationFee = null;
    this.isPrimary = false;
    if (id != null) {
      this.loadDoctors();
    } else {
      this.doctors.set([]);
      this.availableDoctors.set([]);
    }
  }

  loadDoctors() {
    const id = this.clinicId();
    if (!id) return;
    this.loadingDoctors.set(true);
    this.data.getClinicDoctors(id).subscribe({
      next: list => {
        this.doctors.set(list || []);
        const assignedIds = new Set((list || []).map(d => d.doctorId));
        this.availableDoctors.set(this.allDoctors().filter(d => !assignedIds.has(d.id)));
        this.loadingDoctors.set(false);
      },
      error: () => {
        this.loadingDoctors.set(false);
        this.snack.open(this.translate.instant('ADMIN.CLINIC_DOCTORS.FAILED_LOAD'), this.translate.instant('COMMON.OK'), { duration: 2500 });
      }
    });
  }

  assign() {
    const clinicId = this.clinicId();
    if (!clinicId || !this.selectedDoctorId) {
      this.snack.open(this.translate.instant('ADMIN.CLINIC_DOCTORS.SELECT_BOTH'), this.translate.instant('COMMON.OK'), { duration: 2500 });
      return;
    }
    this.saving.set(true);
    this.data.addDoctorToClinic(clinicId, {
      doctorId: this.selectedDoctorId,
      consultationFee: this.consultationFee ?? undefined,
      isPrimary: this.isPrimary
    }).subscribe({
      next: res => {
        this.saving.set(false);
        if (!res.success) {
          this.snack.open(res.message || this.translate.instant('ADMIN.CLINIC_DOCTORS.ASSIGN_FAILED'), this.translate.instant('COMMON.OK'), { duration: 3000 });
          return;
        }
        this.snack.open(this.translate.instant('ADMIN.CLINIC_DOCTORS.ASSIGNED'), this.translate.instant('COMMON.OK'), { duration: 2000 });
        this.selectedDoctorId = null;
        this.consultationFee = null;
        this.isPrimary = false;
        this.loadDoctors();
      },
      error: err => {
        this.saving.set(false);
        this.snack.open(err.error?.message || err.error?.title || this.translate.instant('ADMIN.CLINIC_DOCTORS.ASSIGN_FAILED'), this.translate.instant('COMMON.OK'), { duration: 3000 });
      }
    });
  }

  remove(item: ClinicDoctorDto) {
    const clinicId = this.clinicId();
    if (!clinicId) return;
    if (!confirm(this.translate.instant('ADMIN.CLINIC_DOCTORS.DELETE_CONFIRM', { name: item.doctorName }))) return;
    this.data.removeDoctorFromClinic(clinicId, item.doctorId).subscribe({
      next: () => {
        this.snack.open(this.translate.instant('ADMIN.CLINIC_DOCTORS.REMOVED'), this.translate.instant('COMMON.OK'), { duration: 2000 });
        this.loadDoctors();
      },
      error: err => this.snack.open(err.error?.message || err.error?.title || this.translate.instant('ADMIN.CLINIC_DOCTORS.REMOVE_FAILED'), this.translate.instant('COMMON.OK'), { duration: 3000 })
    });
  }

  initials(name: string) {
    return name.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();
  }
}
