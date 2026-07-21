import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DataService } from '../../core/services/data.service';
import { DoctorDto, SpecialtyDto } from '../../core/models';

@Component({
  selector: 'app-admin-doctors',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatButtonModule, TranslateModule, MatSnackBarModule],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ 'NAV.DOCTORS' | translate }}</h1>
        <p class="page-subtitle">{{ 'COMMON.MANAGE' | translate }} {{ 'NAV.DOCTORS' | translate }}</p>
      </div>
      <button (click)="openCreate()" class="btn-primary">
        <mat-icon>add</mat-icon> {{ 'COMMON.CREATE' | translate }}
      </button>
    </div>

    <!-- Loading -->
    <div *ngIf="loading()" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div class="card p-5" *ngFor="let i of [1,2,3]">
        <div class="flex items-center gap-3 mb-4">
          <div class="skeleton w-12 h-12 rounded-full"></div>
          <div class="flex-1">
            <div class="skeleton h-5 w-3/4 rounded mb-2"></div>
            <div class="skeleton h-4 w-1/2 rounded"></div>
          </div>
        </div>
        <div class="skeleton h-3 w-full rounded mb-2"></div>
        <div class="skeleton h-3 w-2/3 rounded"></div>
      </div>
    </div>

    <!-- Empty -->
    <div *ngIf="!loading() && items().length === 0" class="empty-state card p-12">
      <div class="w-16 h-16 rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400 flex items-center justify-center mb-4">
        <mat-icon class="text-3xl">person_search</mat-icon>
      </div>
      <p class="text-lg font-medium text-slate-900 dark:text-white mb-1">{{ 'COMMON.NO_DATA' | translate }}</p>
      <p class="text-sm text-slate-500 dark:text-slate-400">{{ 'COMMON.CREATE_FIRST' | translate }} {{ 'NAV.DOCTORS' | translate }}</p>
    </div>

    <!-- Doctor Cards Grid -->
    <div *ngIf="!loading() && items().length > 0" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div *ngFor="let d of items()" class="card card-hover group p-0 overflow-hidden">
        <div class="relative h-2 bg-gradient-to-r from-primary-500 to-violet-400"></div>
        <div class="p-5">
          <div class="flex items-start gap-3.5 mb-4">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 text-white flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0">
              {{ initials(d.fullName) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-slate-900 dark:text-white truncate leading-tight">{{ d.fullName }}</div>
              <div class="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{{ d.email }}</div>
            </div>
          </div>

          <div class="mb-4">
            <span class="badge badge-info">
              <mat-icon class="text-[14px]">medical_services</mat-icon>
              {{ d.specialtyName }}
            </span>
          </div>

          <div class="flex items-center gap-3 text-sm mb-4">
            <div class="flex items-center gap-1.5 text-amber-500">
              <mat-icon class="text-[18px]">star</mat-icon>
              <span class="font-semibold text-slate-700 dark:text-slate-300">{{ d.rating ? d.rating.toFixed(1) : '—' }}</span>
              <span class="text-slate-400 dark:text-slate-500">({{ d.totalReviews }})</span>
            </div>
          </div>

          <div class="divider"></div>

          <div class="flex items-center justify-between pt-1">
            <span class="badge" [class.badge-success]="d.isActive" [class.badge-muted]="!d.isActive">
              {{ d.isActive ? ('COMMON.ACTIVE' | translate) : ('COMMON.INACTIVE' | translate) }}
            </span>
            <div class="flex items-center gap-1">
              <button (click)="openEdit(d)" class="btn-ghost btn-sm">
                <mat-icon>edit</mat-icon>
              </button>
              <button (click)="remove(d)" class="btn-ghost btn-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div *ngIf="editing()" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" (click)="$event.target === $event.currentTarget && editing.set(false)">
      <div class="card w-full max-w-2xl my-8 animate-in">
        <div class="flex items-center justify-between p-6 pb-0">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
            {{ editingItem()?.id ? ('COMMON.EDIT' | translate) : ('COMMON.CREATE' | translate) }} {{ 'NAV.DOCTORS' | translate }}
          </h2>
          <button (click)="editing.set(false)" class="btn-ghost btn-sm rounded-full">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        <form [formGroup]="form" (ngSubmit)="save()" class="p-6 pt-4">
          <div class="grid sm:grid-cols-2 gap-4">
            <ng-container *ngIf="!editingItem()">
              <div>
                <label class="label">{{ 'AUTH.FIRST_NAME' | translate }} <span class="text-red-500">*</span></label>
                <input formControlName="firstName" class="input" [class.input-error]="fieldError('firstName')">
                <small class="text-red-500 dark:text-red-400 text-xs mt-1 block" *ngIf="fieldError('firstName')">{{ fieldError('firstName') }}</small>
              </div>
              <div>
                <label class="label">{{ 'AUTH.LAST_NAME' | translate }} <span class="text-red-500">*</span></label>
                <input formControlName="lastName" class="input" [class.input-error]="fieldError('lastName')">
                <small class="text-red-500 dark:text-red-400 text-xs mt-1 block" *ngIf="fieldError('lastName')">{{ fieldError('lastName') }}</small>
              </div>
              <div>
                <label class="label">{{ 'AUTH.EMAIL' | translate }} <span class="text-red-500">*</span></label>
                <input type="email" formControlName="email" class="input" [class.input-error]="fieldError('email')">
                <small class="text-red-500 dark:text-red-400 text-xs mt-1 block" *ngIf="fieldError('email')">{{ fieldError('email') }}</small>
              </div>
              <div>
                <label class="label">{{ 'AUTH.PASSWORD' | translate }} <span class="text-red-500">*</span></label>
                <input type="password" formControlName="password" class="input" [class.input-error]="fieldError('password')">
                <small class="text-red-500 dark:text-red-400 text-xs mt-1 block" *ngIf="fieldError('password')">{{ fieldError('password') }}</small>
              </div>
            </ng-container>

            <div>
              <label class="label">{{ 'NAV.SPECIALTIES' | translate }} <span class="text-red-500">*</span></label>
              <select formControlName="specialtyId" class="input">
                <option *ngFor="let s of specialties()" [ngValue]="s.id">{{ s.name }}</option>
              </select>
            </div>
            <div>
              <label class="label">{{ 'ADMIN.DOCTORS.LICENSE' | translate }} <span class="text-red-500">*</span></label>
              <input formControlName="licenseNumber" class="input" [class.input-error]="fieldError('licenseNumber')">
              <small class="text-red-500 dark:text-red-400 text-xs mt-1 block" *ngIf="fieldError('licenseNumber')">{{ fieldError('licenseNumber') }}</small>
            </div>
            <div>
              <label class="label">{{ 'ADMIN.DOCTORS.EXPERIENCE' | translate }} <span class="text-red-500">*</span></label>
              <input type="number" formControlName="yearsOfExperience" class="input" [class.input-error]="fieldError('yearsOfExperience')">
              <small class="text-red-500 dark:text-red-400 text-xs mt-1 block" *ngIf="fieldError('yearsOfExperience')">{{ fieldError('yearsOfExperience') }}</small>
            </div>
            <div>
              <label class="label">{{ 'ADMIN.DOCTORS.FEE' | translate }} ({{ 'COMMON.CURRENCY' | translate }}) <span class="text-red-500">*</span></label>
              <input type="number" formControlName="defaultConsultationFee" class="input" [class.input-error]="fieldError('defaultConsultationFee')">
              <small class="text-red-500 dark:text-red-400 text-xs mt-1 block" *ngIf="fieldError('defaultConsultationFee')">{{ fieldError('defaultConsultationFee') }}</small>
            </div>
            <div>
              <label class="label">{{ 'ADMIN.DOCTORS.SLOT' | translate }} <span class="text-red-500">*</span></label>
              <input type="number" formControlName="defaultAppointmentDurationMinutes" class="input" [class.input-error]="fieldError('defaultAppointmentDurationMinutes')">
              <small class="text-red-500 dark:text-red-400 text-xs mt-1 block" *ngIf="fieldError('defaultAppointmentDurationMinutes')">{{ fieldError('defaultAppointmentDurationMinutes') }}</small>
            </div>
            <div class="sm:col-span-2">
              <label class="label">{{ 'ADMIN.DOCTORS.BIOGRAPHY' | translate }}</label>
              <textarea formControlName="biography" rows="3" class="input resize-none"></textarea>
            </div>

            <div class="sm:col-span-2">
              <label class="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                <input type="checkbox" formControlName="isActive" class="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500">
                {{ 'COMMON.ACTIVE' | translate }}
              </label>
            </div>

            <div class="sm:col-span-2 flex justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
              <button type="button" (click)="editing.set(false)" class="btn-secondary">{{ 'COMMON.CANCEL' | translate }}</button>
              <button type="submit" [disabled]="form.invalid || saving()" class="btn-primary">
                <mat-icon *ngIf="saving()" class="animate-spin">refresh</mat-icon>
                {{ 'COMMON.SAVE' | translate }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `
})
export class AdminDoctorsComponent implements OnInit {
  private data = inject(DataService);
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);
  private translate = inject(TranslateService);

  loading = signal(true);
  items = signal<DoctorDto[]>([]);
  specialties = signal<SpecialtyDto[]>([]);
  editing = signal(false);
  editingItem = signal<DoctorDto | null>(null);
  saving = signal(false);

  form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(8)]],
    specialtyId: [1, Validators.required],
    licenseNumber: ['', [Validators.required, Validators.minLength(2)]],
    yearsOfExperience: [0, [Validators.min(0), Validators.max(70)]],
    defaultConsultationFee: [0, [Validators.min(0)]],
    defaultAppointmentDurationMinutes: [30, [Validators.min(5), Validators.max(240)]],
    biography: [''],
    isActive: [true]
  }, { updateOn: 'change' });

  ngOnInit() {
    this.load();
    this.data.listSpecialties(1, 100).subscribe(r => this.specialties.set(r.items || []));
  }

  load() {
    this.loading.set(true);
    this.data.listDoctors(1, 100).subscribe({
      next: r => { this.items.set(r.items || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openCreate() {
    this.editingItem.set(null);
    this.form.controls.firstName.enable({ emitEvent: false });
    this.form.controls.lastName.enable({ emitEvent: false });
    this.form.controls.email.enable({ emitEvent: false });
    this.form.controls.password.enable({ emitEvent: false });
    this.form.reset({
      firstName: '', lastName: '', email: '', password: '',
      specialtyId: this.specialties()[0]?.id || 1, licenseNumber: '',
      yearsOfExperience: 0, defaultConsultationFee: 0, defaultAppointmentDurationMinutes: 30,
      biography: '', isActive: true
    });
    this.editing.set(true);
  }

  openEdit(d: DoctorDto) {
    this.editingItem.set(d);
    this.form.controls.firstName.disable({ emitEvent: false });
    this.form.controls.lastName.disable({ emitEvent: false });
    this.form.controls.email.disable({ emitEvent: false });
    this.form.controls.password.disable({ emitEvent: false });
    this.form.reset({
      specialtyId: d.specialtyId, licenseNumber: d.licenseNumber,
      yearsOfExperience: d.yearsOfExperience,
      defaultConsultationFee: d.defaultConsultationFee ?? 0,
      defaultAppointmentDurationMinutes: d.defaultAppointmentDurationMinutes ?? 30,
      biography: d.biography ?? '', isActive: d.isActive,
      firstName: '', lastName: '', email: '', password: ''
    });
    this.editing.set(true);
  }

  save() {
    this.markCreatePasswordRequired();
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const item = this.editingItem();
    const obs = item
      ? this.data.updateDoctor(item.id, this.form.getRawValue())
      : this.data.createDoctor(this.form.getRawValue());
    obs.subscribe({
      next: () => { this.saving.set(false); this.snack.open(this.translate.instant('COMMON.SAVED'), this.translate.instant('COMMON.OK'), { duration: 2000 }); this.editing.set(false); this.load(); },
      error: err => { this.saving.set(false); this.snack.open(err.error?.message || err.error?.title || this.translate.instant('COMMON.SAVE_FAILED'), this.translate.instant('COMMON.OK'), { duration: 3000 }); }
    });
  }

  private markCreatePasswordRequired() {
    const item = this.editingItem();
    const pwdCtrl = this.form.controls.password;
    if (!item) {
      pwdCtrl.setValidators([Validators.required, Validators.minLength(8)]);
    } else {
      pwdCtrl.setValidators([Validators.minLength(8)]);
    }
    pwdCtrl.updateValueAndValidity({ emitEvent: false });
  }

  fieldError(name: string): string | null {
    const c = this.form.get(name);
    if (!c || !(c.dirty || c.touched) || c.valid) return null;
    if (c.errors?.['required']) return this.translate.instant('COMMON.FIELD_REQUIRED');
    if (c.errors?.['email']) return this.translate.instant('COMMON.INVALID_EMAIL');
    if (c.errors?.['minlength']) return this.translate.instant('COMMON.MIN_LENGTH', { min: c.errors['minlength'].requiredLength });
    if (c.errors?.['min']) return this.translate.instant('COMMON.MIN', { min: c.errors['min'].min });
    if (c.errors?.['max']) return this.translate.instant('COMMON.MAX', { max: c.errors['max'].max });
    return this.translate.instant('COMMON.INVALID_VALUE');
  }

  remove(d: DoctorDto) {
    if (!confirm(this.translate.instant('ADMIN.DELETE_CONFIRM', { name: d.fullName }))) return;
    this.data.deleteDoctor(d.id).subscribe(() => { this.snack.open(this.translate.instant('COMMON.DELETED'), this.translate.instant('COMMON.OK'), { duration: 2000 }); this.load(); });
  }

  initials(n: string) { return n.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase(); }
}
