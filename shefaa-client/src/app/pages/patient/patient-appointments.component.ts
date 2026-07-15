import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DataService } from '../../core/services/data.service';
import { AppointmentDto, PaymentMethod } from '../../core/models';
import { CancelAppointmentDialogComponent } from '../../shared/components/cancel-dialog.component';
import { RescheduleDialogComponent } from '../../shared/components/reschedule-dialog.component';
import { ReviewDialogComponent } from '../../shared/components/review-dialog.component';

@Component({
  selector: 'app-patient-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, MatIconModule, MatButtonModule, MatDialogModule, TranslateModule],
  template: `
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ 'APPOINTMENT.TITLE' | translate }}</h1>
        <p class="page-subtitle">{{ 'APPOINTMENT.SUBTITLE' | translate }}</p>
      </div>
      <a href="/patient/book" class="btn-primary">
        <mat-icon>add</mat-icon>
        {{ 'APPOINTMENT.BOOK_TITLE' | translate }}
      </a>
    </div>

    <!-- Filter Tabs -->
    <div class="flex items-center gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1">
      <button (click)="filter = ''; load()"
              class="btn-sm rounded-full whitespace-nowrap transition-all duration-200"
              [ngClass]="filter === '' ? 'bg-primary-600 text-white shadow-sm' : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600'">
        {{ 'COMMON.ALL' | translate }}
      </button>
      <button (click)="filter = 'Pending'; load()"
              class="btn-sm rounded-full whitespace-nowrap transition-all duration-200"
              [ngClass]="filter === 'Pending' ? 'bg-amber-500 text-white shadow-sm' : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600'">
        {{ 'STATUS.Pending' | translate }}
      </button>
      <button (click)="filter = 'Confirmed'; load()"
              class="btn-sm rounded-full whitespace-nowrap transition-all duration-200"
              [ngClass]="filter === 'Confirmed' ? 'bg-blue-500 text-white shadow-sm' : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600'">
        {{ 'STATUS.Confirmed' | translate }}
      </button>
      <button (click)="filter = 'Completed'; load()"
              class="btn-sm rounded-full whitespace-nowrap transition-all duration-200"
              [ngClass]="filter === 'Completed' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600'">
        {{ 'STATUS.Completed' | translate }}
      </button>
      <button (click)="filter = 'Cancelled'; load()"
              class="btn-sm rounded-full whitespace-nowrap transition-all duration-200"
              [ngClass]="filter === 'Cancelled' ? 'bg-red-500 text-white shadow-sm' : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600'">
        {{ 'STATUS.Cancelled' | translate }}
      </button>
    </div>

    <!-- Loading -->
    <div *ngIf="loading()" class="space-y-4">
      <div class="card p-5">
        <div class="flex items-center gap-4">
          <div class="skeleton w-16 h-16 rounded-2xl"></div>
          <div class="flex-1 space-y-2">
            <div class="skeleton h-4 w-48 rounded-lg"></div>
            <div class="skeleton h-3 w-32 rounded-lg"></div>
          </div>
          <div class="skeleton h-6 w-20 rounded-full"></div>
        </div>
      </div>
      <div class="card p-5">
        <div class="flex items-center gap-4">
          <div class="skeleton w-16 h-16 rounded-2xl"></div>
          <div class="flex-1 space-y-2">
            <div class="skeleton h-4 w-48 rounded-lg"></div>
            <div class="skeleton h-3 w-32 rounded-lg"></div>
          </div>
          <div class="skeleton h-6 w-20 rounded-full"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div *ngIf="!loading() && appointments().length === 0" class="card">
      <div class="empty-state py-16">
        <div class="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center mb-4">
          <mat-icon class="!w-8 !h-8 text-surface-400 dark:text-surface-500">event_note</mat-icon>
        </div>
        <p class="text-surface-500 dark:text-surface-400">{{ 'PATIENT.NO_UPCOMING' | translate }}</p>
      </div>
    </div>

    <!-- Appointments List -->
    <div *ngIf="!loading() && appointments().length > 0" class="space-y-3">
      <div *ngFor="let a of appointments()" class="card card-hover p-5">
        <div class="flex flex-col md:flex-row md:items-center gap-4">
          <!-- Date Block -->
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex flex-col items-center justify-center shadow-md shrink-0">
            <span class="text-[10px] uppercase tracking-wider opacity-80">{{ formatMonth(a.scheduledStart) }}</span>
            <span class="text-xl font-bold leading-none">{{ formatDay(a.scheduledStart) }}</span>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1.5 flex-wrap">
              <span class="font-semibold text-surface-900 dark:text-surface-50">{{ a.doctorName }}</span>
              <span class="badge badge-info">{{ a.doctorSpecialty }}</span>
              <span class="badge" [ngClass]="badge(a.status)">{{ ('STATUS.' + a.status) | translate }}</span>
              <span *ngIf="a.isPaid && a.paymentMethod" class="badge badge-success">
                <mat-icon class="!text-[12px] leading-none">verified</mat-icon>
                {{ ('APPOINTMENT.PAYMENT_METHOD_' + paymentKey(a.paymentMethod)) | translate }}
              </span>
              <span *ngIf="!a.isPaid && isOnlinePaymentMethod(a.paymentMethod)" class="badge badge-warning">
                <mat-icon class="!text-[12px] leading-none">hourglass_top</mat-icon>
                {{ ('APPOINTMENT.PAYMENT_METHOD_' + paymentKey(a.paymentMethod)) | translate }}
              </span>
            </div>
            <div class="flex items-center gap-4 text-sm text-surface-500 dark:text-surface-400 mb-1">
              <span class="flex items-center gap-1.5">
                <mat-icon class="!text-[15px]">schedule</mat-icon>
                {{ formatTime(a.scheduledStart) }}
              </span>
              <span class="flex items-center gap-1.5">
                <mat-icon class="!text-[15px]">place</mat-icon>
                {{ a.clinicName }}
              </span>
              <span *ngIf="a.consultationFee" class="flex items-center gap-1.5 text-surface-700 dark:text-surface-300 font-medium">
                <mat-icon class="!text-[15px]">payments</mat-icon>
                {{ a.consultationFee | number:'1.0-0' }} {{ 'COMMON.CURRENCY' | translate }}
              </span>
            </div>
            <div *ngIf="a.confirmationCode" class="text-xs text-surface-400 dark:text-surface-500">
              {{ 'APPOINTMENT.CONFIRMATION_CODE' | translate }}:
              <span class="font-mono font-semibold text-surface-600 dark:text-surface-300">{{ a.confirmationCode }}</span>
              <span *ngIf="a.paymentReference" class="ms-2">
                · ref: <span class="font-mono text-surface-500 dark:text-surface-400">{{ a.paymentReference }}</span>
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-wrap items-center gap-2">
            <button *ngIf="canReschedule(a.status)" (click)="reschedule(a)" class="btn-secondary btn-sm">
              <mat-icon class="!text-[16px]">event_repeat</mat-icon>
              {{ 'APPOINTMENT.RESCHEDULE_TITLE' | translate }}
            </button>
            <button *ngIf="canCancel(a.status)" (click)="cancel(a)" class="btn-danger btn-sm">
              <mat-icon class="!text-[16px]">cancel</mat-icon>
              {{ 'APPOINTMENT.CANCEL_TITLE' | translate }}
            </button>
            <button *ngIf="a.status === 'Completed'" (click)="rate(a)" class="btn-sm bg-amber-500 hover:bg-amber-600 text-white border-none shadow-sm">
              <mat-icon class="!text-[16px]">star</mat-icon>
              {{ 'REVIEW.TITLE' | translate }}
            </button>
          </div>
        </div>

        <!-- Cancellation Reason -->
        <div *ngIf="a.cancellationReason" class="divider mt-4 pt-4">
          <p class="text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
            <mat-icon class="!text-[16px] mt-0.5 shrink-0">info</mat-icon>
            <span>
              <strong>{{ 'APPOINTMENT.CANCEL_REASON' | translate }}:</strong>
              {{ a.cancellationReason }}
            </span>
          </p>
        </div>
      </div>
    </div>
  `
})
export class PatientAppointmentsComponent implements OnInit {
  private data = inject(DataService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);
  private translate = inject(TranslateService);

