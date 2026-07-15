import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-review-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, TranslateModule],
  template: `
    <div class="p-6">
      <h2 class="text-xl font-bold text-slate-800 dark:text-white mb-1">{{ 'REVIEW.TITLE' | translate }}</h2>
      <p class="text-sm text-slate-500 dark:text-slate-400 mb-5">{{ 'REVIEW.SUBTITLE' | translate }}</p>
      
      <div class="flex flex-col gap-4">
        <!-- Rating Stars -->
        <div class="flex flex-col items-center mb-2">
          <label class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{{ 'REVIEW.RATING' | translate }} *</label>
          <div class="flex gap-2">
            <button 
              *ngFor="let star of [1, 2, 3, 4, 5]" 
              (click)="setRating(star)"
              (mouseenter)="hoverRating.set(star)"
              (mouseleave)="hoverRating.set(0)"
              type="button" 
              class="transition-transform hover:scale-110 focus:outline-none"
            >
              <mat-icon 
                class="text-4xl"
                [ngClass]="(hoverRating() || rating()) >= star ? 'text-amber-400' : 'text-slate-200 dark:text-slate-600'"
                style="width: 40px; height: 40px; font-size: 40px;"
              >
                {{ (hoverRating() || rating()) >= star ? 'star' : 'star_outline' }}
              </mat-icon>
            </button>
          </div>
        </div>

        <!-- Comment -->
        <div>
          <label class="label">{{ 'REVIEW.COMMENT' | translate }}</label>
          <textarea 
            [(ngModel)]="comment" 
            class="input min-h-[100px] resize-y" 
            [placeholder]="'REVIEW.COMMENT_PLACEHOLDER' | translate"
            maxlength="2000"
          ></textarea>
        </div>

        <!-- Anonymous -->
        <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer w-max">
          <input type="checkbox" [(ngModel)]="isAnonymous" class="rounded text-primary-600 dark:text-primary-400 focus:ring-primary-500"> 
          {{ 'REVIEW.ANONYMOUS' | translate }}
        </label>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <button mat-button type="button" class="btn-secondary" (click)="close()">
          {{ 'REVIEW.CANCEL' | translate }}
        </button>
        <button mat-flat-button color="primary" class="btn-primary" [disabled]="!rating()" (click)="submit()">
          <mat-icon>send</mat-icon> {{ 'REVIEW.SUBMIT' | translate }}
        </button>
      </div>
    </div>
  `
})
export class ReviewDialogComponent {
  rating = signal(0);
  hoverRating = signal(0);
  comment = '';
  isAnonymous = false;

  constructor(private dialogRef: MatDialogRef<ReviewDialogComponent>) {}

  setRating(val: number) {
    this.rating.set(val);
  }

  close() {
    this.dialogRef.close();
  }

  submit() {
    if (!this.rating()) return;
    
    this.dialogRef.close({
      rating: this.rating(),
      comment: this.comment.trim() || null,
      isAnonymous: this.isAnonymous
    });
  }
}
