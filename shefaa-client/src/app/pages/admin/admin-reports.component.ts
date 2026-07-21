import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DataService } from '../../core/services/data.service';
import { ExcelExportService, SheetData } from '../../core/services/excel-export.service';

interface ReportType {
  id: string;
  icon: string;
  label: string;
  desc: string;
  needsMonthRange: boolean;
  needsClinic: boolean;
  color: string;
}

interface ColumnDef {
  key: string;
  label: string;
  type?: 'badge-success' | 'badge-danger' | 'badge-warning' | 'badge-info' | 'currency' | 'percent' | 'rating';
}

const REPORT_TYPES: ReportType[] = [
  { id: 'appointment-trends',  icon: 'date_range',       label: 'APPOINTMENT_TRENDS',      desc: 'APPOINTMENT_TRENDS_DESC',      needsMonthRange: true,  needsClinic: false, color: 'from-emerald-500 to-teal-500' },
  { id: 'revenue',             icon: 'payments',          label: 'REVENUE',                 desc: 'REVENUE_DESC',                  needsMonthRange: true,  needsClinic: true,  color: 'from-blue-500 to-cyan-500' },
  { id: 'doctor-performance',  icon: 'medical_services',  label: 'DOCTOR_PERFORMANCE',      desc: 'DOCTOR_PERFORMANCE_DESC',      needsMonthRange: false, needsClinic: true,  color: 'from-violet-500 to-purple-500' },
  { id: 'top-doctors',         icon: 'stars',             label: 'TOP_DOCTORS',             desc: 'TOP_DOCTORS_DESC',             needsMonthRange: false, needsClinic: true,  color: 'from-amber-500 to-orange-500' },
  { id: 'specialty-stats',     icon: 'biotech',           label: 'SPECIALTY_STATS',         desc: 'SPECIALTY_STATS_DESC',         needsMonthRange: false, needsClinic: false, color: 'from-rose-500 to-pink-500' },
  { id: 'patient-registrations', icon: 'person_add',      label: 'PATIENT_REGISTRATIONS',   desc: 'PATIENT_REGISTRATIONS_DESC',   needsMonthRange: true,  needsClinic: false, color: 'from-sky-500 to-indigo-500' },
  { id: 'peak-hours',          icon: 'schedule',          label: 'PEAK_HOURS',              desc: 'PEAK_HOURS_DESC',              needsMonthRange: false, needsClinic: false, color: 'from-orange-500 to-red-500' },
  { id: 'day-of-week',         icon: 'calendar_view_week', label: 'DAY_OF_WEEK',            desc: 'DAY_OF_WEEK_DESC',             needsMonthRange: false, needsClinic: false, color: 'from-teal-500 to-emerald-500' },
  { id: 'gender-distribution', icon: 'diversity_3',       label: 'GENDER_DISTRIBUTION',     desc: 'GENDER_DISTRIBUTION_DESC',     needsMonthRange: false, needsClinic: false, color: 'from-pink-500 to-rose-500' },
  { id: 'appointment-status',  icon: 'donut_small',       label: 'APPOINTMENT_STATUS',      desc: 'APPOINTMENT_STATUS_DESC',     needsMonthRange: true,  needsClinic: true,  color: 'from-cyan-500 to-blue-500' },
  { id: 'clinic-summary',      icon: 'local_hospital',    label: 'CLINIC_SUMMARY',          desc: 'CLINIC_SUMMARY_DESC',         needsMonthRange: true,  needsClinic: true,  color: 'from-indigo-500 to-violet-500' },
];

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, MatIconModule, TranslateModule],
  template: `
    <style>
      @media print {
        .no-print { display: none !important; }
        .print-only { display: block !important; }
        body { font-size: 9pt; }
        .card { box-shadow: none !important; border: 1px solid #ddd !important; }
        .report-table td, .report-table th { padding: 4px 6px !important; font-size: 8pt !important; }
      }
      .print-only { display: none; }
    </style>

    <div class="no-print">
      <div class="page-header animate-fade-in">
        <div>
          <h1 class="page-title">{{ 'NAV.REPORTS' | translate }}</h1>
          <p class="page-subtitle">{{ 'ADMIN.REPORTS_DESC' | translate }}</p>
        </div>
        <div class="flex items-center gap-3">
          <button (click)="generate()" [disabled]="loading()" class="btn-primary">
            @if (!loading()) { <mat-icon class="!text-[18px]">play_arrow</mat-icon> }
            @if (loading()) { <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block me-2"></span> }
            {{ loading() ? ('ADMIN.REPORTS.GENERATING' | translate) : ('ADMIN.REPORTS.GENERATE' | translate) }}
          </button>
        </div>
      </div>

      <div class="grid lg:grid-cols-4 gap-6 mb-6 animate-fade-in">
        <div class="lg:col-span-3">
          <label class="label mb-3">{{ 'ADMIN.REPORTS.REPORT_TYPE' | translate }}</label>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            @for (rt of reportTypes; track rt.id) {
              <button (click)="selectReport(rt.id)" class="text-left p-3 rounded-xl border-2 transition-all duration-150"
                [class]="selectedType() === rt.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 shadow-md' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-sm'">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center mb-2 bg-gradient-to-br shadow-sm" [class]="rt.color + ' text-white'">
                  <mat-icon class="!text-[16px]">{{ rt.icon }}</mat-icon>
                </div>
                <div class="font-semibold text-xs text-slate-800 dark:text-white">{{ 'ADMIN.REPORTS.' + rt.label | translate }}</div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{{ 'ADMIN.REPORTS.' + rt.desc | translate }}</div>
              </button>
            }
          </div>
        </div>

        <div>
          <label class="label mb-3">{{ 'COMMON.FILTER' | translate }}</label>
          <div class="card p-4 space-y-3">
            @if (selectedReport()?.needsMonthRange) {
              <div>
                <label class="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">{{ 'ADMIN.REPORTS.TIME_RANGE' | translate }}</label>
                <select [(ngModel)]="months" class="input !w-full">
                  <option [value]="3">{{ 'ADMIN.LAST_3_MONTHS' | translate }}</option>
                  <option [value]="6">{{ 'ADMIN.LAST_6_MONTHS' | translate }}</option>
                  <option [value]="12">{{ 'ADMIN.LAST_12_MONTHS' | translate }}</option>
                  <option [value]="24">{{ 'ADMIN.LAST_24_MONTHS' | translate }}</option>
                </select>
              </div>
            }
            @if (selectedReport()?.needsClinic && clinics().length > 0) {
              <div>
                <label class="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">{{ 'ADMIN.CLINIC' | translate }}</label>
                <select [(ngModel)]="clinicId" class="input !w-full">
                  <option [value]="0">{{ 'ADMIN.REPORTS.ALL_CLINICS' | translate }}</option>
                  @for (c of clinics(); track c.id) { <option [value]="c.id">{{ c.name }}</option> }
                </select>
              </div>
            }
            @if (selectedReport()?.needsClinic && clinics().length === 0) {
              <div class="text-xs text-slate-400">{{ 'ADMIN.REPORTS.NO_CLINICS' | translate }}</div>
            }
            <button (click)="generate()" [disabled]="loading()" class="btn-primary w-full !py-2.5 mt-2">
              @if (!loading()) { <mat-icon class="!text-[16px]">refresh</mat-icon><span>{{ 'ADMIN.REPORTS.RUN' | translate }}</span> }
              @if (loading()) { <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"></span> }
            </button>
          </div>
        </div>
      </div>
    </div>

    @if (loading()) {
      <div class="space-y-4 animate-fade-in no-print">
        <div class="card p-6">
          <div class="skeleton h-8 w-48 rounded mb-6"></div>
          <div class="skeleton h-6 w-full rounded mb-3"></div>
          <div class="skeleton h-6 w-full rounded mb-3"></div>
          <div class="skeleton h-6 w-3/4 rounded"></div>
        </div>
      </div>
    }

    <div class="print-only mb-6">
      <h1 class="text-xl font-bold mb-1">{{ 'ADMIN.REPORTS.' + (selectedReport()?.label || '') | translate }}</h1>
      <p class="text-xs text-slate-500 mb-1">{{ 'ADMIN.REPORTS.PRINT_HEADER' | translate }}</p>
      <p class="text-xs text-slate-400">{{ 'ADMIN.REPORTS.GENERATED' | translate }}: {{ generatedAt }}</p>
      <hr class="my-2 border-slate-300">
    </div>

    @if (!loading() && resultData().length > 0) {
      <div class="animate-fade-in">
        <div class="no-print flex items-center justify-between mb-4">
          <div class="text-sm text-slate-600 dark:text-slate-400">
            <span class="font-semibold text-slate-800 dark:text-white">{{ 'ADMIN.REPORTS.' + (selectedReport()?.label || '') | translate }}</span>
            <span class="mx-1">·</span>
            {{ resultData().length }} {{ 'ADMIN.REPORTS.ROWS' | translate }}
          </div>
          <div class="flex items-center gap-2">
            <button (click)="windowPrint()" class="btn-secondary !py-1.5 !px-3">
              <mat-icon class="!text-[16px]">print</mat-icon> {{ 'ADMIN.REPORTS.PRINT' | translate }}
            </button>
            <button (click)="exportExcel()" class="btn-secondary !py-1.5 !px-3">
              <mat-icon class="!text-[16px]">download</mat-icon> {{ 'ADMIN.REPORTS.EXCEL' | translate }}
            </button>
          </div>
        </div>

        <div class="card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm report-table">
              <thead>
                <tr class="bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th *ngFor="let col of columns()" class="text-left py-3 px-4 font-semibold whitespace-nowrap">{{ col.label }}</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let row of resultData(); let i = index" class="border-t border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors" [ngClass]="i % 2 === 1 ? 'bg-slate-50/50' : ''">
                  <td *ngFor="let col of columns()" class="py-2.5 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    @if (col.type === 'badge-success') { <span class="badge badge-success">{{ row[col.key] }}</span> }
                    @else if (col.type === 'badge-danger') { <span class="badge badge-danger">{{ row[col.key] }}</span> }
                    @else if (col.type === 'badge-warning') { <span class="badge badge-warning">{{ row[col.key] }}</span> }
                    @else if (col.type === 'badge-info') { <span class="badge badge-info">{{ row[col.key] }}</span> }
                    @else if (col.type === 'currency') { <span>{{ (row[col.key] || 0) | number:'1.0-0' }} {{ 'COMMON.CURRENCY' | translate }}</span> }
                    @else if (col.type === 'percent') { <span>{{ (row[col.key] || 0) | percent:'1.1-1' }}</span> }
                    @else if (col.type === 'rating') {
                      <span class="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <mat-icon class="!text-[13px]">star</mat-icon>
                        <span class="text-xs font-bold">{{ row[col.key] || '5.0' }}</span>
                      </span>
                    }
                    @else { <span>{{ row[col.key] }}</span> }
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="no-print text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
          {{ resultData().length }} {{ resultData().length === 1 ? ('ADMIN.REPORTS.RECORD' | translate) : ('ADMIN.REPORTS.RECORDS' | translate) }}
        </div>
      </div>
    }

    @if (!loading() && resultData().length === 0 && hasGenerated()) {
      <div class="card p-12 text-center animate-fade-in">
        <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-400 mx-auto flex items-center justify-center mb-4">
          <mat-icon class="text-3xl">search_off</mat-icon>
        </div>
        <h3 class="text-lg font-semibold text-slate-800 dark:text-white mb-1">{{ 'ADMIN.REPORTS.NO_DATA' | translate }}</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ 'ADMIN.REPORTS.NO_DATA_HINT' | translate }}</p>
      </div>
    }

    @if (!loading() && !hasGenerated()) {
      <div class="no-print card p-12 text-center animate-fade-in">
        <div class="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/40 dark:to-accent-900/40 text-primary-500 dark:text-primary-300 mx-auto flex items-center justify-center mb-5 shadow-lg shadow-primary-500/10">
          <mat-icon class="text-4xl">assignment</mat-icon>
        </div>
        <h2 class="text-xl font-bold text-slate-800 dark:text-white mb-2">{{ 'ADMIN.REPORTS.CENTER' | translate }}</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed" [innerHTML]="'ADMIN.REPORTS.SELECT_HINT' | translate">
        </p>
      </div>
    }
  `
})
export class AdminReportsComponent implements OnInit {
  private data = inject(DataService);
  private excel = inject(ExcelExportService);
  translate = inject(TranslateService);

