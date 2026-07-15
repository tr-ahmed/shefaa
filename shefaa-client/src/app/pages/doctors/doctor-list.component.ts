import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { DataService } from '../../core/services/data.service';
import { DoctorDto, SpecialtyDto } from '../../core/models';

@Component({
  selector: 'app-doctor-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, TranslateModule],
  template: `
    <section class="max-w-7xl mx-auto px-4 lg:px-8 py-10">

      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ 'DOCTORS.LIST_TITLE' | translate }}</h1>
          <p class="page-subtitle dark:text-slate-400">{{ 'DOCTORS.LIST_SUBTITLE' | translate }}</p>
        </div>
      </div>

      <!-- Search & Filter Bar -->
      <div class="card p-4 mb-6">
        <div class="flex flex-col md:flex-row gap-3">
          <div class="flex-1 relative">
            <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">search</mat-icon>
            <input [(ngModel)]="search" (input)="reload()" type="search"
                   class="input ps-10 w-full"
                   placeholder="{{ 'COMMON.SEARCH' | translate }}...">
          </div>
          <div class="w-full md:w-56">
            <select [(ngModel)]="specialtyId" (change)="reload()" class="input w-full">
              <option [ngValue]="null">{{ 'DOCTORS.ALL_SPECIALTIES' | translate }}</option>
              <option *ngFor="let s of specialties()" [ngValue]="s.id">{{ s.name }}</option>
            </select>
          </div>
          <div class="w-full md:w-auto">
            <button class="btn-ghost btn-sm w-full md:w-auto" (click)="resetFilters()">
              <mat-icon class="text-base">filter_alt_off</mat-icon>
              {{ 'COMMON.ALL' | translate }}
            </button>
          </div>
        </div>
      </div>

      <!-- Loading Skeletons -->
      <div *ngIf="loading()" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div *ngFor="let i of [1,2,3,4,5,6]" class="card p-5">
          <div class="flex items-center gap-4 mb-4">
            <div class="skeleton h-14 w-14 rounded-full"></div>
            <div class="flex-1 space-y-2">
              <div class="skeleton h-4 w-3/4"></div>
              <div class="skeleton h-3 w-1/2"></div>
            </div>
          </div>
          <div class="skeleton h-3 w-full mb-2"></div>
          <div class="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
            <div class="skeleton h-4 w-20"></div>
            <div class="skeleton h-6 w-16 rounded-full"></div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading() && doctors().length === 0" class="empty-state card py-16">
        <mat-icon class="text-5xl text-slate-300 dark:text-slate-600 mb-3">person_search</mat-icon>
        <p class="text-slate-500 dark:text-slate-400 text-lg font-medium">{{ 'COMMON.NO_DATA' | translate }}</p>
      </div>

      <!-- Doctor Cards Grid -->
      <div *ngIf="!loading() && doctors().length > 0" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <a *ngFor="let d of doctors()" [routerLink]="['/doctors', d.id]"
           class="card card-hover card-interactive p-5 group flex flex-col">

          <!-- Top: Avatar + Name -->
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 via-primary-400 to-accent-500 text-white flex items-center justify-center font-bold text-lg shadow-md ring-2 ring-white dark:ring-slate-800 flex-shrink-0">
              {{ initials(d.fullName) }}
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-slate-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {{ d.fullName }}
              </h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 truncate">{{ d.specialtyName }}</p>
            </div>
          </div>

          <!-- Middle: Rating + Experience -->
          <div class="flex items-center gap-3 mt-4 text-sm">
            <div class="flex items-center gap-1 text-amber-500">
              <mat-icon class="text-base leading-none">star</mat-icon>
              <span class="font-semibold">{{ d.rating || '5.0' }}</span>
            </div>
            <span class="text-slate-300 dark:text-slate-600">|</span>
            <span class="text-slate-500 dark:text-slate-400 text-xs">
              {{ d.yearsOfExperience }} {{ 'DOCTORS.YEARS_EXPERIENCE' | translate }}
            </span>
          </div>

          <div class="flex-1"></div>

          <!-- Divider -->
          <div class="divider my-4"></div>

          <!-- Bottom: Fee + Status + CTA -->
          <div class="flex items-center justify-between">
            <div *ngIf="d.defaultConsultationFee" class="text-sm">
              <span class="font-bold text-slate-900 dark:text-white">{{ d.defaultConsultationFee }}</span>
              <span class="text-xs text-slate-500 dark:text-slate-400 ms-0.5">{{ 'COMMON.CURRENCY' | translate }}</span>
              <span class="text-xs text-slate-400 dark:text-slate-500">/{{ 'COMMON.MINUTES' | translate }}</span>
            </div>
            <span class="badge" [class.badge-success]="d.isAvailableForBooking" [class.badge-muted]="!d.isAvailableForBooking">
              {{ d.isAvailableForBooking ? ('COMMON.ACTIVE' | translate) : ('COMMON.INACTIVE' | translate) }}
            </span>
          </div>

          <div class="mt-3 text-center text-primary-600 dark:text-primary-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            {{ 'DOCTORS.VIEW_PROFILE' | translate }} →
          </div>
        </a>
      </div>
    </section>
  `
})
export class DoctorListComponent implements OnInit {
  private data = inject(DataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(true);
  doctors = signal<DoctorDto[]>([]);
  specialties = signal<SpecialtyDto[]>([]);

  search = '';
  specialtyId: number | null = null;

  ngOnInit() {
    this.route.queryParamMap.subscribe(p => {
      this.specialtyId = p.get('specialtyId') ? +p.get('specialtyId')! : null;
      this.reload();
    });
    this.data.listSpecialties(1, 100).subscribe(r => { this.specialties.set(r.items ?? []); });
  }

  reload() {
    this.loading.set(true);
    this.data.listDoctors(1, 24, this.specialtyId ?? undefined, this.search || undefined, true).subscribe({
      next: r => { this.doctors.set(r.items || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  resetFilters() {
    this.search = '';
    this.specialtyId = null;
    this.router.navigate([], { queryParams: {} });
    this.reload();
  }

  initials(name: string) {
    return name.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();
  }
}
