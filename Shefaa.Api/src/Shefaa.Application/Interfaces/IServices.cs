using Shefaa.Application.Common;
using Shefaa.Application.DTOs.Appointments;
using Shefaa.Application.DTOs.Clinics;
using Shefaa.Application.DTOs.Doctors;
using Shefaa.Application.DTOs.MedicalRecords;
using Shefaa.Application.DTOs.Notifications;
using Shefaa.Application.DTOs.Patients;
using Shefaa.Application.DTOs.Reviews;
using Shefaa.Application.DTOs.Schedules;
using Shefaa.Application.DTOs.Specialties;

namespace Shefaa.Application.Interfaces;

public interface ISpecialtyService
{
    Task<PagedResult<SpecialtyDto>> GetPagedAsync(int page, int pageSize, string? search, bool activeOnly, CancellationToken ct = default);
    Task<SpecialtyDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<ApiResponse<SpecialtyDto>> CreateAsync(CreateSpecialtyRequest request, CancellationToken ct = default);
    Task<ApiResponse<SpecialtyDto>> UpdateAsync(int id, UpdateSpecialtyRequest request, CancellationToken ct = default);
    Task<ApiResponse> DeleteAsync(int id, CancellationToken ct = default);
}

public interface IClinicService
{
    Task<PagedResult<ClinicDto>> GetPagedAsync(int page, int pageSize, string? search, bool activeOnly, string? city, CancellationToken ct = default);
    Task<ClinicDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<ClinicDto?> GetByOwnerUserIdAsync(string userId, CancellationToken ct = default);
    Task<ApiResponse<ClinicDto>> CreateAsync(CreateClinicRequest request, string currentUserId, CancellationToken ct = default);
    Task<ApiResponse<ClinicDto>> UpdateAsync(int id, UpdateClinicRequest request, CancellationToken ct = default);
    Task<ApiResponse> DeleteAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<ClinicDoctorDto>> GetClinicDoctorsAsync(int clinicId, CancellationToken ct = default);
    Task<ApiResponse<ClinicDoctorDto>> AddDoctorAsync(int clinicId, AddDoctorToClinicRequest request, CancellationToken ct = default);
    Task<ApiResponse> RemoveDoctorAsync(int clinicId, int doctorId, CancellationToken ct = default);
    Task<IReadOnlyList<ClinicStaffDto>> GetClinicStaffAsync(int clinicId, CancellationToken ct = default);
    Task<ApiResponse<ClinicStaffDto>> AddStaffAsync(int clinicId, CreateClinicStaffRequest request, string currentUserId, CancellationToken ct = default);
    Task<ApiResponse> RemoveStaffAsync(int clinicId, int staffId, CancellationToken ct = default);
}

public interface IDoctorService
{
    Task<PagedResult<DoctorDto>> GetPagedAsync(int page, int pageSize, int? specialtyId, string? search, bool availableOnly, CancellationToken ct = default);
    Task<DoctorDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<DoctorDto?> GetByUserIdAsync(string userId, CancellationToken ct = default);
    Task<ApiResponse<DoctorDto>> CreateAsync(CreateDoctorRequest request, string currentUserId, CancellationToken ct = default);
    Task<ApiResponse<DoctorDto>> UpdateAsync(int id, UpdateDoctorRequest request, CancellationToken ct = default);
    Task<ApiResponse> DeleteAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<DoctorScheduleDto>> GetSchedulesAsync(int doctorId, CancellationToken ct = default);
    Task<ApiResponse<DoctorScheduleDto>> AddScheduleAsync(int doctorId, CreateDoctorScheduleRequest request, CancellationToken ct = default);
    Task<ApiResponse> RemoveScheduleAsync(int doctorId, int scheduleId, CancellationToken ct = default);
    Task<IReadOnlyList<TimeSlotDto>> GetAvailableSlotsAsync(int doctorId, DateTime date, int? clinicId, CancellationToken ct = default);
    Task<IReadOnlyList<Shefaa.Application.DTOs.Clinics.ClinicDto>> GetClinicsAsync(int doctorId, CancellationToken ct = default);
    Task<IReadOnlyList<DoctorTimeOffDto>> GetTimeOffAsync(int doctorId, CancellationToken ct = default);
    Task<ApiResponse<DoctorTimeOffDto>> AddTimeOffAsync(int doctorId, CreateDoctorTimeOffRequest request, string currentUserId, CancellationToken ct = default);
    Task<ApiResponse> RemoveTimeOffAsync(int doctorId, int timeOffId, string currentUserId, CancellationToken ct = default);
    Task<IReadOnlyList<DoctorPatientDto>> GetMyPatientsAsync(int doctorId, string? search, CancellationToken ct = default);
}