  readonly reportTypes = REPORT_TYPES;

  selectedType = signal('appointment-trends');
  months = 6;
  clinicId = 0;
  loading = signal(false);
  hasGenerated = signal(false);
  generatedAt = '';

  clinics = signal<{ id: number; name: string }[]>([]);
  resultData = signal<Record<string, any>[]>([]);
  columns = signal<ColumnDef[]>([]);

  selectedReport = computed(() => this.reportTypes.find(r => r.id === this.selectedType()) || null);

  ngOnInit() {
    this.data.listClinics(1, 100).subscribe({
      next: (res: any) => {
        if (res?.items) this.clinics.set(res.items.map((c: any) => ({ id: c.id, name: c.name })));
      }
    });
  }

  selectReport(id: string) {
    this.selectedType.set(id);
    this.hasGenerated.set(false);
  }

  generate() {
    this.loading.set(true);
    this.hasGenerated.set(true);
    this.generatedAt = new Date().toLocaleString();
    const months = this.months;
    const clinicId = this.clinicId || undefined;
    switch (this.selectedType()) {
      case 'appointment-trends': this.loadAppointmentTrends(months); break;
      case 'revenue': this.loadRevenue(months); break;
      case 'doctor-performance': this.loadDoctorPerformance(clinicId); break;
      case 'top-doctors': this.loadTopDoctors(); break;
      case 'specialty-stats': this.loadSpecialtyStats(); break;
      case 'patient-registrations': this.loadPatientTrends(months); break;
      case 'peak-hours': this.loadPeakHours(); break;
      case 'day-of-week': this.loadDayOfWeek(); break;
      case 'gender-distribution': this.loadGenderDistribution(); break;
      case 'appointment-status': this.loadAppointmentStatus(months, clinicId); break;
      case 'clinic-summary': this.loadClinicSummary(months, clinicId); break;
      default: this.loading.set(false);
    }
  }

