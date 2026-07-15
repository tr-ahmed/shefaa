import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DataService } from '../../core/services/data.service';
import { UserDto } from '../../core/models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatTooltipModule, MatDialogModule, TranslateModule],
  template: `
    <div class="page-header animate-fade-in">
      <div>
        <h1 class="page-title">{{ 'ADMIN.USER_MANAGEMENT' | translate }}</h1>
        <p class="page-subtitle">{{ 'ADMIN.USER_MANAGEMENT_DESC' | translate }}</p>
      </div>
    </div>

    <!-- Search + Filters -->
    <div class="card p-4 mb-6 animate-fade-in">
      <div class="flex flex-col md:flex-row gap-3">
        <div class="flex-1 relative">
          <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 !text-[20px]">search</mat-icon>
          <input [(ngModel)]="searchTerm" (keyup.enter)="load()" class="input !pl-10" [placeholder]="'COMMON.SEARCH' | translate">
        </div>
        <select [(ngModel)]="filterRole" class="input md:w-48">
          <option value="">{{ 'COMMON.ALL' | translate }}</option>
          <option value="SystemAdmin">SystemAdmin</option>
          <option value="ClinicAdmin">ClinicAdmin</option>
          <option value="ClinicStaff">ClinicStaff</option>
          <option value="Doctor">Doctor</option>
          <option value="Patient">Patient</option>
        </select>
        <button (click)="load()" class="btn-primary">
          <mat-icon class="!text-[18px]">search</mat-icon> {{ 'COMMON.SEARCH' | translate }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div *ngIf="loading()" class="space-y-3">
      <div *ngFor="let i of [1,2,3,4,5]" class="card p-4">
        <div class="flex items-center gap-4">
          <div class="skeleton w-10 h-10 rounded-full"></div>
          <div class="flex-1 space-y-2">
            <div class="skeleton h-4 w-40 rounded"></div>
            <div class="skeleton h-3 w-56 rounded"></div>
          </div>
          <div class="skeleton w-20 h-8 rounded-lg"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div *ngIf="!loading() && users().length === 0" class="card">
      <div class="empty-state py-16">
        <div class="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center mb-4">
          <mat-icon class="!w-8 !h-8 text-surface-400">people_outline</mat-icon>
        </div>
        <p class="text-surface-500 dark:text-surface-400">{{ 'COMMON.NO_DATA' | translate }}</p>
      </div>
    </div>

    <!-- Users Table -->
    <div *ngIf="!loading() && users().length > 0" class="card overflow-hidden animate-fade-in">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-xs text-surface-500 dark:text-surface-400 uppercase tracking-wider border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
              <th class="text-left px-5 py-3.5 font-semibold">{{ 'ADMIN.USER' | translate }}</th>
              <th class="text-left px-5 py-3.5 font-semibold">{{ 'ADMIN.EMAIL' | translate }}</th>
              <th class="text-left px-5 py-3.5 font-semibold">{{ 'ADMIN.PHONE' | translate }}</th>
              <th class="text-left px-5 py-3.5 font-semibold">{{ 'ADMIN.ROLE' | translate }}</th>
              <th class="text-center px-5 py-3.5 font-semibold">{{ 'ADMIN.STATUS' | translate }}</th>
              <th class="text-left px-5 py-3.5 font-semibold">{{ 'ADMIN.JOINED' | translate }}</th>
              <th class="text-right px-5 py-3.5 font-semibold">{{ 'COMMON.ACTIONS' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of users()" class="border-b border-surface-50 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/40 transition-colors">
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                       [ngClass]="roleColor(u.roles[0])">
                    {{ initials(u.fullName || u.email) }}
                  </div>
                  <div>
                    <div class="font-semibold text-surface-900 dark:text-white">{{ u.fullName || u.email }}</div>
                    <div class="text-xs text-surface-400 dark:text-surface-500">{{ u.id.substring(0, 8) }}...</div>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4 text-surface-600 dark:text-surface-300">{{ u.email }}</td>
              <td class="px-5 py-4 text-surface-500 dark:text-surface-400">{{ u.phoneNumber || '—' }}</td>
              <td class="px-5 py-4">
                <span class="badge" [ngClass]="roleBadge(u.roles[0])">{{ u.roles[0] || '—' }}</span>
              </td>
              <td class="px-5 py-4 text-center">
                <span *ngIf="u.isActive" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {{ 'COMMON.ACTIVE' | translate }}
                </span>
                <span *ngIf="!u.isActive" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                  <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span> {{ 'COMMON.INACTIVE' | translate }}
                </span>
              </td>
              <td class="px-5 py-4 text-surface-500 dark:text-surface-400 text-xs">{{ formatDate(u.id) }}</td>
              <td class="px-5 py-4">
                <div class="flex items-center justify-end gap-1">
                  <button (click)="toggleActive(u)" class="!rounded-lg p-1.5" [matTooltip]="u.isActive ? ('ADMIN.DEACTIVATE' | translate) : ('ADMIN.ACTIVATE' | translate)"
                          [class]="u.isActive ? 'hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500' : 'hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-500'">
                    <mat-icon class="!text-[18px]">{{ u.isActive ? 'block' : 'check_circle' }}</mat-icon>
                  </button>
                  <button (click)="changeRole(u)" class="!rounded-lg p-1.5 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-500"
                          [matTooltip]="'ADMIN.CHANGE_ROLE' | translate">
                    <mat-icon class="!text-[18px]">admin_panel_settings</mat-icon>
                  </button>
                  <button (click)="resetPwd(u)" class="!rounded-lg p-1.5 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-amber-500"
                          [matTooltip]="'ADMIN.RESET_PASSWORD' | translate">
                    <mat-icon class="!text-[18px]">lock_reset</mat-icon>
                  </button>
                  <button (click)="deleteUser(u)" class="!rounded-lg p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500"
                          [matTooltip]="'COMMON.DELETE' | translate">
                    <mat-icon class="!text-[18px]">delete</mat-icon>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between px-5 py-3 border-t border-surface-100 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/30">
        <span class="text-xs text-surface-500 dark:text-surface-400">
          {{ totalCount() }} {{ 'ADMIN.TOTAL_USERS' | translate }}
        </span>
        <div class="flex items-center gap-2">
          <button (click)="prevPage()" [disabled]="page() <= 1" class="btn-sm btn-ghost">
            <mat-icon class="!text-[16px]">chevron_left</mat-icon>
          </button>
          <span class="text-sm font-medium text-surface-700 dark:text-surface-300">{{ page() }}</span>
          <button (click)="nextPage()" [disabled]="users().length < pageSize" class="btn-sm btn-ghost">
            <mat-icon class="!text-[16px]">chevron_right</mat-icon>
          </button>
        </div>
      </div>
    </div>

    <!-- Role Change Modal -->
    <div *ngIf="showRoleModal()" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" (click)="showRoleModal.set(false)"></div>
      <div class="relative bg-white dark:bg-surface-900 rounded-2xl shadow-2xl p-6 w-[400px] animate-scale-in">
        <h3 class="text-lg font-semibold mb-4">{{ 'ADMIN.CHANGE_ROLE_TITLE' | translate }}</h3>
        <p class="text-sm text-surface-500 mb-4">{{ 'ADMIN.USER' | translate }}: <strong>{{ selectedUser()?.email }}</strong></p>
        <div class="space-y-2">
          <button *ngFor="let r of availableRoles" (click)="applyRole(r)"
                  class="w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all"
                  [ngClass]="selectedUser()?.roles?.[0] === r
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300'
                    : 'border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-700 text-surface-700 dark:text-surface-300'">
            {{ r }}
          </button>
        </div>
        <button (click)="showRoleModal.set(false)" class="btn-secondary mt-4 w-full">{{ 'COMMON.CANCEL' | translate }}</button>
      </div>
    </div>

    <!-- Reset Password Modal -->
    <div *ngIf="showResetModal()" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" (click)="showResetModal.set(false)"></div>
      <div class="relative bg-white dark:bg-surface-900 rounded-2xl shadow-2xl p-6 w-[400px] animate-scale-in">
        <h3 class="text-lg font-semibold mb-4">{{ 'ADMIN.RESET_PASSWORD_TITLE' | translate }}</h3>
        <p class="text-sm text-surface-500 mb-4">{{ 'ADMIN.USER' | translate }}: <strong>{{ selectedUser()?.email }}</strong></p>
        <label class="label">{{ 'ADMIN.NEW_PASSWORD' | translate }}</label>
        <input type="password" [(ngModel)]="newPassword" class="input mb-4" [placeholder]="'ADMIN.NEW_PASSWORD_PLACEHOLDER' | translate">
        <div class="flex gap-2">
          <button (click)="showResetModal.set(false)" class="btn-secondary flex-1">{{ 'COMMON.CANCEL' | translate }}</button>
          <button (click)="applyResetPwd()" [disabled]="!newPassword || newPassword.length < 8" class="btn-primary flex-1">
            {{ 'COMMON.CONFIRM' | translate }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class AdminUsersComponent implements OnInit {
  private data = inject(DataService);
  private snack = inject(MatSnackBar);
  private translate = inject(TranslateService);

  loading = signal(true);
  users = signal<UserDto[]>([]);
  totalCount = signal(0);
  searchTerm = '';
  filterRole = '';
  page = signal(1);
  pageSize = 20;

  showRoleModal = signal(false);
  showResetModal = signal(false);
  selectedUser = signal<UserDto | null>(null);
  newPassword = '';
  availableRoles = ['SystemAdmin', 'ClinicAdmin', 'ClinicStaff', 'Doctor', 'Patient'];

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.data.getUsers(this.searchTerm || undefined, this.filterRole || undefined, this.page(), this.pageSize).subscribe({
      next: r => { this.users.set(r.items || []); this.totalCount.set(r.totalCount); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  toggleActive(u: UserDto) {
    this.data.toggleUserActive(u.id).subscribe({
      next: () => {
        this.snack.open(this.translate.instant('COMMON.SAVED'), this.translate.instant('COMMON.OK'), { duration: 2000 });
        this.load();
      }
    });
  }

  changeRole(u: UserDto) {
    this.selectedUser.set(u);
    this.showRoleModal.set(true);
  }

  applyRole(role: string) {
    const u = this.selectedUser();
    if (!u) return;
    this.data.updateUserRole(u.id, role).subscribe({
      next: () => {
        this.showRoleModal.set(false);
        this.snack.open(this.translate.instant('ADMIN.ROLE_UPDATED'), this.translate.instant('COMMON.OK'), { duration: 2000 });
        this.load();
      }
    });
  }

  resetPwd(u: UserDto) {
    this.selectedUser.set(u);
    this.newPassword = '';
    this.showResetModal.set(true);
  }

  applyResetPwd() {
    const u = this.selectedUser();
    if (!u || !this.newPassword) return;
    this.data.adminResetPassword(u.id, this.newPassword).subscribe({
      next: () => {
        this.showResetModal.set(false);
        this.snack.open(this.translate.instant('ADMIN.PASSWORD_RESET'), this.translate.instant('COMMON.OK'), { duration: 2000 });
      }
    });
  }

  deleteUser(u: UserDto) {
    if (!confirm(this.translate.instant('ADMIN.DELETE_USER_CONFIRM'))) return;
    this.data.deleteUser(u.id).subscribe({
      next: () => {
        this.snack.open(this.translate.instant('ADMIN.USER_DELETED'), this.translate.instant('COMMON.OK'), { duration: 2000 });
        this.load();
      }
    });
  }

  nextPage() { this.page.update(p => p + 1); this.load(); }
  prevPage() { this.page.update(p => Math.max(1, p - 1)); this.load(); }

  initials(name: string) {
    return name.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();
  }

  roleBadge(role: string) {
    switch (role) {
      case 'SystemAdmin': return 'badge-danger';
      case 'ClinicAdmin': return 'badge-warning';
      case 'ClinicStaff': return 'badge-info';
      case 'Doctor': return 'badge-success';
      case 'Patient': return 'badge-primary';
      default: return 'badge-muted';
    }
  }

  roleColor(role: string) {
    switch (role) {
      case 'SystemAdmin': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'ClinicAdmin': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
      case 'ClinicStaff': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'Doctor': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
      case 'Patient': return 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400';
      default: return 'bg-surface-100 dark:bg-surface-700 text-surface-500';
    }
  }

  formatDate(id: string) { return ''; }
}
