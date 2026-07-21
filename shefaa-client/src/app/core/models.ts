// Common API response envelope
export interface ApiResponse<T> {
  success: boolean;
  message?: string | null;
  data?: T;
  errors?: string[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ===================== AUTH =====================
export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string | null;
  phoneNumber?: string | null;
  profileImageUrl?: string | null;
  gender: number;
  userType: number;
  isActive: boolean;
  createdAt: string;
  roles: string[];
  permissions: string[];  // derived from roles via AuthorizationCatalog
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  user: UserDto;
}

export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  gender: number;
  userType: number;      // kept for backward-compat; derived from primary role
  roles: string[];       // one or more: ["Patient"], ["Doctor"], ["Patient","Doctor"]
  dateOfBirth?: string;
}
export interface ForgotPasswordRequest { email: string; }
export interface ResetPasswordRequest { email: string; token: string; newPassword: string; }
export interface ChangePasswordRequest { currentPassword: string; newPassword: string; }

// ===================== SPECIALTY =====================
export interface SpecialtyDto {
  id: number;
  name: string;
  nameAr?: string | null;
  description?: string | null;
  iconUrl?: string | null;
  isActive: boolean;
  doctorsCount: number;
}

// ===================== CLINIC =====================
export interface ClinicDto {
  id: number;
  name: string;
  nameAr?: string | null;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  governorate?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  website?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  logoUrl?: string | null;
  openingTime?: string | null;
  closingTime?: string | null;
  isActive: boolean;
  doctorsCount: number;
  specialtyId?: number | null;
  specialtyName?: string | null;
  specialtyNameAr?: string | null;
}

export type StaffRole = 1 | 2 | 3 | 4 | 99;

export interface ClinicStaffDto {
  id: number;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  clinicId: number;
  clinicName: string;
  position: string;
  role: StaffRole;
  isActive: boolean;
}

export interface CreateClinicStaffRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  gender: number;
  dateOfBirth?: string;
  position: string;
  role: StaffRole;
  isActive: boolean;
}

// ===================== DOCTOR =====================
export interface DoctorDto {
  id: number;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  profileImageUrl?: string | null;
  specialtyId: number;
  specialtyName: string;
  licenseNumber: string;
  yearsOfExperience: number;
  biography?: string | null;
  education?: string | null;
  defaultConsultationFee?: number | null;
  defaultAppointmentDurationMinutes?: number | null;
  rating?: number | null;
  totalReviews: number;
  isAvailableForBooking: boolean;
  isActive: boolean;
}

export interface DoctorPatientDto {
  patientId: number;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  medicalRecordNumber?: string;
  totalAppointments: number;
  completedAppointments: number;
  lastVisitDate?: string;
  lastVisitStatus?: string;
}

export interface TimeSlotDto {
  start: string;
  end: string;
  isAvailable: boolean;
}

// ===================== PATIENT =====================
export interface PatientDto {
  id: number;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  medicalRecordNumber?: string | null;
  bloodType: number;
  allergies?: string | null;
  chronicDiseases?: string | null;
  currentMedications?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  insuranceProvider?: string | null;
  insurancePolicyNumber?: string | null;
  registrationDate?: string | null;
  age: number;
  gender: number;
}

// ===================== APPOINTMENT =====================
export type AppointmentStatus =
  | 'Pending' | 'Confirmed' | 'CheckedIn' | 'InProgress'
  | 'Completed' | 'Cancelled' | 'NoShow' | 'Rescheduled';

// 1 = Cash, 2 = Card, 3 = Vodafone Cash, 4 = InstaPay
export type PaymentMethod = 1 | 2 | 3 | 4;

export interface AppointmentDto {
  id: number;
  confirmationCode: string;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialty?: string | null;
  clinicId: number;
  clinicName: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string | null;
  actualEnd?: string | null;
  status: AppointmentStatus;
  reasonForVisit?: string | null;
  patientNotes?: string | null;
  doctorNotes?: string | null;
  cancellationReason?: string | null;
  consultationFee?: number | null;
  isPaid: boolean;
  paymentMethod?: PaymentMethod | null;
  paymentDate?: string | null;
  paymentReference?: string | null;
}

// ===================== NOTIFICATION =====================
export type NotificationType =
  | 'AppointmentCreated' | 'AppointmentConfirmed' | 'AppointmentCancelled'
  | 'AppointmentRescheduled' | 'AppointmentReminder' | 'PrescriptionReady'
  | 'MedicalRecordUpdated' | 'General';

export interface NotificationDto {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string | null;
  appointmentId?: number | null;
  medicalRecordId?: number | null;
  isRead: boolean;
  readAt?: string | null;
  sentAt?: string | null;
  createdAt: string;
}

// ===================== MEDICAL RECORD =====================
export interface PrescriptionDto {
  id: number;
  medicationName: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  route?: string;
  instructions?: string;
  quantity?: number;
  refillAllowed: boolean;
}