  private setCols(cols: ColumnDef[]) { this.columns.set(cols); }
  private done(data: Record<string, any>[]) { this.resultData.set(data); this.loading.set(false); }

  private loadAppointmentTrends(months: number) {
    this.setCols([
      { key: 'label', label: this.translate.instant('ADMIN.REPORTS.COL_MONTH') },
      { key: 'total', label: this.translate.instant('COMMON.TOTAL') },
      { key: 'completed', label: this.translate.instant('ADMIN.REPORTS.COL_COMPLETED'), type: 'badge-success' },
      { key: 'cancelled', label: this.translate.instant('ADMIN.REPORTS.COL_CANCELLED'), type: 'badge-danger' },
      { key: 'noShow', label: this.translate.instant('ADMIN.REPORTS.COL_NO_SHOW'), type: 'badge-warning' },
      { key: 'completionPct', label: this.translate.instant('ADMIN.REPORTS.COL_COMPLETION_PCT'), type: 'percent' },
    ]);
    this.data.getAppointmentTrends(months).subscribe({
      next: (r) => this.done(r.map(t => ({ label: t.label, total: t.total, completed: t.completed, cancelled: t.cancelled, noShow: t.noShow, completionPct: t.total > 0 ? t.completed / t.total : 0 }))),
      error: () => this.done([])
    });
  }

