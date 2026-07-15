import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DataService } from '../../core/services/data.service';
import { AppointmentDto, ClinicDto, DoctorDto, PaymentMethod, SpecialtyDto, TimeSlotDto } from '../../core/models';

const REASON_MAX = 500;
const NOTES_MAX = 2000;
const PAYMENT_REF_PATTERN = /^[A-Za-z0-9\-_/]{6,40}$/;

interface PaymentOption {
  id: PaymentMethod;
  icon: string;
  group: 'clinic' | 'online';
}

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, MatIconModule, MatButtonModule, RouterLink, TranslateModule],
  template: `
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ 'APPOINTMENT.BOOK_TITLE' | translate }}</h1>
        <p class="page-subtitle">{{ 'APPOINTMENT.BOOK_SUBTITLE' | translate }}</p>
      </div>
    </div>

    <!-- Wizard Step Indicator -->
    <div *ngIf="!success()" class="mb-8">
      <div class="flex items-center justify-center gap-0 max-w-lg mx-auto">
        <div class="flex flex-col items-center flex-1">
          <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
               [ngClass]="step() >= 1 ? 'bg-primary-600 text-white shadow-md' : 'bg-surface-200 dark:bg-surface-700 text-surface-500 dark:text-surface-400'">
            <mat-icon *ngIf="step() > 1" class="!text-[18px]">check</mat-icon>
            <span *ngIf="step() <= 1">1</span>
          </div>
          <span class="text-[11px] mt-1.5 font-medium text-surface-600 dark:text-surface-400">{{ 'DOCTORS.SPECIALTY' | translate }}</span>
        </div>
        <div class="flex-1 h-0.5 -mt-5 mx-1 rounded-full transition-all duration-300"
             [ngClass]="step() >= 2 ? 'bg-primary-600' : 'bg-surface-200 dark:bg-surface-700'"></div>
        <div class="flex flex-col items-center flex-1">
          <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
               [ngClass]="step() >= 2 ? 'bg-primary-600 text-white shadow-md' : 'bg-surface-200 dark:bg-surface-700 text-surface-500 dark:text-surface-400'">
            <mat-icon *ngIf="step() > 2" class="!text-[18px]">check</mat-icon>
            <span *ngIf="step() <= 2">2</span>
          </div>
          <span class="text-[11px] mt-1.5 font-medium text-surface-600 dark:text-surface-400">{{ 'APPOINTMENT.SELECT_DOCTOR' | translate }}</span>
        </div>
        <div class="flex-1 h-0.5 -mt-5 mx-1 rounded-full transition-all duration-300"
             [ngClass]="step() >= 3 ? 'bg-primary-600' : 'bg-surface-200 dark:bg-surface-700'"></div>
        <div class="flex flex-col items-center flex-1">
          <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
               [ngClass]="step() >= 3 ? 'bg-primary-600 text-white shadow-md' : 'bg-surface-200 dark:bg-surface-700 text-surface-500 dark:text-surface-400'">
            <mat-icon *ngIf="step() > 3" class="!text-[18px]">check</mat-icon>
            <span *ngIf="step() <= 3">3</span>
          </div>
          <span class="text-[11px] mt-1.5 font-medium text-surface-600 dark:text-surface-400">{{ 'APPOINTMENT.SELECT_CLINIC' | translate }}</span>
        </div>
        <div class="flex-1 h-0.5 -mt-5 mx-1 rounded-full transition-all duration-300"
             [ngClass]="step() >= 4 ? 'bg-primary-600' : 'bg-surface-200 dark:bg-surface-700'"></div>
        <div class="flex flex-col items-center flex-1">
          <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
               [ngClass]="step() >= 4 ? 'bg-primary-600 text-white shadow-md' : 'bg-surface-200 dark:bg-surface-700 text-surface-500 dark:text-surface-400'">
            <mat-icon *ngIf="step() > 4" class="!text-[18px]">check</mat-icon>
            <span *ngIf="step() <= 4">4</span>
          </div>
          <span class="text-[11px] mt-1.5 font-medium text-surface-600 dark:text-surface-400">{{ 'APPOINTMENT.PAYMENT_TITLE' | translate }}</span>
        </div>
      </div>
    </div>

    <!-- ═══════════════ Step 1: Choose Specialty ═══════════════ -->
    <div class="card p-6 mb-6" *ngIf="step() === 1">
      <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-4">{{ 'DOCTORS.SPECIALTY' | translate }}</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <button *ngFor="let s of specialties()" (click)="pickSpecialty(s.id)"
                class="card-interactive p-4 text-left"
                 [ngClass]="specialtyId === s.id
                   ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                   : '!bg-surface-50/50 dark:!bg-surface-700/50'">
          <div class="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-2.5">
            <mat-icon>category</mat-icon>
          </div>
          <div class="font-medium text-sm text-surface-800 dark:text-surface-200">{{ s.name }}</div>
          <div class="text-xs text-surface-500 dark:text-surface-400 mt-0.5">{{ s.doctorsCount }} {{ 'NAV.DOCTORS' | translate }}</div>
        </button>
      </div>
    </div>

    <!-- ═══════════════ Step 2: Choose Doctor ═══════════════ -->
    <div class="card p-6 mb-6" *ngIf="step() === 2">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-50">{{ 'APPOINTMENT.SELECT_DOCTOR' | translate }}</h2>
        <button class="btn-secondary btn-sm" (click)="step.set(1)">
          <mat-icon class="!text-[16px]">arrow_back</mat-icon>
          {{ 'COMMON.PREVIOUS' | translate }}
        </button>
      </div>

      <div *ngIf="doctors().length === 0" class="empty-state py-12">
        <div class="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center mb-4">
          <mat-icon class="!w-8 !h-8 text-surface-400 dark:text-surface-500">person_search</mat-icon>
        </div>
        <p class="text-surface-500 dark:text-surface-400">{{ 'COMMON.NO_DATA' | translate }}</p>
      </div>
      <p *ngIf="doctors().length === 0 && !loading()" class="text-xs text-amber-600 dark:text-amber-400 text-center -mt-4 mb-3">{{ 'APPOINTMENT.SELECT_SPECIALTY_REQUIRED' | translate }}</p>

      <div class="grid sm:grid-cols-2 gap-3">
        <button *ngFor="let d of doctors()" (click)="pickDoctor(d)"
                class="card-interactive p-4 text-left"
                 [ngClass]="doctorId === d.id
                   ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                   : '!bg-surface-50/50 dark:!bg-surface-700/50'">
          <div class="flex items-start gap-3">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
              {{ initials(d.fullName) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-surface-900 dark:text-surface-50 truncate">{{ d.fullName }}</div>
              <div class="text-xs text-surface-500 dark:text-surface-400 truncate">{{ d.specialtyName }} · {{ d.yearsOfExperience }} {{ 'DOCTORS.YEARS_EXPERIENCE' | translate }}</div>
              <div class="flex items-center gap-3 mt-1.5">
                <div *ngIf="d.rating" class="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                  <mat-icon class="!text-sm">star</mat-icon>
                  <span class="font-medium">{{ d.rating | number:'1.1-1' }}</span>
                  <span class="text-surface-400 dark:text-surface-500">({{ d.totalReviews }})</span>
                </div>
                <div *ngIf="d.defaultConsultationFee" class="text-xs text-surface-700 dark:text-surface-300 font-medium">{{ d.defaultConsultationFee }} {{ 'COMMON.CURRENCY' | translate }}</div>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- ═══════════════ Step 3: Choose Clinic + Slot ═══════════════ -->
    <div class="card p-6 mb-6" *ngIf="step() === 3">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-50">{{ 'APPOINTMENT.SELECT_CLINIC' | translate }}</h2>
        <button class="btn-secondary btn-sm" (click)="step.set(2)">
          <mat-icon class="!text-[16px]">arrow_back</mat-icon>
          {{ 'COMMON.PREVIOUS' | translate }}
        </button>
      </div>

      <div class="grid sm:grid-cols-2 gap-3 mb-6">
        <button *ngFor="let c of clinics()" (click)="pickClinic(c.id)"
                class="card-interactive p-4 text-left"
                 [ngClass]="clinicId === c.id
                   ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                   : '!bg-surface-50/50 dark:!bg-surface-700/50'">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <mat-icon>local_hospital</mat-icon>
            </div>
            <div>
              <div class="font-medium text-surface-800 dark:text-surface-200">{{ c.name }}</div>
              <div class="text-xs text-surface-500 dark:text-surface-400">{{ c.city }}</div>
            </div>
          </div>
        </button>
      </div>

      <div *ngIf="clinicId">
        <div class="divider mb-5"></div>

        <label class="label">{{ 'DOCTORS.PICK_DATE' | translate }}</label>
        <input type="date"
               [(ngModel)]="date"
               (change)="onDateChange()"
               [min]="todayDate"
               class="input mb-5 max-w-xs"
               [class.input-error]="dateTouched() && !date">

        <label class="label mb-2">{{ 'DOCTORS.AVAILABLE_SLOTS' | translate }} {{ date || '...' }}</label>
        <div *ngIf="loadingSlots()" class="flex items-center justify-center py-8">
          <div class="skeleton h-10 w-full max-w-md rounded-xl"></div>
        </div>
        <div *ngIf="!loadingSlots() && slots().length === 0" class="empty-state py-8">
          <div class="w-14 h-14 rounded-2xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center mb-3">
            <mat-icon class="!w-7 !h-7 text-surface-400 dark:text-surface-500">event_busy</mat-icon>
          </div>
          <p class="text-surface-500 dark:text-surface-400">{{ 'DOCTORS.NO_SLOTS' | translate }}</p>
        </div>
        <div *ngIf="!loadingSlots() && slots().length > 0" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
          <button *ngFor="let s of slots()" (click)="pickSlot(s)"
                  class="px-3 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 active:scale-[0.96]"
                  [disabled]="!s.isAvailable"
                  [ngClass]="(selectedSlot?.start === s.start && s.isAvailable)
                    ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                    : (!s.isAvailable
                      ? 'bg-surface-50 dark:bg-surface-800 text-surface-400 dark:text-surface-500 line-through border-surface-200 dark:border-surface-700 cursor-not-allowed'
                      : 'bg-white dark:bg-surface-700 text-surface-700 dark:text-surface-300 border-surface-200 dark:border-surface-600 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 cursor-pointer')">
            {{ formatTime(s.start) }}
          </button>
        </div>
      </div>
    </div>

    <!-- ═══════════════ Step 4: Payment + Confirmation ═══════════════ -->
    <div class="card p-6" *ngIf="step() === 4">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-50">{{ 'APPOINTMENT.PAYMENT_TITLE' | translate }}</h2>
        <button class="btn-secondary btn-sm" (click)="step.set(3)">
          <mat-icon class="!text-[16px]">arrow_back</mat-icon>
          {{ 'COMMON.PREVIOUS' | translate }}
        </button>
      </div>

      <!-- Booking Summary -->
      <div class="card !bg-surface-50 dark:!bg-surface-700/50 p-4 mb-5">
        <div class="space-y-3 text-sm">
          <div class="flex justify-between items-center py-1.5 border-b border-surface-200 dark:border-surface-600">
            <span class="flex items-center gap-2 text-surface-500 dark:text-surface-400">
              <mat-icon class="!text-[16px]">person</mat-icon>
              {{ 'APPOINTMENT.DOCTOR' | translate }}
            </span>
            <span class="font-medium text-surface-800 dark:text-surface-200">{{ selectedDoctor?.fullName }}</span>
          </div>
          <div class="flex justify-between items-center py-1.5 border-b border-surface-200 dark:border-surface-600">
            <span class="flex items-center gap-2 text-surface-500 dark:text-surface-400">
              <mat-icon class="!text-[16px]">local_hospital</mat-icon>
              {{ 'APPOINTMENT.CLINIC' | translate }}
            </span>
            <span class="font-medium text-surface-800 dark:text-surface-200">{{ selectedClinic?.name }}</span>
          </div>
          <div class="flex justify-between items-center py-1.5 border-b border-surface-200 dark:border-surface-600">
            <span class="flex items-center gap-2 text-surface-500 dark:text-surface-400">
              <mat-icon class="!text-[16px]">schedule</mat-icon>
              {{ 'APPOINTMENT.DATE_TIME' | translate }}
            </span>
            <span class="font-medium text-surface-800 dark:text-surface-200">{{ selectedSlot ? formatSlot(selectedSlot) : '' }}</span>
          </div>
          <div class="flex justify-between items-center py-1.5">
            <span class="flex items-center gap-2 text-surface-500 dark:text-surface-400">
              <mat-icon class="!text-[16px]">payments</mat-icon>
              {{ 'APPOINTMENT.PAYMENT_AMOUNT' | translate }}
            </span>
            <span class="font-bold text-lg text-emerald-600 dark:text-emerald-400">{{ consultationFee() | number:'1.2-2' }} {{ 'COMMON.CURRENCY' | translate }}</span>
          </div>
        </div>
      </div>

      <!-- Pay at Clinic -->
      <h3 class="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3">{{ 'APPOINTMENT.PAY_AT_CLINIC' | translate }}</h3>
      <div class="grid grid-cols-2 gap-3 mb-2">
        <label *ngFor="let opt of payAtClinicOptions" class="cursor-pointer">
          <input type="radio" name="paymentMethod" class="sr-only peer" [value]="opt.id" [checked]="paymentMethod() === opt.id" (change)="selectPayment(opt.id)">
          <div class="rounded-xl border-2 p-4 transition-all duration-200 peer-checked:shadow-md"
               [ngClass]="(paymentMethod() === opt.id)
                 ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                 : 'border-surface-200 dark:border-surface-600 hover:border-surface-300 dark:hover:border-surface-500'">
            <mat-icon [ngClass]="(paymentMethod() === opt.id) ? 'text-emerald-600 dark:text-emerald-400' : 'text-surface-400'">{{ opt.icon }}</mat-icon>
            <div class="font-medium mt-1.5 text-sm text-surface-800 dark:text-surface-200">{{ paymentLabel(opt.id) | translate }}</div>
          </div>
        </label>
      </div>
      <p class="text-xs text-surface-500 dark:text-surface-400 mt-1 mb-5 flex items-center gap-1">
        <mat-icon class="!text-[14px]">info</mat-icon>
        {{ 'APPOINTMENT.PAY_LATER_HINT' | translate }}
      </p>

      <!-- Pay Online -->
      <h3 class="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3">{{ 'APPOINTMENT.PAY_ONLINE' | translate }}</h3>
      <div class="grid grid-cols-2 gap-3 mb-2">
        <label *ngFor="let opt of payOnlineOptions" class="cursor-pointer">
          <input type="radio" name="paymentMethod" class="sr-only peer" [value]="opt.id" [checked]="paymentMethod() === opt.id" (change)="selectPayment(opt.id)">
          <div class="rounded-xl border-2 p-4 transition-all duration-200 peer-checked:shadow-md"
               [ngClass]="(paymentMethod() === opt.id)
                 ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                 : 'border-surface-200 dark:border-surface-600 hover:border-surface-300 dark:hover:border-surface-500'">
            <mat-icon [ngClass]="(paymentMethod() === opt.id) ? 'text-primary-600 dark:text-primary-400' : 'text-surface-400'">{{ opt.icon }}</mat-icon>
            <div class="font-medium mt-1.5 text-sm text-surface-800 dark:text-surface-200">{{ paymentLabel(opt.id) | translate }}</div>
          </div>
        </label>
      </div>
      <div class="space-y-1 mt-1 mb-5">
        <p class="text-xs text-surface-500 dark:text-surface-400 flex items-center gap-1">
          <mat-icon class="!text-[14px]">lock</mat-icon>
          {{ 'APPOINTMENT.ONLINE_HINT' | translate }}
        </p>
        <p class="text-xs text-surface-500 dark:text-surface-400 flex items-center gap-1">
          <mat-icon class="!text-[14px]">info</mat-icon>
          {{ 'APPOINTMENT.PAY_NOW_HINT' | translate }}
        </p>
      </div>

      <!-- Payment Instructions -->
      <div *ngIf="paymentMethod()" class="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 text-sm text-amber-800 dark:text-amber-200 mb-5">
        <div class="flex items-start gap-2">
          <mat-icon class="!text-[18px] mt-0.5 shrink-0">lightbulb</mat-icon>
          <span>{{ paymentInstruction(paymentMethod()!) | translate }}</span>
        </div>
      </div>

      <!-- Reason -->
      <div class="mb-4">
        <label class="label">{{ 'APPOINTMENT.REASON' | translate }}</label>
        <textarea
          [(ngModel)]="reason"
          (ngModelChange)="onReasonChange()"
          [maxlength]="REASON_MAX"
          rows="2"
          class="input"
          [class.input-error]="reasonError()"
          [placeholder]="'APPOINTMENT.REASON_PLACEHOLDER' | translate"></textarea>
        <div class="flex items-center justify-between mt-1.5">
          <p *ngIf="reasonError()" class="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
            <mat-icon class="!text-[14px]">error_outline</mat-icon>{{ reasonError() }}
          </p>
          <p *ngIf="!reasonError()" class="text-xs text-surface-400 dark:text-surface-500">{{ 'APPOINTMENT.REASON_HINT' | translate }}</p>
          <span class="text-xs text-surface-400 dark:text-surface-500 ms-auto">{{ (reason || '').length }} / {{ REASON_MAX }}</span>
        </div>
      </div>

      <!-- Notes -->
      <div class="mb-4">
        <label class="label">{{ 'APPOINTMENT.NOTES' | translate }}</label>
        <textarea
          [(ngModel)]="notes"
          (ngModelChange)="onNotesChange()"
          [maxlength]="NOTES_MAX"
          rows="2"
          class="input"
          [class.input-error]="notesError()"></textarea>
        <div class="flex items-center justify-between mt-1.5">
          <p *ngIf="notesError()" class="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
            <mat-icon class="!text-[14px]">error_outline</mat-icon>{{ notesError() }}
          </p>
          <p *ngIf="!notesError()" class="text-xs text-surface-400 dark:text-surface-500">{{ 'APPOINTMENT.NOTES_HINT' | translate }}</p>
          <span class="text-xs text-surface-400 dark:text-surface-500 ms-auto">{{ (notes || '').length }} / {{ NOTES_MAX }}</span>
        </div>
      </div>

      <!-- Payment Method Error -->
      <p *ngIf="!paymentMethod() && paymentTouched()" class="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 mb-4">
        <mat-icon class="!text-[14px]">error_outline</mat-icon>{{ 'APPOINTMENT.SELECT_METHOD' | translate }}
      </p>

      <!-- Error -->
      <div *ngIf="error()" class="error-box mb-4">{{ error() }}</div>

      <!-- Action Buttons -->
      <div class="flex gap-3 mt-5">
        <button (click)="confirm(false)" [disabled]="loading() || !canBook()" class="btn-secondary flex-1 !py-3">
          <mat-icon>event</mat-icon>
          {{ 'APPOINTMENT.PAY_LATER' | translate }}
        </button>
        <button (click)="confirm(true)" [disabled]="loading() || !canBook() || !isOnlinePayment()" class="btn-primary flex-1 !py-3">
          <mat-icon>payments</mat-icon>
          {{ 'APPOINTMENT.PAY_NOW' | translate }}
        </button>
      </div>
      <p *ngIf="paymentMethod() && !isOnlinePayment()" class="text-xs text-amber-600 dark:text-amber-400 mt-3 text-center flex items-center justify-center gap-1">
        <mat-icon class="!text-[14px]">arrow_forward</mat-icon>
        {{ 'APPOINTMENT.PAY_NOW_ONLINE_ONLY' | translate }}
      </p>
      <p *ngIf="isOnlinePayment()" class="text-xs text-emerald-600 dark:text-emerald-400 mt-3 text-center flex items-center justify-center gap-1">
        <mat-icon class="!text-[14px]">arrow_forward</mat-icon>
        Online payment will be completed on the next step.
      </p>
    </div>

    <!-- ═══════════════ Step 5: Online Payment Reference ═══════════════ -->
    <div class="card p-6" *ngIf="step() === 5">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-50">{{ 'APPOINTMENT.PAYMENT_PAY_NOW_TITLE' | translate }}</h2>
        <button class="btn-secondary btn-sm" (click)="step.set(4)">
          <mat-icon class="!text-[16px]">arrow_back</mat-icon>
          {{ 'COMMON.PREVIOUS' | translate }}
        </button>
      </div>

      <!-- Summary Card -->
      <div class="card !bg-surface-50 dark:!bg-surface-700/50 p-4 mb-5">
        <div class="space-y-2 text-sm">
          <div class="flex justify-between items-center py-1">
            <span class="text-surface-500 dark:text-surface-400">{{ 'APPOINTMENT.PAYMENT_AMOUNT' | translate }}</span>
            <span class="font-bold text-emerald-600 dark:text-emerald-400 text-xl">{{ consultationFee() | number:'1.2-2' }} {{ 'COMMON.CURRENCY' | translate }}</span>
          </div>
          <div class="flex justify-between items-center py-1">
            <span class="text-surface-500 dark:text-surface-400">{{ 'APPOINTMENT.DOCTOR' | translate }}</span>
            <span class="font-medium text-surface-800 dark:text-surface-200">{{ selectedDoctor?.fullName }}</span>
          </div>
        </div>
      </div>

      <!-- Payment Instructions Box -->
      <div class="rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 p-4 mb-5">
        <h3 class="font-semibold text-primary-900 dark:text-primary-200 mb-2">{{ paymentLabel(paymentMethod()!) | translate }}</h3>
        <p class="text-sm text-surface-700 dark:text-surface-300">{{ paymentInstruction(paymentMethod()!) | translate }}</p>
      </div>

      <!-- Reference Input -->
      <div class="mb-4">
        <label class="label">{{ 'APPOINTMENT.PAYMENT_REFERENCE_LABEL' | translate }}</label>
        <input
          [(ngModel)]="paymentReference"
          (ngModelChange)="onPaymentReferenceChange()"
          class="input"
          [class.input-error]="paymentReferenceError()"
          [placeholder]="'APPOINTMENT.PAYMENT_REFERENCE_PLACEHOLDER' | translate">
        <p *ngIf="paymentReferenceError()" class="text-xs text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1">
          <mat-icon class="!text-[14px]">error_outline</mat-icon>{{ paymentReferenceError() }}
        </p>
        <p *ngIf="!paymentReferenceError()" class="text-xs text-surface-500 dark:text-surface-400 mt-1.5 flex items-center gap-1">
          <mat-icon class="!text-[14px]">info</mat-icon>
          {{ 'APPOINTMENT.PAYMENT_REFERENCE_HINT' | translate }}
        </p>
      </div>

      <button (click)="payNowAndBook()"
              [disabled]="loading() || !!paymentReferenceError()"
              class="btn-primary w-full !py-3 mt-4">
        <mat-icon *ngIf="!loading()">check_circle</mat-icon>
        <span *ngIf="!loading()">{{ 'APPOINTMENT.CONFIRM_BOOKING' | translate }}</span>
        <span *ngIf="loading()">{{ 'COMMON.LOADING' | translate }}...</span>
      </button>

      <div *ngIf="error()" class="error-box mt-3">{{ error() }}</div>
    </div>

    <!-- ═══════════════ Success ═══════════════ -->
    <div class="card p-10 text-center" *ngIf="success()">
      <div class="w-20 h-20 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-5">
        <mat-icon class="!w-12 !h-12 !text-[48px]">check_circle</mat-icon>
      </div>
      <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-50">{{ 'APPOINTMENT.BOOKED' | translate }}</h2>
      <p class="text-surface-500 dark:text-surface-400 mt-2">
        {{ 'APPOINTMENT.CONFIRMATION_CODE' | translate }}:
        <span class="font-mono font-bold text-surface-800 dark:text-surface-200">{{ success()?.confirmationCode }}</span>
      </p>

      <!-- Payment Status Badge -->
      <div class="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
           [ngClass]="success()?.isPaid
             ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
             : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'">
        <mat-icon class="!text-base">{{ success()?.isPaid ? 'verified' : 'pending' }}</mat-icon>
        <span *ngIf="success()?.isPaid && success()?.paymentMethod">{{ 'APPOINTMENT.PAYMENT_RECORDED' | translate }} ({{ paymentLabel(success()!.paymentMethod!) | translate }})</span>
        <span *ngIf="!success()?.isPaid && pendingPaymentKey() === 'VODAFONE'">{{ 'APPOINTMENT.PAYMENT_PENDING_VODAFONE' | translate }}</span>
        <span *ngIf="!success()?.isPaid && pendingPaymentKey() === 'INSTAPAY'">{{ 'APPOINTMENT.PAYMENT_PENDING_INSTAPAY' | translate }}</span>
        <span *ngIf="!success()?.isPaid && pendingPaymentKey() === 'CLINIC'">{{ 'APPOINTMENT.PAYMENT_PAY_AT_CLINIC' | translate }}</span>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 justify-center mt-8">
        <a routerLink="/patient/appointments" class="btn-primary">
          <mat-icon>event</mat-icon>
          {{ 'NAV.APPOINTMENTS' | translate }}
        </a>
        <a routerLink="/patient/dashboard" class="btn-secondary">
          <mat-icon>dashboard</mat-icon>
          {{ 'NAV.DASHBOARD' | translate }}
        </a>
      </div>
    </div>
  `
})
export class BookAppointmentComponent implements OnInit {
  private data = inject(DataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  private translate = inject(TranslateService);

  readonly REASON_MAX = REASON_MAX;
  readonly NOTES_MAX = NOTES_MAX;
  readonly PAYMENT_REF_PATTERN = PAYMENT_REF_PATTERN;
  readonly todayDate: string;

  step = signal(1);
  specialties = signal<SpecialtyDto[]>([]);
  doctors = signal<DoctorDto[]>([]);
  clinics = signal<ClinicDto[]>([]);
  slots = signal<TimeSlotDto[]>([]);
  selectedSlot: TimeSlotDto | null = null;
  selectedDoctor: DoctorDto | null = null;
  selectedClinic: ClinicDto | null = null;
  loadingSlots = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<AppointmentDto | null>(null);

  // Validation state — driven by (ngModelChange) so every keystroke / pick is validated live.
  paymentTouched = signal(false);
  dateTouched = signal(false);
  reasonError = signal<string | null>(null);
  notesError = signal<string | null>(null);
  paymentReferenceError = signal<string | null>(null);

  // Payment state
  paymentMethod = signal<PaymentMethod | null>(null);
  paymentReference = '';

  constructor() {
    this.todayDate = new Date().toISOString().slice(0, 10);
  }
  readonly payAtClinicOptions: PaymentOption[] = [
    { id: 1, icon: 'payments', group: 'clinic' },
    { id: 2, icon: 'credit_card', group: 'clinic' }
  ];
  readonly payOnlineOptions: PaymentOption[] = [
    { id: 3, icon: 'phone_iphone', group: 'online' },
    { id: 4, icon: 'account_balance', group: 'online' }
  ];

  specialtyId: number | null = null;
  doctorId: number | null = null;
  clinicId: number | null = null;
  date = '';
  reason = '';
  notes = '';

  consultationFee(): number {
    return this.selectedDoctor?.defaultConsultationFee ?? 0;
  }

  selectPayment(id: PaymentMethod) {
    this.paymentMethod.set(id);
    this.paymentTouched.set(true);
    // Re-validate any previously entered payment reference
    this.onPaymentReferenceChange();
  }

  isOnlinePayment(): boolean {
    const m = this.paymentMethod();
    return m === 3 || m === 4; // VodafoneCash or InstaPay
  }

  /** Can the booking be confirmed? Returns true once a payment method is selected. */
  canBook(): boolean {
    return this.paymentMethod() !== null;
  }

  /** Clear the message if any selection happens after an error was shown. */
  clearError() {
    if (this.error()) this.error.set(null);
  }

  // === Live validations ===

  onReasonChange() {
    this.clearError();
    const v = (this.reason || '').trim();
    if (v.length > REASON_MAX) {
      this.reasonError.set(this.translate.instant('COMMON.MAX_LENGTH', { max: REASON_MAX }));
    } else {
      this.reasonError.set(null);
    }
  }

  onNotesChange() {
    this.clearError();
    const v = (this.notes || '').trim();
    if (v.length > NOTES_MAX) {
      this.notesError.set(this.translate.instant('COMMON.MAX_LENGTH', { max: NOTES_MAX }));
    } else {
      this.notesError.set(null);
    }
  }

  onDateChange() {
    this.dateTouched.set(true);
    this.selectedSlot = null;
    if (!this.date) return;
    this.loadSlots();
  }

  /** Reference is optional, but if present must be 6-40 alphanum/-_/ chars. */
  onPaymentReferenceChange() {
    const v = (this.paymentReference || '').trim();
    if (v && !PAYMENT_REF_PATTERN.test(v)) {
      this.paymentReferenceError.set(this.translate.instant('APPOINTMENT.PAYMENT_REFERENCE_INVALID'));
    } else {
      this.paymentReferenceError.set(null);
    }
  }

  paymentLabel(id: PaymentMethod): string {
    switch (id) {
      case 1: return 'APPOINTMENT.PAYMENT_METHOD_CASH';
      case 2: return 'APPOINTMENT.PAYMENT_METHOD_CARD';
      case 3: return 'APPOINTMENT.PAYMENT_METHOD_VODAFONE_CASH';
      case 4: return 'APPOINTMENT.PAYMENT_METHOD_INSTAPAY';
      default: return '';
    }
  }

  /** Resolve the success-card payment status key. Returns VODAFONE / INSTAPAY / CLINIC / '' */
  pendingPaymentKey(): 'VODAFONE' | 'INSTAPAY' | 'CLINIC' | '' {
    const raw: any = this.success()?.paymentMethod ?? '';
    const v = String(raw).toLowerCase();
    if (v === '3' || v === 'vodafonecash') return 'VODAFONE';
    if (v === '4' || v === 'instapay') return 'INSTAPAY';
    if (v === '' || v === '0' || v === '1' || v === '2' || v === 'cash' || v === 'card') return 'CLINIC';
    return '';
  }

  paymentInstruction(id: PaymentMethod): string {
    switch (id) {
      case 1: return 'APPOINTMENT.PAYMENT_INSTRUCTIONS_CASH';
      case 2: return 'APPOINTMENT.PAYMENT_INSTRUCTIONS_CARD';
      case 3: return 'APPOINTMENT.PAYMENT_INSTRUCTIONS_VODAFONE_CASH';
      case 4: return 'APPOINTMENT.PAYMENT_INSTRUCTIONS_INSTAPAY';
      default: return '';
    }
  }

  ngOnInit() {
    this.date = new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 10);
    this.data.listSpecialties(1, 50).subscribe(r => { this.specialties.set(r.items ?? []); });
    const presetDoctorId = this.route.snapshot.queryParamMap.get('doctorId');
    if (presetDoctorId) {
      const id = +presetDoctorId;
      this.data.getDoctor(id).subscribe({
        next: d => {
          this.doctorId = id;
          this.specialtyId = d.specialtyId;
          this.selectedDoctor = d;
          // Pre-fetch doctors in this specialty so Step 2 is consistent if user goes back.
          this.data.listDoctors(1, 24, d.specialtyId, undefined, true).subscribe(r => { this.doctors.set(r.items ?? []); });
          this.step.set(3);
          this.loadClinicsAndSlots();
        },
        error: () => { /* ignore — user can pick manually */ }
      });
    }
  }

