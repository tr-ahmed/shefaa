using Shefaa.Domain.Common;
using Shefaa.Domain.Identity;
using Shefaa.Domain.Specialties;

namespace Shefaa.Domain.Clinics;

/// <summary>
/// A physical or virtual clinic where appointments are held.
/// </summary>
public class Clinic : BaseEntity
{
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

    public TimeSpan? OpeningTime { get; set; }

    public TimeSpan? ClosingTime { get; set; }

    public bool IsActive { get; set; } = true;

    // Foreign keys
    public string? OwnerUserId { get; set; }
    public ApplicationUser? OwnerUser { get; set; }

    public int? SpecialtyId { get; set; }
    public Specialty? Specialty { get; set; }

    // Navigation
    public ICollection<ClinicDoctor> ClinicDoctors { get; set; } = new List<ClinicDoctor>();
    public ICollection<ClinicStaff> Staff { get; set; } = new List<ClinicStaff>();
    public ICollection<Appointments.Appointment> Appointments { get; set; } = new List<Appointments.Appointment>();
}