  private loadRevenue(months: number) {
    this.setCols([
      { key: 'label', label: this.translate.instant('ADMIN.REPORTS.COL_MONTH') },
      { key: 'revenue', label: this.translate.instant('ADMIN.REPORTS.COL_REVENUE'), type: 'currency' },
      { key: 'appointmentCount', label: this.translate.instant('ADMIN.REPORTS.COL_APPOINTMENTS') },
      { key: 'avgPerAppt', label: this.translate.instant('ADMIN.REPORTS.COL_AVG_PER_VISIT'), type: 'currency' },
    ]);
    this.data.getMonthlyRevenue(months).subscribe({
      next: (r) => this.done(r.map(rv => ({ label: rv.label, revenue: rv.revenue, appointmentCount: rv.appointmentCount, avgPerAppt: rv.appointmentCount > 0 ? rv.revenue / rv.appointmentCount : 0 }))),
      error: () => this.done([])
    });
  }

  private loadDoctorPerformance(clinicId?: number) {
    this.setCols([
      { key: 'doctorName', label: this.translate.instant('ADMIN.REPORTS.COL_DOCTOR') },
      { key: 'specialtyName', label: this.translate.instant('ADMIN.REPORTS.COL_SPECIALTY') },
      { key: 'totalAppointments', label: this.translate.instant('COMMON.TOTAL') },
      { key: 'completedAppointments', label: this.translate.instant('ADMIN.REPORTS.COL_COMPLETED'), type: 'badge-success' },
      { key: 'cancelledAppointments', label: this.translate.instant('ADMIN.REPORTS.COL_CANCELLED'), type: 'badge-danger' },
      { key: 'revenue', label: this.translate.instant('ADMIN.REPORTS.COL_REVENUE'), type: 'currency' },
      { key: 'rating', label: this.translate.instant('COMMON.RATING'), type: 'rating' },
      { key: 'completionRate', label: this.translate.instant('ADMIN.REPORTS.COL_COMPLETE_PCT'), type: 'percent' },
    ]);
    this.data.getDoctorPerformance(clinicId).subscribe({
      next: (r) => this.done(r.map(d => ({ doctorName: d.doctorName, specialtyName: d.specialtyName, totalAppointments: d.totalAppointments, completedAppointments: d.completedAppointments, cancelledAppointments: d.cancelledAppointments, revenue: d.revenue, rating: d.rating, completionRate: d.completionRate }))),
      error: () => this.done([])
    });
  }