  pickSpecialty(id: number) {
    this.specialtyId = id;
    this.data.listDoctors(1, 24, id, undefined, true).subscribe(r => { this.doctors.set(r.items ?? []); });
    this.step.set(2);
  }

  pickDoctor(d: DoctorDto) {
    this.doctorId = d.id;
    this.selectedDoctor = d;
    this.loadClinicsAndSlots();
  }

  loadClinicsAndSlots() {
    this.data.getDoctorClinics(this.doctorId!).subscribe(r => { this.clinics.set(r ?? []); });
    this.step.set(3);
  }

  pickClinic(id: number) {
    this.clinicId = id;
    this.selectedClinic = this.clinics().find(c => c.id === id) ?? null;
    this.loadSlots();
  }

  loadSlots() {
    if (!this.doctorId || !this.date) return;
    this.loadingSlots.set(true);
    this.data.getAvailableSlots(this.doctorId, this.date, this.clinicId ?? undefined).subscribe({
      next: s => { this.slots.set(s); this.loadingSlots.set(false); },
      error: () => this.loadingSlots.set(false)
    });
  }

  pickSlot(s: TimeSlotDto) {
    if (!s.isAvailable) return;
    this.selectedSlot = s;
    this.step.set(4);
  }

  /** Step 4 button handler. If payNow=true and method is online, jump to step 5. Otherwise book immediately. */
  confirm(payNow: boolean) {
    if (!this.doctorId || !this.clinicId || !this.selectedSlot) {
      this.error.set(this.translate.instant('COMMON.INCOMPLETE_SELECTION'));
      return;
    }
    this.paymentTouched.set(true);
    if (!this.paymentMethod()) {
      this.error.set(this.translate.instant('APPOINTMENT.SELECT_METHOD'));
      return;
    }
    // Re-run validations before allowing submit
    this.onReasonChange();
    this.onNotesChange();
    if (this.reasonError() || this.notesError()) {
      this.error.set(this.translate.instant('COMMON.FIX_ERRORS'));
      return;
    }
    // Cash/Card cannot be marked as paid online -> treat as pay-later regardless of the button pressed
    if (payNow && !this.isOnlinePayment()) payNow = false;
    if (payNow && this.isOnlinePayment()) {
      this.onPaymentReferenceChange();
      this.step.set(5);
      return;
    }
    this.bookAppointment(payNow);
  }

