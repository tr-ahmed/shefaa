using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using Shefaa.Application.Common;
using Shefaa.Application.DTOs.Appointments;
using Shefaa.Application.Interfaces;
using Shefaa.Domain.Appointments;
using Shefaa.Domain.Enums;
using Shefaa.Domain.Notifications;
using Shefaa.Infrastructure.Persistence;

namespace Shefaa.Infrastructure.Services;

public class AppointmentService : IAppointmentService
{
    private readonly ShefaaDbContext _db;

    public AppointmentService(ShefaaDbContext db) => _db = db;

    public async Task<PagedResult<AppointmentDto>> GetPagedAsync(int page, int pageSize, AppointmentQueryFilter filter, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        var query = _db.Appointments.AsNoTracking()
            .Include(a => a.Patient).ThenInclude(p => p!.User)
            .Include(a => a.Doctor).ThenInclude(d => d!.User)
            .Include(a => a.Doctor).ThenInclude(d => d!.Specialty)
            .Include(a => a.Clinic)
            .AsQueryable();

        // Role-based scoping: patients see their own only
        if (!string.IsNullOrEmpty(filter.CurrentUserId))
        {
            var role = filter.CurrentUserRole ?? "";
            if (role == "Patient")
            {
                var patientId = await _db.Patients
                    .Where(p => p.UserId == filter.CurrentUserId)
                    .Select(p => (int?)p.Id)
                    .FirstOrDefaultAsync(ct);
                if (patientId == null) return new PagedResult<AppointmentDto> { Page = page, PageSize = pageSize };
                query = query.Where(a => a.PatientId == patientId.Value);
            }
            else if (role == "Doctor")
            {
                var doctorId = await _db.Doctors
                    .Where(d => d.UserId == filter.CurrentUserId)
                    .Select(d => (int?)d.Id)
                    .FirstOrDefaultAsync(ct);
                if (doctorId == null) return new PagedResult<AppointmentDto> { Page = page, PageSize = pageSize };
                query = query.Where(a => a.DoctorId == doctorId.Value);
            }
        }

        if (filter.PatientId.HasValue) query = query.Where(a => a.PatientId == filter.PatientId.Value);
        if (filter.DoctorId.HasValue) query = query.Where(a => a.DoctorId == filter.DoctorId.Value);
        if (filter.ClinicId.HasValue) query = query.Where(a => a.ClinicId == filter.ClinicId.Value);
        if (filter.Status.HasValue) query = query.Where(a => a.Status == filter.Status.Value);
        if (filter.FromDate.HasValue) query = query.Where(a => a.ScheduledStart >= filter.FromDate.Value);
        if (filter.ToDate.HasValue) query = query.Where(a => a.ScheduledStart <= filter.ToDate.Value);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(a => a.ScheduledStart)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AppointmentDto
            {
                Id = a.Id,
                ConfirmationCode = a.ConfirmationCode,
                PatientId = a.PatientId,
                PatientName = a.Patient!.User!.FirstName + " " + a.Patient.User.LastName,
                DoctorId = a.DoctorId,
                DoctorName = a.Doctor!.User!.FirstName + " " + a.Doctor.User.LastName,
                DoctorSpecialty = a.Doctor.Specialty!.Name,
                ClinicId = a.ClinicId,
                ClinicName = a.Clinic!.Name,
                ScheduledStart = a.ScheduledStart,
                ScheduledEnd = a.ScheduledEnd,
                ActualStart = a.ActualStart,
                ActualEnd = a.ActualEnd,
                Status = a.Status,
                ReasonForVisit = a.ReasonForVisit,
                PatientNotes = a.PatientNotes,
                DoctorNotes = a.DoctorNotes,
                CancellationReason = a.CancellationReason,
                ConsultationFee = a.ConsultationFee,
                IsPaid = a.IsPaid,
                PaymentMethod = a.PaymentMethod,
                PaymentDate = a.PaymentDate,
                PaymentReference = a.PaymentReference
            })
            .ToListAsync(ct);

