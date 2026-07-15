import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  imports: [RouterLink, MatIconModule, TranslateModule],
  template: `
    <div class="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <mat-icon class="!w-20 !h-20 !text-[80px] text-slate-300 dark:text-slate-600 mb-4">explore_off</mat-icon>
      <h1 class="text-3xl font-bold text-slate-900 dark:text-white">404</h1>
      <p class="text-slate-500 dark:text-slate-400 mt-2">{{ 'ERRORS.NOT_FOUND' | translate }}</p>
      <a routerLink="/" class="btn-primary mt-6">{{ 'ERRORS.BACK_HOME' | translate }}</a>
    </div>
  `
})
export class NotFoundComponent {}