  /** Step 5 button handler. Books + immediately marks as paid (online flow). */
  payNowAndBook() {
    this.onPaymentReferenceChange();
    if (!this.paymentMethod() || !this.isOnlinePayment()) return;
    if (this.paymentReferenceError()) {
      this.error.set(this.paymentReferenceError());
      return;
    }
    this.bookAppointment(true);
  }

  private bookAppointment(payNow: boolean) {
    this.loading.set(true);
    this.error.set(null);
    const method = this.paymentMethod()!;
    this.data.bookAppointment({
      doctorId: this.doctorId!,
      clinicId: this.clinicId!,
      scheduledStart: this.selectedSlot!.start,
      reasonForVisit: this.reason,
      patientNotes: this.notes,
      paymentMethod: method
    }).subscribe({
      next: appointment => {
        // For online payments, immediately mark as paid using the optional reference.
        if (payNow && this.isOnlinePayment() && appointment?.id) {
          this.data.markAppointmentPaid(appointment.id, {
            paymentMethod: method,
            paymentReference: this.paymentReference || undefined
          }).subscribe({
            next: paid => {
              this.loading.set(false);
              this.success.set(paid);
              this.snack.open(this.translate.instant('APPOINTMENT.BOOKED'), this.translate.instant('COMMON.OK'), { duration: 3000 });
            },
            error: err => {
              this.loading.set(false);
              // Booking succeeded but marking-paid failed — still show success with a warning.
              this.success.set(appointment);
              this.error.set(err.error?.message || err.error?.title || this.translate.instant('COMMON.SAVE_FAILED'));
            },
            // Even if mark-paid errors, ensure UI unlocks via fetch from server.
            complete: () => { /* no-op */ }
          });
        } else {
          this.loading.set(false);
          this.success.set(appointment);
          this.snack.open(this.translate.instant('APPOINTMENT.BOOKED'), this.translate.instant('COMMON.OK'), { duration: 3000 });
        }
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err.error?.message || err.error?.title || this.translate.instant('COMMON.ERROR_OCCURRED'));
      }
    });
  }

  initials(name: string) { return name.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase(); }
  formatTime(iso: string) { return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }); }
  formatSlot(s: TimeSlotDto) {
    const d = new Date(s.start);
    return d.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
