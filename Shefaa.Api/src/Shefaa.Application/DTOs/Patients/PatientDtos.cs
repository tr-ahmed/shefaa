using System.ComponentModel.DataAnnotations;
using Shefaa.Domain.Enums;

namespace Shefaa.Application.DTOs.Patients;

public class PatientDto
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? MedicalRecordNumber { get; set; }
    public BloodType BloodType { get; set; }
    public string? Allergies { get; set; }
    public string? ChronicDiseases { get; set; }
    public string? CurrentMedications { get; set; }
    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactPhone { get; set; }
    public string? InsuranceProvider { get; set; }
    public string? InsurancePolicyNumber { get; set; }
    public DateTime? RegistrationDate { get; set; }
    public int Age { get; set; }
    public Gender Gender { get; set; }
}

public class CreatePatientRequest
{
    // Identity
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(8)]
    public string Password { get; set; } = string.Empty;

    [Required]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    public string LastName { get; set; } = string.Empty;

    [Phone]
    public string? PhoneNumber { get; set; }

    public Gender Gender { get; set; } = Gender.Male;
    public DateTime? DateOfBirth { get; set; }

    // Profile
    public BloodType BloodType { get; set; } = BloodType.Unknown;

    [MaxLength(2000)]
    public string? Allergies { get; set; }

    [MaxLength(2000)]
    public string? ChronicDiseases { get; set; }

    [MaxLength(2000)]
    public string? CurrentMedications { get; set; }

    [MaxLength(150)]
    public string? EmergencyContactName { get; set; }

    [MaxLength(30)]
    public string? EmergencyContactPhone { get; set; }

    [MaxLength(200)]
    public string? InsuranceProvider { get; set; }

    [MaxLength(100)]
    public string? InsurancePolicyNumber { get; set; }
}

public class UpdatePatientRequest
{
    public BloodType BloodType { get; set; } = BloodType.Unknown;

    [MaxLength(2000)]
    public string? Allergies { get; set; }

    [MaxLength(2000)]
    public string? ChronicDiseases { get; set; }

    [MaxLength(2000)]
    public string? CurrentMedications { get; set; }

    [MaxLength(150)]
    public string? EmergencyContactName { get; set; }

    [MaxLength(30)]
    public string? EmergencyContactPhone { get; set; }

    [MaxLength(200)]
    public string? InsuranceProvider { get; set; }

    [MaxLength(100)]
    public string? InsurancePolicyNumber { get; set; }

    [MaxLength(2000)]
    public string? Notes { get; set; }
}