  private loadTopDoctors() {
    this.setCols([
      { key: 'rank', label: this.translate.instant('ADMIN.REPORTS.COL_RANK') },
      { key: 'doctorName', label: this.translate.instant('ADMIN.REPORTS.COL_DOCTOR') },
      { key: 'specialtyName', label: this.translate.instant('ADMIN.REPORTS.COL_SPECIALTY') },
      { key: 'rating', label: this.translate.instant('COMMON.RATING'), type: 'rating' },
      { key: 'completedAppointments', label: this.translate.instant('ADMIN.REPORTS.COL_COMPLETED'), type: 'badge-success' },
      { key: 'totalReviews', label: this.translate.instant('ADMIN.REPORTS.COL_REVIEWS') },
    ]);
    this.data.getTopDoctors(20).subscribe({
      next: (r) => this.done(r.map((d, i) => ({ rank: i + 1, doctorName: d.doctorName, specialtyName: d.specialtyName, rating: d.rating, completedAppointments: d.completedAppointments, totalReviews: d.totalReviews }))),
      error: () => this.done([])
    });
  }

  private loadSpecialtyStats() {
    this.setCols([
      { key: 'specialtyName', label: this.translate.instant('ADMIN.REPORTS.COL_SPECIALTY') },
      { key: 'doctorCount', label: this.translate.instant('ADMIN.REPORTS.COL_DOCTORS') },
      { key: 'appointmentCount', label: this.translate.instant('ADMIN.REPORTS.COL_APPOINTMENTS'), type: 'badge-info' },
      { key: 'revenue', label: this.translate.instant('ADMIN.REPORTS.COL_REVENUE'), type: 'currency' },
    ]);
    this.data.getSpecialtyStats().subscribe({
      next: (r) => this.done(r.map(s => ({ specialtyName: s.specialtyName, doctorCount: s.doctorCount, appointmentCount: s.appointmentCount, revenue: s.revenue }))),
      error: () => this.done([])
    });
  }

