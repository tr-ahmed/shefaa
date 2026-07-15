import { Routes } from '@angular/router';
import { authGuard, roleGuard, systemAdminGuard, adminOnlyGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shared/layout/public-shell.component').then(m => m.PublicShellComponent),
    children: [
      { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
      { path: 'doctors', loadComponent: () => import('./pages/doctors/doctor-list.component').then(m => m.DoctorListComponent) },
      { path: 'doctors/:id', loadComponent: () => import('./pages/doctors/doctor-detail.component').then(m => m.DoctorDetailComponent) },
      { path: 'clinics', loadComponent: () => import('./pages/clinics/clinic-list.component').then(m => m.ClinicListComponent) }
    ]
  },
  {
    path: 'auth',
    loadComponent: () => import('./shared/layout/auth-shell.component').then(m => m.AuthShellComponent),
    children: [
      { path: 'login', loadComponent: () => import('./pages/auth/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./pages/auth/register.component').then(m => m.RegisterComponent) },
      { path: 'forgot-password', loadComponent: () => import('./pages/auth/forgot-password.component').then(m => m.ForgotPasswordComponent) },
      { path: 'reset-password', loadComponent: () => import('./pages/auth/reset-password.component').then(m => m.ResetPasswordComponent) }
    ]
  },
  {
    path: 'patient',
    canActivate: [authGuard, roleGuard('Patient')],
    loadComponent: () => import('./shared/layout/app-shell.component').then(m => m.AppShellComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/patient/patient-dashboard.component').then(m => m.PatientDashboardComponent) },
      { path: 'appointments', loadComponent: () => import('./pages/patient/patient-appointments.component').then(m => m.PatientAppointmentsComponent) },
      { path: 'book', loadComponent: () => import('./pages/patient/book-appointment.component').then(m => m.BookAppointmentComponent) },
      { path: 'medical-records', loadComponent: () => import('./pages/patient/medical-records.component').then(m => m.MedicalRecordsComponent) },
      { path: 'profile', loadComponent: () => import('./pages/patient/patient-profile.component').then(m => m.PatientProfileComponent) }
    ]
  },
  {
    path: 'doctor',
    canActivate: [authGuard, roleGuard('Doctor')],
    loadComponent: () => import('./shared/layout/app-shell.component').then(m => m.AppShellComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/doctor/doctor-dashboard.component').then(m => m.DoctorDashboardComponent) },
      { path: 'appointments', loadComponent: () => import('./pages/doctor/doctor-appointments.component').then(m => m.DoctorAppointmentsComponent) },
      { path: 'schedule', loadComponent: () => import('./pages/doctor/doctor-schedule.component').then(m => m.DoctorScheduleComponent) },
      { path: 'time-off', loadComponent: () => import('./pages/doctor/doctor-time-off.component').then(m => m.DoctorTimeOffComponent) },
      { path: 'records', loadComponent: () => import('./pages/doctor/doctor-records.component').then(m => m.DoctorRecordsComponent) },
      { path: 'patients', loadComponent: () => import('./pages/doctor/doctor-patients.component').then(m => m.DoctorPatientsComponent) },
      { path: 'profile', loadComponent: () => import('./pages/doctor/doctor-profile.component').then(m => m.DoctorProfileComponent) }
    ]
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard('SystemAdmin', 'ClinicAdmin', 'ClinicStaff')],
    loadComponent: () => import('./shared/layout/app-shell.component').then(m => m.AppShellComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'clinic-dashboard', loadComponent: () => import('./pages/admin/admin-clinic-dashboard.component').then(m => m.AdminClinicDashboardComponent) },
      { path: 'appointments', loadComponent: () => import('./pages/admin/admin-appointments.component').then(m => m.AdminAppointmentsComponent) },
      { path: 'reports', loadComponent: () => import('./pages/admin/admin-reports.component').then(m => m.AdminReportsComponent) },
      // SystemAdmin only
      { path: 'users', canActivate: [systemAdminGuard], loadComponent: () => import('./pages/admin/admin-users.component').then(m => m.AdminUsersComponent) },
      // SystemAdmin + ClinicAdmin only
      { path: 'doctors', canActivate: [adminOnlyGuard], loadComponent: () => import('./pages/admin/admin-doctors.component').then(m => m.AdminDoctorsComponent) },
      { path: 'clinics', canActivate: [adminOnlyGuard], loadComponent: () => import('./pages/admin/admin-clinics.component').then(m => m.AdminClinicsComponent) },
      { path: 'clinic-doctors', canActivate: [adminOnlyGuard], loadComponent: () => import('./pages/admin/admin-clinic-doctors.component').then(m => m.AdminClinicDoctorsComponent) },
      // ClinicAdmin only
      { path: 'staff', canActivate: [roleGuard('ClinicAdmin')], loadComponent: () => import('./pages/admin/admin-clinic-staff.component').then(m => m.AdminClinicStaffComponent) },
      // SystemAdmin only
      { path: 'specialties', canActivate: [systemAdminGuard], loadComponent: () => import('./pages/admin/admin-specialties.component').then(m => m.AdminSpecialtiesComponent) },
      { path: 'approvals', canActivate: [systemAdminGuard], loadComponent: () => import('./pages/admin/admin-approvals.component').then(m => m.AdminApprovalsComponent) }
    ]
  },
  {
    path: 'forbidden',
    loadComponent: () => import('./pages/forbidden.component').then(m => m.ForbiddenComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found.component').then(m => m.NotFoundComponent)
  }
];