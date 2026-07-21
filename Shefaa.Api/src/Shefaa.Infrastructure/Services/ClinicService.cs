using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Shefaa.Application.Common;
using Shefaa.Application.DTOs.Clinics;
using Shefaa.Application.Interfaces;
using Shefaa.Domain.Clinics;
using Shefaa.Domain.Enums;
using Shefaa.Domain.Identity;
using Shefaa.Infrastructure.Persistence;

namespace Shefaa.Infrastructure.Services;

public class ClinicService : IClinicService
{
    private readonly ShefaaDbContext _db;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;

    public ClinicService(
        ShefaaDbContext db,
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager)
    {
        _db = db;
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task<PagedResult<ClinicDto>> GetPagedAsync(int page, int pageSize, string? search, bool activeOnly, string? city, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        var query = _db.Clinics.AsNoTracking().AsQueryable();
        if (activeOnly) query = query.Where(c => c.IsActive);
        if (!string.IsNullOrWhiteSpace(city)) query = query.Where(c => c.City == city);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(c => c.Name.ToLower().Contains(term)
                || (c.NameAr != null && c.NameAr.ToLower().Contains(term))
                || (c.Address != null && c.Address.ToLower().Contains(term)));
        }

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderBy(c => c.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new ClinicDto
            {
                Id = c.Id,
                Name = c.Name,
                NameAr = c.NameAr,
                Description = c.Description,
                Address = c.Address,
                City = c.City,
                Governorate = c.Governorate,
                PhoneNumber = c.PhoneNumber,
                Email = c.Email,
                Website = c.Website,
                Latitude = c.Latitude,
                Longitude = c.Longitude,
                LogoUrl = c.LogoUrl,
                OpeningTime = c.OpeningTime == null ? null : c.OpeningTime.Value.ToString(@"hh\:mm"),
                ClosingTime = c.ClosingTime == null ? null : c.ClosingTime.Value.ToString(@"hh\:mm"),
                IsActive = c.IsActive,
                DoctorsCount = c.ClinicDoctors.Count(cd => !cd.IsDeleted),
                SpecialtyId = c.SpecialtyId,
                SpecialtyName = c.Specialty != null ? c.Specialty.Name : null,
                SpecialtyNameAr = c.Specialty != null ? c.Specialty.NameAr : null
            })
            .ToListAsync(ct);

        return new PagedResult<ClinicDto> { Items = items, TotalCount = total, Page = page, PageSize = pageSize };
    }

