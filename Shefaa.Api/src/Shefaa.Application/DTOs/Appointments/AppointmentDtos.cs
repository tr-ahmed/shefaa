using System.ComponentModel.DataAnnotations;
using Shefaa.Domain.Enums;

namespace Shefaa.Application.DTOs.Appointments;

public class AppointmentDto
{
    public int Id { get; set; }
    public string ConfirmationCode { get; set; } = string.Empty;

    public int PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;

    public int DoctorId { get; set; }
    public string DoctorName { get; set; } = string.Empty;
    public string? DoctorSpecialty { get; set; }

    public int ClinicId { get; set; }
    public string ClinicName { get; set; } = string.Empty;

    public DateTime ScheduledStart { get; set; }
    public DateTime ScheduledEnd { get; set; }
    public DateTime? ActualStart { get; set; }
    public DateTime? ActualEnd { get; set; }

    public AppointmentStatus Status { get; set; }
    public string? ReasonForVisit { get; set; }
    public string? PatientNotes { get; set; }
    public string? DoctorNotes { get; set; }
    public string? CancellationReason { get; set; }

    public decimal? ConsultationFee { get; set; }
    public bool IsPaid { get; set; }
    public PaymentMethod? PaymentMethod { get; set; }
    public DateTime? PaymentDate { get; set; }
    public string? PaymentReference { get; set; }
}

public class CreateAppointmentRequest
{
    [Required]
    public int DoctorId { get; set; }

    [Required]
    public int ClinicId { get; set; }

    [Required]
    public DateTime ScheduledStart { get; set; }

    [MaxLength(500)]
    public string? ReasonForVisit { get; set; }

    [MaxLength(2000)]
    public string? PatientNotes { get; set; }

    /// <summary>Optional. How the patient intends to pay.</summary>
    public PaymentMethod? PaymentMethod { get; set; }
}

public class MarkAppointmentPaidRequest
{
    [Required]
    public PaymentMethod PaymentMethod { get; set; }

    /// <summary>Optional gateway/transaction reference (e.g. Vodafone Cash txn id).</summary>
    [MaxLength(200)]
    public string? PaymentReference { get; set; }
}

public class RescheduleAppointmentRequest
{
    [Required]
    public DateTime NewStart { get; set; }
}

public class CancelAppointmentRequest
{
    [Required, MaxLength(1000)]
    public string Reason { get; set; } = string.Empty;
}