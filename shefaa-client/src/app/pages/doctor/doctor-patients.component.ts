import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { DataService } from '../../core/services/data.service';
import { DoctorPatientDto } from '../../core/models';

@Component({
  selector: 'app-doctor-patients',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, TranslateModule],
  template: `
    <div class="page-header animate-fade-in">
      <div>
        <h1 class="page-title">{{ 'NAV.MY_PATIENTS' | translate }}</h1>
        <p class="page-subtitle">{{ 'DOCTOR_PORTAL.MY_PATIENTS_DESCRIPTION' | translate }}</p>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="card p-4 mb-6 animate-fade-in">
      <div class="flex items-center gap-4">
        <div class="flex-1 relative">
          <mat-icon class="search-icon">search</mat-icon>
          <input
            class="input pl-10 w-full"
            [placeholder]="'DOCTOR_PORTAL.SEARCH_PATIENTS' | translate"
            [(ngModel)]="searchTerm"
            (input)="onSearch()"
          />
        </div>
        <span class="text-sm text-muted">{{ filteredPatients().length }} {{ 'COMMON.PATIENTS' | translate }}</span>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div *ngIf="loading()" class="space-y-3">
      <div *ngFor="let i of [1,2,3,4,5]" class="card p-4">
        <div class="flex items-center gap-4">
          <div class="skeleton w-12 h-12 rounded-full"></div>
          <div class="flex-1 space-y-2">
            <div class="skeleton w-40 h-5 rounded"></div>
            <div class="skeleton w-56 h-4 rounded"></div>
          </div>
          <div class="skeleton w-20 h-8 rounded-lg"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div *ngIf="!loading() && filteredPatients().length === 0" class="card p-12 text-center animate-fade-in">
      <mat-icon class="text-6xl text-muted mb-4 block">people_outline</mat-icon>
      <h3 class="text-lg font-semibold mb-2">{{ 'DOCTOR_PORTAL.NO_PATIENTS' | translate }}</h3>
      <p class="text-muted">{{ 'DOCTOR_PORTAL.NO_PATIENTS_DESCRIPTION' | translate }}</p>
    </div>

    <!-- Patients Table -->
    <div *ngIf="!loading() && filteredPatients().length > 0" class="card overflow-hidden animate-fade-in">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-surface-200 dark:border-surface-700">
              <th class="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted">{{ 'PATIENT.NAME' | translate }}</th>
              <th class="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted hidden sm:table-cell">{{ 'PATIENT.EMAIL' | translate }}</th>
              <th class="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted hidden md:table-cell">{{ 'PATIENT.PHONE' | translate }}</th>
              <th class="text-center p-4 text-xs font-semibold uppercase tracking-wider text-muted">{{ 'DOCTOR_PORTAL.APPOINTMENT_COUNT' | translate }}</th>
              <th class="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted hidden lg:table-cell">{{ 'DOCTOR_PORTAL.LAST_VISIT' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let patient of filteredPatients()"
              class="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50 cursor-pointer transition-colors"
              (click)="selectPatient(patient)"
              [class.bg-primary-50]="selectedPatient()?.patientId === patient.patientId"
            >
              <td class="p-4">
                <div class="flex items-center gap-3">
                  <div class="avatar-sm bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                    {{ getInitials(patient.fullName) }}
                  </div>
                  <div>
                    <div class="font-semibold text-sm">{{ patient.fullName }}</div>
                    <div class="text-xs text-muted" *ngIf="patient.medicalRecordNumber">{{ 'DOCTOR_PORTAL.MRN' | translate }}: {{ patient.medicalRecordNumber }}</div>
                  </div>
                </div>
              </td>
              <td class="p-4 text-sm hidden sm:table-cell">{{ patient.email || '—' }}</td>
              <td class="p-4 text-sm hidden md:table-cell">{{ patient.phoneNumber || '—' }}</td>
              <td class="p-4 text-center">
                <span class="badge-primary">{{ patient.totalAppointments }}</span>
              </td>
              <td class="p-4 text-sm hidden lg:table-cell">
                <div *ngIf="patient.lastVisitDate">
                  <div>{{ patient.lastVisitDate | date:'mediumDate' }}</div>
                  <span class="text-xs" [ngClass]="{
                    'badge-success': patient.lastVisitStatus === 'Completed',
                    'badge-warning': patient.lastVisitStatus === 'Confirmed' || patient.lastVisitStatus === 'Pending',
                    'badge-danger': patient.lastVisitStatus === 'Cancelled' || patient.lastVisitStatus === 'NoShow'
                  }">{{ 'STATUS.' + patient.lastVisitStatus | translate }}</span>
                </div>
                <span *ngIf="!patient.lastVisitDate" class="text-muted text-xs">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Patient Detail Sidebar -->
    <div *ngIf="selectedPatient()" class="card p-6 mt-6 animate-fade-in">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-bold">{{ 'DOCTOR_PORTAL.PATIENT_DETAILS' | translate }}</h2>
        <button mat-icon-button (click)="selectedPatient.set(null)">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Personal Info -->
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="avatar-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
              {{ getInitials(selectedPatient()!.fullName) }}
            </div>
            <div>
              <h3 class="font-bold text-lg">{{ selectedPatient()!.fullName }}</h3>
              <p class="text-sm text-muted" *ngIf="selectedPatient()!.medicalRecordNumber">
                {{ 'DOCTOR_PORTAL.MRN' | translate }}: {{ selectedPatient()!.medicalRecordNumber }}
              </p>
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex items-center gap-3 text-sm" *ngIf="selectedPatient()!.email">
              <mat-icon class="text-muted">email</mat-icon>
              <span>{{ selectedPatient()!.email }}</span>
            </div>
            <div class="flex items-center gap-3 text-sm" *ngIf="selectedPatient()!.phoneNumber">
              <mat-icon class="text-muted">phone</mat-icon>
              <span>{{ selectedPatient()!.phoneNumber }}</span>
            </div>
          </div>
        </div>

        <!-- Appointment Stats -->
        <div class="space-y-4">
          <h4 class="font-semibold text-sm uppercase tracking-wider text-muted">{{ 'DOCTOR_PORTAL.APPOINTMENT_HISTORY' | translate }}</h4>

          <div class="grid grid-cols-3 gap-3">
            <div class="stat-card text-center p-3">
              <div class="stat-number text-primary">{{ selectedPatient()!.totalAppointments }}</div>
              <div class="stat-label text-xs">{{ 'COMMON.TOTAL' | translate }}</div>
            </div>
            <div class="stat-card text-center p-3">
              <div class="stat-number text-green-600">{{ selectedPatient()!.completedAppointments }}</div>
              <div class="stat-label text-xs">{{ 'STATUS.Completed' | translate }}</div>
            </div>
            <div class="stat-card text-center p-3">
              <div class="stat-number text-yellow-600">{{ selectedPatient()!.totalAppointments - selectedPatient()!.completedAppointments }}</div>
              <div class="stat-label text-xs">{{ 'DOCTOR_PORTAL.OTHER' | translate }}</div>
            </div>
          </div>

          <div class="space-y-2" *ngIf="selectedPatient()!.lastVisitDate">
            <div class="flex justify-between text-sm">
              <span class="text-muted">{{ 'DOCTOR_PORTAL.LAST_VISIT' | translate }}:</span>
              <span class="font-medium">{{ selectedPatient()!.lastVisitDate | date:'medium' }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-muted">{{ 'COMMON.STATUS' | translate }}:</span>
              <span class="badge-sm" [ngClass]="{
                'badge-success': selectedPatient()!.lastVisitStatus === 'Completed',
                'badge-warning': selectedPatient()!.lastVisitStatus === 'Confirmed' || selectedPatient()!.lastVisitStatus === 'Pending',
                'badge-danger': selectedPatient()!.lastVisitStatus === 'Cancelled' || selectedPatient()!.lastVisitStatus === 'NoShow'
              }">{{ 'STATUS.' + selectedPatient()!.lastVisitStatus | translate }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .avatar-sm { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; flex-shrink: 0; }
    .avatar-lg { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem; flex-shrink: 0; }
    .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 20px; }
    .badge-sm { padding: 2px 8px; border-radius: 9999px; font-size: 0.7rem; font-weight: 600; }
    .badge-primary { background: var(--primary-light); color: var(--primary); padding: 2px 10px; border-radius: 9999px; font-size: 0.8rem; font-weight: 600; }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-danger { background: #fee2e2; color: #991b1b; }
    :host.dark .badge-success { background: #052e16; color: #4ade80; }
    :host.dark .badge-warning { background: #451a03; color: #fbbf24; }
    :host.dark .badge-danger { background: #450a0a; color: #f87171; }
  `]
})
export class DoctorPatientsComponent implements OnInit {
  private data = inject(DataService);

  loading = signal(true);
  patients = signal<DoctorPatientDto[]>([]);
  searchTerm = '';
  selectedPatient = signal<DoctorPatientDto | null>(null);
  private searchTimeout: any;

  filteredPatients = computed(() => {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.patients();
    return this.patients().filter(p =>
      p.fullName.toLowerCase().includes(term) ||
      p.email?.toLowerCase().includes(term) ||
      p.phoneNumber?.includes(term) ||
      p.medicalRecordNumber?.toLowerCase().includes(term)
    );
  });

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients(search?: string) {
    this.loading.set(true);
    this.data.getMyPatients(search).subscribe({
      next: (res) => { this.patients.set(res); this.loading.set(false); },
      error: () => { this.patients.set([]); this.loading.set(false); }
    });
  }

  onSearch() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.loadPatients(this.searchTerm);
    }, 400);
  }

  selectPatient(patient: DoctorPatientDto) {
    if (this.selectedPatient()?.patientId === patient.patientId) {
      this.selectedPatient.set(null);
    } else {
      this.selectedPatient.set(patient);
    }
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }
}