export interface AttachmentDto {
  id: number;
  fileName: string;
  fileUrl: string;
  contentType: string;
  fileSize: number;
  description?: string;
}

export interface MedicalRecordDto {
  id: number;
  appointmentId: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  chiefComplaint?: string;
  diagnosis?: string;
  symptoms?: string;
  treatmentPlan?: string;
  investigations?: string;
  notes?: string;
  recordDate: string;
  followUpRequired: boolean;
  followUpDate?: string | null;
  prescriptions: PrescriptionDto[];
  attachments: AttachmentDto[];
}

// ===================== REVIEW =====================
export interface ReviewDto {
  id: number;
  appointmentId: number;
  doctorId: number;
  patientId: number;
  patientDisplayName?: string | null;
  rating: number;
  comment?: string | null;
  createdAt: string;
}

// ===================== REPORTS =====================
export interface StatusCountDto { status: AppointmentStatus; count: number; }
export interface TopDoctorDto {
  doctorId: number; doctorName: string; specialtyName: string;
  completedAppointments: number; rating?: number | null; totalReviews: number;
}
export interface RevenueByMonthDto {
  year: number; month: number; label: string;
  revenue: number; appointmentCount: number;
}
export interface DashboardSummaryDto {
  totalPatients: number;
  totalDoctors: number;
  totalClinics: number;
  totalAppointments: number;
  appointmentsToday: number;
  appointmentsThisWeek: number;
  appointmentsThisMonth: number;
  estimatedRevenueThisMonth: number;
  estimatedRevenueLastMonth: number;
  revenueGrowthPercent: number;
  newPatientsThisMonth: number;
  newPatientsThisWeek: number;
  newDoctorsThisMonth: number;
  avgConsultationFee: number;
  completionRate: number;
  noShowRate: number;
  cancellationRate: number;
  appointmentsByStatus: StatusCountDto[];
}
export interface AppointmentTrendDto {
  label: string; total: number; completed: number; cancelled: number; noShow: number;
}
export interface SpecialtyStatsDto {
  specialtyId: number; specialtyName: string;
  doctorCount: number; appointmentCount: number; revenue: number;
}
export interface PatientRegistrationTrendDto { label: string; count: number; }
export interface PeakHourDto { hour: number; count: number; }
export interface DayOfWeekStatsDto { dayName: string; count: number; }
export interface DoctorPerformanceDto {
  doctorId: number; doctorName: string; specialtyName: string;
  totalAppointments: number; completedAppointments: number; cancelledAppointments: number;
  revenue: number; rating?: number | null; totalReviews: number; completionRate: number;
}
export interface GenderDistributionDto { gender: string; count: number; }
export interface AdminReportDto {
  summary: DashboardSummaryDto;
  appointmentTrends: AppointmentTrendDto[];
  specialtyStats: SpecialtyStatsDto[];
  patientTrends: PatientRegistrationTrendDto[];
  peakHours: PeakHourDto[];
  dayOfWeekStats: DayOfWeekStatsDto[];
  genderDistribution: GenderDistributionDto[];
  topDoctors: TopDoctorDto[];
  revenueByMonth: RevenueByMonthDto[];
}
export interface ClinicSummaryDto {
  clinicName: string; totalDoctors: number; totalPatients: number;
  totalAppointments: number; appointmentsToday: number; appointmentsThisWeek: number;
  revenueThisMonth: number; revenueLastMonth: number; revenueGrowthPercent: number;
  completionRate: number; noShowRate: number; newPatientsThisMonth: number;
}
export interface ClinicReportDto {
  summary: ClinicSummaryDto;
  doctorPerformance: DoctorPerformanceDto[];
  appointmentTrends: AppointmentTrendDto[];
  dayOfWeekStats: DayOfWeekStatsDto[];
  peakHours: PeakHourDto[];
  revenueByMonth: RevenueByMonthDto[];
  appointmentsByStatus: StatusCountDto[];
}

// ===================== DOCTOR SCHEDULES / TIME OFF =====================
export interface DoctorScheduleDto {
  id: number;
  doctorId: number;
  clinicId?: number | null;
  clinicName?: string | null;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  isActive: boolean;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
}

export interface DoctorTimeOffDto {
  id: number;
  doctorId: number;
  startAt: string;
  endAt: string;
  reason?: string | null;
  isFullDay: boolean;
  createdAt?: string;
}

export interface TimeOffRequest {
  startAt: string;
  endAt: string;
  reason?: string;
  isFullDay: boolean;
}

export interface CreateReviewRequest {
  appointmentId: number;
  rating: number;
  comment?: string | null;
  isAnonymous?: boolean;
}

// ===================== CLINIC-DOCTOR =====================
export interface ClinicDoctorDto {
  id: number;
  doctorId: number;
  doctorName: string;
  specialtyName?: string | null;
  consultationFee?: number | null;
  isPrimary: boolean;
}