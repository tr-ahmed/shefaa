import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DataService } from '../../core/services/data.service';
import { ExcelExportService, SheetData } from '../../core/services/excel-export.service';
import {
  ClinicReportDto, ClinicSummaryDto, DoctorPerformanceDto,
  AppointmentTrendDto, DayOfWeekStatsDto, PeakHourDto, StatusCountDto
} from '../../core/models';

@Component({
  selector: 'app-admin-clinic-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatSelectModule, FormsModule, TranslateModule],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ report()?.summary?.clinicName || 'My Clinic' }} — {{ 'ADMIN.DASHBOARD_TITLE' | translate }}</h1>
        <p class="page-subtitle">{{ today() }}</p>
      </div>
      <div class="flex items-center gap-3">
        <select [(ngModel)]="selectedMonths" (change)="reload()" class="input !w-auto">
          <option [value]="3">{{ 'ADMIN.LAST_3_MONTHS' | translate }}</option>
          <option [value]="6">{{ 'ADMIN.LAST_6_MONTHS' | translate }}</option>
          <option [value]="12">{{ 'ADMIN.LAST_12_MONTHS' | translate }}</option>
          <option [value]="24">{{ 'ADMIN.LAST_24_MONTHS' | translate }}</option>
        </select>
        <button (click)="exportExcel()" class="btn-primary" [disabled]="!report()">
          <mat-icon class="!text-[18px]">download</mat-icon>
          {{ 'ADMIN.EXPORT_EXCEL' | translate }}
        </button>
      </div>
    </div>

    <!-- ═══════════════ KPI Row 1: Core Metrics ═══════════════ -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="stat-card card-hover">
        <div class="stat-icon bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400">
          <mat-icon>wb_sunny</mat-icon>
        </div>
        <div>
          <div class="stat-label">{{ 'ADMIN.TODAY' | translate }}</div>
          <div class="stat-value">{{ cs()?.appointmentsToday ?? 0 }}</div>
        </div>
      </div>

      <div class="stat-card card-hover">
        <div class="stat-icon bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
          <mat-icon>date_range</mat-icon>
        </div>
        <div>
          <div class="stat-label">{{ 'ADMIN.THIS_WEEK' | translate }}</div>
          <div class="stat-value">{{ cs()?.appointmentsThisWeek ?? 0 }}</div>
        </div>
      </div>

      <div class="stat-card card-hover">
        <div class="stat-icon bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
          <mat-icon>payments</mat-icon>
        </div>
        <div>
          <div class="stat-label">{{ 'ADMIN.REVENUE_MONTH' | translate }}</div>
          <div class="stat-value text-emerald-600 dark:text-emerald-400">
            {{ cs()?.revenueThisMonth ?? 0 | number:'1.0-0' }} <span class="text-xs font-normal text-slate-400">{{ 'COMMON.CURRENCY' | translate }}</span>
          </div>
          <div class="text-xs mt-0.5" [class]="(cs()?.revenueGrowthPercent ?? 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'">
            <mat-icon class="text-[13px] align-middle">{{ (cs()?.revenueGrowthPercent ?? 0) >= 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
            {{ cs()?.revenueGrowthPercent ?? 0 }}% vs last month
          </div>
        </div>
      </div>

      <div class="stat-card card-hover">
        <div class="stat-icon bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400">
          <mat-icon>people</mat-icon>
        </div>
        <div>
          <div class="stat-label">{{ 'ADMIN.TOTAL_PATIENTS' | translate }}</div>
          <div class="stat-value">{{ cs()?.totalPatients ?? 0 }}</div>
          <div class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">+{{ cs()?.newPatientsThisMonth ?? 0 }} {{ 'ADMIN.THIS_MONTH_LOWER' | translate }}</div>
        </div>
      </div>
    </div>

    <!-- ═══════════════ KPI Row 2: Rates ═══════════════ -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div class="stat-card card-hover">
        <div>
          <div class="stat-label">{{ 'ADMIN.COMPLETION_RATE' | translate }}</div>
          <div class="stat-value text-emerald-600 dark:text-emerald-400">{{ cs()?.completionRate ?? 0 }}%</div>
          <div class="mt-2 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div class="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all duration-500" [style.width.%]="cs()?.completionRate ?? 0"></div>
          </div>
        </div>
      </div>

      <div class="stat-card card-hover">
        <div>
          <div class="stat-label">{{ 'ADMIN.NOSHOW_RATE' | translate }}</div>
          <div class="stat-value text-red-600 dark:text-red-400">{{ cs()?.noShowRate ?? 0 }}%</div>
          <div class="mt-2 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div class="h-full bg-red-500 dark:bg-red-400 rounded-full transition-all duration-500" [style.width.%]="cs()?.noShowRate ?? 0"></div>
          </div>
        </div>
      </div>

      <div class="stat-card card-hover">
        <div>
          <div class="stat-label">{{ 'ADMIN.TOTAL_DOCTORS' | translate }}</div>
          <div class="stat-value">{{ cs()?.totalDoctors ?? 0 }}</div>
          <div class="text-xs text-slate-400 dark:text-slate-500 mt-1">{{ cs()?.totalAppointments ?? 0 }} {{ 'ADMIN.TOTAL_APPTS_LOWER' | translate }}</div>
        </div>
      </div>
    </div>

    <!-- ═══════════════ Row: Doctor Performance + Status Breakdown ═══════════════ -->
    <div class="grid lg:grid-cols-3 gap-6 mb-6">
      <!-- Doctor Performance -->
      <div class="lg:col-span-2 card p-6">
        <h3 class="font-semibold text-lg text-slate-900 dark:text-white mb-5">{{ 'ADMIN.DOCTOR_PERFORMANCE' | translate }}</h3>
        <div *ngIf="report()?.doctorPerformance?.length === 0" class="empty-state">{{ 'ADMIN.NO_DOCTOR_DATA' | translate }}</div>
        <div *ngIf="report()?.doctorPerformance?.length" class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <th class="pb-3 pr-4 font-semibold">{{ 'ADMIN.DOCTOR' | translate }}</th>
                <th class="pb-3 pr-4 text-center font-semibold">{{ 'ADMIN.TOTAL' | translate }}</th>
                <th class="pb-3 pr-4 text-center font-semibold">{{ 'ADMIN.COMPLETED' | translate }}</th>
                <th class="pb-3 pr-4 text-center font-semibold">{{ 'ADMIN.CANCELLED' | translate }}</th>
                <th class="pb-3 pr-4 text-center font-semibold">{{ 'ADMIN.RATE' | translate }}</th>
                <th class="pb-3 pr-4 text-right font-semibold">{{ 'ADMIN.REVENUE' | translate }}</th>
                <th class="pb-3 text-right font-semibold">{{ 'ADMIN.RATING' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let d of report()!.doctorPerformance" class="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <td class="py-3 pr-4">
                  <div class="font-semibold text-slate-900 dark:text-white">{{ d.doctorName }}</div>
                  <div class="text-xs text-slate-400 dark:text-slate-500">{{ d.specialtyName }}</div>
                </td>
                <td class="py-3 pr-4 text-center font-medium text-slate-700 dark:text-slate-200">{{ d.totalAppointments }}</td>
                <td class="py-3 pr-4 text-center">
                  <span class="badge-success">{{ d.completedAppointments }}</span>
                </td>
                <td class="py-3 pr-4 text-center">
                  <span class="badge-danger">{{ d.cancelledAppointments }}</span>
                </td>
                <td class="py-3 pr-4 text-center">
                  <span class="inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold"
                        [class]="d.completionRate >= 80 ? 'badge-success' : d.completionRate >= 50 ? 'badge-warning' : 'badge-danger'">
                    {{ d.completionRate }}%
                  </span>
                </td>
                <td class="py-3 pr-4 text-right font-semibold text-slate-700 dark:text-slate-200">{{ d.revenue | number:'1.0-0' }} <span class="text-xs text-slate-400">{{ 'COMMON.CURRENCY' | translate }}</span></td>
                <td class="py-3 text-right">
                  <span class="flex items-center gap-0.5 justify-end text-xs text-amber-500">
                    <mat-icon class="text-[12px]">star</mat-icon>
                    {{ d.rating ?? '—' }}
                    <span class="text-slate-400 dark:text-slate-500">({{ d.totalReviews }})</span>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Status Breakdown -->
      <div class="card p-6">
        <h3 class="font-semibold text-lg text-slate-900 dark:text-white mb-5">{{ 'ADMIN.BY_STATUS' | translate }}</h3>
        <div class="space-y-4">
          <div *ngFor="let st of statusDisplay()">
            <div class="flex items-center justify-between mb-1.5">
              <div class="flex items-center gap-2.5">
                <span class="w-3 h-3 rounded-full shadow-sm" [style.background]="st.color"></span>
                <span class="text-sm font-medium text-slate-700 dark:text-slate-200">{{ st.label }}</span>
              </div>
              <span class="text-sm font-bold text-slate-900 dark:text-white">{{ st.count }}</span>
            </div>
            <div class="h-2.5 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-500" [style.width.%]="st.pct" [style.background]="st.color"></div>
            </div>
            <div class="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 text-right">{{ st.pct }}%</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════ Row: Appointment Trends + Revenue ═══════════════ -->
    <div class="grid lg:grid-cols-2 gap-6 mb-6">
      <!-- Appointment Trends -->
      <div class="card p-6">
        <h3 class="font-semibold text-lg text-slate-900 dark:text-white mb-5">{{ 'ADMIN.APPT_TRENDS' | translate }}</h3>
        <div *ngIf="report()?.appointmentTrends?.length === 0" class="empty-state">{{ 'COMMON.NO_DATA' | translate }}</div>
        <div *ngIf="report()?.appointmentTrends?.length" class="space-y-4">
          <div *ngFor="let t of report()!.appointmentTrends">
            <div class="flex items-center justify-between text-xs mb-1.5">
              <span class="text-slate-700 dark:text-slate-200 font-medium">{{ t.label }}</span>
              <span class="text-slate-400 dark:text-slate-500">{{ t.total }} total</span>
            </div>
            <div class="flex h-6 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700/50 gap-px">
              <div class="bg-emerald-500 transition-all duration-300" [style.width.%]="t.total > 0 ? (t.completed / maxTrend() * 100) : 0"></div>
              <div class="bg-blue-400 transition-all duration-300" [style.width.%]="t.total > 0 ? ((t.total - t.completed - t.cancelled - t.noShow) / maxTrend() * 100) : 0"></div>
              <div class="bg-red-400 transition-all duration-300" [style.width.%]="t.total > 0 ? (t.cancelled / maxTrend() * 100) : 0"></div>
              <div class="bg-orange-400 transition-all duration-300" [style.width.%]="t.total > 0 ? (t.noShow / maxTrend() * 100) : 0"></div>
            </div>
            <div class="flex gap-4 mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">
              <span class="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{{ t.completed }}</span>
              <span class="text-red-500 dark:text-red-400 flex items-center gap-0.5"><span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>{{ t.cancelled }}</span>
              <span class="text-orange-500 dark:text-orange-400 flex items-center gap-0.5"><span class="w-1.5 h-1.5 rounded-full bg-orange-400"></span>{{ t.noShow }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Revenue -->
      <div class="card p-6">
        <h3 class="font-semibold text-lg text-slate-900 dark:text-white mb-5">{{ 'ADMIN.MONTHLY_REVENUE' | translate }}</h3>
        <div *ngIf="report()?.revenueByMonth?.length === 0" class="empty-state">{{ 'COMMON.NO_DATA' | translate }}</div>
        <div *ngIf="report()?.revenueByMonth?.length" class="space-y-3">
          <div *ngFor="let r of report()!.revenueByMonth" class="flex items-center gap-3">
            <div class="w-20 text-xs text-slate-500 dark:text-slate-400 font-semibold">{{ r.label }}</div>
            <div class="flex-1 h-4 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500" [style.width.%]="(r.revenue / maxRevenue() * 100) || 0"></div>
            </div>
            <div class="text-xs font-bold w-28 text-right text-slate-700 dark:text-slate-200">{{ r.revenue | number:'1.0-0' }} <span class="text-slate-400">{{ 'COMMON.CURRENCY' | translate }}</span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════ Row: Day of Week + Peak Hours ═══════════════ -->
    <div class="grid lg:grid-cols-2 gap-6 mb-6">
      <div class="card p-6">
        <h3 class="font-semibold text-lg text-slate-900 dark:text-white mb-5">{{ 'ADMIN.APPTS_BY_DAY' | translate }}</h3>
        <div *ngIf="report()?.dayOfWeekStats?.length === 0" class="empty-state">{{ 'COMMON.NO_DATA' | translate }}</div>
        <div *ngIf="report()?.dayOfWeekStats?.length" class="space-y-3">
          <div *ngFor="let d of report()!.dayOfWeekStats" class="flex items-center gap-3">
            <div class="w-16 text-xs text-slate-600 dark:text-slate-300 font-semibold">{{ d.dayName | slice:0:3 }}</div>
            <div class="flex-1 h-5 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full transition-all duration-500" [style.width.%]="(d.count / maxDay() * 100) || 0"></div>
            </div>
            <span class="text-xs font-bold w-8 text-right text-slate-700 dark:text-slate-200">{{ d.count }}</span>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <h3 class="font-semibold text-lg text-slate-900 dark:text-white mb-5">{{ 'ADMIN.PEAK_HOURS' | translate }}</h3>
        <div *ngIf="report()?.peakHours?.length === 0" class="empty-state">{{ 'COMMON.NO_DATA' | translate }}</div>
        <div *ngIf="report()?.peakHours?.length" class="grid grid-cols-4 gap-2">
          <div *ngFor="let h of report()!.peakHours"
               class="text-center p-2.5 rounded-xl text-[11px] font-semibold transition-all duration-200"
               [class]="peakHourBg(h)">
            <div>{{ h.hour }}:00</div>
            <div class="text-[9px] opacity-70 mt-0.5">{{ h.count }}</div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminClinicDashboardComponent implements OnInit {
  private data = inject(DataService);
  private excel = inject(ExcelExportService);
  private translate = inject(TranslateService);

  report = signal<ClinicReportDto | null>(null);
  cs = signal<ClinicSummaryDto | null>(null);
  selectedMonths = 6;

  ngOnInit() { this.reload(); }

  reload() {
    this.data.getClinicReport(undefined, this.selectedMonths).subscribe(r => {
      this.report.set(r);
      this.cs.set(r.summary);
    });
  }

  exportExcel() {
    const r = this.report();
    if (!r) return;
    const sheets: SheetData[] = [];

    sheets.push({
      name: this.t('ADMIN.EXPORT_SHEET_SUMMARY'),
      rows: [{
        [this.t('ADMIN.CLINIC')]: r.summary.clinicName,
        [this.t('ADMIN.TOTAL_DOCTORS')]: r.summary.totalDoctors,
        [this.t('ADMIN.TOTAL_PATIENTS')]: r.summary.totalPatients,
        [this.t('ADMIN.TOTAL_APPOINTMENTS')]: r.summary.totalAppointments,
        [this.t('ADMIN.TODAY')]: r.summary.appointmentsToday,
        [this.t('ADMIN.THIS_WEEK')]: r.summary.appointmentsThisWeek,
        [this.t('ADMIN.REVENUE_MONTH')]: r.summary.revenueThisMonth,
        [this.t('ADMIN.REVENUE_LAST_MONTH')]: r.summary.revenueLastMonth,
        [this.t('ADMIN.REVENUE_GROWTH') + ' (%)']: r.summary.revenueGrowthPercent,
        [this.t('ADMIN.NEW_PATIENTS_MONTH')]: r.summary.newPatientsThisMonth,
        [this.t('ADMIN.COMPLETION_RATE') + ' (%)']: r.summary.completionRate,
        [this.t('ADMIN.NO_SHOW_RATE') + ' (%)']: r.summary.noShowRate
      }]
    });

    if (r.doctorPerformance.length > 0) {
      sheets.push({
        name: this.t('ADMIN.DOCTOR_PERFORMANCE'),
        rows: r.doctorPerformance.map(d => ({
          [this.t('ADMIN.DOCTOR')]: d.doctorName,
          [this.t('ADMIN.SPECIALTY')]: d.specialtyName,
          [this.t('ADMIN.TOTAL')]: d.totalAppointments,
          [this.t('ADMIN.COMPLETION')]: d.completedAppointments,
          [this.t('ADMIN.CANCELLED')]: d.cancelledAppointments,
          [this.t('ADMIN.COMPLETION_RATE') + ' (%)']: d.completionRate,
          [this.t('ADMIN.REVENUE') + ' (' + this.t('COMMON.CURRENCY') + ')']: d.revenue,
          [this.t('ADMIN.RATING')]: d.rating,
          [this.t('ADMIN.REVIEWS')]: d.totalReviews
        }))
      });
    }

    if (r.appointmentTrends.length > 0) {
      sheets.push({
        name: this.t('ADMIN.APPOINTMENT_TRENDS'),
        rows: r.appointmentTrends.map(t => ({
          [this.t('COMMON.DATE')]: t.label,
          [this.t('ADMIN.TOTAL')]: t.total,
          [this.t('ADMIN.COMPLETION')]: t.completed,
          [this.t('ADMIN.CANCELLED')]: t.cancelled,
          [this.t('ADMIN.NO_SHOW')]: t.noShow
        }))
      });
    }

    if (r.revenueByMonth.length > 0) {
      sheets.push({
        name: this.t('ADMIN.MONTHLY_REVENUE'),
        rows: r.revenueByMonth.map(rv => ({
          [this.t('COMMON.DATE')]: rv.label,
          [this.t('ADMIN.REVENUE') + ' (' + this.t('COMMON.CURRENCY') + ')']: rv.revenue,
          [this.t('ADMIN.APPOINTMENTS_COUNT')]: rv.appointmentCount
        }))
      });
    }

    if (r.appointmentsByStatus.length > 0) {
      sheets.push({
        name: this.t('ADMIN.BY_STATUS'),
        rows: r.appointmentsByStatus.map(st => ({
          [this.t('ADMIN.STATUS')]: st.status,
          [this.t('ADMIN.COUNT')]: st.count
        }))
      });
    }

    if (r.dayOfWeekStats.length > 0) {
      sheets.push({
        name: this.t('ADMIN.DAY_OF_WEEK'),
        rows: r.dayOfWeekStats.map(dw => ({
          [this.t('ADMIN.DAY')]: dw.dayName,
          [this.t('ADMIN.APPOINTMENTS_COUNT')]: dw.count
        }))
      });
    }

    if (r.peakHours.length > 0) {
      sheets.push({
        name: this.t('ADMIN.PEAK_HOURS'),
        rows: r.peakHours.map(ph => ({
          [this.t('ADMIN.HOUR')]: ph.hour + ':00',
          [this.t('ADMIN.APPOINTMENTS_COUNT')]: ph.count
        }))
      });
    }

    const date = new Date().toISOString().slice(0, 10);
    const clinicName = r.summary.clinicName?.replace(/[^a-zA-Z0-9]/g, '_') || 'Clinic';
    this.excel.exportMultiSheet(`Shefaa_${clinicName}_${date}`, sheets);
  }

  private t(key: string): string { return this.translate.instant(key); }

  today() { return new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); }

  maxTrend() { return Math.max(1, ...(this.report()?.appointmentTrends?.map(t => t.total) ?? [1])); }
  maxRevenue() { return Math.max(1, ...(this.report()?.revenueByMonth?.map(r => r.revenue) ?? [1])); }
  maxDay() { return Math.max(1, ...(this.report()?.dayOfWeekStats?.map(d => d.count) ?? [1])); }

  peakHourBg(h: PeakHourDto) {
    const max = Math.max(1, ...(this.report()?.peakHours?.map(x => x.count) ?? [1]));
    const i = h.count / max;
    if (i > 0.75) return 'bg-primary-600 text-white shadow-md';
    if (i > 0.5) return 'bg-primary-300 text-primary-900 dark:bg-primary-700 dark:text-primary-100';
    if (i > 0.25) return 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300';
    return 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500';
  }

  statusDisplay() {
    const byStatus = this.report()?.appointmentsByStatus ?? [];
    const total = this.cs()?.totalAppointments ?? 1;
    const colors: Record<string, string> = {
      'Pending': '#f59e0b', 'Confirmed': '#3b82f6', 'CheckedIn': '#06b6d4',
      'InProgress': '#8b5cf6', 'Completed': '#10b981', 'Cancelled': '#ef4444',
      'NoShow': '#f97316', 'Rescheduled': '#6366f1'
    };
    const labels: Record<string, string> = {
      'Pending': 'Pending', 'Confirmed': 'Confirmed', 'CheckedIn': 'Checked In',
      'InProgress': 'In Progress', 'Completed': 'Completed', 'Cancelled': 'Cancelled',
      'NoShow': 'No Show', 'Rescheduled': 'Rescheduled'
    };
    return byStatus.map(st => ({
      label: labels[st.status] ?? st.status, count: st.count,
      color: colors[st.status] ?? '#6b7280',
      pct: total > 0 ? Math.round(st.count / total * 100) : 0
    })).sort((a, b) => b.count - a.count);
  }
}