  private loadPatientTrends(months: number) {
    this.setCols([
      { key: 'label', label: this.translate.instant('ADMIN.REPORTS.COL_MONTH') },
      { key: 'count', label: this.translate.instant('ADMIN.REPORTS.COL_NEW_PATIENTS'), type: 'badge-info' },
    ]);
    this.data.getPatientTrends(months).subscribe({
      next: (r) => this.done(r.map(pt => ({ label: pt.label, count: pt.count }))),
      error: () => this.done([])
    });
  }

  private loadPeakHours() {
    this.setCols([
      { key: 'hour', label: this.translate.instant('ADMIN.HOUR') },
      { key: 'count', label: this.translate.instant('ADMIN.REPORTS.COL_APPOINTMENTS'), type: 'badge-info' },
    ]);
    this.data.getPeakHours().subscribe({
      next: (r) => this.done(r.map(ph => ({ hour: `${ph.hour}:00`, count: ph.count }))),
      error: () => this.done([])
    });
  }

  private loadDayOfWeek() {
    this.setCols([
      { key: 'dayName', label: this.translate.instant('ADMIN.DAY') },
      { key: 'count', label: this.translate.instant('ADMIN.REPORTS.COL_APPOINTMENTS'), type: 'badge-info' },
    ]);
    this.data.getDayOfWeekStats().subscribe({
      next: (r) => this.done(r.map(dw => ({ dayName: dw.dayName, count: dw.count }))),
      error: () => this.done([])
    });
  }

  private loadGenderDistribution() {
    this.setCols([
      { key: 'gender', label: this.translate.instant('ADMIN.GENDER') },
      { key: 'count', label: this.translate.instant('ADMIN.PATIENTS') },
      { key: 'pct', label: this.translate.instant('ADMIN.REPORTS.COL_PERCENTAGE'), type: 'percent' },
    ]);
    this.data.getGenderDistribution().subscribe({
      next: (r) => {
        const total = r.reduce((s, g) => s + g.count, 0);
        this.done(r.map(g => ({ gender: g.gender, count: g.count, pct: total > 0 ? g.count / total : 0 })));
      },
      error: () => this.done([])
    });
  }

  private loadAppointmentStatus(months: number, clinicId?: number) {
    this.setCols([
      { key: 'status', label: this.translate.instant('COMMON.STATUS') },
      { key: 'count', label: this.translate.instant('ADMIN.COUNT') },
      { key: 'pct', label: this.translate.instant('ADMIN.REPORTS.COL_PERCENTAGE'), type: 'percent' },
    ]);
    this.data.getAdminReport(months).subscribe({
      next: (r) => {
        const statuses = r.summary.appointmentsByStatus || [];
        const total = statuses.reduce((s, st) => s + st.count, 0);
        this.done(statuses.map(st => ({ status: st.status, count: st.count, pct: total > 0 ? st.count / total : 0 })));
      },
      error: () => this.done([])
    });
  }