public interface IPatientService
{
    Task<PatientDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<PatientDto?> GetByUserIdAsync(string userId, CancellationToken ct = default);
    Task<ApiResponse<PatientDto>> CreateAsync(CreatePatientRequest request, string currentUserId, CancellationToken ct = default);
    Task<ApiResponse<PatientDto>> UpdateAsync(int id, UpdatePatientRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<MedicalRecordDto>> GetMedicalRecordsAsync(int patientId, CancellationToken ct = default);
    Task<PagedResult<PatientDto>> SearchAsync(string? search, int page, int pageSize, CancellationToken ct = default);
}

public interface IAppointmentService
{
    Task<PagedResult<AppointmentDto>> GetPagedAsync(int page, int pageSize, AppointmentQueryFilter filter, CancellationToken ct = default);
    Task<AppointmentDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<ApiResponse<AppointmentDto>> CreateAsync(CreateAppointmentRequest request, string currentUserId, CancellationToken ct = default);
    Task<ApiResponse> CancelAsync(int id, string reason, string currentUserId, CancellationToken ct = default);
    Task<ApiResponse> RescheduleAsync(int id, RescheduleAppointmentRequest request, string currentUserId, CancellationToken ct = default);
    Task<ApiResponse> UpdateStatusAsync(int id, Domain.Enums.AppointmentStatus newStatus, string? notes, string currentUserId, CancellationToken ct = default);
    Task<ApiResponse<AppointmentDto>> MarkPaidAsync(int id, MarkAppointmentPaidRequest request, string currentUserId, CancellationToken ct = default);
}

public interface IMedicalRecordService
{
    Task<MedicalRecordDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<MedicalRecordDto>> GetByDoctorIdAsync(int doctorId, CancellationToken ct = default);
    Task<ApiResponse<MedicalRecordDto>> CreateAsync(CreateMedicalRecordRequest request, string currentUserId, CancellationToken ct = default);
    Task<ApiResponse<MedicalRecordDto>> UpdateAsync(int id, UpdateMedicalRecordRequest request, CancellationToken ct = default);
}

public interface INotificationService
{
    Task<PagedResult<NotificationDto>> GetForUserAsync(string userId, int page, int pageSize, bool unreadOnly, CancellationToken ct = default);
    Task<ApiResponse> MarkAsReadAsync(int id, string currentUserId, CancellationToken ct = default);
    Task<ApiResponse> MarkAllAsReadAsync(string currentUserId, CancellationToken ct = default);
    Task<int> GetUnreadCountAsync(string userId, CancellationToken ct = default);
}

public interface IReviewService
{
    Task<PagedResult<ReviewDto>> GetForDoctorAsync(int doctorId, int page, int pageSize, CancellationToken ct = default);
    Task<ApiResponse<ReviewDto>> CreateAsync(CreateReviewRequest request, string currentUserId, CancellationToken ct = default);
}

public class AppointmentQueryFilter
{
    public int? PatientId { get; set; }
    public int? DoctorId { get; set; }
    public int? ClinicId { get; set; }
    public Domain.Enums.AppointmentStatus? Status { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public string? CurrentUserId { get; set; }
    public string? CurrentUserRole { get; set; }
}