    public async Task<ClinicDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return await _db.Clinics.AsNoTracking()
            .Where(c => c.Id == id)
            .Select(c => new ClinicDto
            {
                Id = c.Id,
                Name = c.Name,
                NameAr = c.NameAr,
                Description = c.Description,
                Address = c.Address,
                City = c.City,
                Governorate = c.Governorate,
                PhoneNumber = c.PhoneNumber,
                Email = c.Email,
                Website = c.Website,
                Latitude = c.Latitude,
                Longitude = c.Longitude,
                LogoUrl = c.LogoUrl,
                OpeningTime = c.OpeningTime == null ? null : c.OpeningTime.Value.ToString(@"hh\:mm"),
                ClosingTime = c.ClosingTime == null ? null : c.ClosingTime.Value.ToString(@"hh\:mm"),
                IsActive = c.IsActive,
                DoctorsCount = c.ClinicDoctors.Count(cd => !cd.IsDeleted),
                SpecialtyId = c.SpecialtyId,
                SpecialtyName = c.Specialty != null ? c.Specialty.Name : null,
                SpecialtyNameAr = c.Specialty != null ? c.Specialty.NameAr : null
            })
            .FirstOrDefaultAsync(ct);
    }

    public async Task<IReadOnlyList<ClinicDto>> GetByOwnerUserIdAsync(string userId, CancellationToken ct = default)
    {
        return await _db.Clinics.AsNoTracking()
            .Where(c => c.OwnerUserId == userId && !c.IsDeleted)
            .OrderBy(c => c.Name)
            .Select(c => new ClinicDto
            {
                Id = c.Id,
                Name = c.Name,
                NameAr = c.NameAr,
                Description = c.Description,
                Address = c.Address,
                City = c.City,
                Governorate = c.Governorate,
                PhoneNumber = c.PhoneNumber,
                Email = c.Email,
                Website = c.Website,
                Latitude = c.Latitude,
                Longitude = c.Longitude,
                LogoUrl = c.LogoUrl,
                OpeningTime = c.OpeningTime == null ? null : c.OpeningTime.Value.ToString(@"hh\:mm"),
                ClosingTime = c.ClosingTime == null ? null : c.ClosingTime.Value.ToString(@"hh\:mm"),
                IsActive = c.IsActive,
                DoctorsCount = c.ClinicDoctors.Count(cd => !cd.IsDeleted),
                SpecialtyId = c.SpecialtyId,
                SpecialtyName = c.Specialty != null ? c.Specialty.Name : null,
                SpecialtyNameAr = c.Specialty != null ? c.Specialty.NameAr : null
            })
            .ToListAsync(ct);
    }

    public async Task<ApiResponse<ClinicDto>> CreateAsync(CreateClinicRequest request, string currentUserId, CancellationToken ct = default)
    {
        var entity = new Clinic
        {
            Name = request.Name.Trim(),
            NameAr = request.NameAr?.Trim(),
            Description = request.Description,
            Address = request.Address?.Trim(),
            City = request.City,
            Governorate = request.Governorate,
            PhoneNumber = request.PhoneNumber,
            Email = request.Email,
            Website = request.Website,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            LogoUrl = request.LogoUrl,
            SpecialtyId = request.SpecialtyId,
            IsActive = true,
            OwnerUserId = currentUserId
        };
        _db.Clinics.Add(entity);
        await _db.SaveChangesAsync(ct);

        var dto = await GetByIdAsync(entity.Id, ct);
        return ApiResponse<ClinicDto>.Ok(dto!, "Clinic created.");
    }

    public async Task<IReadOnlyList<ClinicStaffDto>> GetClinicStaffAsync(int clinicId, string currentUserId, CancellationToken ct = default)
    {
        if (!await IsOwnerOrAdminAsync(clinicId, currentUserId, ct))
            return Array.Empty<ClinicStaffDto>();

        return await _db.ClinicStaff.AsNoTracking()
            .Where(s => s.ClinicId == clinicId && !s.IsDeleted)
            .Select(s => new ClinicStaffDto
            {
                Id = s.Id,
                UserId = s.UserId,
                FullName = s.User!.FirstName + " " + s.User.LastName,
                Email = s.User.Email ?? string.Empty,
                PhoneNumber = s.User.PhoneNumber,
                ClinicId = s.ClinicId,
                ClinicName = s.Clinic!.Name,
                Position = s.Position,
                Role = s.Role,
                IsActive = s.IsActive
            })
            .OrderBy(s => s.FullName)
            .ToListAsync(ct);
    }

    public async Task<ApiResponse<ClinicStaffDto>> AddStaffAsync(int clinicId, CreateClinicStaffRequest request, string currentUserId, CancellationToken ct = default)
    {
        var clinic = await _db.Clinics.FirstOrDefaultAsync(c => c.Id == clinicId && !c.IsDeleted, ct);
        if (clinic == null) return ApiResponse<ClinicStaffDto>.Fail("Clinic not found.", "CLINIC_NOT_FOUND");

        if (!await IsOwnerOrAdminAsync(clinicId, currentUserId, ct))
            return ApiResponse<ClinicStaffDto>.Fail("Access denied.", "FORBIDDEN");

        if (!await _roleManager.RoleExistsAsync("ClinicStaff"))
            return ApiResponse<ClinicStaffDto>.Fail("ClinicStaff role is not configured.", "ROLE_NOT_FOUND");

        if (await _userManager.FindByEmailAsync(request.Email) != null)
            return ApiResponse<ClinicStaffDto>.Fail("Email already registered.", "EMAIL_TAKEN");

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            PhoneNumber = request.PhoneNumber,
            Gender = request.Gender,
            DateOfBirth = request.DateOfBirth,
            UserType = UserType.ClinicStaff,
            EmailConfirmed = true,
            IsActive = request.IsActive,
            CreatedBy = currentUserId
        };

        var userResult = await _userManager.CreateAsync(user, request.Password);
        if (!userResult.Succeeded)
            return ApiResponse<ClinicStaffDto>.Fail("User creation failed.", userResult.Errors.Select(e => e.Description).ToArray());

        await _userManager.AddToRoleAsync(user, "ClinicStaff");

        var entity = new ClinicStaff
        {
            UserId = user.Id,
            ClinicId = clinicId,
            Position = request.Position.Trim(),
            Role = request.Role,
            IsActive = request.IsActive,
            CreatedBy = currentUserId
        };
        _db.ClinicStaff.Add(entity);
        await _db.SaveChangesAsync(ct);

        var dto = await _db.ClinicStaff.AsNoTracking()
            .Where(s => s.Id == entity.Id)
            .Select(s => new ClinicStaffDto
            {
                Id = s.Id,
                UserId = s.UserId,
                FullName = s.User!.FirstName + " " + s.User.LastName,
                Email = s.User.Email ?? string.Empty,
                PhoneNumber = s.User.PhoneNumber,
                ClinicId = s.ClinicId,
                ClinicName = s.Clinic!.Name,
                Position = s.Position,
                Role = s.Role,
                IsActive = s.IsActive
            })
            .FirstAsync(ct);

        return ApiResponse<ClinicStaffDto>.Ok(dto, "Clinic staff created.");
    }

    public async Task<ApiResponse> RemoveStaffAsync(int clinicId, int staffId, string currentUserId, CancellationToken ct = default)
    {
        if (!await IsOwnerOrAdminAsync(clinicId, currentUserId, ct))
            return ApiResponse.Fail("Access denied.", "FORBIDDEN");

        var entity = await _db.ClinicStaff.FirstOrDefaultAsync(x => x.Id == staffId && x.ClinicId == clinicId, ct);
        if (entity == null) return ApiResponse.Fail("Clinic staff not found.", "NOT_FOUND");
        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return ApiResponse.Ok("Clinic staff removed.");
    }

    private async Task<bool> IsOwnerOrAdminAsync(int clinicId, string userId, CancellationToken ct = default)
    {
        var clinic = await _db.Clinics.AsNoTracking()
            .Select(c => new { c.Id, c.OwnerUserId })
            .FirstOrDefaultAsync(c => c.Id == clinicId, ct);
        if (clinic == null) return false;
        if (clinic.OwnerUserId == userId) return true;
        var user = await _db.Users.FindAsync(new object?[] { userId }, ct);
        if (user == null) return false;
        return await _userManager.IsInRoleAsync(user, "SystemAdmin");
    }

    public async Task<ApiResponse<ClinicDto>> UpdateAsync(int id, UpdateClinicRequest request, string currentUserId, CancellationToken ct = default)
    {
        var entity = await _db.Clinics.FirstOrDefaultAsync(c => c.Id == id, ct);
        if (entity == null) return ApiResponse<ClinicDto>.Fail("Clinic not found.", "NOT_FOUND");

        if (!await IsOwnerOrAdminAsync(id, currentUserId, ct))
            return ApiResponse<ClinicDto>.Fail("Access denied.", "FORBIDDEN");

        entity.Name = request.Name.Trim();
        entity.NameAr = request.NameAr?.Trim();
        entity.Description = request.Description;
        entity.Address = request.Address?.Trim();
        entity.City = request.City;
        entity.Governorate = request.Governorate;
        entity.PhoneNumber = request.PhoneNumber;
        entity.Email = request.Email;
        entity.Website = request.Website;
        entity.Latitude = request.Latitude;
        entity.Longitude = request.Longitude;
        entity.LogoUrl = request.LogoUrl;
        entity.SpecialtyId = request.SpecialtyId;
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        var dto = await GetByIdAsync(id, ct);
        return ApiResponse<ClinicDto>.Ok(dto!, "Clinic updated.");
    }

    public async Task<ApiResponse> DeleteAsync(int id, string currentUserId, CancellationToken ct = default)
    {
        var entity = await _db.Clinics.FirstOrDefaultAsync(c => c.Id == id, ct);
        if (entity == null) return ApiResponse.Fail("Clinic not found.", "NOT_FOUND");

        if (!await IsOwnerOrAdminAsync(id, currentUserId, ct))
            return ApiResponse.Fail("Access denied.", "FORBIDDEN");
        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return ApiResponse.Ok("Clinic deleted.");
    }

    public async Task<IReadOnlyList<ClinicDoctorDto>> GetClinicDoctorsAsync(int clinicId, CancellationToken ct = default)
    {
        return await _db.ClinicDoctors.AsNoTracking()
            .Where(cd => cd.ClinicId == clinicId && !cd.Doctor.IsDeleted)
            .Select(cd => new ClinicDoctorDto
            {
                Id = cd.Id,
                DoctorId = cd.DoctorId,
                DoctorName = cd.Doctor!.User!.FirstName + " " + cd.Doctor.User.LastName,
                SpecialtyName = cd.Doctor.Specialty!.Name,
                ConsultationFee = cd.ConsultationFee,
                IsPrimary = cd.IsPrimary
            })
            .ToListAsync(ct);
    }

    public async Task<ApiResponse<ClinicDoctorDto>> AddDoctorAsync(int clinicId, AddDoctorToClinicRequest request, string currentUserId, CancellationToken ct = default)
    {
        if (!await IsOwnerOrAdminAsync(clinicId, currentUserId, ct))
            return ApiResponse<ClinicDoctorDto>.Fail("Access denied.", "FORBIDDEN");
        var clinic = await _db.Clinics.AnyAsync(c => c.Id == clinicId, ct);
        if (!clinic) return ApiResponse<ClinicDoctorDto>.Fail("Clinic not found.", "CLINIC_NOT_FOUND");

        var doctor = await _db.Doctors.AnyAsync(d => d.Id == request.DoctorId, ct);
        if (!doctor) return ApiResponse<ClinicDoctorDto>.Fail("Doctor not found.", "DOCTOR_NOT_FOUND");

        var existing = await _db.ClinicDoctors.FirstOrDefaultAsync(cd => cd.ClinicId == clinicId && cd.DoctorId == request.DoctorId, ct);
        if (existing != null)
        {
            existing.ConsultationFee = request.ConsultationFee ?? existing.ConsultationFee;
            existing.IsPrimary = request.IsPrimary;
            existing.IsDeleted = false;
        }
        else
        {
            existing = new ClinicDoctor
            {
                ClinicId = clinicId,
                DoctorId = request.DoctorId,
                ConsultationFee = request.ConsultationFee,
                IsPrimary = request.IsPrimary
            };
            _db.ClinicDoctors.Add(existing);
        }
        await _db.SaveChangesAsync(ct);

        var dto = await _db.ClinicDoctors.AsNoTracking()
            .Where(cd => cd.Id == existing.Id)
            .Select(cd => new ClinicDoctorDto
            {
                Id = cd.Id,
                DoctorId = cd.DoctorId,
                DoctorName = cd.Doctor!.User!.FirstName + " " + cd.Doctor.User.LastName,
                SpecialtyName = cd.Doctor.Specialty!.Name,
                ConsultationFee = cd.ConsultationFee,
                IsPrimary = cd.IsPrimary
            })
            .FirstAsync(ct);
        return ApiResponse<ClinicDoctorDto>.Ok(dto, "Doctor added to clinic.");
    }

    public async Task<ApiResponse> RemoveDoctorAsync(int clinicId, int doctorId, string currentUserId, CancellationToken ct = default)
    {
        if (!await IsOwnerOrAdminAsync(clinicId, currentUserId, ct))
            return ApiResponse.Fail("Access denied.", "FORBIDDEN");
        var cd = await _db.ClinicDoctors.FirstOrDefaultAsync(x => x.ClinicId == clinicId && x.DoctorId == doctorId, ct);
        if (cd == null) return ApiResponse.Fail("Doctor not linked to this clinic.", "NOT_FOUND");
        cd.IsDeleted = true;
        cd.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return ApiResponse.Ok("Doctor removed from clinic.");
    }
}