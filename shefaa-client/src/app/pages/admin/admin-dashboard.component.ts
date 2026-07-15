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
  AdminReportDto, DashboardSummaryDto, AppointmentTrendDto,
  SpecialtyStatsDto, PeakHourDto, DayOfWeekStatsDto, TopDoctorDto,
  RevenueByMonthDto, PatientRegistrationTrendDto, GenderDistributionDto
} from '../../core/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatSelectModule, FormsModule, TranslateModule],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ 'ADMIN.DASHBOARD_TITLE' | translate }}</h1>
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

    <!-- ═══════════════ KPI Row 1: Core Counts ═══════════════ -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="stat-card card-hover">
        <div class="stat-icon bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">
          <mat-icon>people</mat-icon>
        </div>
        <div>
          <div class="stat-label">{{ 'ADMIN.TOTAL_PATIENTS' | translate }}</div>
          <div class="stat-value">{{ s()?.totalPatients ?? '—' }}</div>
          <div class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">+{{ s()?.newPatientsThisMonth ?? 0 }} {{ 'ADMIN.THIS_MONTH_LOWER' | translate }}</div>
        </div>
      </div>

      <div class="stat-card card-hover">
        <div class="stat-icon bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
          <mat-icon>medical_information</mat-icon>
        </div>
        <div>
          <div class="stat-label">{{ 'ADMIN.TOTAL_DOCTORS' | translate }}</div>
          <div class="stat-value">{{ s()?.totalDoctors ?? '—' }}</div>
          <div class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">+{{ s()?.newDoctorsThisMonth ?? 0 }} {{ 'ADMIN.THIS_MONTH_LOWER' | translate }}</div>
        </div>
      </div>

      <div class="stat-card card-hover">
        <div class="stat-icon bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
          <mat-icon>local_hospital</mat-icon>
        </div>
        <div>
          <div class="stat-label">{{ 'ADMIN.TOTAL_CLINICS' | translate }}</div>
          <div class="stat-value">{{ s()?.totalClinics ?? '—' }}</div>
        </div>
      </div>

      <div class="stat-card card-hover">
        <div class="stat-icon bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
          <mat-icon>event</mat-icon>
        </div>
        <div>
          <div class="stat-label">{{ 'ADMIN.TOTAL_APPOINTMENTS' | translate }}</div>
          <div class="stat-value">{{ s()?.totalAppointments ?? '—' }}</div>
        </div>
      </div>
    </div>

    <!-- ═══════════════ KPI Row 2: Time-Based + Revenue ═══════════════ -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="stat-card card-hover">
        <div class="stat-icon bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400">
          <mat-icon>wb_sunny</mat-icon>
        </div>
        <div>
          <div class="stat-label">{{ 'ADMIN.TODAY' | translate }}</div>
          <div class="stat-value">{{ s()?.appointmentsToday ?? 0 }}</div>
        </div>
      </div>

      <div class="stat-card card-hover">
        <div class="stat-icon bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
          <mat-icon>date_range</mat-icon>
        </div>
        <div>
          <div class="stat-label">{{ 'ADMIN.THIS_WEEK' | translate }}</div>
          <div class="stat-value">{{ s()?.appointmentsThisWeek ?? 0 }}</div>
        </div>
      </div>

      <div class="stat-card card-hover">
        <div class="stat-icon bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
          <mat-icon>calendar_month</mat-icon>
        </div>
        <div>
          <div class="stat-label">{{ 'ADMIN.THIS_MONTH' | translate }}</div>
          <div class="stat-value">{{ s()?.appointmentsThisMonth ?? 0 }}</div>
        </div>
      </div>

      <div class="stat-card card-hover">
        <div class="stat-icon bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
          <mat-icon>payments</mat-icon>
        </div>
        <div>
          <div class="stat-label">{{ 'ADMIN.REVENUE_MONTH' | translate }}</div>
          <div class="stat-value text-emerald-600 dark:text-emerald-400">
            {{ s()?.estimatedRevenueThisMonth ?? 0 | number }} <span class="text-xs font-normal text-slate-400">{{ 'COMMON.CURRENCY' | translate }}</span>
          </div>
          <div class="text-xs mt-0.5" [class]="(s()?.revenueGrowthPercent ?? 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'">
            <mat-icon class="text-[13px] align-middle">{{ (s()?.revenueGrowthPercent ?? 0) >= 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
            {{ s()?.revenueGrowthPercent ?? 0 }}% vs last month
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════ KPI Row 3: Rates ═══════════════ -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="stat-card card-hover">
        <div class="stat-icon bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
          <mat-icon>monetization_on</mat-icon>
        </div>
        <div>
          <div class="stat-label">{{ 'ADMIN.AVG_FEE' | translate }}</div>
          <div class="stat-value">{{ s()?.avgConsultationFee ?? 0 | number:'1.0-0' }} <span class="text-xs font-normal text-slate-400">{{ 'COMMON.CURRENCY' | translate }}</span></div>
        </div>
      </div>

      <div class="stat-card card-hover">
        <div>
          <div class="stat-label">{{ 'ADMIN.COMPLETION_RATE' | translate }}</div>
          <div class="stat-value text-emerald-600 dark:text-emerald-400">{{ s()?.completionRate ?? 0 }}%</div>
          <div class="mt-2 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div class="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all duration-500" [style.width.%]="s()?.completionRate ?? 0"></div>
          </div>
        </div>
      </div>

      <div class="stat-card card-hover">
        <div>
          <div class="stat-label">{{ 'ADMIN.NOSHOW_RATE' | translate }}</div>
          <div class="stat-value text-red-600 dark:text-red-400">{{ s()?.noShowRate ?? 0 }}%</div>
          <div class="mt-2 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div class="h-full bg-red-500 dark:bg-red-400 rounded-full transition-all duration-500" [style.width.%]="s()?.noShowRate ?? 0"></div>
          </div>
        </div>
      </div>

      <div class="stat-card card-hover">
        <div>
          <div class="stat-label">{{ 'ADMIN.CANCEL_RATE' | translate }}</div>
          <div class="stat-value text-amber-600 dark:text-amber-400">{{ s()?.cancellationRate ?? 0 }}%</div>
          <div class="mt-2 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div class="h-full bg-amber-500 dark:bg-amber-400 rounded-full transition-all duration-500" [style.width.%]="s()?.cancellationRate ?? 0"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════ Row: Appointment Trends + Status Breakdown ═══════════════ -->
    <div class="grid lg:grid-cols-3 gap-6 mb-6">
      <!-- Appointment Trends -->
      <div class="lg:col-span-2 card p-6">
        <h3 class="font-semibold text-lg text-slate-900 dark:text-white mb-5">{{ 'ADMIN.APPT_TRENDS' | translate }}</h3>
        <div *ngIf="report()?.appointmentTrends?.length === 0" class="empty-state">{{ 'COMMON.NO_DATA' | translate }}</div>
        <div *ngIf="report()?.appointmentTrends?.length" class="space-y-4">
          <div *ngFor="let t of report()!.appointmentTrends" class="group">
            <div class="flex items-center justify-between text-xs mb-1.5">
              <span class="text-slate-700 dark:text-slate-200 font-medium">{{ t.label }}</span>
              <span class="text-slate-400 dark:text-slate-500">{{ t.total }} total</span>
            </div>
            <div class="flex h-6 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700/50 gap-px">
              <div class="bg-emerald-500 transition-all duration-300" [style.width.%]="t.total > 0 ? (t.completed / maxTrendTotal() * 100) : 0" [title]="'Completed: ' + t.completed"></div>
              <div class="bg-blue-400 transition-all duration-300" [style.width.%]="t.total > 0 ? ((t.total - t.completed - t.cancelled - t.noShow) / maxTrendTotal() * 100) : 0" title="Other statuses"></div>
              <div class="bg-red-400 transition-all duration-300" [style.width.%]="t.total > 0 ? (t.cancelled / maxTrendTotal() * 100) : 0" [title]="'Cancelled: ' + t.cancelled"></div>
              <div class="bg-orange-400 transition-all duration-300" [style.width.%]="t.total > 0 ? (t.noShow / maxTrendTotal() * 100) : 0" [title]="'No-Show: ' + t.noShow"></div>
            </div>
            <div class="flex gap-4 mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">
              <span class="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{{ t.completed }} {{ 'ADMIN.COMPLETED_LOWER' | translate }}</span>
              <span class="text-red-500 dark:text-red-400 flex items-center gap-0.5"><span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>{{ t.cancelled }} {{ 'ADMIN.CANCELLED_LOWER' | translate }}</span>
              <span class="text-orange-500 dark:text-orange-400 flex items-center gap-0.5"><span class="w-1.5 h-1.5 rounded-full bg-orange-400"></span>{{ t.noShow }} {{ 'ADMIN.NOSHOW_LOWER' | translate }}</span>
            </div>
          </div>
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

    <!-- ═══════════════ Row: Revenue + Top Doctors ═══════════════ -->
    <div class="grid lg:grid-cols-2 gap-6 mb-6">
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

      <div class="card p-6">
        <h3 class="font-semibold text-lg text-slate-900 dark:text-white mb-5">{{ 'ADMIN.TOP_DOCTORS' | translate }}</h3>
        <div *ngIf="report()?.topDoctors?.length === 0" class="empty-state">{{ 'COMMON.NO_DATA' | translate }}</div>
        <div *ngIf="report()?.topDoctors?.length" class="space-y-1">
          <div *ngFor="let d of report()!.topDoctors; let i = index"
               class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
            <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                 [class]="i === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' : i === 1 ? 'bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-300' : i === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'">
              {{ i + 1 }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-sm text-slate-900 dark:text-white truncate">{{ d.doctorName }}</div>
              <div class="text-xs text-slate-500 dark:text-slate-400">{{ d.specialtyName }}</div>
            </div>
            <div class="text-right shrink-0">
              <div class="text-sm font-bold text-slate-900 dark:text-white">{{ d.completedAppointments }}</div>
              <div class="flex items-center gap-0.5 text-xs text-amber-500 justify-end">
                <mat-icon class="text-[12px]">star</mat-icon>
                {{ d.rating ?? '—' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════ Row: Specialty Distribution + Day of Week ═══════════════ -->
    <div class="grid lg:grid-cols-2 gap-6 mb-6">
      <div class="card p-6">
        <h3 class="font-semibold text-lg text-slate-900 dark:text-white mb-5">{{ 'ADMIN.SPECIALTY_DIST' | translate }}</h3>
        <div *ngIf="report()?.specialtyStats?.length === 0" class="empty-state">{{ 'COMMON.NO_DATA' | translate }}</div>
        <div *ngIf="report()?.specialtyStats?.length" class="space-y-4">
          <div *ngFor="let sp of report()!.specialtyStats">
            <div class="flex items-center justify-between text-sm mb-1.5">
              <span class="text-slate-700 dark:text-slate-200 font-medium">{{ sp.specialtyName }}</span>
              <span class="text-slate-500 dark:text-slate-400 text-xs">{{ sp.doctorCount }} {{ 'ADMIN.DOCTORS_LOWER' | translate }} · {{ sp.appointmentCount }} {{ 'ADMIN.APPTS_LOWER' | translate }}</span>
            </div>
            <div class="h-2.5 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-blue-500 to-primary-500 rounded-full transition-all duration-500" [style.width.%]="(sp.appointmentCount / maxSpecialtyAppts() * 100) || 0"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <h3 class="font-semibold text-lg text-slate-900 dark:text-white mb-5">{{ 'ADMIN.APPTS_BY_DAY' | translate }}</h3>
        <div *ngIf="report()?.dayOfWeekStats?.length === 0" class="empty-state">{{ 'COMMON.NO_DATA' | translate }}</div>
        <div *ngIf="report()?.dayOfWeekStats?.length" class="space-y-3">
          <div *ngFor="let d of report()!.dayOfWeekStats" class="flex items-center gap-3">
            <div class="w-16 text-xs text-slate-600 dark:text-slate-300 font-semibold">{{ d.dayName | slice:0:3 }}</div>
            <div class="flex-1 h-5 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full transition-all duration-500" [style.width.%]="(d.count / maxDayCount() * 100) || 0"></div>
            </div>
            <span class="text-xs font-bold w-8 text-right text-slate-700 dark:text-slate-200">{{ d.count }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════ Row: Peak Hours + Gender + Patient Trends ═══════════════ -->
    <div class="grid lg:grid-cols-3 gap-6 mb-6">
      <!-- Peak Hours Heatmap -->
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

      <!-- Gender Distribution -->
      <div class="card p-6">
        <h3 class="font-semibold text-lg text-slate-900 dark:text-white mb-5">{{ 'ADMIN.PATIENT_GENDER' | translate }}</h3>
        <div *ngIf="report()?.genderDistribution?.length === 0" class="empty-state">{{ 'COMMON.NO_DATA' | translate }}</div>
        <div *ngIf="report()?.genderDistribution?.length" class="space-y-4">
          <div *ngFor="let g of report()!.genderDistribution" class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30">
            <div class="w-11 h-11 rounded-full flex items-center justify-center"
                 [class]="g.gender === 'Male' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300' : g.gender === 'Female' ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/50 dark:text-pink-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'">
              <mat-icon>{{ g.gender === 'Male' ? 'male' : g.gender === 'Female' ? 'female' : 'person' }}</mat-icon>
            </div>
            <div class="flex-1">
              <div class="text-sm font-semibold text-slate-900 dark:text-white">{{ g.gender }}</div>
              <div class="text-xs text-slate-500 dark:text-slate-400">{{ g.count }} patients</div>
            </div>
            <div class="text-xl font-bold text-slate-900 dark:text-white">{{ genderPct(g) }}%</div>
          </div>
        </div>
      </div>

      <!-- Patient Registration Trends -->
      <div class="card p-6">
        <h3 class="font-semibold text-lg text-slate-900 dark:text-white mb-5">{{ 'ADMIN.PATIENT_REGS' | translate }}</h3>
        <div *ngIf="report()?.patientTrends?.length === 0" class="empty-state">{{ 'COMMON.NO_DATA' | translate }}</div>
        <div *ngIf="report()?.patientTrends?.length" class="space-y-3">
          <div *ngFor="let p of report()!.patientTrends" class="flex items-center gap-3">
            <div class="w-16 text-xs text-slate-500 dark:text-slate-400 font-semibold">{{ p.label }}</div>
            <div class="flex-1 h-4 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-violet-500 to-primary-500 rounded-full transition-all duration-500" [style.width.%]="(p.count / maxPatientReg() * 100) || 0"></div>
            </div>
            <span class="text-xs font-bold w-8 text-right text-slate-700 dark:text-slate-200">{{ p.count }}</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private data = inject(DataService);
  private excel = inject(ExcelExportService);
  private translate = inject(TranslateService);

  report = signal<AdminReportDto | null>(null);
  s = signal<DashboardSummaryDto | null>(null);
  selectedMonths = 6;

  ngOnInit() { this.reload(); }

  reload() {
    this.data.getAdminReport(this.selectedMonths).subscribe(r => {
      this.report.set(r);
      this.s.set(r.summary);
    });
  }

  exportExcel() {
    const r = this.report();
    if (!r) return;
    const sheets: SheetData[] = [];

    sheets.push({
      name: this.t('ADMIN.EXPORT_SHEET_SUMMARY'),
      rows: [{
        [this.t('ADMIN.TOTAL_PATIENTS')]: r.summary.totalPatients,
        [this.t('ADMIN.TOTAL_DOCTORS')]: r.summary.totalDoctors,
        [this.t('ADMIN.TOTAL_CLINICS')]: r.summary.totalClinics,
        [this.t('ADMIN.TOTAL_APPOINTMENTS')]: r.summary.totalAppointments,
        [this.t('ADMIN.APPOINTMENTS_THIS_WEEK')]: r.summary.appointmentsThisWeek,
        [this.t('ADMIN.THIS_MONTH')]: r.summary.appointmentsThisMonth,
        [this.t('ADMIN.REVENUE_MONTH')]: r.summary.estimatedRevenueThisMonth,
        [this.t('ADMIN.REVENUE_LAST_MONTH')]: r.summary.estimatedRevenueLastMonth,
        [this.t('ADMIN.REVENUE_GROWTH') + ' (%)']: r.summary.revenueGrowthPercent,
        [this.t('ADMIN.NEW_PATIENTS_MONTH')]: r.summary.newPatientsThisMonth,
        [this.t('ADMIN.AVG_FEE') + ' (' + this.t('COMMON.CURRENCY') + ')']: r.summary.avgConsultationFee,
        [this.t('ADMIN.COMPLETION_RATE') + ' (%)']: r.summary.completionRate,
        [this.t('ADMIN.NO_SHOW_RATE') + ' (%)']: r.summary.noShowRate,
        [this.t('ADMIN.CANCELLATION_RATE') + ' (%)']: r.summary.cancellationRate
      }]
    });

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

    if (r.specialtyStats.length > 0) {
      sheets.push({
        name: this.t('ADMIN.SPECIALTY_PERFORMANCE'),
        rows: r.specialtyStats.map(s => ({
          [this.t('ADMIN.SPECIALTY')]: s.specialtyName,
          [this.t('ADMIN.DOCTORS_COUNT')]: s.doctorCount,
          [this.t('ADMIN.APPOINTMENTS_COUNT')]: s.appointmentCount,
          [this.t('ADMIN.REVENUE') + ' (' + this.t('COMMON.CURRENCY') + ')']: s.revenue
        }))
      });
    }

    if (r.patientTrends.length > 0) {
      sheets.push({
        name: this.t('ADMIN.PATIENT_REGISTRATIONS'),
        rows: r.patientTrends.map(pt => ({
          [this.t('COMMON.DATE')]: pt.label,
          [this.t('ADMIN.PATIENTS')]: pt.count
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

    if (r.dayOfWeekStats.length > 0) {
      sheets.push({
        name: this.t('ADMIN.DAY_OF_WEEK'),
        rows: r.dayOfWeekStats.map(dw => ({
          [this.t('ADMIN.DAY')]: dw.dayName,
          [this.t('ADMIN.APPOINTMENTS_COUNT')]: dw.count
        }))
      });
    }

    if (r.genderDistribution.length > 0) {
      sheets.push({
        name: this.t('ADMIN.GENDER_DISTRIBUTION'),
        rows: r.genderDistribution.map(g => ({
          [this.t('ADMIN.GENDER')]: g.gender,
          [this.t('ADMIN.COUNT')]: g.count
        }))
      });
    }

    if (r.topDoctors.length > 0) {
      sheets.push({
        name: this.t('ADMIN.TOP_DOCTORS'),
        rows: r.topDoctors.map((d, i) => ({
          '#': i + 1,
          [this.t('ADMIN.DOCTOR')]: d.doctorName,
          [this.t('ADMIN.SPECIALTY')]: d.specialtyName,
          [this.t('ADMIN.RATING')]: d.rating,
          [this.t('ADMIN.APPOINTMENTS_COUNT')]: d.completedAppointments,
          [this.t('ADMIN.REVIEWS')]: d.totalReviews
        }))
      });
    }

    if (r.summary.appointmentsByStatus?.length > 0) {
      sheets.push({
        name: this.t('ADMIN.BY_STATUS'),
        rows: r.summary.appointmentsByStatus.map(st => ({
          [this.t('ADMIN.STATUS')]: st.status,
          [this.t('ADMIN.COUNT')]: st.count
        }))
      });
    }

    const date = new Date().toISOString().slice(0, 10);
    this.excel.exportMultiSheet(`Shefaa_Dashboard_${date}`, sheets);
  }

  private t(key: string): string { return this.translate.instant(key); }

  today() { return new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); }

  // ── Chart helpers ──
  maxTrendTotal() {
    return Math.max(1, ...(this.report()?.appointmentTrends?.map(t => t.total) ?? [1]));
  }
  maxRevenue() {
    return Math.max(1, ...(this.report()?.revenueByMonth?.map(r => r.revenue) ?? [1]));
  }
  maxSpecialtyAppts() {
    return Math.max(1, ...(this.report()?.specialtyStats?.map(s => s.appointmentCount) ?? [1]));
  }
  maxDayCount() {
    return Math.max(1, ...(this.report()?.dayOfWeekStats?.map(d => d.count) ?? [1]));
  }
  maxPatientReg() {
    return Math.max(1, ...(this.report()?.patientTrends?.map(p => p.count) ?? [1]));
  }

  genderPct(g: GenderDistributionDto) {
    const total = this.report()?.genderDistribution?.reduce((a, b) => a + b.count, 0) ?? 1;
    return total > 0 ? Math.round(g.count / total * 100) : 0;
  }

  peakHourBg(h: PeakHourDto) {
    const max = Math.max(1, ...(this.report()?.peakHours?.map(x => x.count) ?? [1]));
    const intensity = h.count / max;
    if (intensity > 0.75) return 'bg-primary-600 text-white shadow-md';
    if (intensity > 0.5) return 'bg-primary-300 text-primary-900 dark:bg-primary-700 dark:text-primary-100';
    if (intensity > 0.25) return 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300';
    return 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500';
  }

  statusDisplay() {
    const byStatus = this.s()?.appointmentsByStatus ?? [];
    const total = this.s()?.totalAppointments ?? 1;
    const statusColors: Record<string, string> = {
      'Pending': '#f59e0b', 'Confirmed': '#3b82f6', 'CheckedIn': '#06b6d4',
      'InProgress': '#8b5cf6', 'Completed': '#10b981', 'Cancelled': '#ef4444',
      'NoShow': '#f97316', 'Rescheduled': '#6366f1'
    };
    const statusLabels: Record<string, string> = {
      'Pending': 'Pending', 'Confirmed': 'Confirmed', 'CheckedIn': 'Checked In',
      'InProgress': 'In Progress', 'Completed': 'Completed', 'Cancelled': 'Cancelled',
      'NoShow': 'No Show', 'Rescheduled': 'Rescheduled'
    };
    return byStatus.map(st => ({
      label: statusLabels[st.status] ?? st.status,
      count: st.count,
      color: statusColors[st.status] ?? '#6b7280',
      pct: total > 0 ? Math.round(st.count / total * 100) : 0
    })).sort((a, b) => b.count - a.count);
  }
}
