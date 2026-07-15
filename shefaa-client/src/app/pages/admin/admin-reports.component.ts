import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe, PercentPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DataService } from '../../core/services/data.service';
import { ExcelExportService, SheetData } from '../../core/services/excel-export.service';
import {
  AdminReportDto, DashboardSummaryDto, AppointmentTrendDto,
  SpecialtyStatsDto, PeakHourDto, DayOfWeekStatsDto,
  GenderDistributionDto, TopDoctorDto, RevenueByMonthDto,
  PatientRegistrationTrendDto
} from '../../core/models';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, PercentPipe, MatIconModule, TranslateModule],
  template: `
    <div class="page-header animate-fade-in">
      <div>
        <h1 class="page-title">{{ 'NAV.REPORTS' | translate }}</h1>
        <p class="page-subtitle">{{ 'ADMIN.REPORTS_DESC' | translate }}</p>
      </div>
      <div class="flex items-center gap-3">
        <select [(ngModel)]="selectedMonths" (change)="reload()" class="input !w-auto">
          <option [value]="3">{{ 'ADMIN.LAST_3_MONTHS' | translate }}</option>
          <option [value]="6">{{ 'ADMIN.LAST_6_MONTHS' | translate }}</option>
          <option [value]="12">{{ 'ADMIN.LAST_12_MONTHS' | translate }}</option>
          <option [value]="24">{{ 'ADMIN.LAST_24_MONTHS' | translate }}</option>
        </select>
        <button (click)="exportExcel()" class="btn-primary" [disabled]="loading()">
          <mat-icon class="!text-[18px]">download</mat-icon>
          {{ 'ADMIN.EXPORT_EXCEL' | translate }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div *ngIf="loading()" class="space-y-6">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div *ngFor="let i of [1,2,3,4,5,6,7,8]" class="card p-5"><div class="skeleton h-4 w-24 rounded mb-3"></div><div class="skeleton h-8 w-16 rounded"></div></div>
      </div>
      <div class="card p-6"><div class="skeleton h-64 w-full rounded-xl"></div></div>
    </div>

    <div *ngIf="!loading() && report() as r" class="space-y-6 animate-fade-in">

      <!-- ═══════════════ ROW 1: Core KPIs ═══════════════ -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="stat-card">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center"><mat-icon>groups</mat-icon></div>
            <span class="text-xs text-surface-500 dark:text-surface-400 uppercase tracking-wide font-medium">{{ 'ADMIN.TOTAL_PATIENTS' | translate }}</span>
          </div>
          <div class="text-3xl font-bold text-surface-900 dark:text-white">{{ r.summary.totalPatients | number }}</div>
          <div class="text-xs text-surface-400 mt-1">+{{ r.summary.newPatientsThisMonth }} {{ 'ADMIN.THIS_MONTH' | translate }}</div>
        </div>
        <div class="stat-card">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"><mat-icon>medical_services</mat-icon></div>
            <span class="text-xs text-surface-500 dark:text-surface-400 uppercase tracking-wide font-medium">{{ 'ADMIN.TOTAL_DOCTORS' | translate }}</span>
          </div>
          <div class="text-3xl font-bold text-surface-900 dark:text-white">{{ r.summary.totalDoctors | number }}</div>
          <div class="text-xs text-surface-400 mt-1">+{{ r.summary.newDoctorsThisMonth }} {{ 'ADMIN.THIS_MONTH' | translate }}</div>
        </div>
        <div class="stat-card">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center"><mat-icon>calendar_month</mat-icon></div>
            <span class="text-xs text-surface-500 dark:text-surface-400 uppercase tracking-wide font-medium">{{ 'ADMIN.TOTAL_APPOINTMENTS' | translate }}</span>
          </div>
          <div class="text-3xl font-bold text-surface-900 dark:text-white">{{ r.summary.totalAppointments | number }}</div>
          <div class="text-xs text-surface-400 mt-1">{{ r.summary.appointmentsThisMonth }} {{ 'ADMIN.THIS_MONTH' | translate }}</div>
        </div>
        <div class="stat-card">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center"><mat-icon>payments</mat-icon></div>
            <span class="text-xs text-surface-500 dark:text-surface-400 uppercase tracking-wide font-medium">{{ 'ADMIN.REVENUE_MONTH' | translate }}</span>
          </div>
          <div class="text-3xl font-bold text-surface-900 dark:text-white">{{ r.summary.estimatedRevenueThisMonth | number:'1.0-0' }} <span class="text-sm font-normal text-surface-400">{{ 'COMMON.CURRENCY' | translate }}</span></div>
          <div class="text-xs mt-1" [class]="r.summary.revenueGrowthPercent >= 0 ? 'text-emerald-500' : 'text-red-500'">
            <mat-icon class="!text-[12px]">{{ r.summary.revenueGrowthPercent >= 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
            {{ r.summary.revenueGrowthPercent | number:'1.1-1' }}% vs last month
          </div>
        </div>
      </div>

      <!-- ═══════════════ ROW 2: Rates ═══════════════ -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card p-4 text-center">
          <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{{ r.summary.completionRate | percent:'1.1-1' }}</div>
          <div class="text-xs text-surface-500 dark:text-surface-400 mt-1">{{ 'ADMIN.COMPLETION_RATE' | translate }}</div>
        </div>
        <div class="card p-4 text-center">
          <div class="text-2xl font-bold text-red-600 dark:text-red-400">{{ r.summary.noShowRate | percent:'1.1-1' }}</div>
          <div class="text-xs text-surface-500 dark:text-surface-400 mt-1">{{ 'ADMIN.NO_SHOW_RATE' | translate }}</div>
        </div>
        <div class="card p-4 text-center">
          <div class="text-2xl font-bold text-amber-600 dark:text-amber-400">{{ r.summary.cancellationRate | percent:'1.1-1' }}</div>
          <div class="text-xs text-surface-500 dark:text-surface-400 mt-1">{{ 'ADMIN.CANCELLATION_RATE' | translate }}</div>
        </div>
        <div class="card p-4 text-center">
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ r.summary.avgConsultationFee | number:'1.0-0' }}</div>
          <div class="text-xs text-surface-500 dark:text-surface-400 mt-1">{{ 'ADMIN.AVG_FEE' | translate }} ({{ 'COMMON.CURRENCY' | translate }})</div>
        </div>
      </div>

      <!-- ═══════════════ ROW 3: Appointment Trends + Revenue ═══════════════ -->
      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Appointment Trends -->
        <div class="card p-6">
          <h3 class="font-semibold text-lg text-surface-900 dark:text-white mb-5">{{ 'ADMIN.APPOINTMENT_TRENDS' | translate }}</h3>
          <div *ngIf="r.appointmentTrends.length === 0" class="empty-state !py-10">{{ 'COMMON.NO_DATA' | translate }}</div>
          <div *ngIf="r.appointmentTrends.length > 0" class="space-y-3">
            <div *ngFor="let t of r.appointmentTrends" class="group">
              <div class="flex items-center justify-between text-xs mb-1.5">
                <span class="font-medium text-surface-700 dark:text-surface-300">{{ t.label }}</span>
                <span class="text-surface-400">{{ t.total }} {{ 'ADMIN.TOTAL' | translate }}</span>
              </div>
              <div class="h-5 rounded-lg bg-surface-100 dark:bg-surface-800 overflow-hidden flex">
                <div class="bg-emerald-500 transition-all duration-500" [style.width.%]="(t.completed / maxTrend() * 100) || 0" [title]="'Completed: ' + t.completed"></div>
                <div class="bg-red-400 transition-all duration-500" [style.width.%]="(t.cancelled / maxTrend() * 100) || 0" [title]="'Cancelled: ' + t.cancelled"></div>
                <div class="bg-amber-400 transition-all duration-500" [style.width.%]="(t.noShow / maxTrend() * 100) || 0" [title]="'No Show: ' + t.noShow"></div>
              </div>
            </div>
            <div class="flex items-center gap-4 mt-4 text-xs">
              <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> {{ 'ADMIN.COMPLETION' | translate }}</span>
              <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-red-400"></span> {{ 'ADMIN.CANCELLED' | translate }}</span>
              <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span> {{ 'ADMIN.NO_SHOW' | translate }}</span>
            </div>
          </div>
        </div>

        <!-- Revenue Chart -->
        <div class="card p-6">
          <h3 class="font-semibold text-lg text-surface-900 dark:text-white mb-5">{{ 'ADMIN.MONTHLY_REVENUE' | translate }}</h3>
          <div *ngIf="r.revenueByMonth.length === 0" class="empty-state !py-10">{{ 'COMMON.NO_DATA' | translate }}</div>
          <div *ngIf="r.revenueByMonth.length" class="flex items-end justify-around gap-3 px-2 pt-4 pb-2">
            <div *ngFor="let rv of r.revenueByMonth" class="flex flex-col items-center flex-1 group">
              <div class="text-[10px] font-bold text-surface-600 dark:text-surface-300 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">{{ rv.revenue | number:'1.0-0' }} {{ 'COMMON.CURRENCY' | translate }}</div>
              <div class="w-full rounded-t-lg bg-gradient-to-t from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 transition-all duration-300 shadow-sm hover:shadow-md min-h-[4px]"
                   [style.height.%]="(rv.revenue / maxRevenue() * 100) || 1"></div>
              <div class="text-[10px] font-medium text-surface-500 dark:text-surface-400 mt-2 text-center">{{ rv.label }}</div>
              <div class="text-[9px] text-surface-400 dark:text-surface-500">{{ rv.appointmentCount }} appts</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════ ROW 4: Specialty Performance ═══════════════ -->
      <div class="card p-6">
        <h3 class="font-semibold text-lg text-surface-900 dark:text-white mb-5">{{ 'ADMIN.SPECIALTY_PERFORMANCE' | translate }}</h3>
        <div *ngIf="r.specialtyStats.length === 0" class="empty-state !py-10">{{ 'COMMON.NO_DATA' | translate }}</div>
        <div *ngIf="r.specialtyStats.length > 0" class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-xs text-surface-500 dark:text-surface-400 uppercase tracking-wider border-b border-surface-200 dark:border-surface-700">
                <th class="text-left pb-3 font-semibold">{{ 'ADMIN.SPECIALTY' | translate }}</th>
                <th class="text-center pb-3 font-semibold">{{ 'ADMIN.DOCTORS_COUNT' | translate }}</th>
                <th class="text-center pb-3 font-semibold">{{ 'ADMIN.APPOINTMENTS_COUNT' | translate }}</th>
                <th class="text-right pb-3 font-semibold">{{ 'ADMIN.REVENUE' | translate }}</th>
                <th class="pb-3 w-40"></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of r.specialtyStats" class="border-b border-surface-50 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/40 transition-colors">
                <td class="py-3 font-semibold text-surface-900 dark:text-white">{{ s.specialtyName }}</td>
                <td class="py-3 text-center text-surface-600 dark:text-surface-300">{{ s.doctorCount }}</td>
                <td class="py-3 text-center">
                  <span class="badge badge-info">{{ s.appointmentCount }}</span>
                </td>
                <td class="py-3 text-right font-semibold text-surface-900 dark:text-white">{{ s.revenue | number:'1.0-0' }} {{ 'COMMON.CURRENCY' | translate }}</td>
                <td class="py-3 pl-3">
                  <div class="h-2 rounded-full bg-surface-100 dark:bg-surface-800 overflow-hidden">
                    <div class="h-full rounded-full bg-gradient-to-r from-primary-400 to-accent-400 transition-all duration-700"
                         [style.width.%]="(s.revenue / maxSpecialtyRevenue() * 100) || 1"></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ═══════════════ ROW 5: Patient Trends + Peak Hours + Day of Week ═══════════════ -->
      <div class="grid lg:grid-cols-3 gap-6">
        <!-- Patient Registration Trends -->
        <div class="card p-6">
          <h3 class="font-semibold text-lg text-surface-900 dark:text-white mb-5">{{ 'ADMIN.PATIENT_REGISTRATIONS' | translate }}</h3>
          <div *ngIf="r.patientTrends.length === 0" class="empty-state !py-10">{{ 'COMMON.NO_DATA' | translate }}</div>
          <div *ngIf="r.patientTrends.length" class="space-y-3">
            <div *ngFor="let pt of r.patientTrends" class="flex items-center gap-3">
              <span class="text-xs text-surface-500 w-16 shrink-0">{{ pt.label }}</span>
              <div class="flex-1 h-4 rounded-full bg-surface-100 dark:bg-surface-800 overflow-hidden">
                <div class="h-full rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-700"
                     [style.width.%]="(pt.count / maxPatientTrend() * 100) || 0"></div>
              </div>
              <span class="text-xs font-bold text-surface-700 dark:text-surface-300 w-8 text-right">{{ pt.count }}</span>
            </div>
          </div>
        </div>

        <!-- Peak Hours -->
        <div class="card p-6">
          <h3 class="font-semibold text-lg text-surface-900 dark:text-white mb-5">{{ 'ADMIN.PEAK_HOURS' | translate }}</h3>
          <div *ngIf="r.peakHours.length === 0" class="empty-state !py-10">{{ 'COMMON.NO_DATA' | translate }}</div>
          <div *ngIf="r.peakHours.length" class="space-y-1.5">
            <div *ngFor="let ph of r.peakHours" class="flex items-center gap-2">
              <span class="text-[10px] text-surface-500 w-10 text-right shrink-0 font-mono">{{ ph.hour }}:00</span>
              <div class="flex-1 h-3.5 rounded bg-surface-100 dark:bg-surface-800 overflow-hidden">
                <div class="h-full rounded bg-gradient-to-r from-violet-400 to-purple-400 transition-all duration-700"
                     [style.width.%]="(ph.count / maxPeakHour() * 100) || 0"></div>
              </div>
              <span class="text-[10px] font-bold text-surface-700 dark:text-surface-300 w-5">{{ ph.count }}</span>
            </div>
          </div>
        </div>

        <!-- Day of Week -->
        <div class="card p-6">
          <h3 class="font-semibold text-lg text-surface-900 dark:text-white mb-5">{{ 'ADMIN.DAY_OF_WEEK' | translate }}</h3>
          <div *ngIf="r.dayOfWeekStats.length === 0" class="empty-state !py-10">{{ 'COMMON.NO_DATA' | translate }}</div>
          <div *ngIf="r.dayOfWeekStats.length" class="space-y-2">
            <div *ngFor="let dw of r.dayOfWeekStats" class="flex items-center gap-3">
              <span class="text-xs text-surface-600 dark:text-surface-300 w-12 shrink-0 font-medium">{{ dw.dayName }}</span>
              <div class="flex-1 h-5 rounded-lg bg-surface-100 dark:bg-surface-800 overflow-hidden">
                <div class="h-full rounded-lg bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-700"
                     [style.width.%]="(dw.count / maxDayOfWeek() * 100) || 0"></div>
              </div>
              <span class="text-xs font-bold text-surface-700 dark:text-surface-300 w-6 text-right">{{ dw.count }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════ ROW 6: Gender + Top Doctors ═══════════════ -->
      <div class="grid lg:grid-cols-3 gap-6">
        <!-- Gender Distribution -->
        <div class="card p-6">
          <h3 class="font-semibold text-lg text-surface-900 dark:text-white mb-5">{{ 'ADMIN.GENDER_DISTRIBUTION' | translate }}</h3>
          <div *ngIf="r.genderDistribution.length === 0" class="empty-state !py-10">{{ 'COMMON.NO_DATA' | translate }}</div>
          <div *ngIf="r.genderDistribution.length" class="space-y-3">
            <div *ngFor="let g of r.genderDistribution" class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                   [ngClass]="genderIcon(g.gender).bg">
                <mat-icon class="!text-[16px]" [class]="genderIcon(g.gender).text">{{ genderIcon(g.gender).icon }}</mat-icon>
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium text-surface-700 dark:text-surface-300">{{ g.gender }}</span>
                  <span class="text-xs font-bold text-surface-500">{{ g.count | number }}</span>
                </div>
                <div class="h-2 rounded-full bg-surface-100 dark:bg-surface-800 overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-700"
                       [ngClass]="genderIcon(g.gender).bar"
                       [style.width.%]="genderPercent(g.count)"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Doctors -->
        <div class="lg:col-span-2 card p-6">
          <h3 class="font-semibold text-lg text-surface-900 dark:text-white mb-5">{{ 'ADMIN.TOP_DOCTORS' | translate }}</h3>
          <div *ngIf="r.topDoctors.length === 0" class="empty-state !py-10">{{ 'COMMON.NO_DATA' | translate }}</div>
          <div *ngIf="r.topDoctors.length > 0" class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-xs text-surface-500 dark:text-surface-400 uppercase tracking-wider border-b border-surface-200 dark:border-surface-700">
                  <th class="text-left pb-3 font-semibold w-10">#</th>
                  <th class="text-left pb-3 font-semibold">{{ 'ADMIN.DOCTOR' | translate }}</th>
                  <th class="text-left pb-3 font-semibold">{{ 'ADMIN.SPECIALTY' | translate }}</th>
                  <th class="text-center pb-3 font-semibold">{{ 'ADMIN.RATING' | translate }}</th>
                  <th class="text-right pb-3 font-semibold">{{ 'ADMIN.DONE' | translate }}</th>
                  <th class="pb-3 w-32"></th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let d of r.topDoctors; let i = index" class="border-b border-surface-50 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/40 transition-colors">
                  <td class="py-3">
                    <div class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs"
                         [class]="i === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' : i === 1 ? 'bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-300' : i === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' : 'bg-surface-100 text-surface-500 dark:bg-surface-700 dark:text-surface-400'">
                      {{ i + 1 }}
                    </div>
                  </td>
                  <td class="py-3 font-semibold text-surface-900 dark:text-white">{{ d.doctorName }}</td>
                  <td class="py-3 text-surface-500 dark:text-surface-400">{{ d.specialtyName }}</td>
                  <td class="py-3 text-center">
                    <span class="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      <mat-icon class="!text-[14px]">star</mat-icon>
                      <span class="text-xs font-bold">{{ d.rating || '5.0' }}</span>
                    </span>
                  </td>
                  <td class="py-3 text-right">
                    <span class="badge badge-success font-bold">{{ d.completedAppointments }}</span>
                  </td>
                  <td class="py-3 pl-3">
                    <div class="h-2 rounded-full bg-surface-100 dark:bg-surface-800 overflow-hidden">
                      <div class="h-full rounded-full bg-emerald-400 transition-all duration-700"
                           [style.width.%]="(d.completedAppointments / maxDoctorCompleted() * 100) || 1"></div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ═══════════════ ROW 7: Doctor Performance ═══════════════ -->
      <div class="card p-6">
        <h3 class="font-semibold text-lg text-surface-900 dark:text-white mb-5">{{ 'ADMIN.DOCTOR_PERFORMANCE' | translate }}</h3>
        <div *ngIf="doctorPerf().length === 0" class="empty-state !py-10">{{ 'COMMON.NO_DATA' | translate }}</div>
        <div *ngIf="doctorPerf().length > 0" class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-xs text-surface-500 dark:text-surface-400 uppercase tracking-wider border-b border-surface-200 dark:border-surface-700">
                <th class="text-left pb-3 font-semibold">{{ 'ADMIN.DOCTOR' | translate }}</th>
                <th class="text-left pb-3 font-semibold">{{ 'ADMIN.SPECIALTY' | translate }}</th>
                <th class="text-center pb-3 font-semibold">{{ 'ADMIN.TOTAL' | translate }}</th>
                <th class="text-center pb-3 font-semibold">{{ 'ADMIN.COMPLETION' | translate }}</th>
                <th class="text-center pb-3 font-semibold">{{ 'ADMIN.CANCELLED' | translate }}</th>
                <th class="text-center pb-3 font-semibold">{{ 'ADMIN.REVENUE' | translate }}</th>
                <th class="text-center pb-3 font-semibold">{{ 'ADMIN.RATING' | translate }}</th>
                <th class="pb-3 w-36"></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let d of doctorPerf()" class="border-b border-surface-50 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/40 transition-colors">
                <td class="py-3 font-semibold text-surface-900 dark:text-white">{{ d.doctorName }}</td>
                <td class="py-3 text-surface-500 dark:text-surface-400">{{ d.specialtyName }}</td>
                <td class="py-3 text-center text-surface-700 dark:text-surface-300">{{ d.totalAppointments }}</td>
                <td class="py-3 text-center"><span class="badge badge-success">{{ d.completedAppointments }}</span></td>
                <td class="py-3 text-center"><span class="badge badge-danger">{{ d.cancelledAppointments }}</span></td>
                <td class="py-3 text-center font-semibold text-surface-900 dark:text-white">{{ d.revenue | number:'1.0-0' }} {{ 'COMMON.CURRENCY' | translate }}</td>
                <td class="py-3 text-center">
                  <span class="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    <mat-icon class="!text-[14px]">star</mat-icon>
                    <span class="text-xs font-bold">{{ d.rating || '5.0' }}</span>
                  </span>
                </td>
                <td class="py-3 pl-3">
                  <div class="h-2 rounded-full bg-surface-100 dark:bg-surface-800 overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-700"
                         [ngClass]="d.completionRate >= 0.8 ? 'bg-emerald-400' : d.completionRate >= 0.5 ? 'bg-amber-400' : 'bg-red-400'"
                         [style.width.%]="(d.completionRate * 100)"></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `
})
export class AdminReportsComponent implements OnInit {
  private data = inject(DataService);
  private excel = inject(ExcelExportService);
  private translate = inject(TranslateService);

