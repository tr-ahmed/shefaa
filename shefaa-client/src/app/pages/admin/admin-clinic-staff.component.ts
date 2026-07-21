import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { ClinicDto, ClinicStaffDto, CreateClinicStaffRequest, StaffRole } from '../../core/models';

@Component({
  selector: 'app-admin-clinic-staff',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatButtonModule, TranslateModule],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ 'ADMIN.CLINIC_STAFF.TITLE' | translate }}</h1>
        <p class="page-subtitle">{{ 'ADMIN.CLINIC_STAFF.SUBTITLE' | translate }}</p>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-6">
      <!-- Left: Clinic selector + create form -->
      <div class="lg:col-span-1">
        <div class="card p-0 overflow-hidden">
          <div class="relative h-1.5 bg-gradient-to-r from-violet-500 to-purple-400"></div>
          <div class="p-5">
            <div class="flex items-center gap-2.5 mb-4">
              <div class="w-9 h-9 rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300 flex items-center justify-center">
                <mat-icon class="text-xl">local_hospital</mat-icon>
              </div>
              <span class="font-semibold text-slate-900 dark:text-white">{{ 'ADMIN.CLINIC_STAFF.SELECT_CLINIC' | translate }}</span>
            </div>
            <label class="label">{{ 'ADMIN.CLINIC_STAFF.CLINIC_LABEL' | translate }}</label>
            <select class="input" [ngModel]="clinicId()" (ngModelChange)="onClinicChange($event)" name="clinicId">
              <option [ngValue]="null">{{ '-- Select --' }}</option>
              <option *ngFor="let c of clinics()" [ngValue]="c.id">{{ c.name }}{{ c.city ? ' - ' + c.city : '' }}</option>
            </select>
          </div>

          <div class="divider my-0"></div>

          <div class="p-5">
            <h2 class="font-semibold text-slate-900 dark:text-white mb-4">{{ 'ADMIN.CLINIC_STAFF.CREATE_TITLE' | translate }}</h2>
            <form [formGroup]="form" (ngSubmit)="save()" class="flex flex-col gap-4">
              <div>
                <label class="label">{{ 'ADMIN.CLINIC_STAFF.FIRST_NAME' | translate }} <span class="text-red-500">*</span></label>
                <input class="input" formControlName="firstName" [class.input-error]="fieldError('firstName')">
                <small class="text-red-500 dark:text-red-400 text-xs mt-1 block" *ngIf="fieldError('firstName')">{{ fieldError('firstName') }}</small>
              </div>
              <div>
                <label class="label">{{ 'ADMIN.CLINIC_STAFF.LAST_NAME' | translate }} <span class="text-red-500">*</span></label>
                <input class="input" formControlName="lastName" [class.input-error]="fieldError('lastName')">
                <small class="text-red-500 dark:text-red-400 text-xs mt-1 block" *ngIf="fieldError('lastName')">{{ fieldError('lastName') }}</small>
              </div>
              <div>
                <label class="label">{{ 'ADMIN.CLINIC_STAFF.EMAIL' | translate }} <span class="text-red-500">*</span></label>
                <input class="input" formControlName="email" type="email" [class.input-error]="fieldError('email')">
                <small class="text-red-500 dark:text-red-400 text-xs mt-1 block" *ngIf="fieldError('email')">{{ fieldError('email') }}</small>
              </div>
              <div>
                <label class="label">{{ 'ADMIN.CLINIC_STAFF.PASSWORD' | translate }} <span class="text-red-500">*</span></label>
                <input class="input" formControlName="password" type="password" [class.input-error]="fieldError('password')">
                <small class="text-red-500 dark:text-red-400 text-xs mt-1 block" *ngIf="fieldError('password')">{{ fieldError('password') }}</small>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">{{ 'ADMIN.CLINIC_STAFF.GENDER' | translate }} <span class="text-red-500">*</span></label>
                  <select class="input" formControlName="gender">
                    <option [ngValue]="1">{{ 'ADMIN.CLINIC_STAFF.GENDER_MALE' | translate }}</option>
                    <option [ngValue]="2">{{ 'ADMIN.CLINIC_STAFF.GENDER_FEMALE' | translate }}</option>
                    <option [ngValue]="3">{{ 'ADMIN.CLINIC_STAFF.GENDER_OTHER' | translate }}</option>
                  </select>
                </div>
                <div>
                  <label class="label">{{ 'ADMIN.CLINIC_STAFF.ROLE' | translate }} <span class="text-red-500">*</span></label>
                  <select class="input" formControlName="role">
                    <option [ngValue]="1">{{ 'ROLES.Receptionist' | translate }}</option>
                    <option [ngValue]="2">{{ 'ROLES.Nurse' | translate }}</option>
                    <option [ngValue]="3">{{ 'ROLES.Manager' | translate }}</option>
                    <option [ngValue]="4">{{ 'ROLES.Accountant' | translate }}</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="label">{{ 'ADMIN.CLINIC_STAFF.POSITION' | translate }} <span class="text-red-500">*</span></label>
                <input class="input" formControlName="position" [placeholder]="'ADMIN.CLINIC_STAFF.POSITION_PLACEHOLDER' | translate" [class.input-error]="fieldError('position')">
                <small class="text-red-500 dark:text-red-400 text-xs mt-1 block" *ngIf="fieldError('position')">{{ fieldError('position') }}</small>
              </div>
              <div>
                <label class="label">{{ 'ADMIN.CLINIC_STAFF.PHONE' | translate }}</label>
                <input class="input" formControlName="phoneNumber" [class.input-error]="fieldError('phoneNumber')">
                <small class="text-red-500 dark:text-red-400 text-xs mt-1 block" *ngIf="fieldError('phoneNumber')">{{ fieldError('phoneNumber') }}</small>
              </div>
              <label class="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                <input type="checkbox" formControlName="isActive" class="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500">
                {{ 'COMMON.ACTIVE' | translate }}
              </label>
              <button type="submit" class="btn-primary w-full" [disabled]="saving() || form.invalid || !clinicId()">
                <mat-icon *ngIf="saving()" class="animate-spin">refresh</mat-icon>
                <mat-icon *ngIf="!saving()">person_add</mat-icon>
                {{ 'COMMON.SAVE' | translate }}
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Right: Staff list -->
      <div class="lg:col-span-2">
        <div class="card p-0 overflow-hidden">
          <div class="p-5 border-b border-slate-200 dark:border-slate-700">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="font-semibold text-slate-900 dark:text-white">{{ 'ADMIN.CLINIC_STAFF.MEMBERS_TITLE' | translate }}</h2>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5" *ngIf="clinicName()">{{ clinicName() }}</p>
              </div>
              <button type="button" class="btn-secondary btn-sm" (click)="loadStaff()">
                <mat-icon>refresh</mat-icon>
                {{ 'COMMON.REFRESH' | translate }}
              </button>
            </div>
          </div>

          <div class="p-5">
            <div *ngIf="loadingStaff()" class="flex flex-col gap-3">
              <div class="flex items-center gap-3 p-4" *ngFor="let i of [1,2,3]">
                <div class="flex-1">
                  <div class="skeleton h-5 w-1/3 rounded mb-2"></div>
                  <div class="skeleton h-4 w-1/4 rounded mb-2"></div>
                  <div class="skeleton h-3 w-1/5 rounded"></div>
                </div>
              </div>
            </div>

            <div *ngIf="!loadingStaff() && staff().length === 0" class="empty-state py-10">
              <mat-icon class="text-4xl text-slate-300 dark:text-slate-600 mb-2">groups</mat-icon>
              <p class="text-slate-500 dark:text-slate-400">{{ 'ADMIN.CLINIC_STAFF.NO_DATA' | translate }}</p>
            </div>

            <div *ngIf="!loadingStaff() && staff().length > 0" class="flex flex-col gap-3">
              <div *ngFor="let s of staff()" class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-1">
                    <div class="font-semibold text-slate-900 dark:text-white">{{ s.fullName }}</div>
                    <span class="badge" [ngClass]="{
                      'badge-info': s.role === 1,
                      'badge-success': s.role === 2,
                      'badge-warning': s.role === 3,
                      'badge-muted': s.role === 4
                    }">
                      {{ roleLabel(s.role) | translate }}
                    </span>
                  </div>
                  <div class="text-sm text-slate-500 dark:text-slate-400">{{ s.email }}</div>
                  <div class="text-xs text-slate-400 dark:text-slate-500 mt-1.5">{{ s.position }}</div>
                </div>
                <div class="flex items-center gap-3 sm:flex-shrink-0 pl-[52px] sm:pl-0">
                  <span class="badge" [class.badge-success]="s.isActive" [class.badge-muted]="!s.isActive">
                    {{ s.isActive ? ('COMMON.ACTIVE' | translate) : ('COMMON.INACTIVE' | translate) }}
                  </span>
                  <button class="btn-ghost btn-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" (click)="remove(s)">
                    <mat-icon>delete</mat-icon>
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
export class AdminClinicStaffComponent implements OnInit {
  private data = inject(DataService);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);
  private translate = inject(TranslateService);

  clinics = signal<ClinicDto[]>([]);
  staff = signal<ClinicStaffDto[]>([]);
  clinicId = signal<number | null>(null);
  clinicName = signal('');
  loadingStaff = signal(false);
  saving = signal(false);
  isClinicAdmin = false;

  form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    phoneNumber: ['', [Validators.pattern(/^[+\d\s()-]{6,20}$/)]],
    gender: [1, Validators.required],
    position: ['', [Validators.required, Validators.minLength(2)]],
    role: [1, Validators.required],
    isActive: [true]
  }, { updateOn: 'change' });

  ngOnInit() {
    this.isClinicAdmin = this.auth.hasRole('ClinicAdmin');
    if (this.isClinicAdmin) {
      this.data.getMyClinics().subscribe({
        next: clinics => {
          this.clinics.set(clinics || []);
          if (clinics && clinics.length > 0) {
            this.onClinicChange(clinics[0].id);
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
  }

  onClinicChange(id: number | null) {
    this.clinicId.set(id);
    const clinic = this.clinics().find(c => c.id === id) ?? null;
    this.clinicName.set(clinic?.name ?? '');
    if (id != null) {
      this.loadStaff();
    } else {
      this.staff.set([]);
    }
  }

  loadStaff() {
    const id = this.clinicId();
    if (!id) return;
    this.loadingStaff.set(true);
    this.data.getClinicStaff(id).subscribe({
      next: list => { this.staff.set(list || []); this.loadingStaff.set(false); },
      error: () => { this.loadingStaff.set(false); this.snack.open(this.translate.instant('ADMIN.CLINIC_STAFF.FAILED_LOAD'), this.translate.instant('COMMON.OK'), { duration: 2500 }); }
    });
  }

  save() {
    const clinicId = this.clinicId();
    if (!clinicId) {
      this.snack.open(this.translate.instant('ADMIN.CLINIC_STAFF.SELECT_CLINIC_FIRST'), this.translate.instant('COMMON.OK'), { duration: 2500 });
      return;
    }
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.saving.set(true);
    const raw = this.form.getRawValue();
    const payload: CreateClinicStaffRequest = {
      ...raw,
      role: raw.role as StaffRole,
      isActive: raw.isActive
    };
    this.data.createClinicStaff(clinicId, payload).subscribe({
      next: res => {
        this.saving.set(false);
        if (!res.success) {
          this.snack.open(res.message || this.translate.instant('ADMIN.CLINIC_STAFF.SAVE_FAILED'), this.translate.instant('COMMON.OK'), { duration: 3000 });
          return;
        }
        this.snack.open(this.translate.instant('ADMIN.CLINIC_STAFF.STAFF_CREATED'), this.translate.instant('COMMON.OK'), { duration: 2000 });
        this.form.reset({ firstName: '', lastName: '', email: '', password: '', phoneNumber: '', gender: 1, position: '', role: 1, isActive: true });
        this.loadStaff();
      },
      error: err => {
        this.saving.set(false);
        this.snack.open(err.error?.message || err.error?.title || this.translate.instant('ADMIN.CLINIC_STAFF.SAVE_FAILED'), this.translate.instant('COMMON.OK'), { duration: 3000 });
      }
    });
  }

  remove(item: ClinicStaffDto) {
    const clinicId = this.clinicId();
    if (!clinicId) return;
    if (!confirm(this.translate.instant('ADMIN.CLINIC_STAFF.DELETE_CONFIRM', { name: item.fullName }))) return;
    this.data.deleteClinicStaff(clinicId, item.id).subscribe({
      next: () => { this.snack.open(this.translate.instant('ADMIN.CLINIC_STAFF.DELETED'), this.translate.instant('COMMON.OK'), { duration: 2000 }); this.loadStaff(); },
      error: err => this.snack.open(err.error?.message || err.error?.title || this.translate.instant('ADMIN.CLINIC_STAFF.DELETE_FAILED'), this.translate.instant('COMMON.OK'), { duration: 3000 })
    });
  }

  roleLabel(role: number) {
    switch (role) {
      case 1: return 'Receptionist';
      case 2: return 'Nurse';
      case 3: return 'Manager';
      case 4: return 'Accountant';
      default: return 'Other';
    }
  }

  fieldError(name: string): string | null {
    const control = this.form.get(name);
    if (!control || !(control.dirty || control.touched) || control.valid) return null;
    if (control.errors?.['required']) return this.translate.instant('COMMON.FIELD_REQUIRED');
    if (control.errors?.['email']) return this.translate.instant('COMMON.INVALID_EMAIL');
    if (control.errors?.['minlength']) return this.translate.instant('COMMON.MIN_LENGTH', { min: control.errors['minlength'].requiredLength });
    if (control.errors?.['pattern']) return this.translate.instant('COMMON.INVALID_FORMAT');
    return this.translate.instant('COMMON.INVALID_VALUE');
  }
}
