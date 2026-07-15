import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { ThemeService } from '../../core/services/theme.service';
import { NotificationBellComponent } from '../components/notification-bell.component';

interface NavItem { label: string; icon: string; route: string; roles?: string[]; section?: string; }

@Component({
  selector: 'app-app-shell',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatIconModule, MatButtonModule, MatMenuModule, MatTooltipModule,
    TranslateModule, NotificationBellComponent
  ],
  template: `
    <div class="min-h-screen flex bg-surface-50 dark:bg-surface-950 transition-colors">
      <!-- Sidebar -->
      <aside class="hidden lg:flex flex-col w-[260px] bg-white dark:bg-surface-900 border-r border-surface-100 dark:border-surface-800 sticky top-0 h-screen z-30">
        <!-- Logo -->
        <div class="px-5 h-16 flex items-center gap-3 border-b border-surface-100 dark:border-surface-800">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
            <mat-icon class="text-lg">medical_services</mat-icon>
          </div>
          <div class="leading-tight">
            <div class="font-bold text-surface-900 dark:text-white text-[15px]">{{ 'APP_NAME' | translate }}</div>
            <div class="text-[10px] uppercase tracking-widest text-surface-400 dark:text-surface-500 font-medium">{{ 'APP_TAGLINE' | translate }}</div>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          <ng-container *ngFor="let item of visibleNav(); trackBy: trackNav">
            <a [routerLink]="item.route"
               routerLinkActive="!bg-primary-50 !text-primary-700 !border-primary-200 dark:!bg-primary-950/50 dark:!text-primary-300 dark:!border-primary-800"
               [routerLinkActiveOptions]="{exact: item.route === baseRoute()}"
               class="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-200 border border-transparent transition-all duration-150">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400 group-hover:bg-primary-50 group-hover:text-primary-600 dark:group-hover:bg-primary-950/50 dark:group-hover:text-primary-400 transition-all duration-150"
                   routerLinkActive="!bg-primary-100 !text-primary-700 dark:!bg-primary-900/40 dark:!text-primary-300">
                <mat-icon class="text-[18px]">{{ item.icon }}</mat-icon>
              </div>
              <span>{{ item.label | translate }}</span>
            </a>
          </ng-container>
        </nav>

        <!-- User -->
        <div class="p-3 border-t border-surface-100 dark:border-surface-800">
          <button mat-button [matMenuTriggerFor]="userMenu" class="!w-full !justify-start !rounded-xl !px-3 !py-2.5 !normal-case group">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
              {{ initials() }}
            </div>
            <div class="flex-1 text-left ml-2 min-w-0">
              <div class="text-sm font-semibold text-surface-900 dark:text-white truncate">{{ auth.user()?.fullName }}</div>
              <div class="text-[11px] text-surface-400 dark:text-surface-500">{{ roleLabel() | translate }}</div>
            </div>
            <mat-icon class="text-surface-400 dark:text-surface-500 text-xl">unfold_more</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu" class="!rounded-xl">
            <button mat-menu-item (click)="goProfile()" class="!rounded-lg">
              <mat-icon>person_outline</mat-icon><span>{{ 'NAV.PROFILE' | translate }}</span>
            </button>
            <button mat-menu-item (click)="lang.toggle()" class="!rounded-lg">
              <mat-icon>translate</mat-icon><span>{{ lang.currentLang() === 'en' ? 'العربية' : 'English' }}</span>
            </button>
            <button mat-menu-item (click)="theme.toggle()" class="!rounded-lg">
              <mat-icon>{{ theme.isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
              <span>{{ (theme.isDark() ? 'LIGHT_MODE' : 'DARK_MODE') | translate }}</span>
            </button>
            <div class="divider my-1"></div>
            <button mat-menu-item (click)="auth.logout()" class="!rounded-lg !text-red-600 dark:!text-red-400">
              <mat-icon>logout</mat-icon><span>{{ 'NAV.LOGOUT' | translate }}</span>
            </button>
          </mat-menu>
        </div>
      </aside>

      <!-- Main -->
      <div class="flex-1 min-w-0 flex flex-col">
        <!-- Topbar -->
        <header class="sticky top-0 z-20 bg-white/70 dark:bg-surface-900/70 backdrop-blur-xl border-b border-surface-100 dark:border-surface-800 h-16 flex items-center px-4 lg:px-6 gap-3">
          <button mat-icon-button class="lg:hidden !rounded-xl" (click)="mobileOpen.set(!mobileOpen())">
            <mat-icon>menu</mat-icon>
          </button>
          <div class="flex-1"></div>
          <button mat-icon-button class="!rounded-xl" (click)="theme.toggle()" [matTooltip]="(theme.isDark() ? 'LIGHT_MODE' : 'DARK_MODE') | translate">
            <mat-icon class="text-surface-500">{{ theme.isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
          </button>
          <app-notification-bell></app-notification-bell>
          <button mat-icon-button class="!rounded-xl" [matMenuTriggerFor]="langMenu">
            <mat-icon class="text-surface-500">translate</mat-icon>
          </button>
          <mat-menu #langMenu="matMenu">
            <button mat-menu-item (click)="lang.setLanguage('en')" class="!rounded-lg">English</button>
            <button mat-menu-item (click)="lang.setLanguage('ar')" class="!rounded-lg">العربية</button>
          </mat-menu>
        </header>

        <!-- Mobile drawer -->
        <div *ngIf="mobileOpen()" class="lg:hidden fixed inset-0 z-50">
          <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" (click)="mobileOpen.set(false)"></div>
          <aside class="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 w-[280px] bg-white dark:bg-surface-900 shadow-2xl p-4 space-y-1 animate-slide-in"
                 (click)="$event.stopPropagation()">
            <div class="flex items-center gap-3 px-3 py-3 mb-4">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white shadow-md">
                <mat-icon class="text-lg">medical_services</mat-icon>
              </div>
              <div class="font-bold text-surface-900 dark:text-white">{{ 'APP_NAME' | translate }}</div>
            </div>
            <ng-container *ngFor="let item of visibleNav()">
              <a [routerLink]="item.route" routerLinkActive="!bg-primary-50 !text-primary-700 dark:!bg-primary-950/50 dark:!text-primary-300"
                 (click)="mobileOpen.set(false)"
                 class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 transition-all">
                <mat-icon class="text-[18px]">{{ item.icon }}</mat-icon>
                <span>{{ item.label | translate }}</span>
              </a>
            </ng-container>
            <div class="divider my-3"></div>
            <button mat-menu-item (click)="theme.toggle()" class="!flex !w-full !items-center !gap-3 !rounded-xl">
              <mat-icon>{{ theme.isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
              <span>{{ (theme.isDark() ? 'LIGHT_MODE' : 'DARK_MODE') | translate }}</span>
            </button>
            <button mat-menu-item (click)="auth.logout()" class="!flex !w-full !items-center !gap-3 !rounded-xl !text-red-600">
              <mat-icon>logout</mat-icon><span>{{ 'NAV.LOGOUT' | translate }}</span>
            </button>
          </aside>
        </div>

        <!-- Content -->
        <main class="flex-1 px-4 lg:px-8 py-6 max-w-[1400px] w-full mx-auto animate-fade-in">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class AppShellComponent {
  auth = inject(AuthService);
  lang = inject(LanguageService);
  theme = inject(ThemeService);
  router = inject(Router);

  mobileOpen = signal(false);

  private allNav: NavItem[] = [
    { label: 'NAV.DASHBOARD', icon: 'space_dashboard', route: '/patient/dashboard', roles: ['Patient'] },
    { label: 'NAV.APPOINTMENTS', icon: 'calendar_today', route: '/patient/appointments', roles: ['Patient'] },
    { label: 'NAV.DOCTORS', icon: 'stethoscope', route: '/doctors', roles: ['Patient'] },
    { label: 'NAV.MY_PRESCRIPTIONS', icon: 'description', route: '/patient/medical-records', roles: ['Patient'] },
    { label: 'NAV.PROFILE', icon: 'person', route: '/patient/profile', roles: ['Patient'] },

    { label: 'NAV.DASHBOARD', icon: 'space_dashboard', route: '/doctor/dashboard', roles: ['Doctor'] },
    { label: 'NAV.APPOINTMENTS', icon: 'calendar_today', route: '/doctor/appointments', roles: ['Doctor'] },
    { label: 'NAV.MY_PATIENTS', icon: 'people', route: '/doctor/patients', roles: ['Doctor'] },
    { label: 'NAV.SCHEDULE', icon: 'schedule', route: '/doctor/schedule', roles: ['Doctor'] },
    { label: 'NAV.TIME_OFF', icon: 'event_busy', route: '/doctor/time-off', roles: ['Doctor'] },
    { label: 'NAV.PATIENT_RECORDS', icon: 'folder_open', route: '/doctor/records', roles: ['Doctor'] },
    { label: 'NAV.PROFILE', icon: 'person', route: '/doctor/profile', roles: ['Doctor'] },

    { label: 'NAV.DASHBOARD', icon: 'space_dashboard', route: '/admin/dashboard', roles: ['SystemAdmin', 'ClinicStaff'] },
    { label: 'NAV.DASHBOARD', icon: 'space_dashboard', route: '/admin/clinic-dashboard', roles: ['ClinicAdmin'] },
    { label: 'NAV.APPOINTMENTS', icon: 'calendar_today', route: '/admin/appointments', roles: ['SystemAdmin', 'ClinicAdmin', 'ClinicStaff'] },
    { label: 'NAV.DOCTORS', icon: 'stethoscope', route: '/admin/doctors', roles: ['SystemAdmin', 'ClinicAdmin'] },
    { label: 'NAV.CLINICS', icon: 'local_hospital', route: '/admin/clinics', roles: ['SystemAdmin', 'ClinicAdmin'] },
    { label: 'NAV.CLINIC_STAFF', icon: 'group', route: '/admin/staff', roles: ['ClinicAdmin'] },
    { label: 'NAV.CLINIC_DOCTORS', icon: 'assignment_ind', route: '/admin/clinic-doctors', roles: ['ClinicAdmin'] },
    { label: 'NAV.SPECIALTIES', icon: 'category', route: '/admin/specialties', roles: ['SystemAdmin'] },
    { label: 'NAV.APPROVALS', icon: 'fact_check', route: '/admin/approvals', roles: ['SystemAdmin'] },
    { label: 'NAV.REPORTS', icon: 'analytics', route: '/admin/reports', roles: ['SystemAdmin', 'ClinicAdmin'] },
    { label: 'NAV.USERS', icon: 'manage_accounts', route: '/admin/users', roles: ['SystemAdmin'] }
  ];

  visibleNav = computed(() => {
    const roles = this.auth.roles();
    const prefix = this.baseRoute().split('/')[1];
    return this.allNav.filter(n => n.route.startsWith('/' + prefix) && n.roles?.some(r => roles.includes(r)));
  });

  baseRoute = computed(() => {
    const url = this.router.url;
    if (url.startsWith('/patient')) return '/patient/dashboard';
    if (url.startsWith('/doctor')) return '/doctor/dashboard';
    if (url.startsWith('/admin')) return '/admin/dashboard';
    return '/';
  });

  initials = computed(() => {
    const u = this.auth.user();
    if (!u) return '?';
    return ((u.firstName?.[0] || '') + (u.lastName?.[0] || '')).toUpperCase();
  });

  roleLabel = computed(() => {
    const r = this.auth.roles()[0];
    if (!r) return '';
    return `ROLES.${r}`;
  });

  trackNav(_: number, item: NavItem) { return item.route; }

  goProfile() {
    if (this.auth.hasRole('Patient')) this.router.navigate(['/patient/profile']);
    if (this.auth.hasRole('Doctor')) this.router.navigate(['/doctor/profile']);
  }
}
