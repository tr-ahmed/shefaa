using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Shefaa.Application.Common;
using Shefaa.Application.DTOs.Clinics;
using Shefaa.Application.DTOs.Doctors;
using Shefaa.Application.DTOs.Schedules;
using Shefaa.Application.Interfaces;
using Shefaa.Domain.Doctors;
using Shefaa.Domain.Enums;
using Shefaa.Domain.Identity;
using Shefaa.Domain.Schedules;
using Shefaa.Infrastructure.Persistence;

namespace Shefaa.Infrastructure.Services;

public class DoctorService : IDoctorService
{
    private readonly ShefaaDbContext _db;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IHttpContextAccessor _http;

    public DoctorService(ShefaaDbContext db, UserManager<ApplicationUser> userManager, IHttpContextAccessor http)
    {
        _db = db;
        _userManager = userManager;
        _http = http;
    }

    public async Task<PagedResult<DoctorDto>> GetPagedAsync(int page, int pageSize, int? specialtyId, string? search, bool availableOnly, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        var query = _db.Doctors.AsNoTracking()
            .Include(d => d.User)
            .Include(d => d.Specialty)
            .Where(d => !d.IsDeleted)
            .AsQueryable();

        if (specialtyId.HasValue) query = query.Where(d => d.SpecialtyId == specialtyId.Value);
        if (availableOnly) query = query.Where(d => d.IsAvailableForBooking && d.IsActive);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(d => d.User!.FirstName.ToLower().Contains(term)
                || d.User.LastName.ToLower().Contains(term)
                || d.Specialty!.Name.ToLower().Contains(term));
        }

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderBy(d => d.User!.LastName)
            .ThenBy(d => d.User.FirstName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(d => new DoctorDto
            {
                Id = d.Id,
                UserId = d.UserId,
                FullName = d.User!.FirstName + " " + d.User.LastName,
                Email = d.User.Email ?? "",
                PhoneNumber = d.User.PhoneNumber,
                ProfileImageUrl = d.User.ProfileImageUrl,
                SpecialtyId = d.SpecialtyId,
                SpecialtyName = d.Specialty!.Name,
                LicenseNumber = d.LicenseNumber,
                YearsOfExperience = d.YearsOfExperience,
                Biography = d.Biography,
                Education = d.Education,
                DefaultConsultationFee = d.DefaultConsultationFee,
                DefaultAppointmentDurationMinutes = d.DefaultAppointmentDurationMinutes,
                Rating = d.Rating,
                TotalReviews = d.TotalReviews,
                IsAvailableForBooking = d.IsAvailableForBooking,
                IsActive = d.IsActive
            })
            .ToListAsync(ct);

        return new PagedResult<DoctorDto> { Items = items, TotalCount = total, Page = page, PageSize = pageSize };
    }

    public async Task<DoctorDto?> GetByIdAsync(int id, CancellationToken ct = default)
        => await BuildDoctorDtoAsync(_db.Doctors.Where(d => d.Id == id), ct);

    public async Task<DoctorDto?> GetByUserIdAsync(string userId, CancellationToken ct = default)
        => await BuildDoctorDtoAsync(_db.Doctors.Where(d => d.UserId == userId), ct);

    private async Task<DoctorDto?> BuildDoctorDtoAsync(IQueryable<Doctor> query, CancellationToken ct)
    {
        return await query.AsNoTracking()
            .Select(d => new DoctorDto
            {
                Id = d.Id,
                UserId = d.UserId,
                FullName = d.User!.FirstName + " " + d.User.LastName,
                Email = d.User.Email ?? "",
                PhoneNumber = d.User.PhoneNumber,
                ProfileImageUrl = d.User.ProfileImageUrl,
                SpecialtyId = d.SpecialtyId,
                SpecialtyName = d.Specialty!.Name,
                LicenseNumber = d.LicenseNumber,
                YearsOfExperience = d.YearsOfExperience,
                Biography = d.Biography,
                Education = d.Education,
                DefaultConsultationFee = d.DefaultConsultationFee,
                DefaultAppointmentDurationMinutes = d.DefaultAppointmentDurationMinutes,
                Rating = d.Rating,
                TotalReviews = d.TotalReviews,
                IsAvailableForBooking = d.IsAvailableForBooking,
                IsActive = d.IsActive
            })
            .FirstOrDefaultAsync(ct);
    }

