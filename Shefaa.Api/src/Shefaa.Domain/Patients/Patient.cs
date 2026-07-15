using Shefaa.Domain.Common;
using Shefaa.Domain.Enums;
using Shefaa.Domain.Identity;

namespace Shefaa.Domain.Patients;

/// <summary>
/// Patient profile linked 1:1 to an <see cref="ApplicationUser"/>.
/// </summary>
public class Patient : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser? User { get; set; }

    public string? MedicalRecordNumber { get; set; }

    public BloodType BloodType { get; set; } = BloodType.Unknown;

    public string? Allergies { get; set; }

    public string? ChronicDiseases { get; set; }

    public string? CurrentMedications { get; set; }

    public string? EmergencyContactName { get; set; }

    public string? EmergencyContactPhone { get; set; }

    public string? InsuranceProvider { get; set; }

    public string? InsurancePolicyNumber { get; set; }

    public DateTime? RegistrationDate { get; set; } = DateTime.UtcNow;

    public string? Notes { get; set; }

    // Navigation
    public ICollection<Appointments.Appointment> Appointments { get; set; } = new List<Appointments.Appointment>();
    public ICollection<MedicalRecords.MedicalRecord> MedicalRecords { get; set; } = new List<MedicalRecords.MedicalRecord>();
}