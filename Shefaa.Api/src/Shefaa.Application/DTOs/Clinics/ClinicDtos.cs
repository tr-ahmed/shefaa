using System.ComponentModel.DataAnnotations;
using Shefaa.Domain.Clinics;
using Shefaa.Domain.Enums;

namespace Shefaa.Application.DTOs.Clinics;

public class ClinicDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? NameAr { get; set; }
    public string? Description { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Governorate { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? LogoUrl { get; set; }
    public string? OpeningTime { get; set; }
    public string? ClosingTime { get; set; }
    public bool IsActive { get; set; }
    public int DoctorsCount { get; set; }
    public int? SpecialtyId { get; set; }
    public string? SpecialtyName { get; set; }
    public string? SpecialtyNameAr { get; set; }
}

public class CreateClinicRequest
{
    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? NameAr { get; set; }

    [MaxLength(2000)]
    public string? Description { get; set; }

    [MaxLength(500)]
    public string? Address { get; set; }

    [MaxLength(100)]
    public string? City { get; set; }

    [MaxLength(100)]
    public string? Governorate { get; set; }

    [MaxLength(30)]
    public string? PhoneNumber { get; set; }

    [EmailAddress, MaxLength(200)]
    public string? Email { get; set; }

    [MaxLength(300)]
    public string? Website { get; set; }

    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    [MaxLength(500)]
    public string? LogoUrl { get; set; }

    public int? SpecialtyId { get; set; }
}

public class UpdateClinicRequest
{
    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? NameAr { get; set; }

    [MaxLength(2000)]
    public string? Description { get; set; }

    [MaxLength(500)]
    public string? Address { get; set; }

    [MaxLength(100)]
    public string? City { get; set; }

    [MaxLength(100)]
    public string? Governorate { get; set; }

    [MaxLength(30)]
    public string? PhoneNumber { get; set; }

    [EmailAddress, MaxLength(200)]
    public string? Email { get; set; }

    [MaxLength(300)]
    public string? Website { get; set; }

    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    [MaxLength(500)]
    public string? LogoUrl { get; set; }

    public bool IsActive { get; set; } = true;

    public int? SpecialtyId { get; set; }
}

public class ClinicDoctorDto
{
    public int Id { get; set; }
    public int DoctorId { get; set; }
    public string DoctorName { get; set; } = string.Empty;
    public string? SpecialtyName { get; set; }
    public decimal? ConsultationFee { get; set; }
    public bool IsPrimary { get; set; }
}

public class AddDoctorToClinicRequest
{
    [Required]
    public int DoctorId { get; set; }

    public decimal? ConsultationFee { get; set; }

    public bool IsPrimary { get; set; }
}

public class ClinicStaffDto
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public int ClinicId { get; set; }
    public string ClinicName { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public StaffRole Role { get; set; }
    public bool IsActive { get; set; }
}

public class CreateClinicStaffRequest
{
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

    [Required, MaxLength(100)]
    public string Position { get; set; } = string.Empty;

    public StaffRole Role { get; set; } = StaffRole.Receptionist;

    public bool IsActive { get; set; } = true;
}