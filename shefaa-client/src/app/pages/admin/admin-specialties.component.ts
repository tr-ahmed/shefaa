import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DataService } from '../../core/services/data.service';
import { SpecialtyDto } from '../../core/models';

@Component({
  selector: 'app-admin-specialties',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatButtonModule, TranslateModule],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ 'NAV.SPECIALTIES' | translate }}</h1>
        <p class="page-subtitle">{{ 'COMMON.MANAGE' | translate }} {{ 'NAV.SPECIALTIES' | translate }}</p>
      </div>
      <button (click)="openCreate()" class="btn-primary">
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
      <div class="w-16 h-16 rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400 flex items-center justify-center mb-4">
        <mat-icon class="text-3xl">category</mat-icon>
      </div>
      <p class="text-lg font-medium text-slate-900 dark:text-white mb-1">{{ 'COMMON.NO_DATA' | translate }}</p>
      <p class="text-sm text-slate-500 dark:text-slate-400">{{ 'COMMON.CREATE_FIRST' | translate }} {{ 'NAV.SPECIALTIES' | translate }}</p>
    </div>

    <!-- Specialty Cards Grid -->
    <div *ngIf="!loading() && items().length > 0" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div *ngFor="let s of items()" class="card card-hover group p-0 overflow-hidden">
        <div class="relative h-2 bg-gradient-to-r from-violet-500 to-purple-400"></div>
        <div class="p-5">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300 flex items-center justify-center shadow-sm">
                <mat-icon>category</mat-icon>
              </div>
              <div>
                <div class="font-semibold text-slate-900 dark:text-white leading-tight">{{ s.name }}</div>
                <div *ngIf="s.nameAr" class="text-xs text-slate-400 dark:text-slate-500 mt-0.5" dir="rtl">{{ s.nameAr }}</div>
              </div>
            </div>
          </div>

          <div class="mb-3">
            <span class="badge" [class.badge-success]="s.isActive" [class.badge-muted]="!s.isActive">
              {{ s.isActive ? ('COMMON.ACTIVE' | translate) : ('COMMON.INACTIVE' | translate) }}
            </span>
          </div>

          <p *ngIf="s.description" class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">{{ s.description }}</p>

          <div class="divider"></div>

          <div class="flex items-center justify-between pt-1">
            <div class="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <mat-icon class="text-[18px]">medical_information</mat-icon>
              <span class="text-sm font-medium">{{ s.doctorsCount }}</span>
            </div>
            <div class="flex items-center gap-1">
              <button (click)="openEdit(s)" class="btn-ghost btn-sm">
                <mat-icon>edit</mat-icon>
              </button>
              <button (click)="remove(s)" class="btn-ghost btn-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div *ngIf="editing()" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="$event.target === $event.currentTarget && editing.set(false)">
      <div class="card w-full max-w-md my-8 animate-in">
        <div class="flex items-center justify-between p-6 pb-0">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
            {{ editingItem()?.id ? ('COMMON.EDIT' | translate) : ('COMMON.CREATE' | translate) }} {{ 'NAV.SPECIALTIES' | translate }}
          </h2>
          <button (click)="editing.set(false)" class="btn-ghost btn-sm rounded-full">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        <form [formGroup]="form" (ngSubmit)="save()" class="p-6 pt-4">
          <div class="flex flex-col gap-4">
            <div [class.order-2]="isAr()" [class.order-1]="!isAr()">
              <label class="label">{{ 'ADMIN.SPECIALTIES.NAME_EN' | translate }} <span *ngIf="!isAr()" class="text-red-500">*</span></label>
              <input formControlName="name" class="input" [class.input-error]="fieldError('name')">
              <small class="text-red-500 dark:text-red-400 text-xs mt-1 block" *ngIf="fieldError('name')">{{ fieldError('name') }}</small>
            </div>
            <div [class.order-1]="isAr()" [class.order-2]="!isAr()">
              <label class="label">{{ 'ADMIN.SPECIALTIES.NAME_AR' | translate }} <span *ngIf="isAr()" class="text-red-500">*</span></label>
              <input formControlName="nameAr" class="input" dir="rtl" [class.input-error]="fieldError('nameAr')">
              <small class="text-red-500 dark:text-red-400 text-xs mt-1 block" *ngIf="fieldError('nameAr')">{{ fieldError('nameAr') }}</small>
            </div>
            <div>
              <label class="label">{{ 'ADMIN.SPECIALTIES.DESCRIPTION' | translate }}</label>
              <textarea formControlName="description" rows="3" class="input resize-none"></textarea>
            </div>
            <label class="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
              <input type="checkbox" formControlName="isActive" class="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500">
              {{ 'COMMON.ACTIVE' | translate }}
            </label>
            <div class="flex justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
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
export class AdminSpecialtiesComponent implements OnInit {
  private data = inject(DataService);
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);
  private translate = inject(TranslateService);

  loading = signal(true);
  items = signal<SpecialtyDto[]>([]);
  editing = signal(false);
  editingItem = signal<SpecialtyDto | null>(null);
  saving = signal(false);
  isAr = signal(false);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    nameAr: [''],
    description: [''],
    isActive: [true]
  }, { updateOn: 'change' });

  ngOnInit() {
    this.isAr.set(this.translate.currentLang === 'ar');
    this.updateValidators(this.isAr());
    this.translate.onLangChange.subscribe(event => {
      this.isAr.set(event.lang === 'ar');
      this.updateValidators(event.lang === 'ar');
    });
    this.load();
  }

  updateValidators(isArabic: boolean) {
    const nameCtrl = this.form.controls.name;
    const nameArCtrl = this.form.controls.nameAr;
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
    this.data.listSpecialties(1, 100).subscribe({
      next: r => { this.items.set(r.items || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openCreate() {
    this.editingItem.set(null);
    this.form.reset({ name: '', nameAr: '', description: '', isActive: true });
    this.updateValidators(this.isAr());
    this.editing.set(true);
  }

  openEdit(s: SpecialtyDto) {
    this.editingItem.set(s);
    this.form.reset({ name: s.name, nameAr: s.nameAr || '', description: s.description || '', isActive: s.isActive });
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
      ? this.data.updateSpecialty(item.id, payload)
      : this.data.createSpecialty(payload);
    obs.subscribe({
      next: () => { this.saving.set(false); this.snack.open(this.translate.instant('COMMON.SAVED'), this.translate.instant('COMMON.OK'), { duration: 2000 }); this.editing.set(false); this.load(); },
      error: err => { this.saving.set(false); this.snack.open(err.error?.message || err.error?.title || this.translate.instant('COMMON.SAVE_FAILED'), this.translate.instant('COMMON.OK'), { duration: 3000 }); }
    });
  }

  fieldError(name: string): string | null {
    const c = this.form.get(name);
    if (!c || !(c.dirty || c.touched) || c.valid) return null;
    if (c.errors?.['required']) return this.translate.instant('COMMON.FIELD_REQUIRED');
    if (c.errors?.['minlength']) return this.translate.instant('COMMON.MIN_LENGTH', { min: c.errors['minlength'].requiredLength });
    return this.translate.instant('COMMON.INVALID_VALUE');
  }

  remove(s: SpecialtyDto) {
    if (!confirm(this.translate.instant('ADMIN.CLINIC_STAFF.DELETE_CONFIRM', { name: s.name }))) return;
    this.data.deleteSpecialty(s.id).subscribe(() => { this.snack.open(this.translate.instant('COMMON.DELETED'), this.translate.instant('COMMON.OK'), { duration: 2000 }); this.load(); });
  }
}
