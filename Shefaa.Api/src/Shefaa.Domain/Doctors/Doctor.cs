using Shefaa.Domain.Common;
using Shefaa.Domain.Identity;

namespace Shefaa.Domain.Doctors;

/// <summary>
/// Doctor profile linked 1:1 to an <see cref="ApplicationUser"/>.
/// </summary>
public class Doctor : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser? User { get; set; }

    public int SpecialtyId { get; set; }
    public Specialties.Specialty? Specialty { get; set; }

    public string LicenseNumber { get; set; } = string.Empty;

    public int YearsOfExperience { get; set; }

    public string? Biography { get; set; }

    public string? Education { get; set; }

    public decimal? DefaultConsultationFee { get; set; }

    public int? DefaultAppointmentDurationMinutes { get; set; } = 30;

    public decimal? Rating { get; set; }

    public int TotalReviews { get; set; }

    public bool IsAvailableForBooking { get; set; } = true;

    public bool IsActive { get; set; } = true;

    // Navigation
    public ICollection<Clinics.ClinicDoctor> ClinicMemberships { get; set; } = new List<Clinics.ClinicDoctor>();
    public ICollection<Schedules.DoctorSchedule> Schedules { get; set; } = new List<Schedules.DoctorSchedule>();
    public ICollection<Appointments.Appointment> Appointments { get; set; } = new List<Appointments.Appointment>();
    public ICollection<MedicalRecords.MedicalRecord> MedicalRecords { get; set; } = new List<MedicalRecords.MedicalRecord>();
    public ICollection<Reviews.Review> Reviews { get; set; } = new List<Reviews.Review>();
}