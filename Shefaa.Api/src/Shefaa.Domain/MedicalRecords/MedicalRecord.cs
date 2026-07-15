using Shefaa.Domain.Common;

namespace Shefaa.Domain.MedicalRecords;

/// <summary>
/// Electronic medical record (EMR) entry produced by a doctor for a patient,
/// typically after a completed appointment.
/// </summary>
public class MedicalRecord : BaseEntity
{
    public int AppointmentId { get; set; }
    public Appointments.Appointment? Appointment { get; set; }

    public int PatientId { get; set; }
    public Patients.Patient? Patient { get; set; }

    public int DoctorId { get; set; }
    public Doctors.Doctor? Doctor { get; set; }

    public string? ChiefComplaint { get; set; }

    public string? Diagnosis { get; set; }

    public string? Symptoms { get; set; }

    public string? TreatmentPlan { get; set; }

    public string? Investigations { get; set; }

    public string? Notes { get; set; }

    public DateTime RecordDate { get; set; } = DateTime.UtcNow;

    public bool FollowUpRequired { get; set; }

    public DateTime? FollowUpDate { get; set; }

    // Navigation
    public ICollection<Prescription> Prescriptions { get; set; } = new List<Prescription>();
    public ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
}