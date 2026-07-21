import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DataService } from '../../core/services/data.service';
import { SpecialtyDto } from '../../core/models';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-admin-specialties',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatButtonModule, TranslateModule, MatSnackBarModule],
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

    <!-- Search + Filters -->
    <div class="card p-4 mb-5">
      <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div class="relative flex-1 max-w-md w-full">
          <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</mat-icon>
          <input
            #searchInput
            (input)="onSearch(searchInput.value)"
            class="input pl-10"
            [placeholder]="'COMMON.SEARCH' | translate"
          >
          <button *ngIf="searchQuery()" (click)="clearSearch(searchInput)" class="absolute right-2 top-1/2 -translate-y-1/2 btn-ghost btn-xs rounded-full text-slate-400 hover:text-slate-600">
            <mat-icon class="text-[18px]">close</mat-icon>
          </button>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-slate-500 dark:text-slate-400">{{ 'COMMON.FILTER' | translate }}:</span>
          <button (click)="setFilter('all')" class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors" [class.bg-violet-100]="activeFilter() === 'all'" [class.text-violet-700]="activeFilter() === 'all'" [class.text-slate-500]="activeFilter() !== 'all'" [class.hover:bg-slate-100]="activeFilter() !== 'all'"> {{ 'COMMON.ALL' | translate }}</button>
          <button (click)="setFilter('active')" class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors" [class.bg-emerald-100]="activeFilter() === 'active'" [class.text-emerald-700]="activeFilter() === 'active'" [class.text-slate-500]="activeFilter() !== 'active'" [class.hover:bg-slate-100]="activeFilter() !== 'active'"> {{ 'COMMON.ACTIVE' | translate }}</button>
          <button (click)="setFilter('inactive')" class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors" [class.bg-red-100]="activeFilter() === 'inactive'" [class.text-red-700]="activeFilter() === 'inactive'" [class.text-slate-500]="activeFilter() !== 'inactive'" [class.hover:bg-slate-100]="activeFilter() !== 'inactive'"> {{ 'COMMON.INACTIVE' | translate }}</button>
        </div>
      </div>
      <div *ngIf="!loading()" class="mt-3 text-xs text-slate-400 dark:text-slate-500">
        {{ items().length }} {{ 'COMMON.OF' | translate }} {{ totalCount() }} {{ 'NAV.SPECIALTIES' | translate }}
      </div>
    </div>

    <!-- Loading -->
    <div *ngIf="loading()" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div class="card p-5" *ngFor="let i of [1,2,3,4,5,6]">
        <div class="skeleton h-10 w-10 rounded-xl mb-3"></div>
        <div class="skeleton h-5 w-3/4 rounded mb-2"></div>
        <div class="skeleton h-4 w-1/2 rounded mb-4"></div>
        <div class="skeleton h-3 w-full rounded mb-2"></div>
        <div class="skeleton h-3 w-2/3 rounded"></div>
      </div>
    </div>

    <!-- Empty -->
    <div *ngIf="!loading() && filteredItems().length === 0" class="empty-state card p-12">
      <div class="w-16 h-16 rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400 flex items-center justify-center mb-4">
        <mat-icon class="text-3xl">category</mat-icon>
      </div>
      <p class="text-lg font-medium text-slate-900 dark:text-white mb-1">{{ 'COMMON.NO_DATA' | translate }}</p>
      <p class="text-sm text-slate-500 dark:text-slate-400">{{ 'COMMON.CREATE_FIRST' | translate }} {{ 'NAV.SPECIALTIES' | translate }}</p>
    </div>

    <!-- Specialty Cards Grid -->
    <div *ngIf="!loading() && filteredItems().length > 0" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div *ngFor="let s of filteredItems()" class="card card-hover group p-0 overflow-hidden">
        <div class="relative h-2 bg-gradient-to-r from-violet-500 to-purple-400"></div>
        <div class="p-5">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-11 h-11 rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300 flex items-center justify-center shadow-sm shrink-0">
                <mat-icon>category</mat-icon>
              </div>
              <div class="min-w-0">
                <div class="font-semibold text-slate-900 dark:text-white leading-tight truncate">{{ s.name }}</div>
                <div *ngIf="s.nameAr" class="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate" dir="rtl">{{ s.nameAr }}</div>
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
              <button (click)="toggleActive(s)" class="btn-ghost btn-sm" [class.text-amber-500]="s.isActive" [class.text-green-500]="!s.isActive" [title]="(s.isActive ? 'ADMIN.DEACTIVATE' : 'ADMIN.ACTIVATE') | translate">
                <mat-icon>{{ s.isActive ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
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

    <!-- Pagination -->
    <div *ngIf="totalPages() > 1" class="flex items-center justify-center gap-2 mt-6">
      <button (click)="goPage(currentPage() - 1)" [disabled]="currentPage() <= 1" class="btn-ghost btn-sm">
        <mat-icon>chevron_right</mat-icon>
      </button>
      <span class="text-sm text-slate-500 dark:text-slate-400">{{ 'COMMON.PAGE' | translate }} {{ currentPage() }} {{ 'COMMON.OF' | translate }} {{ totalPages() }}</span>
      <button (click)="goPage(currentPage() + 1)" [disabled]="currentPage() >= totalPages()" class="btn-ghost btn-sm">
        <mat-icon>chevron_left</mat-icon>
      </button>
    </div>

    <!-- Create/Edit Modal -->
    <div *ngIf="editing" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="$event.target === $event.currentTarget && (editing = false)">
      <div class="card w-full max-w-md my-8 animate-in">
        <div class="flex items-center justify-between p-6 pb-0">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
            {{ editingItem?.id ? ('COMMON.EDIT' | translate) : ('COMMON.CREATE' | translate) }} {{ 'NAV.SPECIALTIES' | translate }}
          </h2>
          <button (click)="editing = false" class="btn-ghost btn-sm rounded-full">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        <form [formGroup]="form" class="p-6 pt-4">
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
            <div class="order-3">
              <label class="label">{{ 'ADMIN.SPECIALTIES.DESCRIPTION' | translate }}</label>
              <textarea formControlName="description" rows="3" class="input resize-none"></textarea>
            </div>
            <label class="order-4 flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
              <input type="checkbox" formControlName="isActive" class="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500">
              {{ 'COMMON.ACTIVE' | translate }}
            </label>
            <div class="flex justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
              <button type="button" (click)="editing = false" class="btn-secondary">{{ 'COMMON.CANCEL' | translate }}</button>
              <button type="button" (click)="save()" [disabled]="saving()" class="btn-primary">
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
  totalCount = signal(0);
  currentPage = signal(1);
  searchQuery = signal('');
  activeFilter = signal<'all' | 'active' | 'inactive'>('all');
  editing = false;
  editingItem: SpecialtyDto | null = null;
  saving = signal(false);
  isAr = signal(false);

  private search$ = new Subject<string>();
  private pageSize = 50;

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    nameAr: [''],
    description: [''],
    isActive: [true]
  }, { updateOn: 'change' });

  get totalPages() {
    return () => Math.max(1, Math.ceil(this.totalCount() / this.pageSize));
  }

  get filteredItems() {
    return () => {
      const items = this.items();
      const filter = this.activeFilter();
      if (filter === 'all') return items;
      return items.filter(s => filter === 'active' ? s.isActive : !s.isActive);
    };
  }

  ngOnInit() {
    this.isAr.set(this.translate.currentLang === 'ar');
    this.updateValidators(this.isAr());
    this.translate.onLangChange.subscribe(event => {
      this.isAr.set(event.lang === 'ar');
      this.updateValidators(event.lang === 'ar');
    });
    this.search$.pipe(debounceTime(300), distinctUntilChanged()).subscribe(q => {
      this.searchQuery.set(q);
      this.currentPage.set(1);
      this.load();
    });
    this.load();
  }

  onSearch(value: string) {
    this.search$.next(value);
  }

  clearSearch(input: HTMLInputElement) {
    input.value = '';
    this.search$.next('');
  }

  setFilter(f: 'all' | 'active' | 'inactive') {
    this.activeFilter.set(f);
  }

  updateValidators(isArabic: boolean) {
    const nameCtrl = this.form.controls.name;
    const nameArCtrl = this.form.controls.nameAr;
    if (isArabic) {
      nameArCtrl.setValidators([Validators.required, Validators.minLength(2)]);
      nameCtrl.clearValidators();
    } else {
      nameCtrl.setValidators([Validators.required, Validators.minLength(2)]);
      nameArCtrl.clearValidators();
    }
    nameCtrl.updateValueAndValidity({ emitEvent: false });
    nameArCtrl.updateValueAndValidity({ emitEvent: false });
  }

  load() {
    this.loading.set(true);
    const q = this.searchQuery();
    this.data.listSpecialties(this.currentPage(), this.pageSize, q || undefined, false).subscribe({
      next: r => {
        this.items.set(r.items || []);
        this.totalCount.set(r.totalCount);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  goPage(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.currentPage.set(p);
    this.load();
  }

  openCreate() {
    this.editingItem = null;
    this.form.reset({ name: '', nameAr: '', description: '', isActive: true });
    this.updateValidators(this.isAr());
    this.editing = true;
  }

  openEdit(s: SpecialtyDto) {
    this.editingItem = s;
    this.form.reset({ name: s.name, nameAr: s.nameAr || '', description: s.description || '', isActive: s.isActive });
    this.updateValidators(this.isAr());
    this.editing = true;
  }

  toggleActive(s: SpecialtyDto) {
    this.data.updateSpecialty(s.id, { name: s.name, nameAr: s.nameAr, description: s.description, isActive: !s.isActive }).subscribe({
      next: () => {
        this.snack.open(this.translate.instant('COMMON.SAVED'), this.translate.instant('COMMON.OK'), { duration: 2000 });
        this.load();
      },
      error: err => this.snack.open(err.error?.message || this.translate.instant('COMMON.SAVE_FAILED'), this.translate.instant('COMMON.OK'), { duration: 3000 })
    });
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const item = this.editingItem;
    const payload = { ...this.form.getRawValue() };
    if (!payload.name && payload.nameAr) payload.name = payload.nameAr;
    if (!payload.nameAr && payload.name) payload.nameAr = payload.name;

    const obs = item
      ? this.data.updateSpecialty(item.id, payload)
      : this.data.createSpecialty(payload);
    obs.subscribe({
      next: () => { this.saving.set(false); this.snack.open(this.translate.instant('COMMON.SAVED'), this.translate.instant('COMMON.OK'), { duration: 2000 }); this.editing = false; this.load(); },
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
    if (!confirm(this.translate.instant('ADMIN.DELETE_CONFIRM', { name: s.name }))) return;
    this.data.deleteSpecialty(s.id).subscribe(() => { this.snack.open(this.translate.instant('COMMON.DELETED'), this.translate.instant('COMMON.OK'), { duration: 2000 }); this.load(); });
  }
}
