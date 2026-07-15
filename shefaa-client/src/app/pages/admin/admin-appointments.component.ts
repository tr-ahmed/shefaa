import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { DataService } from '../../core/services/data.service';
import { AppointmentDto } from '../../core/models';

@Component({
  selector: 'app-admin-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, TranslateModule],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ 'NAV.APPOINTMENTS' | translate }}</h1>
        <p class="page-subtitle">{{ 'ADMIN.ALL_APPOINTMENTS_DESC' | translate }}</p>
      </div>
      <div class="flex items-center gap-3">
        <label class="label">{{ 'COMMON.FILTER' | translate }}</label>
        <select [(ngModel)]="filter" (change)="load()" class="input">
          <option value="">{{ 'COMMON.ALL' | translate }}</option>
          <option value="Pending">{{ 'STATUS.Pending' | translate }}</option>
          <option value="Confirmed">{{ 'STATUS.Confirmed' | translate }}</option>
          <option value="Completed">{{ 'STATUS.Completed' | translate }}</option>
          <option value="Cancelled">{{ 'STATUS.Cancelled' | translate }}</option>
        </select>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div *ngIf="loading()" class="card p-6">
      <div class="space-y-4">
        <div class="skeleton h-12 w-full rounded-xl"></div>
        <div class="skeleton h-12 w-full rounded-xl"></div>
        <div class="skeleton h-12 w-full rounded-xl"></div>
        <div class="skeleton h-12 w-full rounded-xl"></div>
        <div class="skeleton h-12 w-full rounded-xl"></div>
      </div>
    </div>

    <!-- Empty state -->
    <div *ngIf="!loading() && items().length === 0" class="empty-state card">
      <mat-icon class="text-5xl text-slate-300 dark:text-slate-600 mb-3">event_note</mat-icon>
      <p class="text-slate-500 dark:text-slate-400 font-medium">{{ 'COMMON.NO_DATA' | translate }}</p>
    </div>

    <!-- Appointments Table -->
    <div *ngIf="!loading() && items().length > 0" class="card overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
            <th class="px-6 py-4 font-semibold">{{ 'ADMIN.PATIENT' | translate }}</th>
            <th class="px-6 py-4 font-semibold">{{ 'ADMIN.DOCTOR' | translate }}</th>
            <th class="px-6 py-4 font-semibold">{{ 'ADMIN.CLINIC' | translate }}</th>
            <th class="px-6 py-4 font-semibold">{{ 'APPOINTMENT.DATE_TIME' | translate }}</th>
            <th class="px-6 py-4 font-semibold">{{ 'COMMON.STATUS' | translate }}</th>
            <th class="px-6 py-4 font-semibold">{{ 'ADMIN.CODE' | translate }}</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let a of items()"
              class="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
            <td class="px-6 py-4">
              <span class="font-semibold text-slate-900 dark:text-white">{{ a.patientName }}</span>
            </td>
            <td class="px-6 py-4">
              <div class="font-medium text-slate-800 dark:text-slate-100">{{ a.doctorName }}</div>
              <div class="text-xs text-slate-400 dark:text-slate-500">{{ a.doctorSpecialty }}</div>
            </td>
            <td class="px-6 py-4 text-slate-600 dark:text-slate-300">{{ a.clinicName }}</td>
            <td class="px-6 py-4">
              <div class="text-slate-700 dark:text-slate-200">{{ a.scheduledStart | date:'mediumDate' }}</div>
              <div class="text-xs text-slate-400 dark:text-slate-500">{{ a.scheduledStart | date:'shortTime' }}</div>
            </td>
            <td class="px-6 py-4">
              <span class="badge" [ngClass]="badge(a.status)">{{ ('STATUS.' + a.status) | translate }}</span>
            </td>
            <td class="px-6 py-4">
              <code class="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-lg font-mono">{{ a.confirmationCode }}</code>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class AdminAppointmentsComponent implements OnInit {
  private data = inject(DataService);
  loading = signal(true);
  items = signal<AppointmentDto[]>([]);
  filter = '';

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.data.listAppointments(1, 200, { status: this.filter || undefined }).subscribe({
      next: r => { this.items.set(r.items || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  badge(s: string) {
    switch (s) {
      case 'Pending': return 'badge-warning';
      case 'Confirmed': case 'CheckedIn': return 'badge-info';
      case 'Completed': return 'badge-success';
      case 'Cancelled': case 'NoShow': return 'badge-danger';
      default: return 'badge-muted';
    }
  }
}
