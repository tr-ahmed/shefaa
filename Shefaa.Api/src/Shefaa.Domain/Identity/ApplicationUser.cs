using Microsoft.AspNetCore.Identity;
using Shefaa.Domain.Common;
using Shefaa.Domain.Enums;
using Shefaa.Domain.Notifications;
using Shefaa.Domain.Patients;
using Shefaa.Domain.Doctors;
using Shefaa.Domain.Clinics;

namespace Shefaa.Domain.Identity;

/// <summary>
/// Application user used by ASP.NET Core Identity. Extended with profile fields
/// shared across patients, doctors, and staff members.
/// </summary>
public class ApplicationUser : IdentityUser<string>, IBaseEntity
{
    public ApplicationUser()
    {
        Id = Guid.NewGuid().ToString();
    }

    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;

    public string? FullName => string.IsNullOrWhiteSpace(FirstName) && string.IsNullOrWhiteSpace(LastName)
        ? null
        : $"{FirstName} {LastName}".Trim();

    public string? ProfileImageUrl { get; set; }

    public Gender Gender { get; set; } = Gender.Male;

    public DateTime? DateOfBirth { get; set; }

    public string? NationalId { get; set; }

    public string? Address { get; set; }

    public string? City { get; set; }

    public string? Country { get; set; } = "Egypt";

    public bool IsActive { get; set; } = true;

    public DateTime? LastLoginAt { get; set; }

    public UserType UserType { get; set; } = UserType.Patient;

    // Audit
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    // Navigation
    public Patient? Patient { get; set; }
    public Doctor? Doctor { get; set; }
    public ICollection<ClinicStaff> ClinicStaff { get; set; } = new List<ClinicStaff>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}