import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, AuthResponse, ChangePasswordRequest, ForgotPasswordRequest, LoginRequest, RegisterRequest, ResetPasswordRequest, UserDto } from '../models';

const STORAGE_KEY = 'shefaa.auth';

interface StoredAuth { accessToken: string; refreshToken: string; user: UserDto; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Reactive state via signals
  private _user = signal<UserDto | null>(this.loadFromStorage()?.user ?? null);
  private _token = signal<string | null>(this.loadFromStorage()?.accessToken ?? null);
  user = this._user.asReadonly();
  token = this._token.asReadonly();
  isAuthenticated = computed(() => !!this._user());
  roles       = computed(() => this._user()?.roles       ?? []);
  permissions = computed(() => this._user()?.permissions ?? []);
  userType    = computed(() => this._user()?.userType    ?? 0);

  private loadFromStorage(): StoredAuth | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  private save(data: StoredAuth | null) {
    if (data) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    else localStorage.removeItem(STORAGE_KEY);
  }

  login(req: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${environment.apiBaseUrl}/auth/login`, req).pipe(
      tap(res => {
        if (res.success && res.data) this.setSession(res.data);
      })
    );
  }

  register(req: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${environment.apiBaseUrl}/auth/register`, req).pipe(
      tap(res => { if (res.success && res.data) this.setSession(res.data); })
    );
  }

  logout() {
    this.save(null);
    this._user.set(null);
    this._token.set(null);
    this.router.navigate(['/auth/login']);
  }

  forgotPassword(req: ForgotPasswordRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${environment.apiBaseUrl}/auth/forgot-password`, req);
  }

  resetPassword(req: ResetPasswordRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${environment.apiBaseUrl}/auth/reset-password`, req);
  }

  changePassword(req: ChangePasswordRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${environment.apiBaseUrl}/auth/change-password`, req);
  }

  me(): Observable<UserDto> {
    return this.http.get<UserDto>(`${environment.apiBaseUrl}/auth/me`);
  }

  refreshMe() {
    this.me().subscribe({
      next: u => {
        this._user.set(u);
        const stored = this.loadFromStorage();
        if (stored) this.save({ ...stored, user: u });
      },
      error: () => this.logout()
    });
  }

  private setSession(auth: AuthResponse) {
    this._token.set(auth.accessToken);
    this._user.set(auth.user);
    this.save({ accessToken: auth.accessToken, refreshToken: auth.refreshToken, user: auth.user });
  }

  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }

  hasAnyRole(...roles: string[]): boolean {
    return roles.some(r => this.roles().includes(r));
  }

  /** Check a single fine-grained permission (e.g. 'admin.doctors.manage') */
  hasPermission(permission: string): boolean {
    return this.permissions().includes(permission);
  }

  /** Check if the user has at least one of the given permissions */
  hasAnyPermission(...perms: string[]): boolean {
    return perms.some(p => this.permissions().includes(p));
  }

  redirectByRole() {
    const u = this._user();
    if (!u) return this.router.navigate(['/auth/login']);
    if (u.roles.includes('SystemAdmin') || u.roles.includes('ClinicAdmin') || u.roles.includes('ClinicStaff'))
      return this.router.navigate(['/admin/dashboard']);
    if (u.roles.includes('Doctor')) return this.router.navigate(['/doctor/dashboard']);
    if (u.roles.includes('Patient')) return this.router.navigate(['/patient/dashboard']);
    return this.router.navigate(['/']);
  }
}