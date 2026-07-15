using Shefaa.Domain.Common;

namespace Shefaa.Domain.Specialties;

/// <summary>
/// A medical specialty (Cardiology, Dermatology, ...).
/// </summary>
public class Specialty : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public string? NameAr { get; set; }

    public string? Description { get; set; }

    public string? IconUrl { get; set; }

    public bool IsActive { get; set; } = true;

    // Navigation
    public ICollection<Doctors.Doctor> Doctors { get; set; } = new List<Doctors.Doctor>();
    public ICollection<Clinics.Clinic> Clinics { get; set; } = new List<Clinics.Clinic>();
}