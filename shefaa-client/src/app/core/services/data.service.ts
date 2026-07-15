import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse, AppointmentDto, AttachmentDto, ClinicDto, ClinicDoctorDto, DashboardSummaryDto, DoctorDto,
  ClinicStaffDto, CreateClinicStaffRequest, DoctorScheduleDto, DoctorTimeOffDto, DoctorPatientDto, MedicalRecordDto, PagedResult, PatientDto,
  PaymentMethod, ReviewDto, RevenueByMonthDto, SpecialtyDto,
  TimeSlotDto, TopDoctorDto, UserDto, AdminReportDto, ClinicReportDto,
  AppointmentTrendDto, SpecialtyStatsDto, PatientRegistrationTrendDto,
  PeakHourDto, DayOfWeekStatsDto, GenderDistributionDto, DoctorPerformanceDto
} from '../models';

@Injectable({ providedIn: 'root' })
export class DataService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl;

  // =================== SPECIALTIES ===================
  listSpecialties(page = 1, pageSize = 50, search?: string, activeOnly = true): Observable<PagedResult<SpecialtyDto>> {
    let p = new HttpParams().set('page', page).set('pageSize', pageSize).set('activeOnly', activeOnly);
    if (search) p = p.set('search', search);
    return this.http.get<PagedResult<SpecialtyDto>>(`${this.base}/specialties`, { params: p });
  }

  // =================== CLINICS ===================
  listClinics(page = 1, pageSize = 50, search?: string, city?: string, activeOnly = true): Observable<PagedResult<ClinicDto>> {
    let p = new HttpParams().set('page', page).set('pageSize', pageSize).set('activeOnly', activeOnly);
    if (search) p = p.set('search', search);
    if (city) p = p.set('city', city);
    return this.http.get<PagedResult<ClinicDto>>(`${this.base}/clinics`, { params: p });
  }

  getMyClinic(): Observable<ClinicDto> {
    return this.http.get<ClinicDto>(`${this.base}/clinics/my`);
  }

  getClinicStaff(clinicId: number): Observable<ClinicStaffDto[]> {
    return this.http.get<ClinicStaffDto[]>(`${this.base}/clinics/${clinicId}/staff`);
  }

  createClinicStaff(clinicId: number, body: CreateClinicStaffRequest): Observable<ApiResponse<ClinicStaffDto>> {
    return this.http.post<ApiResponse<ClinicStaffDto>>(`${this.base}/clinics/${clinicId}/staff`, body);
  }

  deleteClinicStaff(clinicId: number, staffId: number): Observable<any> {
    return this.http.delete<any>(`${this.base}/clinics/${clinicId}/staff/${staffId}`);
  }

  // =================== CLINIC-DOCTOR ===================
  getClinicDoctors(clinicId: number): Observable<ClinicDoctorDto[]> {
    return this.http.get<ClinicDoctorDto[]>(`${this.base}/clinics/${clinicId}/doctors`);
  }

  addDoctorToClinic(clinicId: number, body: { doctorId: number; consultationFee?: number; isPrimary?: boolean }): Observable<ApiResponse<ClinicDoctorDto>> {
    return this.http.post<ApiResponse<ClinicDoctorDto>>(`${this.base}/clinics/${clinicId}/doctors`, body);
  }

  removeDoctorFromClinic(clinicId: number, doctorId: number): Observable<any> {
    return this.http.delete<any>(`${this.base}/clinics/${clinicId}/doctors/${doctorId}`);
  }

  // =================== DOCTORS ===================
  listDoctors(page = 1, pageSize = 50, specialtyId?: number, search?: string, availableOnly = true): Observable<PagedResult<DoctorDto>> {
    let p = new HttpParams().set('page', page).set('pageSize', pageSize).set('availableOnly', availableOnly);
    if (specialtyId != null) p = p.set('specialtyId', specialtyId);
    if (search) p = p.set('search', search);
    return this.http.get<PagedResult<DoctorDto>>(`${this.base}/doctors`, { params: p });
  }

  getDoctor(id: number): Observable<DoctorDto> {
    return this.http.get<DoctorDto>(`${this.base}/doctors/${id}`);
  }

  getDoctorMe(): Observable<DoctorDto> {
    return this.http.get<DoctorDto>(`${this.base}/doctors/me`);
  }

  getMyPatients(search?: string): Observable<DoctorPatientDto[]> {
    let p = new HttpParams();
    if (search) p = p.set('search', search);
    return this.http.get<DoctorPatientDto[]>(`${this.base}/doctors/me/patients`, { params: p });
  }

  getAvailableSlots(doctorId: number, date: string, clinicId?: number): Observable<TimeSlotDto[]> {
    let p = new HttpParams().set('date', date);
    if (clinicId) p = p.set('clinicId', clinicId);
    return this.http.get<TimeSlotDto[]>(`${this.base}/doctors/${doctorId}/available-slots`, { params: p });
  }

  getDoctorClinics(doctorId: number): Observable<ClinicDto[]> {
    return this.http.get<ClinicDto[]>(`${this.base}/doctors/${doctorId}/clinics`);
  }

  getSchedules(doctorId: number): Observable<DoctorScheduleDto[]> {
    return this.http.get<DoctorScheduleDto[]>(`${this.base}/doctors/${doctorId}/schedules`);
  }

  addSchedule(doctorId: number, body: any): Observable<any> {
    return this.http.post<any>(`${this.base}/doctors/${doctorId}/schedules`, body);
  }

  deleteSchedule(doctorId: number, scheduleId: number): Observable<any> {
    return this.http.delete<any>(`${this.base}/doctors/${doctorId}/schedules/${scheduleId}`);
  }

  // =================== APPOINTMENTS ===================
  listAppointments(page = 1, pageSize = 50, filters: { status?: string; fromDate?: string; toDate?: string } = {}): Observable<PagedResult<AppointmentDto>> {
    let p = new HttpParams().set('page', page).set('pageSize', pageSize);
    Object.entries(filters).forEach(([k, v]) => { if (v != null && v !== '') p = p.set(k, v as string); });
    return this.http.get<PagedResult<AppointmentDto>>(`${this.base}/appointments`, { params: p });
  }

  getAppointment(id: number): Observable<AppointmentDto> {
    return this.http.get<AppointmentDto>(`${this.base}/appointments/${id}`);
  }

  bookAppointment(body: { doctorId: number; clinicId: number; scheduledStart: string; reasonForVisit?: string; patientNotes?: string; paymentMethod?: PaymentMethod }): Observable<AppointmentDto> {
    return this.http.post<AppointmentDto>(`${this.base}/appointments`, body);
  }

  markAppointmentPaid(id: number, body: { paymentMethod: PaymentMethod; paymentReference?: string }): Observable<AppointmentDto> {
    return this.http.post<AppointmentDto>(`${this.base}/appointments/${id}/payment`, body);
  }

  cancelAppointment(id: number, reason: string): Observable<any> {
    return this.http.post<any>(`${this.base}/appointments/${id}/cancel`, { reason });
  }

  rescheduleAppointment(id: number, newStart: string): Observable<any> {
    return this.http.post<any>(`${this.base}/appointments/${id}/reschedule`, { newStart });
  }

  updateAppointmentStatus(id: number, status: string, notes?: string): Observable<any> {
    return this.http.post<any>(`${this.base}/appointments/${id}/status`, { status, notes });
  }

  // =================== PATIENT ===================
  getPatientMe(): Observable<PatientDto> {
    return this.http.get<PatientDto>(`${this.base}/patients/me`);
  }

  getPatient(id: number): Observable<PatientDto> {
    return this.http.get<PatientDto>(`${this.base}/patients/${id}`);
  }

  updatePatient(id: number, body: any): Observable<PatientDto> {
    return this.http.put<PatientDto>(`${this.base}/patients/${id}`, body);
  }

  searchPatients(search?: string, page = 1, pageSize = 50): Observable<PagedResult<PatientDto>> {
    let p = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (search) p = p.set('search', search);
    return this.http.get<PagedResult<PatientDto>>(`${this.base}/patients`, { params: p });
  }

  getMedicalRecords(patientId: number): Observable<MedicalRecordDto[]> {
    return this.http.get<MedicalRecordDto[]>(`${this.base}/patients/${patientId}/medical-records`);
  }

  // =================== MEDICAL RECORDS ===================
  getMedicalRecord(id: number): Observable<MedicalRecordDto> {
    return this.http.get<MedicalRecordDto>(`${this.base}/medical-records/${id}`);
  }

  createMedicalRecord(body: any): Observable<MedicalRecordDto> {
    return this.http.post<MedicalRecordDto>(`${this.base}/medical-records`, body);
  }

  getDoctorMedicalRecords(doctorId: number): Observable<MedicalRecordDto[]> {
    return this.http.get<MedicalRecordDto[]>(`${this.base}/medical-records/doctor/${doctorId}`);
  }

  // =================== DOCTOR TIME OFF ===================
  getTimeOff(doctorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/doctors/${doctorId}/time-off`);
  }

  addTimeOff(doctorId: number, body: any): Observable<any> {
    return this.http.post<any>(`${this.base}/doctors/${doctorId}/time-off`, body);
  }

  deleteTimeOff(doctorId: number, timeOffId: number): Observable<any> {
    return this.http.delete<any>(`${this.base}/doctors/${doctorId}/time-off/${timeOffId}`);
  }

  // =================== ATTACHMENTS ===================
  uploadAttachment(medicalRecordId: number, file: File, description?: string): Observable<AttachmentDto> {
    const fd = new FormData();
    fd.append('file', file);
    if (description) fd.append('description', description);
    return this.http.post<AttachmentDto>(`${this.base}/attachments/medical-record/${medicalRecordId}`, fd);
  }

  attachmentDownloadUrl(id: number): string {
    return `${this.base}/attachments/${id}/download`;
  }

  // =================== REVIEWS ===================
  getDoctorReviews(doctorId: number, page = 1, pageSize = 20): Observable<PagedResult<ReviewDto>> {
    return this.http.get<PagedResult<ReviewDto>>(`${this.base}/reviews/doctor/${doctorId}`, {
      params: new HttpParams().set('page', page).set('pageSize', pageSize)
    });
  }

  createReview(body: { appointmentId: number; rating: number; comment?: string; isAnonymous?: boolean }): Observable<ReviewDto> {
    return this.http.post<ReviewDto>(`${this.base}/reviews`, body);
  }

  // =================== REPORTS ===================
  getDashboard(): Observable<DashboardSummaryDto> {
    return this.http.get<DashboardSummaryDto>(`${this.base}/reports/dashboard`);
  }

  getTopDoctors(count = 10): Observable<TopDoctorDto[]> {
    return this.http.get<TopDoctorDto[]>(`${this.base}/reports/top-doctors?count=${count}`);
  }

  getMonthlyRevenue(months = 6): Observable<RevenueByMonthDto[]> {
    return this.http.get<RevenueByMonthDto[]>(`${this.base}/reports/revenue/monthly?months=${months}`);
  }

  getAdminReport(months = 6): Observable<AdminReportDto> {
    return this.http.get<AdminReportDto>(`${this.base}/reports/admin-report?months=${months}`);
  }

  getClinicReport(clinicId?: number, months = 6): Observable<ClinicReportDto> {
    let p = new HttpParams().set('months', months);
    if (clinicId) p = p.set('clinicId', clinicId);
    return this.http.get<ClinicReportDto>(`${this.base}/reports/clinic-report`, { params: p });
  }

  getAppointmentTrends(months = 6): Observable<AppointmentTrendDto[]> {
    return this.http.get<AppointmentTrendDto[]>(`${this.base}/reports/appointment-trends?months=${months}`);
  }

  getSpecialtyStats(): Observable<SpecialtyStatsDto[]> {
    return this.http.get<SpecialtyStatsDto[]>(`${this.base}/reports/specialty-stats`);
  }

  getPatientTrends(months = 6): Observable<PatientRegistrationTrendDto[]> {
    return this.http.get<PatientRegistrationTrendDto[]>(`${this.base}/reports/patient-trends?months=${months}`);
  }

  getPeakHours(): Observable<PeakHourDto[]> {
    return this.http.get<PeakHourDto[]>(`${this.base}/reports/peak-hours`);
  }

  getDayOfWeekStats(): Observable<DayOfWeekStatsDto[]> {
    return this.http.get<DayOfWeekStatsDto[]>(`${this.base}/reports/day-of-week`);
  }

  getGenderDistribution(): Observable<GenderDistributionDto[]> {
    return this.http.get<GenderDistributionDto[]>(`${this.base}/reports/gender-distribution`);
  }

  getDoctorPerformance(clinicId?: number): Observable<DoctorPerformanceDto[]> {
    let p = new HttpParams();
    if (clinicId) p = p.set('clinicId', clinicId);
    return this.http.get<DoctorPerformanceDto[]>(`${this.base}/reports/doctor-performance`, { params: p });
  }

  // =================== ADMIN: SPECIALTIES CRUD ===================
  createSpecialty(body: any): Observable<SpecialtyDto> {
    return this.http.post<SpecialtyDto>(`${this.base}/specialties`, body);
  }
  updateSpecialty(id: number, body: any): Observable<SpecialtyDto> {
    return this.http.put<SpecialtyDto>(`${this.base}/specialties/${id}`, body);
  }
  deleteSpecialty(id: number): Observable<any> {
    return this.http.delete<any>(`${this.base}/specialties/${id}`);
  }

  // =================== ADMIN: CLINICS CRUD ===================
  createClinic(body: any): Observable<ClinicDto> {
    return this.http.post<ClinicDto>(`${this.base}/clinics`, body);
  }
  updateClinic(id: number, body: any): Observable<ClinicDto> {
    return this.http.put<ClinicDto>(`${this.base}/clinics/${id}`, body);
  }
  deleteClinic(id: number): Observable<any> {
    return this.http.delete<any>(`${this.base}/clinics/${id}`);
  }

  // =================== ADMIN: DOCTORS CRUD ===================
  createDoctor(body: any): Observable<DoctorDto> {
    return this.http.post<DoctorDto>(`${this.base}/doctors`, body);
  }
  updateDoctor(id: number, body: any): Observable<DoctorDto> {
    return this.http.put<DoctorDto>(`${this.base}/doctors/${id}`, body);
  }
  deleteDoctor(id: number): Observable<any> {
    return this.http.delete<any>(`${this.base}/doctors/${id}`);
  }

  // =================== ADMIN: CLINIC ADMIN APPROVALS ===================
  getPendingClinicAdmins(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(`${this.base}/auth/pending-clinic-admins`);
  }

  approveClinicAdmin(userId: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.base}/auth/approve-clinic-admin/${userId}`, {});
  }

  rejectClinicAdmin(userId: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.base}/auth/reject-clinic-admin/${userId}`, {});
  }

  // =================== ADMIN: USER MANAGEMENT ===================
  getUsers(search?: string, role?: string, page = 1, pageSize = 50): Observable<PagedResult<UserDto>> {
    let p = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (search) p = p.set('search', search);
    if (role) p = p.set('role', role);
    return this.http.get<PagedResult<UserDto>>(`${this.base}/users`, { params: p });
  }

  getUser(id: string): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.base}/users/${id}`);
  }

  toggleUserActive(id: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.base}/users/${id}/toggle-active`, {});
  }

  adminResetPassword(id: string, newPassword: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.base}/users/${id}/reset-password`, { newPassword });
  }

  updateUserRole(id: string, role: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.base}/users/${id}/role`, { role });
  }

  deleteUser(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.base}/users/${id}`);
  }
}