    public async Task<ApiResponse<DoctorDto>> CreateAsync(CreateDoctorRequest request, string currentUserId, CancellationToken ct = default)
    {
        if (await _db.Doctors.AnyAsync(d => d.LicenseNumber == request.LicenseNumber, ct))
            return ApiResponse<DoctorDto>.Fail("License number already registered.", "LICENSE_TAKEN");

        if (await _userManager.FindByEmailAsync(request.Email) != null)
            return ApiResponse<DoctorDto>.Fail("Email already registered.", "EMAIL_TAKEN");

        if (!await _db.Specialties.AnyAsync(s => s.Id == request.SpecialtyId, ct))
            return ApiResponse<DoctorDto>.Fail("Specialty not found.", "SPECIALTY_NOT_FOUND");

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            PhoneNumber = request.PhoneNumber,
            Gender = request.Gender,
            DateOfBirth = request.DateOfBirth,
            UserType = UserType.Doctor,
            EmailConfirmed = true
        };
        var createResult = await _userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
            return ApiResponse<DoctorDto>.Fail("User creation failed.", createResult.Errors.Select(e => e.Description).ToArray());

        await _userManager.AddToRoleAsync(user, "Doctor");

        var doctor = new Doctor
        {
            UserId = user.Id,
            SpecialtyId = request.SpecialtyId,
            LicenseNumber = request.LicenseNumber,
            YearsOfExperience = request.YearsOfExperience,
            Biography = request.Biography,
            Education = request.Education,
            DefaultConsultationFee = request.DefaultConsultationFee,
            DefaultAppointmentDurationMinutes = request.DefaultAppointmentDurationMinutes,
            IsAvailableForBooking = true,
            IsActive = true
        };
        _db.Doctors.Add(doctor);
        await _db.SaveChangesAsync(ct);

