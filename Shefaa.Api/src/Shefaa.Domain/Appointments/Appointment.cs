using Shefaa.Domain.Common;
using Shefaa.Domain.Enums;

namespace Shefaa.Domain.Appointments;

/// <summary>
/// Represents a booking between a patient and a doctor at a specific clinic and time.
/// </summary>
public class Appointment : BaseEntity
{
    public int PatientId { get; set; }
    public Patients.Patient? Patient { get; set; }

    public int DoctorId { get; set; }
    public Doctors.Doctor? Doctor { get; set; }

    public int ClinicId { get; set; }
    public Clinics.Clinic? Clinic { get; set; }

    public DateTime ScheduledStart { get; set; }

    public DateTime ScheduledEnd { get; set; }

    public DateTime? ActualStart { get; set; }

    public DateTime? ActualEnd { get; set; }

    public AppointmentStatus Status { get; set; } = AppointmentStatus.Pending;

    public string? ReasonForVisit { get; set; }

    public string? PatientNotes { get; set; }

    public string? DoctorNotes { get; set; }

    public string? CancellationReason { get; set; }

    public string? CancelledBy { get; set; }

    public DateTime? CancelledAt { get; set; }

    public decimal? ConsultationFee { get; set; }

    public bool IsPaid { get; set; }

    public string? PaymentReference { get; set; }

    public PaymentMethod? PaymentMethod { get; set; }

    public DateTime? PaymentDate { get; set; }

    public string? ConfirmationCode { get; set; }

    // Navigation
    public MedicalRecords.MedicalRecord? MedicalRecord { get; set; }
    public Reviews.Review? Review { get; set; }
}