  loading = signal(true);
  appointments = signal<AppointmentDto[]>([]);
  filter = '';

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.data.listAppointments(1, 100, { status: this.filter || undefined }).subscribe({
      next: r => { this.appointments.set(r.items || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  canCancel(s: string) {
    return ['Pending', 'Confirmed'].includes(s);
  }

  canReschedule(s: string) {
    return ['Pending', 'Confirmed'].includes(s);
  }

  cancel(a: AppointmentDto) {
    const ref = this.dialog.open(CancelAppointmentDialogComponent, { width: '420px' });
    ref.afterClosed().subscribe((reason: string | undefined) => {
      if (!reason) return;
      this.data.cancelAppointment(a.id, reason).subscribe(() => {
        this.snack.open(this.translate.instant('APPOINTMENT.CANCELLED'), this.translate.instant('COMMON.OK'), { duration: 3000 });
        this.load();
      });
    });
  }

  reschedule(a: AppointmentDto) {
    const ref = this.dialog.open(RescheduleDialogComponent, {
      width: '480px',
      data: { doctorId: a.doctorId, clinicId: a.clinicId }
    });
    ref.afterClosed().subscribe((newStart: string | undefined) => {
      if (!newStart) return;
      this.data.rescheduleAppointment(a.id, newStart).subscribe({
        next: () => {
          this.snack.open(this.translate.instant('APPOINTMENT.RESCHEDULED'), this.translate.instant('COMMON.OK'), { duration: 3000 });
          this.load();
        },
        error: err => {
          this.snack.open(err.error?.message || this.translate.instant('COMMON.SAVE_FAILED'), this.translate.instant('COMMON.OK'), { duration: 4000 });
        }
      });
    });
  }

  rate(a: AppointmentDto) {
    const ref = this.dialog.open(ReviewDialogComponent, { width: '450px' });
    ref.afterClosed().subscribe(res => {
      if (!res) return;
      this.data.createReview({ appointmentId: a.id, rating: res.rating, comment: res.comment, isAnonymous: res.isAnonymous })
        .subscribe({
          next: () => {
            this.snack.open(this.translate.instant('REVIEW.SUCCESS'), this.translate.instant('COMMON.OK'), { duration: 3000 });
          },
          error: () => {
            this.snack.open(this.translate.instant('REVIEW.ERROR'), this.translate.instant('COMMON.OK'), { duration: 4000 });
          }
        });
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

  /** Returns true if the given payment method is an online method (Vodafone Cash / InstaPay). */
  isOnlinePaymentMethod(m: any): boolean {
    const v = String(m ?? '').toLowerCase();
    return v === '3' || v === 'vodafonecash' || v === '4' || v === 'instapay';
  }

  /** Map numeric or string PaymentMethod to the i18n key suffix (PAYMENT_METHOD_VODAFONE_CASH, etc.) */
  paymentKey(m: PaymentMethod | string | null | undefined): string {
    const v = typeof m === 'string' ? m : String(m ?? '');
    const norm = v.toLowerCase();
    switch (norm) {
      case '1': case 'cash': return 'CASH';
      case '2': case 'card': case 'creditcard': return 'CARD';
      case '3': case 'vodafonecash': case 'vodafone_cash': return 'VODAFONE_CASH';
      case '4': case 'instapay': return 'INSTAPAY';
      default: return '';
    }
  }

  formatMonth(iso: string) { return new Date(iso).toLocaleString('en-US', { month: 'short' }); }
  formatDay(iso: string) { return new Date(iso).getDate(); }
  formatTime(iso: string) { return new Date(iso).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' }); }
}