  private loadClinicSummary(months: number, clinicId?: number) {
    if (clinicId && clinicId > 0) {
      this.setCols([
        { key: 'clinicName', label: this.translate.instant('ADMIN.CLINIC') },
        { key: 'totalDoctors', label: this.translate.instant('ADMIN.REPORTS.COL_DOCTORS') },
        { key: 'totalPatients', label: this.translate.instant('ADMIN.PATIENTS') },
        { key: 'totalAppointments', label: this.translate.instant('ADMIN.REPORTS.COL_APPOINTMENTS') },
        { key: 'appointmentsToday', label: this.translate.instant('ADMIN.REPORTS.COL_TODAY') },
        { key: 'appointmentsThisWeek', label: this.translate.instant('ADMIN.REPORTS.COL_THIS_WEEK') },
        { key: 'revenueThisMonth', label: this.translate.instant('ADMIN.REPORTS.COL_REVENUE_MONTH'), type: 'currency' },
        { key: 'completionRate', label: this.translate.instant('ADMIN.REPORTS.COL_COMPLETE_PCT'), type: 'percent' },
      ]);
      this.data.getClinicReport(clinicId, months).subscribe({
        next: (r) => {
          const s = r.summary;
          this.done([{ clinicName: s.clinicName, totalDoctors: s.totalDoctors, totalPatients: s.totalPatients, totalAppointments: s.totalAppointments, appointmentsToday: s.appointmentsToday, appointmentsThisWeek: s.appointmentsThisWeek, revenueThisMonth: s.revenueThisMonth, completionRate: s.completionRate }]);
        },
        error: () => this.done([])
      });
    } else {
      this.setCols([{ key: 'metric', label: this.translate.instant('ADMIN.REPORTS.COL_METRIC') }, { key: 'value', label: this.translate.instant('ADMIN.REPORTS.COL_VALUE') }]);
      this.data.getAdminReport(months).subscribe({
        next: (r) => this.done([
          { metric: this.translate.instant('ADMIN.REPORTS.METRIC_TOTAL_PATIENTS'), value: r.summary?.totalPatients },
          { metric: this.translate.instant('ADMIN.REPORTS.METRIC_TOTAL_DOCTORS'), value: r.summary?.totalDoctors },
          { metric: this.translate.instant('ADMIN.REPORTS.METRIC_TOTAL_CLINICS'), value: r.summary?.totalClinics },
          { metric: this.translate.instant('ADMIN.REPORTS.METRIC_TOTAL_APPTS'), value: r.summary?.totalAppointments },
          { metric: this.translate.instant('ADMIN.REPORTS.METRIC_APPTS_WEEK'), value: r.summary?.appointmentsThisWeek },
          { metric: this.translate.instant('ADMIN.REPORTS.METRIC_REVENUE_MONTH'), value: `${r.summary?.estimatedRevenueThisMonth?.toLocaleString() || 0} ${this.translate.instant('COMMON.CURRENCY')}` },
          { metric: this.translate.instant('ADMIN.REPORTS.METRIC_COMPLETION_RATE'), value: `${(r.summary?.completionRate || 0).toFixed(1)}%` },
          { metric: this.translate.instant('ADMIN.REPORTS.METRIC_NO_SHOW_RATE'), value: `${(r.summary?.noShowRate || 0).toFixed(1)}%` },
          { metric: this.translate.instant('ADMIN.REPORTS.METRIC_CANCELLATION_RATE'), value: `${(r.summary?.cancellationRate || 0).toFixed(1)}%` },
          { metric: this.translate.instant('ADMIN.REPORTS.METRIC_NEW_PATIENTS_MONTH'), value: r.summary?.newPatientsThisMonth },
          { metric: this.translate.instant('ADMIN.REPORTS.METRIC_AVG_FEE'), value: `${r.summary?.avgConsultationFee?.toLocaleString() || 0} ${this.translate.instant('COMMON.CURRENCY')}` },
        ]),
        error: () => this.done([])
      });
    }
  }

  windowPrint() {
    window.print();
  }

  exportExcel() {
    const rows = this.resultData();
    if (rows.length === 0) return;
    const cols = this.columns();
    const cleanRows = rows.map(row => {
      const clean: Record<string, any> = {};
      cols.forEach(col => {
        let val = row[col.key];
        if (col.type === 'currency') val = val != null ? Number(val) : 0;
        if (col.type === 'percent') val = val != null ? Number(val) : 0;
        if (col.type?.startsWith('badge')) val = String(val ?? '');
        clean[col.label] = val;
      });
      return clean;
    });
    const date = new Date().toISOString().slice(0, 10);
    const reportName = this.translate.instant('ADMIN.REPORTS.' + (this.selectedReport()?.label || ''));
    const fileSuffix = reportName.replace(/\s+/g, '_');
    this.excel.exportSingleSheet(`Shefaa_${fileSuffix}_${date}`, reportName, cleanRows);
  }
}
