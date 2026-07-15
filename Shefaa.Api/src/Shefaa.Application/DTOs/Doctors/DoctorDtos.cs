using System.ComponentModel.DataAnnotations;
using Shefaa.Domain.Enums;

namespace Shefaa.Application.DTOs.Doctors;

public class DoctorDto
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? ProfileImageUrl { get; set; }
    public int SpecialtyId { get; set; }
    public string SpecialtyName { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty;
    public int YearsOfExperience { get; set; }
    public string? Biography { get; set; }
    public string? Education { get; set; }
    public decimal? DefaultConsultationFee { get; set; }
    public int? DefaultAppointmentDurationMinutes { get; set; }
    public decimal? Rating { get; set; }
    public int TotalReviews { get; set; }
    public bool IsAvailableForBooking { get; set; }
    public bool IsActive { get; set; }
}

public class CreateDoctorRequest
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
    [Required]
    public int SpecialtyId { get; set; }

    [Required, MaxLength(100)]
    public string LicenseNumber { get; set; } = string.Empty;

    public int YearsOfExperience { get; set; }

    [MaxLength(2000)]
    public string? Biography { get; set; }

    [MaxLength(1000)]
    public string? Education { get; set; }

    public decimal? DefaultConsultationFee { get; set; }

    [Range(5, 240)]
    public int DefaultAppointmentDurationMinutes { get; set; } = 30;
}

public class UpdateDoctorRequest
{
    [Required]
    public int SpecialtyId { get; set; }

    [Required, MaxLength(100)]
    public string LicenseNumber { get; set; } = string.Empty;

    public int YearsOfExperience { get; set; }

    [MaxLength(2000)]
    public string? Biography { get; set; }

    [MaxLength(1000)]
    public string? Education { get; set; }

    public decimal? DefaultConsultationFee { get; set; }

    [Range(5, 240)]
    public int DefaultAppointmentDurationMinutes { get; set; } = 30;

    public bool IsAvailableForBooking { get; set; } = true;
    public bool IsActive { get; set; } = true;
}

public class TimeSlotDto
{
    public DateTime Start { get; set; }
    public DateTime End { get; set; }
    public bool IsAvailable { get; set; }
}

public class DoctorPatientDto
{
    public int PatientId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? MedicalRecordNumber { get; set; }
    public int TotalAppointments { get; set; }
    public int CompletedAppointments { get; set; }
    public DateTime? LastVisitDate { get; set; }
    public string? LastVisitStatus { get; set; }
}