  loading = signal(true);
  report = signal<AdminReportDto | null>(null);
  doctorPerf = signal<any[]>([]);
  selectedMonths = 6;

  ngOnInit() { this.reload(); }

  reload() {
    this.loading.set(true);
    this.data.getAdminReport(this.selectedMonths).subscribe({
      next: r => { this.report.set(r); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
    this.data.getDoctorPerformance().subscribe({
      next: dp => this.doctorPerf.set(dp)
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

    if (this.doctorPerf().length > 0) {
      sheets.push({
        name: this.t('ADMIN.DOCTOR_PERFORMANCE'),
        rows: this.doctorPerf().map(d => ({
          [this.t('ADMIN.DOCTOR')]: d.doctorName,
          [this.t('ADMIN.SPECIALTY')]: d.specialtyName,
          [this.t('ADMIN.TOTAL')]: d.totalAppointments,
          [this.t('ADMIN.COMPLETION')]: d.completedAppointments,
          [this.t('ADMIN.CANCELLED')]: d.cancelledAppointments,
          [this.t('ADMIN.NO_SHOW')]: d.noShowAppointments || 0,
          [this.t('ADMIN.REVENUE') + ' (' + this.t('COMMON.CURRENCY') + ')']: d.revenue,
          [this.t('ADMIN.RATING')]: d.rating,
          [this.t('ADMIN.REVIEWS')]: d.totalReviews,
          [this.t('ADMIN.COMPLETION_RATE') + ' (%)']: d.completionRate
        }))
      });
    }

    const date = new Date().toISOString().slice(0, 10);
    this.excel.exportMultiSheet(`Shefaa_Reports_${date}`, sheets);
  }

  private t(key: string): string { return this.translate.instant(key); }

  maxTrend(): number {
    const r = this.report();
    if (!r) return 1;
    return Math.max(1, ...r.appointmentTrends.map(t => t.total));
  }

  maxRevenue(): number {
    const r = this.report();
    if (!r) return 1;
    return Math.max(1, ...r.revenueByMonth.map(rv => rv.revenue));
  }

  maxSpecialtyRevenue(): number {
    const r = this.report();
    if (!r) return 1;
    return Math.max(1, ...r.specialtyStats.map(s => s.revenue));
  }

  maxPatientTrend(): number {
    const r = this.report();
    if (!r) return 1;
    return Math.max(1, ...r.patientTrends.map(pt => pt.count));
  }

  maxPeakHour(): number {
    const r = this.report();
    if (!r) return 1;
    return Math.max(1, ...r.peakHours.map(ph => ph.count));
  }

  maxDayOfWeek(): number {
    const r = this.report();
    if (!r) return 1;
    return Math.max(1, ...r.dayOfWeekStats.map(dw => dw.count));
  }

  maxDoctorCompleted(): number {
    const r = this.report();
    if (!r || r.topDoctors.length === 0) return 1;
    return Math.max(1, ...r.topDoctors.map(d => d.completedAppointments));
  }

  genderPercent(count: number): number {
    const r = this.report();
    if (!r) return 0;
    const total = r.genderDistribution.reduce((sum, g) => sum + g.count, 0);
    return total > 0 ? (count / total * 100) : 0;
  }

  genderIcon(gender: string) {
    const g = gender.toLowerCase();
    if (g.includes('male') || g === 'ذكر') return { icon: 'male', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', bar: 'bg-blue-500' };
    if (g.includes('female') || g === 'أنثى') return { icon: 'female', bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-600 dark:text-pink-400', bar: 'bg-pink-500' };
    return { icon: 'person', bg: 'bg-surface-100 dark:bg-surface-700', text: 'text-surface-500', bar: 'bg-surface-400' };
  }
}
