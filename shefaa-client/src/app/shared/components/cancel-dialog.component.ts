import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatIconModule, TranslateModule],
  template: `
    <div class="p-6">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
          <mat-icon>cancel</mat-icon>
        </div>
        <h2 class="text-lg font-semibold">{{ 'APPOINTMENT.CANCEL_TITLE' | translate }}</h2>
      </div>
      <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">{{ 'APPOINTMENT.CANCEL_CONFIRM' | translate }}</p>
      <label class="label">{{ 'APPOINTMENT.CANCEL_REASON' | translate }}</label>
      <textarea [(ngModel)]="reason" rows="3" class="input"></textarea>
      <div class="flex justify-end gap-2 mt-4">
        <button mat-dialog-close class="btn-secondary">{{ 'COMMON.CANCEL' | translate }}</button>
        <button [disabled]="!reason?.trim()" (click)="dialogRef.close(reason)" class="btn-danger">
          {{ 'COMMON.CONFIRM' | translate }}
        </button>
      </div>
    </div>
  `
})
export class CancelAppointmentDialogComponent {
  reason: string | null = '';
  constructor(public dialogRef: MatDialogRef<CancelAppointmentDialogComponent>) {}
}