        var dto = await GetByIdAsync(doctor.Id, ct);
        return ApiResponse<DoctorDto>.Ok(dto!, "Doctor profile created.");
    }

    public async Task<ApiResponse<DoctorDto>> UpdateAsync(int id, UpdateDoctorRequest request, CancellationToken ct = default)
    {
        var entity = await _db.Doctors.FirstOrDefaultAsync(d => d.Id == id, ct);
        if (entity == null) return ApiResponse<DoctorDto>.Fail("Doctor not found.", "NOT_FOUND");

        if (await _db.Doctors.AnyAsync(d => d.Id != id && d.LicenseNumber == request.LicenseNumber, ct))
            return ApiResponse<DoctorDto>.Fail("License number already registered.", "LICENSE_TAKEN");

        if (!await _db.Specialties.AnyAsync(s => s.Id == request.SpecialtyId, ct))
            return ApiResponse<DoctorDto>.Fail("Specialty not found.", "SPECIALTY_NOT_FOUND");

        entity.SpecialtyId = request.SpecialtyId;
        entity.LicenseNumber = request.LicenseNumber;
        entity.YearsOfExperience = request.YearsOfExperience;
        entity.Biography = request.Biography;
        entity.Education = request.Education;
        entity.DefaultConsultationFee = request.DefaultConsultationFee;
        entity.DefaultAppointmentDurationMinutes = request.DefaultAppointmentDurationMinutes;
        entity.IsAvailableForBooking = request.IsAvailableForBooking;
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        var dto = await GetByIdAsync(id, ct);
        return ApiResponse<DoctorDto>.Ok(dto!, "Doctor updated.");
    }

    public async Task<ApiResponse> DeleteAsync(int id, CancellationToken ct = default)
    {
        var entity = await _db.Doctors.FirstOrDefaultAsync(d => d.Id == id, ct);
        if (entity == null) return ApiResponse.Fail("Doctor not found.", "NOT_FOUND");
        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return ApiResponse.Ok("Doctor deleted.");
    }

    public async Task<IReadOnlyList<DoctorScheduleDto>> GetSchedulesAsync(int doctorId, CancellationToken ct = default)
    {
        var schedules = await _db.DoctorSchedules.AsNoTracking()
            .Include(s => s.Clinic)
            .Where(s => s.DoctorId == doctorId && s.IsActive)
            .OrderBy(s => s.DayOfWeek)
            .ThenBy(s => s.StartTime)
            .ToListAsync(ct);

        return schedules.Select(s => new DoctorScheduleDto
        {
            Id = s.Id,
            DoctorId = s.DoctorId,
            ClinicId = s.ClinicId,
            ClinicName = s.Clinic?.Name,
            DayOfWeek = s.DayOfWeek,
            StartTime = s.StartTime.ToString(@"hh\:mm"),
            EndTime = s.EndTime.ToString(@"hh\:mm"),
            SlotDurationMinutes = s.SlotDurationMinutes,
            IsActive = s.IsActive
        }).ToList();
    }

    public async Task<ApiResponse<DoctorScheduleDto>> AddScheduleAsync(int doctorId, CreateDoctorScheduleRequest request, CancellationToken ct = default)
    {
        if (!await _db.Doctors.AnyAsync(d => d.Id == doctorId, ct))
            return ApiResponse<DoctorScheduleDto>.Fail("Doctor not found.", "DOCTOR_NOT_FOUND");

        if (!TimeSpan.TryParse(request.StartTime, out var start) || !TimeSpan.TryParse(request.EndTime, out var end) || start >= end)
            return ApiResponse<DoctorScheduleDto>.Fail("Invalid time range.", "INVALID_TIME");

        var schedule = new DoctorSchedule
        {
            DoctorId = doctorId,
            ClinicId = request.ClinicId,
            DayOfWeek = request.DayOfWeek,
            StartTime = start,
            EndTime = end,
            SlotDurationMinutes = request.SlotDurationMinutes,
            IsActive = true,
            EffectiveFrom = request.EffectiveFrom,
            EffectiveTo = request.EffectiveTo
        };
        _db.DoctorSchedules.Add(schedule);
        await _db.SaveChangesAsync(ct);

        var dto = new DoctorScheduleDto
        {
            Id = schedule.Id,
            DoctorId = schedule.DoctorId,
            ClinicId = schedule.ClinicId,
            DayOfWeek = schedule.DayOfWeek,
            StartTime = schedule.StartTime.ToString(@"hh\:mm"),
            EndTime = schedule.EndTime.ToString(@"hh\:mm"),
            SlotDurationMinutes = schedule.SlotDurationMinutes,
            IsActive = schedule.IsActive
        };
        return ApiResponse<DoctorScheduleDto>.Ok(dto, "Schedule added.");
    }

    public async Task<ApiResponse> RemoveScheduleAsync(int doctorId, int scheduleId, CancellationToken ct = default)
    {
        var s = await _db.DoctorSchedules.FirstOrDefaultAsync(x => x.Id == scheduleId && x.DoctorId == doctorId, ct);
        if (s == null) return ApiResponse.Fail("Schedule not found.", "NOT_FOUND");
        s.IsDeleted = true;
        s.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return ApiResponse.Ok("Schedule removed.");
    }

    public async Task<IReadOnlyList<TimeSlotDto>> GetAvailableSlotsAsync(int doctorId, DateTime date, int? clinicId, CancellationToken ct = default)
    {
        var dayOfWeek = (WeekDay)(int)date.DayOfWeek;
        var schedules = await _db.DoctorSchedules.AsNoTracking()
            .Where(s => s.DoctorId == doctorId
                && s.IsActive
                && s.DayOfWeek == dayOfWeek
                && (clinicId == null || s.ClinicId == null || s.ClinicId == clinicId))
            .ToListAsync(ct);

        if (schedules.Count == 0) return Array.Empty<TimeSlotDto>();

        // Time off blocks
        var dayStart = date.Date;
        var dayEnd = dayStart.AddDays(1);
        var timeOff = await _db.DoctorTimeOffs.AsNoTracking()
            .Where(t => t.DoctorId == doctorId && t.StartAt < dayEnd && t.EndAt > dayStart)
            .ToListAsync(ct);

        // Existing appointments that block slots
        var existing = await _db.Appointments.AsNoTracking()
            .Where(a => a.DoctorId == doctorId
                && a.ScheduledStart >= dayStart
                && a.ScheduledStart < dayEnd
                && a.Status != AppointmentStatus.Cancelled
                && a.Status != AppointmentStatus.NoShow)
            .Select(a => new { a.ScheduledStart, a.ScheduledEnd })
            .ToListAsync(ct);

        var slots = new List<TimeSlotDto>();
        foreach (var s in schedules)
        {
            var cursor = date.Date.Add(s.StartTime);
            var scheduleEnd = date.Date.Add(s.EndTime);
            var step = TimeSpan.FromMinutes(s.SlotDurationMinutes);

            while (cursor + step <= scheduleEnd)
            {
                var slotEnd = cursor + step;
                bool isAvailable = true;

                // Time off overlap?
                if (timeOff.Any(t => t.StartAt < slotEnd && t.EndAt > cursor))
                {
                    isAvailable = false;
                }

                // Already booked?
                if (isAvailable && existing.Any(a => a.ScheduledStart < slotEnd && a.ScheduledEnd > cursor))
                {
                    isAvailable = false;
                }

                // Past slot?
                if (cursor <= DateTime.UtcNow)
                {
                    isAvailable = false;
                }

                slots.Add(new TimeSlotDto { Start = cursor, End = slotEnd, IsAvailable = isAvailable });
                cursor = slotEnd;
            }
        }

        return slots;
    }

    public async Task<IReadOnlyList<ClinicDto>> GetClinicsAsync(int doctorId, CancellationToken ct = default)
    {
        return await _db.ClinicDoctors.AsNoTracking()
            .Where(cd => cd.DoctorId == doctorId && !cd.IsDeleted && cd.Clinic != null && cd.Clinic.IsActive)
            .Select(cd => new ClinicDto
            {
                Id = cd.Clinic!.Id,
                Name = cd.Clinic.Name,
                NameAr = cd.Clinic.NameAr,
                Description = cd.Clinic.Description,
                Address = cd.Clinic.Address,
                City = cd.Clinic.City,
                Governorate = cd.Clinic.Governorate,
                PhoneNumber = cd.Clinic.PhoneNumber,
                Email = cd.Clinic.Email,
                Website = cd.Clinic.Website,
                Latitude = cd.Clinic.Latitude,
                Longitude = cd.Clinic.Longitude,
                LogoUrl = cd.Clinic.LogoUrl,
                OpeningTime = cd.Clinic.OpeningTime == null ? null : cd.Clinic.OpeningTime.Value.ToString(@"hh\:mm"),
                ClosingTime = cd.Clinic.ClosingTime == null ? null : cd.Clinic.ClosingTime.Value.ToString(@"hh\:mm"),
                IsActive = cd.Clinic.IsActive,
                SpecialtyId = cd.Clinic.SpecialtyId,
                SpecialtyName = cd.Clinic.Specialty != null ? cd.Clinic.Specialty.Name : null,
                SpecialtyNameAr = cd.Clinic.Specialty != null ? cd.Clinic.Specialty.NameAr : null
            })
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<DoctorTimeOffDto>> GetTimeOffAsync(int doctorId, CancellationToken ct = default)
    {
        return await _db.DoctorTimeOffs.AsNoTracking()
            .Where(t => t.DoctorId == doctorId && t.EndAt >= DateTime.UtcNow)
            .OrderBy(t => t.StartAt)
            .Select(t => new DoctorTimeOffDto
            {
                Id = t.Id,
                DoctorId = t.DoctorId,
                StartAt = t.StartAt,
                EndAt = t.EndAt,
                Reason = t.Reason,
                IsFullDay = t.IsFullDay
            })
            .ToListAsync(ct);
    }

    public async Task<ApiResponse<DoctorTimeOffDto>> AddTimeOffAsync(int doctorId, CreateDoctorTimeOffRequest request, string currentUserId, CancellationToken ct = default)
    {
        var doctor = await _db.Doctors.Include(d => d.User).FirstOrDefaultAsync(d => d.Id == doctorId, ct);
        if (doctor == null) return ApiResponse<DoctorTimeOffDto>.Fail("Doctor not found.", "NOT_FOUND");

        if (doctor.UserId != currentUserId && !UserIsAdminOrStaff())
            return ApiResponse<DoctorTimeOffDto>.Fail("Forbidden.", "FORBIDDEN");

        var start = EnsureUtc(request.StartAt);
        var end = EnsureUtc(request.EndAt);
        if (end <= start)
            return ApiResponse<DoctorTimeOffDto>.Fail("End must be after start.", "INVALID_RANGE");

        var entity = new DoctorTimeOff
        {
            DoctorId = doctorId,
            StartAt = start,
            EndAt = end,
            Reason = request.Reason,
            IsFullDay = request.IsFullDay
        };
        _db.DoctorTimeOffs.Add(entity);
        await _db.SaveChangesAsync(ct);

        var dto = new DoctorTimeOffDto
        {
            Id = entity.Id,
            DoctorId = entity.DoctorId,
            StartAt = entity.StartAt,
            EndAt = entity.EndAt,
            Reason = entity.Reason,
            IsFullDay = entity.IsFullDay
        };
        return ApiResponse<DoctorTimeOffDto>.Ok(dto, "Time off added.");
    }

    public async Task<ApiResponse> RemoveTimeOffAsync(int doctorId, int timeOffId, string currentUserId, CancellationToken ct = default)
    {
        var entity = await _db.DoctorTimeOffs.FirstOrDefaultAsync(t => t.Id == timeOffId && t.DoctorId == doctorId, ct);
        if (entity == null) return ApiResponse.Fail("Time off not found.", "NOT_FOUND");

        var doctor = await _db.Doctors.FirstOrDefaultAsync(d => d.Id == doctorId, ct);
        if (doctor == null) return ApiResponse.Fail("Doctor not found.", "NOT_FOUND");
        if (doctor.UserId != currentUserId && !UserIsAdminOrStaff())
            return ApiResponse.Fail("Forbidden.", "FORBIDDEN");

        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return ApiResponse.Ok("Time off removed.");
    }

    public async Task<IReadOnlyList<DoctorPatientDto>> GetMyPatientsAsync(int doctorId, string? search, CancellationToken ct = default)
    {
        var query = _db.Appointments
            .AsNoTracking()
            .Where(a => a.DoctorId == doctorId && !a.IsDeleted)
            .Include(a => a.Patient)
                .ThenInclude(p => p!.User)
            .GroupBy(a => a.PatientId)
            .Select(g => new
            {
                PatientId = g.Key,
                Patient = g.First().Patient,
                TotalAppointments = g.Count(),
                CompletedAppointments = g.Count(a => a.Status == Domain.Enums.AppointmentStatus.Completed),
                LastVisitDate = g.Max(a => (DateTime?)a.ScheduledStart),
                LastVisitStatus = g.OrderByDescending(a => a.ScheduledStart).First().Status.ToString()
            });

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(x =>
                x.Patient!.User!.FirstName.ToLower().Contains(term) ||
                x.Patient.User.LastName.ToLower().Contains(term) ||
                x.Patient.User.Email!.ToLower().Contains(term) ||
                (x.Patient.MedicalRecordNumber != null && x.Patient.MedicalRecordNumber.ToLower().Contains(term)));
        }

        var result = await query
            .OrderByDescending(x => x.LastVisitDate)
            .ToListAsync(ct);

        return result.Select(x => new DoctorPatientDto
        {
            PatientId = x.PatientId,
            FullName = x.Patient?.User != null ? $"{x.Patient.User.FirstName} {x.Patient.User.LastName}" : string.Empty,
            Email = x.Patient?.User?.Email,
            PhoneNumber = x.Patient?.User?.PhoneNumber,
            MedicalRecordNumber = x.Patient?.MedicalRecordNumber,
            TotalAppointments = x.TotalAppointments,
            CompletedAppointments = x.CompletedAppointments,
            LastVisitDate = x.LastVisitDate,
            LastVisitStatus = x.LastVisitStatus
        }).ToList();
    }

    private bool UserIsAdminOrStaff()
    {
        var user = _http.HttpContext?.User;
        if (user == null) return false;
        return user.IsInRole("SystemAdmin") || user.IsInRole("ClinicAdmin") || user.IsInRole("ClinicStaff");
    }

    private static DateTime EnsureUtc(DateTime dt) => dt.Kind switch
    {
        DateTimeKind.Utc => dt,
        DateTimeKind.Local => dt.ToUniversalTime(),
        _ => DateTime.SpecifyKind(dt, DateTimeKind.Utc)
    };
}