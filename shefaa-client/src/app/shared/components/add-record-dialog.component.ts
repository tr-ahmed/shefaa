import { Component, Inject, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { DataService } from '../../core/services/data.service';
import { TranslateService } from '@ngx-translate/core';
import { AppointmentDto, PrescriptionDto } from '../../core/models';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatDialogModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, TranslateModule],
  template: `
    <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-lg font-semibold">{{ 'DOCTOR_PORTAL.RECORD_TITLE' | translate }}</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ data.patientName }} · {{ data.scheduledStart | date:'medium' }}</p>
        </div>
        <button mat-dialog-close class="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"><mat-icon>close</mat-icon></button>
      </div>

      <form [formGroup]="form" class="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        <div>
          <label class="label">{{ 'DOCTOR_PORTAL.CHIEF_COMPLAINT' | translate }}</label>
          <textarea formControlName="chiefComplaint" rows="2" class="input"></textarea>
        </div>
        <div>
          <label class="label">{{ 'DOCTOR_PORTAL.DIAGNOSIS' | translate }}</label>
          <textarea formControlName="diagnosis" rows="2" class="input"></textarea>
        </div>
        <div class="grid sm:grid-cols-2 gap-3">
          <div>
            <label class="label">{{ 'DOCTOR_PORTAL.SYMPTOMS' | translate }}</label>
            <textarea formControlName="symptoms" rows="2" class="input"></textarea>
          </div>
          <div>
            <label class="label">{{ 'DOCTOR_PORTAL.TREATMENT_PLAN' | translate }}</label>
            <textarea formControlName="treatmentPlan" rows="2" class="input"></textarea>
          </div>
        </div>
        <div>
          <label class="label">{{ 'DOCTOR_PORTAL.INVESTIGATIONS' | translate }}</label>
          <textarea formControlName="investigations" rows="2" class="input"></textarea>
        </div>

        <div class="border-t border-slate-100 dark:border-slate-700 pt-3">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-semibold text-sm">{{ 'DOCTOR_PORTAL.PRESCRIPTIONS' | translate }}</h3>
            <button type="button" (click)="addPrescription()" class="btn-secondary !py-1.5 !px-3 text-xs"><mat-icon class="text-base">add</mat-icon> {{ 'DOCTOR_PORTAL.ADD_PRESCRIPTION' | translate }}</button>
          </div>
          <div *ngFor="let p of prescriptions; let i = index" class="p-3 mb-2 rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <input [(ngModel)]="p.medicationName" [ngModelOptions]="{standalone:true}" placeholder="{{ 'DOCTOR_PORTAL.MEDICATION' | translate }}" class="input text-sm">
              <input [(ngModel)]="p.dosage" [ngModelOptions]="{standalone:true}" placeholder="{{ 'DOCTOR_PORTAL.DOSAGE' | translate }}" class="input text-sm">
              <input [(ngModel)]="p.frequency" [ngModelOptions]="{standalone:true}" placeholder="{{ 'DOCTOR_PORTAL.FREQUENCY' | translate }}" class="input text-sm">
              <input [(ngModel)]="p.duration" [ngModelOptions]="{standalone:true}" placeholder="{{ 'DOCTOR_PORTAL.DURATION' | translate }}" class="input text-sm">
            </div>
            <div class="flex justify-between items-center mt-2">
              <input [(ngModel)]="p.instructions" [ngModelOptions]="{standalone:true}" placeholder="{{ 'DOCTOR_PORTAL.INSTRUCTIONS' | translate }}" class="input text-sm flex-1 me-2">
              <button type="button" (click)="removePrescription(i)" class="text-red-600 dark:text-red-400"><mat-icon>delete</mat-icon></button>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3 pt-2">
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" formControlName="followUpRequired"> {{ 'DOCTOR_PORTAL.FOLLOW_UP_REQUIRED' | translate }}
          </label>
          <input *ngIf="form.get('followUpRequired')?.value" type="date" formControlName="followUpDate" class="input flex-1 max-w-xs">
        </div>

        <div *ngIf="error()" class="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm p-3">{{ error() }}</div>
      </form>

      <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
        <button mat-dialog-close class="btn-secondary">{{ 'COMMON.CANCEL' | translate }}</button>
        <button (click)="save()" [disabled]="loading()" class="btn-primary">
          {{ 'DOCTOR_PORTAL.RECORD_SAVED' | translate }} · {{ 'STATUS.Completed' | translate }}
        </button>
      </div>
    </div>
  `
})
export class AddRecordDialogComponent {
  private fb = inject(FormBuilder);
  private dataSvc = inject(DataService);
  private snack = inject(MatSnackBar);
  private translate = inject(TranslateService);
  private dialogRef = inject(MatDialogRef<AddRecordDialogComponent>);

  loading = signal(false);
  error = signal<string | null>(null);
  prescriptions: Partial<PrescriptionDto>[] = [];

  form = this.fb.nonNullable.group({
    chiefComplaint: [''],
    diagnosis: [''],
    symptoms: [''],
    treatmentPlan: [''],
    investigations: [''],
    notes: [''],
    followUpRequired: [false],
    followUpDate: ['']
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: AppointmentDto) {}

  addPrescription() {
    this.prescriptions.push({ medicationName: '', dosage: '', frequency: '', duration: '', instructions: '', refillAllowed: false });
  }

  removePrescription(i: number) {
    this.prescriptions.splice(i, 1);
  }

  save() {
    this.loading.set(true);
    this.error.set(null);
    const body = {
      ...this.form.getRawValue(),
      followUpDate: this.form.value.followUpRequired ? this.form.value.followUpDate : null,
      prescriptions: this.prescriptions.filter(p => p.medicationName?.trim()).map(p => ({
        medicationName: p.medicationName,
        dosage: p.dosage,
        frequency: p.frequency,
        duration: p.duration,
        instructions: p.instructions,
        quantity: p.quantity ?? null,
        refillAllowed: p.refillAllowed ?? false
      }))
    };
    this.dataSvc.createMedicalRecord({ appointmentId: this.data.id, ...body }).subscribe({
      next: () => {
        this.loading.set(false);
        this.snack.open(this.translate.instant('DOCTOR_PORTAL.RECORD_SAVED'), this.translate.instant('COMMON.OK'), { duration: 2500 });
        this.dialogRef.close(true);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err.error?.message || this.translate.instant('ADMIN.CLINIC_STAFF.SAVE_FAILED'));
      }
    });
  }
}