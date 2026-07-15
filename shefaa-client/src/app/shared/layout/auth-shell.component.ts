import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-auth-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, MatButtonModule, MatIconModule, MatMenuModule, TranslateModule],
  template: `
    <div class="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 via-white to-emerald-50 dark:from-primary-950 dark:via-slate-900 dark:to-emerald-950">
      <header class="p-4 flex items-center justify-between">
        <a routerLink="/" class="flex items-center gap-2">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white shadow-lg">
            <mat-icon>medical_services</mat-icon>
          </div>
          <div>
            <div class="font-bold text-slate-900 dark:text-white">{{ 'APP_NAME' | translate }}</div>
            <div class="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ 'APP_TAGLINE' | translate }}</div>
          </div>
        </a>
        <button mat-icon-button [matMenuTriggerFor]="langMenu">
          <mat-icon>language</mat-icon>
        </button>
        <mat-menu #langMenu="matMenu">
          <button mat-menu-item (click)="lang.setLanguage('en')">English</button>
          <button mat-menu-item (click)="lang.setLanguage('ar')">العربية</button>
        </mat-menu>
      </header>

      <main class="flex-1 flex items-center justify-center p-4">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AuthShellComponent {
  lang = inject(LanguageService);
}