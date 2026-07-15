using System.ComponentModel.DataAnnotations;

namespace Shefaa.Application.DTOs.MedicalRecords;

public class PrescriptionDto
{
    public int Id { get; set; }
    public string MedicationName { get; set; } = string.Empty;
    public string? Dosage { get; set; }
    public string? Frequency { get; set; }
    public string? Duration { get; set; }
    public string? Route { get; set; }
    public string? Instructions { get; set; }
    public int? Quantity { get; set; }
    public bool RefillAllowed { get; set; }
}

public class AttachmentDto
{
    public int Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string? Description { get; set; }
}

public class MedicalRecordDto
{
    public int Id { get; set; }
    public int AppointmentId { get; set; }
    public int PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public int DoctorId { get; set; }
    public string DoctorName { get; set; } = string.Empty;

    public string? ChiefComplaint { get; set; }
    public string? Diagnosis { get; set; }
    public string? Symptoms { get; set; }
    public string? TreatmentPlan { get; set; }
    public string? Investigations { get; set; }
    public string? Notes { get; set; }

    public DateTime RecordDate { get; set; }
    public bool FollowUpRequired { get; set; }
    public DateTime? FollowUpDate { get; set; }

    public IReadOnlyList<PrescriptionDto> Prescriptions { get; set; } = Array.Empty<PrescriptionDto>();
    public IReadOnlyList<AttachmentDto> Attachments { get; set; } = Array.Empty<AttachmentDto>();
}

public class CreatePrescriptionRequest
{
    [Required, MaxLength(200)]
    public string MedicationName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Dosage { get; set; }

    [MaxLength(100)]
    public string? Frequency { get; set; }

    [MaxLength(100)]
    public string? Duration { get; set; }

    [MaxLength(50)]
    public string? Route { get; set; }

    [MaxLength(1000)]
    public string? Instructions { get; set; }

    public int? Quantity { get; set; }
    public bool RefillAllowed { get; set; }
}

public class CreateMedicalRecordRequest
{
    [Required]
    public int AppointmentId { get; set; }

    [MaxLength(1000)]
    public string? ChiefComplaint { get; set; }

    [MaxLength(2000)]
    public string? Diagnosis { get; set; }

    [MaxLength(2000)]
    public string? Symptoms { get; set; }

    [MaxLength(4000)]
    public string? TreatmentPlan { get; set; }

    [MaxLength(2000)]
    public string? Investigations { get; set; }

    [MaxLength(4000)]
    public string? Notes { get; set; }

    public bool FollowUpRequired { get; set; }
    public DateTime? FollowUpDate { get; set; }

    public List<CreatePrescriptionRequest> Prescriptions { get; set; } = new();
}

public class UpdateMedicalRecordRequest
{
    [MaxLength(1000)]
    public string? ChiefComplaint { get; set; }

    [MaxLength(2000)]
    public string? Diagnosis { get; set; }

    [MaxLength(2000)]
    public string? Symptoms { get; set; }

    [MaxLength(4000)]
    public string? TreatmentPlan { get; set; }

    [MaxLength(2000)]
    public string? Investigations { get; set; }

    [MaxLength(4000)]
    public string? Notes { get; set; }

    public bool FollowUpRequired { get; set; }
    public DateTime? FollowUpDate { get; set; }
}