        return new PagedResult<AppointmentDto> { Items = items, TotalCount = total, Page = page, PageSize = pageSize };
    }

    public async Task<AppointmentDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return await _db.Appointments.AsNoTracking()
            .Where(a => a.Id == id)
            .Select(a => new AppointmentDto
            {
                Id = a.Id,
                ConfirmationCode = a.ConfirmationCode,
                PatientId = a.PatientId,
                PatientName = a.Patient!.User!.FirstName + " " + a.Patient.User.LastName,
                DoctorId = a.DoctorId,
                DoctorName = a.Doctor!.User!.FirstName + " " + a.Doctor.User.LastName,
                DoctorSpecialty = a.Doctor.Specialty!.Name,
                ClinicId = a.ClinicId,
                ClinicName = a.Clinic!.Name,
                ScheduledStart = a.ScheduledStart,
                ScheduledEnd = a.ScheduledEnd,
                ActualStart = a.ActualStart,
                ActualEnd = a.ActualEnd,
                Status = a.Status,
                ReasonForVisit = a.ReasonForVisit,
                PatientNotes = a.PatientNotes,
                DoctorNotes = a.DoctorNotes,
                CancellationReason = a.CancellationReason,
                ConsultationFee = a.ConsultationFee,
                IsPaid = a.IsPaid,
                PaymentMethod = a.PaymentMethod,
                PaymentDate = a.PaymentDate,
                PaymentReference = a.PaymentReference
            })
            .FirstOrDefaultAsync(ct);
    }

    public async Task<ApiResponse<AppointmentDto>> CreateAsync(CreateAppointmentRequest request, string currentUserId, CancellationToken ct = default)
    {
        // Resolve patient from current user
        var patient = await _db.Patients.Include(p => p.User)
            .FirstOrDefaultAsync(p => p.UserId == currentUserId, ct);
        if (patient == null)
            return ApiResponse<AppointmentDto>.Fail("Patient profile not found.", "PATIENT_PROFILE_REQUIRED");

        var doctor = await _db.Doctors.Include(d => d.User)
            .FirstOrDefaultAsync(d => d.Id == request.DoctorId && !d.IsDeleted, ct);
        if (doctor == null || !doctor.IsActive || !doctor.IsAvailableForBooking)
            return ApiResponse<AppointmentDto>.Fail("Doctor not available for booking.", "DOCTOR_NOT_AVAILABLE");

        if (!await _db.Clinics.AnyAsync(c => c.Id == request.ClinicId && c.IsActive, ct))
            return ApiResponse<AppointmentDto>.Fail("Clinic not available.", "CLINIC_NOT_FOUND");

        var duration = TimeSpan.FromMinutes(doctor.DefaultAppointmentDurationMinutes ?? 30);
        var startUtc = EnsureUtc(request.ScheduledStart);
        var endUtc = startUtc.Add(duration);

        if (startUtc <= DateTime.UtcNow)
            return ApiResponse<AppointmentDto>.Fail("Appointment time must be in the future.", "INVALID_TIME");

        // Conflict check
        var conflict = await _db.Appointments.AnyAsync(a =>
            a.DoctorId == request.DoctorId
            && a.Status != AppointmentStatus.Cancelled
            && a.Status != AppointmentStatus.NoShow
            && a.ScheduledStart < endUtc
            && a.ScheduledEnd > startUtc, ct);
        if (conflict)
            return ApiResponse<AppointmentDto>.Fail("This time slot is already booked.", "SLOT_TAKEN");

        var confirmationCode = GenerateConfirmationCode();
        var appointment = new Appointment
        {
            PatientId = patient.Id,
            DoctorId = request.DoctorId,
            ClinicId = request.ClinicId,
            ScheduledStart = startUtc,
            ScheduledEnd = endUtc,
            Status = AppointmentStatus.Pending,
            ReasonForVisit = request.ReasonForVisit,
            PatientNotes = request.PatientNotes,
            ConsultationFee = doctor.DefaultConsultationFee,
            PaymentMethod = request.PaymentMethod,
            // Cash / pay-at-clinic is recorded as "not paid yet" — the receptionist marks it paid on arrival.
            // Card / VodafoneCash / InstaPay imply the patient intends to pay online before arrival and
            //   the status remains Pending until the payment endpoint flips IsPaid = true.
            IsPaid = false,
            ConfirmationCode = confirmationCode,
            CreatedBy = currentUserId
        };
        _db.Appointments.Add(appointment);
        _db.AppointmentStatusHistories.Add(new AppointmentStatusHistory
        {
            Appointment = appointment,
            ToStatus = AppointmentStatus.Pending,
            ChangedBy = currentUserId,
            Notes = "Appointment created."
        });

        // Save first so the appointment.Id is assigned, then add notifications referencing it.
        await _db.SaveChangesAsync(ct);

        // Notify doctor
        _db.Notifications.Add(new Notification
        {
            UserId = doctor.UserId,
            Type = NotificationType.AppointmentCreated,
            Title = "New appointment request",
            Message = $"{patient.User!.FirstName} {patient.User.LastName} booked an appointment on {startUtc:yyyy-MM-dd HH:mm}.",
            AppointmentId = appointment.Id,
            SentAt = DateTime.UtcNow
        });
        // Notify patient
        _db.Notifications.Add(new Notification
        {
            UserId = currentUserId,
            Type = NotificationType.AppointmentCreated,
            Title = "Appointment pending confirmation",
            Message = $"Your appointment with Dr. {doctor.User!.FirstName} {doctor.User.LastName} is pending confirmation.",
            AppointmentId = appointment.Id,
            SentAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync(ct);

        var dto = await GetByIdAsync(appointment.Id, ct);
        return ApiResponse<AppointmentDto>.Ok(dto!, "Appointment created.");
    }

    public async Task<ApiResponse> CancelAsync(int id, string reason, string currentUserId, CancellationToken ct = default)
    {
        var a = await _db.Appointments.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (a == null) return ApiResponse.Fail("Appointment not found.", "NOT_FOUND");

        if (a.Status == AppointmentStatus.Completed || a.Status == AppointmentStatus.Cancelled)
            return ApiResponse.Fail("Cannot cancel a completed or already-cancelled appointment.", "INVALID_STATE");

        var from = a.Status;
        a.Status = AppointmentStatus.Cancelled;
        a.CancellationReason = reason;
        a.CancelledBy = currentUserId;
        a.CancelledAt = DateTime.UtcNow;
        a.UpdatedAt = DateTime.UtcNow;

        _db.AppointmentStatusHistories.Add(new AppointmentStatusHistory
        {
            AppointmentId = id,
            FromStatus = from,
            ToStatus = AppointmentStatus.Cancelled,
            ChangedBy = currentUserId,
            Notes = reason
        });

        await _db.SaveChangesAsync(ct);
        return ApiResponse.Ok("Appointment cancelled.");
    }

    public async Task<ApiResponse> RescheduleAsync(int id, RescheduleAppointmentRequest request, string currentUserId, CancellationToken ct = default)
    {
        var a = await _db.Appointments.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (a == null) return ApiResponse.Fail("Appointment not found.", "NOT_FOUND");

        var doctor = await _db.Doctors.FirstOrDefaultAsync(d => d.Id == a.DoctorId, ct);
        if (doctor == null) return ApiResponse.Fail("Doctor not found.", "NOT_FOUND");

        var duration = a.ScheduledEnd - a.ScheduledStart;
        var newStart = EnsureUtc(request.NewStart);
        var newEnd = newStart.Add(duration);

        if (newStart <= DateTime.UtcNow)
            return ApiResponse.Fail("New appointment time must be in the future.", "INVALID_TIME");

        var conflict = await _db.Appointments.AnyAsync(x =>
            x.Id != id
            && x.DoctorId == a.DoctorId
            && x.Status != AppointmentStatus.Cancelled
            && x.Status != AppointmentStatus.NoShow
            && x.ScheduledStart < newEnd
            && x.ScheduledEnd > newStart, ct);
        if (conflict) return ApiResponse.Fail("New time slot is already booked.", "SLOT_TAKEN");

        var from = a.Status;
        a.ScheduledStart = newStart;
        a.ScheduledEnd = newEnd;
        a.Status = AppointmentStatus.Rescheduled;
        a.UpdatedAt = DateTime.UtcNow;

        _db.AppointmentStatusHistories.Add(new AppointmentStatusHistory
        {
            AppointmentId = id,
            FromStatus = from,
            ToStatus = AppointmentStatus.Rescheduled,
            ChangedBy = currentUserId,
            Notes = $"Rescheduled to {newStart:yyyy-MM-dd HH:mm}."
        });

        await _db.SaveChangesAsync(ct);
        return ApiResponse.Ok("Appointment rescheduled.");
    }

    public async Task<ApiResponse> UpdateStatusAsync(int id, AppointmentStatus newStatus, string? notes, string currentUserId, CancellationToken ct = default)
    {
        var a = await _db.Appointments.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (a == null) return ApiResponse.Fail("Appointment not found.", "NOT_FOUND");

        var from = a.Status;
        a.Status = newStatus;
        a.UpdatedAt = DateTime.UtcNow;
        if (newStatus == AppointmentStatus.CheckedIn) a.ActualStart = DateTime.UtcNow;
        if (newStatus == AppointmentStatus.Completed) a.ActualEnd = DateTime.UtcNow;

        _db.AppointmentStatusHistories.Add(new AppointmentStatusHistory
        {
            AppointmentId = id,
            FromStatus = from,
            ToStatus = newStatus,
            ChangedBy = currentUserId,
            Notes = notes
        });

        await _db.SaveChangesAsync(ct);
        return ApiResponse.Ok($"Appointment status updated to {newStatus}.");
    }

    public async Task<ApiResponse<AppointmentDto>> MarkPaidAsync(int id, MarkAppointmentPaidRequest request, string currentUserId, CancellationToken ct = default)
    {
        var a = await _db.Appointments.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (a == null) return ApiResponse<AppointmentDto>.Fail("Appointment not found.", "NOT_FOUND");

        // The patient who owns the appointment can always mark it paid (after paying online via Vodafone Cash / InstaPay).
        // Staff/admin override is enforced at the controller layer.
        var patientUserId = await _db.Patients.Where(p => p.Id == a.PatientId)
            .Select(p => p.UserId).FirstOrDefaultAsync(ct);
        if (patientUserId != currentUserId)
            return ApiResponse<AppointmentDto>.Fail("You are not allowed to mark this appointment as paid.", "FORBIDDEN");

        a.PaymentMethod = request.PaymentMethod;
        a.PaymentReference = request.PaymentReference;
        a.PaymentDate = DateTime.UtcNow;
        a.IsPaid = true;
        a.UpdatedAt = DateTime.UtcNow;
        a.UpdatedBy = currentUserId;

        await _db.SaveChangesAsync(ct);

        var dto = await GetByIdAsync(id, ct);
        return ApiResponse<AppointmentDto>.Ok(dto!, $"Payment recorded ({request.PaymentMethod}).");
    }

    private static DateTime EnsureUtc(DateTime dt) =>
        dt.Kind switch
        {
            DateTimeKind.Utc => dt,
            DateTimeKind.Local => dt.ToUniversalTime(),
            _ => DateTime.SpecifyKind(dt, DateTimeKind.Utc)
        };

    private static string GenerateConfirmationCode()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var buffer = new byte[6];
        RandomNumberGenerator.Fill(buffer);
        return new string(buffer.Select(b => chars[b % chars.Length]).ToArray());
    }
}