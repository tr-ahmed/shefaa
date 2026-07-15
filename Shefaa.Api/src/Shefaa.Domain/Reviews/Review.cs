using Shefaa.Domain.Common;

namespace Shefaa.Domain.Reviews;

/// <summary>
/// Patient review for a completed appointment and its doctor.
/// </summary>
public class Review : BaseEntity
{
    public int AppointmentId { get; set; }
    public Appointments.Appointment? Appointment { get; set; }

    public int PatientId { get; set; }
    public Patients.Patient? Patient { get; set; }

    public int DoctorId { get; set; }
    public Doctors.Doctor? Doctor { get; set; }

    public int Rating { get; set; } // 1..5

    public string? Comment { get; set; }

    public bool IsAnonymous { get; set; }

    public bool IsVisible { get; set; } = true;
}