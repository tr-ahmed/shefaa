using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Shefaa.Application.Common;
using Shefaa.Application.DTOs.MedicalRecords;
using Shefaa.Application.DTOs.Patients;
using Shefaa.Application.Interfaces;
using Shefaa.Domain.Enums;
using Shefaa.Domain.Identity;
using Shefaa.Domain.Patients;
using Shefaa.Infrastructure.Persistence;

namespace Shefaa.Infrastructure.Services;

public class PatientService : IPatientService
{
    private readonly ShefaaDbContext _db;
    private readonly UserManager<ApplicationUser> _userManager;

    public PatientService(ShefaaDbContext db, UserManager<ApplicationUser> userManager)
    {
        _db = db;
        _userManager = userManager;
    }

    public async Task<PatientDto?> GetByIdAsync(int id, CancellationToken ct = default)
        => await BuildPatientDtoAsync(_db.Patients.Where(p => p.Id == id), ct);

    public async Task<PatientDto?> GetByUserIdAsync(string userId, CancellationToken ct = default)
        => await BuildPatientDtoAsync(_db.Patients.Where(p => p.UserId == userId), ct);

    private async Task<PatientDto?> BuildPatientDtoAsync(IQueryable<Patient> query, CancellationToken ct)
    {
        return await query.AsNoTracking()
            .Select(p => new PatientDto
            {
                Id = p.Id,
                UserId = p.UserId,
                FullName = p.User!.FirstName + " " + p.User.LastName,
                Email = p.User.Email ?? "",
                PhoneNumber = p.User.PhoneNumber,
                MedicalRecordNumber = p.MedicalRecordNumber,
                BloodType = p.BloodType,
                Allergies = p.Allergies,
                ChronicDiseases = p.ChronicDiseases,
                CurrentMedications = p.CurrentMedications,
                EmergencyContactName = p.EmergencyContactName,
                EmergencyContactPhone = p.EmergencyContactPhone,
                InsuranceProvider = p.InsuranceProvider,
                InsurancePolicyNumber = p.InsurancePolicyNumber,
                RegistrationDate = p.RegistrationDate,
                Age = p.User.DateOfBirth == null ? 0 : (int)((DateTime.UtcNow - p.User.DateOfBirth.Value).TotalDays / 365.25),
                Gender = p.User.Gender
            })
            .FirstOrDefaultAsync(ct);
    }

    public async Task<ApiResponse<PatientDto>> CreateAsync(CreatePatientRequest request, string currentUserId, CancellationToken ct = default)
    {
        if (await _userManager.FindByEmailAsync(request.Email) != null)
            return ApiResponse<PatientDto>.Fail("Email already registered.", "EMAIL_TAKEN");

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            PhoneNumber = request.PhoneNumber,
            Gender = request.Gender,
            DateOfBirth = request.DateOfBirth,
            UserType = UserType.Patient,
            EmailConfirmed = true
        };
        var createResult = await _userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
            return ApiResponse<PatientDto>.Fail("User creation failed.", createResult.Errors.Select(e => e.Description).ToArray());

        await _userManager.AddToRoleAsync(user, "Patient");

        var patient = new Patient
        {
            UserId = user.Id,
            BloodType = request.BloodType,
            Allergies = request.Allergies,
            ChronicDiseases = request.ChronicDiseases,
            CurrentMedications = request.CurrentMedications,
            EmergencyContactName = request.EmergencyContactName,
            EmergencyContactPhone = request.EmergencyContactPhone,
            InsuranceProvider = request.InsuranceProvider,
            InsurancePolicyNumber = request.InsurancePolicyNumber,
            RegistrationDate = DateTime.UtcNow,
            MedicalRecordNumber = $"MRN-{DateTime.UtcNow:yyyyMMdd}-{user.Id[..6].ToUpperInvariant()}"
        };
        _db.Patients.Add(patient);
        await _db.SaveChangesAsync(ct);

