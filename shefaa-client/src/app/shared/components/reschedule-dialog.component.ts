import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { DataService } from '../../core/services/data.service';
import { TimeSlotDto } from '../../core/models';

@Component({
  selector: 'app-reschedule-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatIconModule, TranslateModule],
  template: `
    <div class="p-6">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <mat-icon>event_repeat</mat-icon>
        </div>
        <h2 class="text-lg font-semibold">{{ 'APPOINTMENT.RESCHEDULE_TITLE' | translate }}</h2>
      </div>
      <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">{{ 'APPOINTMENT.RESCHEDULE_CONFIRM' | translate }}</p>

      <label class="label">{{ 'BOOKING.SELECT_DATE' | translate }}</label>
      <input type="date" [(ngModel)]="selectedDate" (ngModelChange)="loadSlots()" class="input mb-4" [min]="minDate">

      <div *ngIf="loadingSlots()" class="text-sm text-slate-400 py-4 text-center">
        <mat-icon class="animate-spin mr-2">refresh</mat-icon> {{ 'COMMON.LOADING' | translate }}
      </div>

      <div *ngIf="!loadingSlots() && slots().length === 0 && selectedDate" class="empty-state !py-6">
        <mat-icon class="text-3xl text-slate-300 dark:text-slate-600">event_busy</mat-icon>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ 'BOOKING.NO_SLOTS' | translate }}</p>
      </div>

      <div *ngIf="slots().length > 0" class="max-h-48 overflow-y-auto space-y-2 mb-4">
        <button *ngFor="let s of slots()"
                [disabled]="!s.isAvailable"
                (click)="selectedSlot = s"
                class="w-full text-left p-3 rounded-xl border text-sm transition-all"
                [ngClass]="selectedSlot === s
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 ring-1 ring-primary-500'
                  : s.isAvailable
                    ? 'border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-700'
                    : 'border-surface-100 dark:border-surface-800 opacity-40 cursor-not-allowed'">
          <span class="font-medium">{{ formatTime(s.start) }}</span>
          <span class="text-slate-400 mx-1">–</span>
          <span class="text-slate-500">{{ formatTime(s.end) }}</span>
        </button>
      </div>

      <div class="flex justify-end gap-2 mt-4 pt-3 border-t border-surface-100 dark:border-surface-700">
        <button mat-dialog-close class="btn-secondary">{{ 'COMMON.CANCEL' | translate }}</button>
        <button [disabled]="!selectedSlot" (click)="confirm()" class="btn-primary">
          {{ 'COMMON.CONFIRM' | translate }}
        </button>
      </div>
    </div>
  `
})
export class RescheduleDialogComponent implements OnInit {
  private data = inject(DataService);
  public dialogRef = inject(MatDialogRef<RescheduleDialogComponent>);

  selectedDate = '';
  selectedSlot: TimeSlotDto | null = null;
  slots = signal<TimeSlotDto[]>([]);
  loadingSlots = signal(false);
  minDate = '';

  // Injected via dialog data
  doctorId = 0;
  clinicId = 0;

  ngOnInit() {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    this.selectedDate = this.minDate;
    this.loadSlots();
  }

  loadSlots() {
    if (!this.selectedDate || !this.doctorId) return;
    this.loadingSlots.set(true);
    this.selectedSlot = null;
    this.data.getAvailableSlots(this.doctorId, this.selectedDate, this.clinicId || undefined).subscribe({
      next: s => { this.slots.set(s); this.loadingSlots.set(false); },
      error: () => { this.slots.set([]); this.loadingSlots.set(false); }
    });
  }

  confirm() {
    if (this.selectedSlot) {
      this.dialogRef.close(this.selectedSlot.start);
    }
  }

  formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }
}
