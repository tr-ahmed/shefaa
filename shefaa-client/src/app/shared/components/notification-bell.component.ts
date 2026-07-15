import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { NotificationDto, PagedResult } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatBadgeModule, MatMenuModule, MatDividerModule, MatTooltipModule, TranslateModule],
  template: `
    <button mat-icon-button [matMenuTriggerFor]="notifMenu" matTooltip="{{ 'NOTIFICATIONS.TITLE' | translate }}">
      <mat-icon [matBadge]="unreadCount() > 0 ? unreadCount() : null"
                [matBadgeHidden]="unreadCount() === 0"
                matBadgeColor="warn" matBadgeSize="small">notifications</mat-icon>
    </button>
    <mat-menu #notifMenu="matMenu" class="!w-80 !max-w-[90vw]">
      <div class="px-4 py-3 flex items-center justify-between">
        <h3 class="font-semibold text-slate-900 dark:text-white">{{ 'NOTIFICATIONS.TITLE' | translate }}</h3>
        <button mat-button color="primary" (click)="markAllRead()" [disabled]="unreadCount() === 0">
          {{ 'NOTIFICATIONS.MARK_ALL_READ' | translate }}
        </button>
      </div>
      <mat-divider></mat-divider>
      <div class="max-h-96 overflow-y-auto">
        <ng-container *ngIf="notifications().length === 0">
          <div class="empty-state">
            <mat-icon class="icon">notifications_none</mat-icon>
            <p>{{ 'NOTIFICATIONS.NO_NOTIFICATIONS' | translate }}</p>
          </div>
        </ng-container>
        <button mat-menu-item *ngFor="let n of notifications()" class="!flex !items-start !gap-3 !p-3 !h-auto"
                (click)="markRead(n.id)">
          <div class="w-9 h-9 rounded-full flex items-center justify-center"
               [class]="!n.isRead ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'">
            <mat-icon class="text-[18px]">{{ iconFor(n.type) }}</mat-icon>
          </div>
          <div class="flex-1 text-left">
            <div class="text-sm font-medium text-slate-900 dark:text-white">{{ n.title }}</div>
            <div class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{{ n.message }}</div>
            <div class="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{{ formatTime(n.createdAt) }}</div>
          </div>
          <span *ngIf="!n.isRead" class="w-2 h-2 rounded-full bg-primary-500 mt-1"></span>
        </button>
      </div>
    </mat-menu>
  `
})
export class NotificationBellComponent implements OnInit {
  private http = inject(HttpClient);
  private translate = inject(TranslateService);
  auth = inject(AuthService);

  notifications = signal<NotificationDto[]>([]);
  unreadCount = signal(0);

  ngOnInit() {
    if (this.auth.isAuthenticated()) {
      this.load();
      // refresh every minute
      setInterval(() => this.load(true), 60_000);
    }
  }

  load(silent = false) {
    if (!silent) this.unreadCount.set(0);
    this.http.get<PagedResult<NotificationDto>>(`${environment.apiBaseUrl}/notifications?pageSize=10`)
      .subscribe(res => {
        if (res?.items) {
          this.notifications.set(res.items);
          const unread = res.items.filter(n => !n.isRead).length;
          this.unreadCount.set(unread);
        }
      });
    // Also fetch true unread count
    this.http.get<{count: number}>(`${environment.apiBaseUrl}/notifications/unread-count`)
      .subscribe(r => this.unreadCount.set(r.count));
  }

  markRead(id: number) {
    this.http.post(`${environment.apiBaseUrl}/notifications/${id}/read`, {}).subscribe(() => {
      this.notifications.update(list => list.map(n => n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n));
      this.unreadCount.update(c => Math.max(0, c - 1));
    });
  }

  markAllRead() {
    this.http.post(`${environment.apiBaseUrl}/notifications/read-all`, {}).subscribe(() => {
      this.notifications.update(list => list.map(n => ({ ...n, isRead: true, readAt: n.readAt ?? new Date().toISOString() })));
      this.unreadCount.set(0);
    });
  }

  iconFor(t: string): string {
    switch (t) {
      case 'AppointmentCreated': return 'event_available';
      case 'AppointmentConfirmed': return 'check_circle';
      case 'AppointmentCancelled': return 'event_busy';
      case 'AppointmentRescheduled': return 'schedule';
      case 'AppointmentReminder': return 'alarm';
      case 'PrescriptionReady': return 'medication';
      case 'MedicalRecordUpdated': return 'folder_shared';
      default: return 'notifications';
    }
  }

  formatTime(iso: string): string {
    try {
      const d = new Date(iso);
      const diff = Date.now() - d.getTime();
      const minutes = Math.floor(diff / 60000);
      if (minutes < 1) return this.translate.instant('NOTIFICATIONS.TIME_NOW');
      if (minutes < 60) return this.translate.instant('NOTIFICATIONS.TIME_MINUTES_AGO', { minutes });
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return this.translate.instant('NOTIFICATIONS.TIME_HOURS_AGO', { hours });
      const days = Math.floor(hours / 24);
      return this.translate.instant('NOTIFICATIONS.TIME_DAYS_AGO', { days });
    } catch { return ''; }
  }
}