import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { DataService } from '../../core/services/data.service';
import { ClinicDto } from '../../core/models';

@Component({
  selector: 'app-clinic-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, TranslateModule],
  template: `
    <section class="max-w-7xl mx-auto px-4 lg:px-8 py-10">

      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ 'NAV.CLINICS' | translate }}</h1>
          <p class="page-subtitle dark:text-slate-400">{{ 'COMMON.SEARCH' | translate }} {{ 'NAV.CLINICS' | translate }}...</p>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="card p-4 mb-6">
        <div class="relative">
          <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">search</mat-icon>
          <input [(ngModel)]="search" (input)="reload()" type="search"
                 class="input ps-10 w-full"
                 placeholder="{{ 'COMMON.SEARCH' | translate }}...">
        </div>
      </div>

      <!-- Loading Skeletons -->
      <div *ngIf="loading()" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div *ngFor="let i of [1,2,3,4,5,6]" class="card p-5">
          <div class="flex items-center gap-3 mb-4">
            <div class="skeleton h-12 w-12 rounded-xl"></div>
            <div class="flex-1 space-y-2">
              <div class="skeleton h-4 w-3/4"></div>
              <div class="skeleton h-3 w-1/2"></div>
            </div>
          </div>
          <div class="skeleton h-3 w-full mb-2"></div>
          <div class="skeleton h-3 w-2/3 mb-4"></div>
          <div class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700/50">
            <div class="skeleton h-4 w-24"></div>
            <div class="skeleton h-6 w-16 rounded-full"></div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading() && clinics().length === 0" class="empty-state card py-16">
        <mat-icon class="text-5xl text-slate-300 dark:text-slate-600 mb-3">local_hospital</mat-icon>
        <p class="text-slate-500 dark:text-slate-400 text-lg font-medium">{{ 'COMMON.NO_DATA' | translate }}</p>
      </div>

      <!-- Clinic Cards Grid -->
      <div *ngIf="!loading() && clinics().length > 0" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div *ngFor="let c of clinics()" class="card card-hover p-5 group flex flex-col">

          <!-- Top: Icon + Name -->
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-md flex-shrink-0">
              <mat-icon>local_hospital</mat-icon>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-slate-900 dark:text-white truncate">{{ c.name }}</h3>
              <div *ngIf="c.nameAr" class="text-xs text-slate-400 dark:text-slate-500 truncate" dir="rtl">{{ c.nameAr }}</div>
            </div>
          </div>

          <!-- Address -->
          <p class="text-sm text-slate-600 dark:text-slate-300 mt-3 line-clamp-2 leading-relaxed">{{ c.address }}</p>

          <!-- Meta: City + Phone -->
          <div class="flex items-center gap-3 mt-3 text-xs text-slate-500 dark:text-slate-400">
            <span *ngIf="c.city" class="flex items-center gap-1">
              <mat-icon class="text-[14px] leading-none text-primary-500">location_on</mat-icon>
              {{ c.city }}
            </span>
            <span *ngIf="c.phoneNumber" class="flex items-center gap-1">
              <mat-icon class="text-[14px] leading-none text-primary-500">phone</mat-icon>
              {{ c.phoneNumber }}
            </span>
          </div>

          <div class="flex-1"></div>

          <!-- Divider -->
          <div class="divider my-4"></div>

          <!-- Bottom: Doctors Count + Status -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300">
              <mat-icon class="text-primary-500 text-base">medical_information</mat-icon>
              <span class="font-semibold">{{ c.doctorsCount }}</span>
              <span class="text-xs text-slate-500 dark:text-slate-400">{{ 'NAV.DOCTORS' | translate }}</span>
            </div>
            <span class="badge" [class.badge-success]="c.isActive" [class.badge-muted]="!c.isActive">
              {{ c.isActive ? ('COMMON.ACTIVE' | translate) : ('COMMON.INACTIVE' | translate) }}
            </span>
          </div>
        </div>
      </div>
    </section>
  `
})
export class ClinicListComponent implements OnInit {
  private data = inject(DataService);
  loading = signal(true);
  clinics = signal<ClinicDto[]>([]);
  search = '';

  ngOnInit() { this.reload(); }

  reload() {
    this.loading.set(true);
    this.data.listClinics(1, 24, this.search || undefined).subscribe({
      next: r => { this.clinics.set(r.items || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