        var dto = await GetByIdAsync(patient.Id, ct);
        return ApiResponse<PatientDto>.Ok(dto!, "Patient created.");
    }

    public async Task<ApiResponse<PatientDto>> UpdateAsync(int id, UpdatePatientRequest request, CancellationToken ct = default)
    {
        var entity = await _db.Patients.FirstOrDefaultAsync(p => p.Id == id, ct);
        if (entity == null) return ApiResponse<PatientDto>.Fail("Patient not found.", "NOT_FOUND");

        entity.BloodType = request.BloodType;
        entity.Allergies = request.Allergies;
        entity.ChronicDiseases = request.ChronicDiseases;
        entity.CurrentMedications = request.CurrentMedications;
        entity.EmergencyContactName = request.EmergencyContactName;
        entity.EmergencyContactPhone = request.EmergencyContactPhone;
        entity.InsuranceProvider = request.InsuranceProvider;
        entity.InsurancePolicyNumber = request.InsurancePolicyNumber;
        entity.Notes = request.Notes;
        entity.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        var dto = await GetByIdAsync(id, ct);
        return ApiResponse<PatientDto>.Ok(dto!, "Patient updated.");
    }

    public async Task<IReadOnlyList<MedicalRecordDto>> GetMedicalRecordsAsync(int patientId, CancellationToken ct = default)
    {
        return await _db.MedicalRecords.AsNoTracking()
            .Where(r => r.PatientId == patientId)
            .OrderByDescending(r => r.RecordDate)
            .Select(r => new MedicalRecordDto
            {
                Id = r.Id,
                AppointmentId = r.AppointmentId,
                PatientId = r.PatientId,
                PatientName = r.Patient!.User!.FirstName + " " + r.Patient.User.LastName,
                DoctorId = r.DoctorId,
                DoctorName = r.Doctor!.User!.FirstName + " " + r.Doctor.User.LastName,
                ChiefComplaint = r.ChiefComplaint,
                Diagnosis = r.Diagnosis,
                Symptoms = r.Symptoms,
                TreatmentPlan = r.TreatmentPlan,
                Investigations = r.Investigations,
                Notes = r.Notes,
                RecordDate = r.RecordDate,
                FollowUpRequired = r.FollowUpRequired,
                FollowUpDate = r.FollowUpDate,
                Prescriptions = r.Prescriptions
                    .Select(p => new PrescriptionDto
                    {
                        Id = p.Id,
                        MedicationName = p.MedicationName,
                        Dosage = p.Dosage,
                        Frequency = p.Frequency,
                        Duration = p.Duration,
                        Route = p.Route,
                        Instructions = p.Instructions,
                        Quantity = p.Quantity,
                        RefillAllowed = p.RefillAllowed
                    }).ToList(),
                Attachments = r.Attachments
                    .Select(a => new AttachmentDto
                    {
                        Id = a.Id,
                        FileName = a.FileName,
                        FileUrl = a.FileUrl,
                        ContentType = a.ContentType,
                        FileSize = a.FileSize,
                        Description = a.Description
                    }).ToList()
            })
            .ToListAsync(ct);
    }

    public async Task<PagedResult<PatientDto>> SearchAsync(string? search, int page, int pageSize, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _db.Patients.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(p =>
                (p.User!.FirstName + " " + p.User.LastName).ToLower().Contains(term) ||
                (p.User.Email != null && p.User.Email.ToLower().Contains(term)) ||
                (p.MedicalRecordNumber != null && p.MedicalRecordNumber.ToLower().Contains(term)) ||
                (p.User.PhoneNumber != null && p.User.PhoneNumber.Contains(term)));
        }

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(p => p.RegistrationDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new PatientDto
            {
                Id = p.Id,
                UserId = p.UserId,
                FullName = p.User!.FirstName + " " + p.User.LastName,
                Email = p.User.Email ?? "",
                PhoneNumber = p.User.PhoneNumber,
                MedicalRecordNumber = p.MedicalRecordNumber,
                BloodType = p.BloodType,
                Allergies = p.Allergies,
                ChronicDiseases = p.ChronicDiseases,
                CurrentMedications = p.CurrentMedications,
                EmergencyContactName = p.EmergencyContactName,
                EmergencyContactPhone = p.EmergencyContactPhone,
                InsuranceProvider = p.InsuranceProvider,
                InsurancePolicyNumber = p.InsurancePolicyNumber,
                RegistrationDate = p.RegistrationDate,
                Age = p.User.DateOfBirth == null ? 0 : (int)((DateTime.UtcNow - p.User.DateOfBirth.Value).TotalDays / 365.25),
                Gender = p.User.Gender
            })
            .ToListAsync(ct);

        return new PagedResult<PatientDto> { Items = items, TotalCount = total, Page = page, PageSize = pageSize };
    }
}