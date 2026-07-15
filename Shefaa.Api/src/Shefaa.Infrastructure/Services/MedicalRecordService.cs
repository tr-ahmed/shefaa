using Microsoft.EntityFrameworkCore;
using Shefaa.Application.Common;
using Shefaa.Application.DTOs.MedicalRecords;
using Shefaa.Application.Interfaces;
using Shefaa.Domain.Appointments;
using Shefaa.Domain.Enums;
using Shefaa.Domain.MedicalRecords;
using Shefaa.Infrastructure.Persistence;

namespace Shefaa.Infrastructure.Services;

public class MedicalRecordService : IMedicalRecordService
{
    private readonly ShefaaDbContext _db;

    public MedicalRecordService(ShefaaDbContext db) => _db = db;

    public async Task<MedicalRecordDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return await _db.MedicalRecords.AsNoTracking()
            .Where(r => r.Id == id)
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
                Prescriptions = r.Prescriptions.Select(p => new PrescriptionDto
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
                Attachments = r.Attachments.Select(a => new AttachmentDto
                {
                    Id = a.Id,
                    FileName = a.FileName,
                    FileUrl = a.FileUrl,
                    ContentType = a.ContentType,
                    FileSize = a.FileSize,
                    Description = a.Description
                }).ToList()
            })
            .FirstOrDefaultAsync(ct);
    }

    public async Task<IReadOnlyList<MedicalRecordDto>> GetByDoctorIdAsync(int doctorId, CancellationToken ct = default)
    {
        return await _db.MedicalRecords.AsNoTracking()
            .Where(r => r.DoctorId == doctorId)
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
                Prescriptions = r.Prescriptions.Select(p => new PrescriptionDto
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
                Attachments = r.Attachments.Select(a => new AttachmentDto
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

    public async Task<ApiResponse<MedicalRecordDto>> CreateAsync(CreateMedicalRecordRequest request, string currentUserId, CancellationToken ct = default)
    {
        var appointment = await _db.Appointments
            .Include(a => a.Doctor)
            .FirstOrDefaultAsync(a => a.Id == request.AppointmentId, ct);
        if (appointment == null)
            return ApiResponse<MedicalRecordDto>.Fail("Appointment not found.", "NOT_FOUND");

        if (await _db.MedicalRecords.AnyAsync(r => r.AppointmentId == request.AppointmentId, ct))
            return ApiResponse<MedicalRecordDto>.Fail("A medical record already exists for this appointment.", "DUPLICATE");

        if (appointment.Doctor!.UserId != currentUserId)
            return ApiResponse<MedicalRecordDto>.Fail("Only the appointment's doctor can create the medical record.", "FORBIDDEN");

        var record = new MedicalRecord
        {
            AppointmentId = appointment.Id,
            PatientId = appointment.PatientId,
            DoctorId = appointment.DoctorId,
            ChiefComplaint = request.ChiefComplaint,
            Diagnosis = request.Diagnosis,
            Symptoms = request.Symptoms,
            TreatmentPlan = request.TreatmentPlan,
            Investigations = request.Investigations,
            Notes = request.Notes,
            FollowUpRequired = request.FollowUpRequired,
            FollowUpDate = request.FollowUpDate,
            RecordDate = DateTime.UtcNow,
            Prescriptions = request.Prescriptions.Select(p => new Prescription
            {
                MedicationName = p.MedicationName,
                Dosage = p.Dosage,
                Frequency = p.Frequency,
                Duration = p.Duration,
                Route = p.Route,
                Instructions = p.Instructions,
                Quantity = p.Quantity,
                RefillAllowed = p.RefillAllowed
            }).ToList()
        };
        _db.MedicalRecords.Add(record);

        // Mark appointment as completed if it isn't already
        if (appointment.Status != AppointmentStatus.Completed)
        {
            appointment.Status = AppointmentStatus.Completed;
            appointment.ActualEnd = DateTime.UtcNow;
            _db.AppointmentStatusHistories.Add(new AppointmentStatusHistory
            {
                AppointmentId = appointment.Id,
                FromStatus = appointment.Status,
                ToStatus = AppointmentStatus.Completed,
                ChangedBy = currentUserId,
                Notes = "Completed with medical record."
            });
        }

        await _db.SaveChangesAsync(ct);

        var dto = await GetByIdAsync(record.Id, ct);
        return ApiResponse<MedicalRecordDto>.Ok(dto!, "Medical record created.");
    }

    public async Task<ApiResponse<MedicalRecordDto>> UpdateAsync(int id, UpdateMedicalRecordRequest request, CancellationToken ct = default)
    {
        var entity = await _db.MedicalRecords.FirstOrDefaultAsync(r => r.Id == id, ct);
        if (entity == null) return ApiResponse<MedicalRecordDto>.Fail("Medical record not found.", "NOT_FOUND");

        entity.ChiefComplaint = request.ChiefComplaint;
        entity.Diagnosis = request.Diagnosis;
        entity.Symptoms = request.Symptoms;
        entity.TreatmentPlan = request.TreatmentPlan;
        entity.Investigations = request.Investigations;
        entity.Notes = request.Notes;
        entity.FollowUpRequired = request.FollowUpRequired;
        entity.FollowUpDate = request.FollowUpDate;
        entity.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        var dto = await GetByIdAsync(id, ct);
        return ApiResponse<MedicalRecordDto>.Ok(dto!, "Medical record updated.");
    }
}