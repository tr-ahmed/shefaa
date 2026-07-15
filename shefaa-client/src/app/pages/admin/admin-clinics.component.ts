import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { ClinicDto, SpecialtyDto } from '../../core/models';

@Component({
  selector: 'app-admin-clinics',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatButtonModule, TranslateModule, MatSnackBarModule],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ 'NAV.CLINICS' | translate }}</h1>
        <p class="page-subtitle">{{ 'COMMON.MANAGE' | translate }} {{ 'NAV.CLINICS' | translate }}</p>
      </div>
      <button *ngIf="!isClinicAdmin" (click)="openCreate()" class="btn-primary">
        <mat-icon>add</mat-icon> {{ 'COMMON.CREATE' | translate }}
      </button>
    </div>

    <!-- Loading -->
    <div *ngIf="loading()" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div class="card p-5" *ngFor="let i of [1,2,3]">
        <div class="skeleton h-10 w-10 rounded-xl mb-3"></div>
        <div class="skeleton h-5 w-3/4 rounded mb-2"></div>
        <div class="skeleton h-4 w-1/2 rounded mb-4"></div>
        <div class="skeleton h-3 w-full rounded mb-2"></div>
        <div class="skeleton h-3 w-2/3 rounded"></div>
      </div>
    </div>

    <!-- Empty -->
    <div *ngIf="!loading() && items().length === 0" class="empty-state card p-12">
      <div class="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 flex items-center justify-center mb-4">
        <mat-icon class="text-3xl">local_hospital</mat-icon>
      </div>
      <p class="text-lg font-medium text-slate-900 dark:text-white mb-1">{{ 'COMMON.NO_DATA' | translate }}</p>
      <p class="text-sm text-slate-500 dark:text-slate-400">{{ 'COMMON.CREATE_FIRST' | translate }} {{ 'NAV.CLINICS' | translate }}</p>
    </div>

    <!-- Clinic Cards Grid -->
    <div *ngIf="!loading() && items().length > 0" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div *ngFor="let c of items()" class="card card-hover group p-0 overflow-hidden">
        <div class="relative h-2 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
        <div class="p-5">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 flex items-center justify-center shadow-sm">
                <mat-icon>local_hospital</mat-icon>
              </div>
              <div>
                <div class="font-semibold text-slate-900 dark:text-white leading-tight">{{ c.name }}</div>
                <div *ngIf="c.nameAr" class="text-xs text-slate-400 dark:text-slate-500 mt-0.5" dir="rtl">{{ c.nameAr }}</div>
              </div>
            </div>
          </div>

          <div *ngIf="c.specialtyName || c.specialtyNameAr" class="mb-3">
            <span class="badge badge-info">
              {{ isAr() ? (c.specialtyNameAr || c.specialtyName) : (c.specialtyName || c.specialtyNameAr) }}
            </span>
          </div>

          <p *ngIf="c.address" class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">{{ c.address }}</p>

          <div class="divider"></div>

          <div class="flex items-center justify-between pt-1">
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <mat-icon class="text-[18px]">medical_information</mat-icon>
                <span class="text-sm font-medium">{{ c.doctorsCount }}</span>
              </div>
              <span class="badge" [class.badge-success]="c.isActive" [class.badge-muted]="!c.isActive">
                {{ c.isActive ? ('COMMON.ACTIVE' | translate) : ('COMMON.INACTIVE' | translate) }}
              </span>
            </div>
            <div class="flex items-center gap-1">
              <button (click)="openEdit(c)" class="btn-ghost btn-sm">
                <mat-icon>edit</mat-icon>
              </button>
              <button (click)="remove(c)" class="btn-ghost btn-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
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
            {{ editingItem()?.id ? ('COMMON.EDIT' | translate) : ('COMMON.CREATE' | translate) }} {{ 'NAV.CLINICS' | translate }}
          </h2>
          <button (click)="editing.set(false)" class="btn-ghost btn-sm rounded-full">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        <form [formGroup]="form" (ngSubmit)="save()" class="p-6 pt-4">
          <div class="grid sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <div class="grid grid-cols-2 gap-3">
                <div [class.order-2]="isAr()" [class.order-1]="!isAr()">
                  <label class="label">{{ 'COMMON.NAME' | translate }} (EN) <span *ngIf="!isAr()" class="text-red-500">*</span></label>
                  <input formControlName="name" class="input" [class.input-error]="fieldError('name')">
                  <small class="text-red-500 dark:text-red-400 text-xs mt-1 block" *ngIf="fieldError('name')">{{ fieldError('name') }}</small>
                </div>
                <div [class.order-1]="isAr()" [class.order-2]="!isAr()">
                  <label class="label">{{ 'ADMIN.CLINICS.NAME_AR' | translate }} <span *ngIf="isAr()" class="text-red-500">*</span></label>
                  <input formControlName="nameAr" class="input" dir="rtl" [class.input-error]="fieldError('nameAr')">
                  <small class="text-red-500 dark:text-red-400 text-xs mt-1 block" *ngIf="fieldError('nameAr')">{{ fieldError('nameAr') }}</small>
                </div>
              </div>
            </div>

            <div class="sm:col-span-2">
              <label class="label">{{ 'ADMIN.CLINICS.SPECIALTY' | translate }}</label>
              <select formControlName="specialtyId" class="input">
                <option [ngValue]="null">— {{ 'COMMON.NONE' | translate }} —</option>
                <option *ngFor="let s of specialties()" [ngValue]="s.id">
                  {{ isAr() ? (s.nameAr || s.name) : s.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="label">{{ 'COMMON.PHONE' | translate }}</label>
              <input formControlName="phoneNumber" class="input" [class.input-error]="fieldError('phoneNumber')">
              <small class="text-red-500 dark:text-red-400 text-xs mt-1 block" *ngIf="fieldError('phoneNumber')">{{ fieldError('phoneNumber') }}</small>
            </div>
            <div>
              <label class="label">{{ 'COMMON.EMAIL' | translate }}</label>
              <input formControlName="email" class="input" [class.input-error]="fieldError('email')">
              <small class="text-red-500 dark:text-red-400 text-xs mt-1 block" *ngIf="fieldError('email')">{{ fieldError('email') }}</small>
            </div>
            <div>
              <label class="label">{{ 'COMMON.CITY' | translate }}</label>
              <input formControlName="city" class="input">
            </div>
            <div>
              <label class="label">{{ 'ADMIN.CLINICS.GOVERNORATE' | translate }}</label>
              <input formControlName="governorate" class="input">
            </div>
            <div class="sm:col-span-2">
              <label class="label">{{ 'COMMON.ADDRESS' | translate }}</label>
              <input formControlName="address" class="input" [class.input-error]="fieldError('address')">
              <small class="text-red-500 dark:text-red-400 text-xs mt-1 block" *ngIf="fieldError('address')">{{ fieldError('address') }}</small>
            </div>
            <div>
              <label class="label">{{ 'ADMIN.CLINICS.WEBSITE' | translate }}</label>
              <input formControlName="website" class="input" [class.input-error]="fieldError('website')">
              <small class="text-red-500 dark:text-red-400 text-xs mt-1 block" *ngIf="fieldError('website')">{{ fieldError('website') }}</small>
            </div>

            <div class="sm:col-span-2">
              <label class="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                <input type="checkbox" formControlName="isActive" class="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500">
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
export class AdminClinicsComponent implements OnInit {
  private data = inject(DataService);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);
  private translate = inject(TranslateService);

  loading = signal(true);
  items = signal<ClinicDto[]>([]);
  specialties = signal<SpecialtyDto[]>([]);
  editing = signal(false);
  editingItem = signal<ClinicDto | null>(null);
  saving = signal(false);
  isAr = signal(false);
  isClinicAdmin = false;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    nameAr: [''],
    address: [''],
    city: [''],
    governorate: [''],
    phoneNumber: ['', [Validators.pattern(/^[+\d\s()-]{6,20}$/)]],
    email: ['', [Validators.email]],
    website: ['', [Validators.pattern(/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}.*$/i)]],
    isActive: [true],
    specialtyId: [null as number | null]
  }, { updateOn: 'change' });

  ngOnInit() {
    this.isClinicAdmin = this.auth.hasRole('ClinicAdmin');
    this.isAr.set(this.translate.currentLang === 'ar');
    this.updateValidators(this.isAr());
    this.translate.onLangChange.subscribe(event => {
      this.isAr.set(event.lang === 'ar');
      this.updateValidators(event.lang === 'ar');
    });
    this.load();
    this.loadSpecialties();
  }

  updateValidators(isArabic: boolean) {
    const nameCtrl = this.form.controls['name'];
    const nameArCtrl = this.form.controls['nameAr'];
    if (isArabic) {
      nameArCtrl.setValidators([Validators.required, Validators.minLength(2)]);
      nameCtrl.setValidators([Validators.minLength(2)]);
    } else {
      nameCtrl.setValidators([Validators.required, Validators.minLength(2)]);
      nameArCtrl.setValidators([]);
    }
    nameCtrl.updateValueAndValidity({ emitEvent: false });
    nameArCtrl.updateValueAndValidity({ emitEvent: false });
  }

  load() {
    this.loading.set(true);
    if (this.auth.hasRole('ClinicAdmin')) {
      this.data.getMyClinic().subscribe({
        next: clinic => {
          this.items.set(clinic ? [clinic] : []);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    } else {
      this.data.listClinics(1, 100, undefined, undefined, false).subscribe({
        next: r => { this.items.set(r.items || []); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
    }
  }

  loadSpecialties() {
    this.data.listSpecialties(1, 200, undefined, true).subscribe({
      next: r => this.specialties.set(r.items || [])
    });
  }

  openCreate() {
    this.editingItem.set(null);
    this.form.reset({ name: '', nameAr: '', address: '', city: '', governorate: '', phoneNumber: '', email: '', website: '', isActive: true, specialtyId: null });
    this.updateValidators(this.isAr());
    this.editing.set(true);
  }

  openEdit(c: ClinicDto) {
    this.editingItem.set(c);
    this.form.reset({
      name: c.name, nameAr: c.nameAr || '', address: c.address || '', city: c.city || '', governorate: c.governorate || '',
      phoneNumber: c.phoneNumber || '', email: c.email || '', website: c.website || '', isActive: c.isActive,
      specialtyId: c.specialtyId ?? null
    });
    this.updateValidators(this.isAr());
    this.editing.set(true);
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const item = this.editingItem();
    const payload = { ...this.form.getRawValue() };
    if (!payload.name && payload.nameAr) payload.name = payload.nameAr;
    if (!payload.nameAr && payload.name) payload.nameAr = payload.name;

    const obs = item
      ? this.data.updateClinic(item.id, payload)
      : this.data.createClinic(payload);
    obs.subscribe({
      next: () => { this.saving.set(false); this.snack.open(this.translate.instant('COMMON.SAVED'), this.translate.instant('COMMON.OK'), { duration: 2000 }); this.editing.set(false); this.load(); },
      error: err => { this.saving.set(false); this.snack.open(err.error?.message || err.error?.title || this.translate.instant('COMMON.SAVE_FAILED'), this.translate.instant('COMMON.OK'), { duration: 3000 }); }
    });
  }

  fieldError(name: string): string | null {
    const c = this.form.get(name);
    if (!c || !(c.dirty || c.touched) || c.valid) return null;
    if (c.errors?.['required']) return this.translate.instant('COMMON.FIELD_REQUIRED');
    if (c.errors?.['email']) return this.translate.instant('COMMON.INVALID_EMAIL');
    if (c.errors?.['minlength']) return this.translate.instant('COMMON.MIN_LENGTH', { min: c.errors['minlength'].requiredLength });
    if (c.errors?.['pattern']) return this.translate.instant('COMMON.INVALID_FORMAT');
    return this.translate.instant('COMMON.INVALID_VALUE');
  }

  remove(c: ClinicDto) {
    if (!confirm(this.translate.instant('ADMIN.CLINIC_STAFF.DELETE_CONFIRM', { name: c.name }))) return;
    this.data.deleteClinic(c.id).subscribe(() => { this.snack.open(this.translate.instant('COMMON.DELETED'), this.translate.instant('COMMON.OK'), { duration: 2000 }); this.load(); });
  }
}
