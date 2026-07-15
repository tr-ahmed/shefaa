import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-public-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule, MatMenuModule, TranslateModule],
  template: `
    <div class="min-h-screen flex flex-col bg-white dark:bg-surface-950">
      <!-- Header -->
      <header class="sticky top-0 z-40 bg-white/80 dark:bg-surface-950/80 backdrop-blur-xl border-b border-surface-100 dark:border-surface-800">
        <nav class="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
          <a routerLink="/" class="flex items-center gap-2.5 group">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white shadow-md shadow-primary-500/20 group-hover:shadow-lg group-hover:shadow-primary-500/30 transition-all duration-300">
              <mat-icon class="text-lg">medical_services</mat-icon>
            </div>
            <div class="leading-tight">
              <div class="font-bold text-surface-900 dark:text-white text-[15px]">{{ 'APP_NAME' | translate }}</div>
              <div class="text-[10px] uppercase tracking-widest text-surface-400 dark:text-surface-500 font-medium">{{ 'APP_TAGLINE' | translate }}</div>
            </div>
          </a>

          <div class="hidden md:flex items-center gap-1">
            <a routerLink="/" routerLinkActive="!text-primary-700 !bg-primary-50 dark:!text-primary-300 dark:!bg-primary-950/50" [routerLinkActiveOptions]="{exact:true}"
               class="px-3.5 py-2 rounded-xl text-sm font-medium text-surface-600 hover:text-surface-900 hover:bg-surface-50 dark:text-surface-400 dark:hover:text-surface-200 dark:hover:bg-surface-800 transition-all duration-150">{{ 'NAV.HOME' | translate }}</a>
            <a routerLink="/doctors" routerLinkActive="!text-primary-700 !bg-primary-50 dark:!text-primary-300 dark:!bg-primary-950/50"
               class="px-3.5 py-2 rounded-xl text-sm font-medium text-surface-600 hover:text-surface-900 hover:bg-surface-50 dark:text-surface-400 dark:hover:text-surface-200 dark:hover:bg-surface-800 transition-all duration-150">{{ 'NAV.DOCTORS' | translate }}</a>
            <a routerLink="/clinics" routerLinkActive="!text-primary-700 !bg-primary-50 dark:!text-primary-300 dark:!bg-primary-950/50"
               class="px-3.5 py-2 rounded-xl text-sm font-medium text-surface-600 hover:text-surface-900 hover:bg-surface-50 dark:text-surface-400 dark:hover:text-surface-200 dark:hover:bg-surface-800 transition-all duration-150">{{ 'NAV.CLINICS' | translate }}</a>
          </div>

          <div class="flex items-center gap-2">
            <button mat-icon-button class="!rounded-xl" [matMenuTriggerFor]="langMenu">
              <mat-icon class="text-surface-500">translate</mat-icon>
            </button>
            <mat-menu #langMenu="matMenu">
              <button mat-menu-item (click)="lang.setLanguage('en')" class="!rounded-lg">{{ 'LANG.ENGLISH' | translate }}</button>
              <button mat-menu-item (click)="lang.setLanguage('ar')" class="!rounded-lg">{{ 'LANG.ARABIC' | translate }}</button>
            </mat-menu>

            <ng-container *ngIf="!auth.isAuthenticated()">
              <a routerLink="/auth/login" class="hidden sm:inline-flex btn-secondary !py-2 !px-4 !text-sm">{{ 'NAV.LOGIN' | translate }}</a>
              <a routerLink="/auth/register" class="btn-primary !py-2 !px-4 !text-sm">{{ 'NAV.REGISTER' | translate }}</a>
            </ng-container>
            <ng-container *ngIf="auth.isAuthenticated()">
              <button mat-button [matMenuTriggerFor]="userMenu" class="!flex items-center gap-2 !rounded-xl !normal-case">
                <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  {{ initials() }}
                </div>
                <span class="hidden sm:inline text-sm font-medium text-surface-700 dark:text-surface-200">{{ auth.user()?.fullName }}</span>
              </button>
              <mat-menu #userMenu="matMenu">
                <button mat-menu-item (click)="goDashboard()" class="!rounded-lg">
                  <mat-icon>space_dashboard</mat-icon><span>{{ 'NAV.DASHBOARD' | translate }}</span>
                </button>
                <div class="divider my-1"></div>
                <button mat-menu-item (click)="auth.logout()" class="!rounded-lg !text-red-600">
                  <mat-icon>logout</mat-icon><span>{{ 'NAV.LOGOUT' | translate }}</span>
                </button>
              </mat-menu>
            </ng-container>
          </div>
        </nav>
      </header>

      <!-- Content -->
      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="border-t border-surface-100 dark:border-surface-800 bg-surface-50 dark:bg-surface-900 mt-16">
        <div class="max-w-7xl mx-auto px-4 lg:px-8 py-10">
          <div class="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div class="flex items-center gap-2.5 mb-4">
                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white shadow-sm">
                  <mat-icon class="text-base">medical_services</mat-icon>
                </div>
                <span class="font-bold text-surface-900 dark:text-white">{{ 'APP_NAME' | translate }}</span>
              </div>
              <p class="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">{{ 'HOME.HERO_SUBTITLE' | translate }}</p>
            </div>
            <div>
              <h4 class="font-semibold text-surface-900 dark:text-white mb-3 text-sm">{{ 'NAV.DOCTORS' | translate }}</h4>
              <div class="space-y-2">
                <a routerLink="/doctors" class="block text-sm text-surface-500 hover:text-primary-600 dark:text-surface-400 dark:hover:text-primary-400 transition-colors">Browse Doctors</a>
                <a routerLink="/clinics" class="block text-sm text-surface-500 hover:text-primary-600 dark:text-surface-400 dark:hover:text-primary-400 transition-colors">Our Clinics</a>
              </div>
            </div>
            <div>
              <h4 class="font-semibold text-surface-900 dark:text-white mb-3 text-sm">Platform</h4>
              <div class="space-y-2">
                <a class="block text-sm text-surface-500 hover:text-primary-600 dark:text-surface-400 dark:hover:text-primary-400 transition-colors cursor-pointer">{{ 'FOOTER.PRIVACY' | translate }}</a>
                <a class="block text-sm text-surface-500 hover:text-primary-600 dark:text-surface-400 dark:hover:text-primary-400 transition-colors cursor-pointer">{{ 'FOOTER.TERMS' | translate }}</a>
              </div>
            </div>
            <div>
              <h4 class="font-semibold text-surface-900 dark:text-white mb-3 text-sm">{{ 'FOOTER.CONTACT' | translate }}</h4>
              <div class="space-y-2 text-sm text-surface-500 dark:text-surface-400">
                <div class="flex items-center gap-2"><mat-icon class="text-base text-surface-400">location_on</mat-icon> Cairo, Egypt</div>
                <div class="flex items-center gap-2"><mat-icon class="text-base text-surface-400">email</mat-icon> info&#64;shefaa.com</div>
              </div>
            </div>
          </div>
          <div class="divider"></div>
          <div class="flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-surface-400 dark:text-surface-500 pt-6">
            <span>© 2026 {{ 'APP_NAME' | translate }}. Cairo University Diploma Project.</span>
            <div class="flex items-center gap-4">
              <a class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{{ 'FOOTER.PRIVACY' | translate }}</a>
              <a class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{{ 'FOOTER.TERMS' | translate }}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class PublicShellComponent {
  auth = inject(AuthService);
  lang = inject(LanguageService);
  router = inject(Router);

  initials = computed(() => {
    const u = this.auth.user();
    if (!u) return '?';
    return ((u.firstName?.[0] || '') + (u.lastName?.[0] || '')).toUpperCase();
  });

  goDashboard() { this.auth.redirectByRole(); }
}
