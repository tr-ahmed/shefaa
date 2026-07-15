using Shefaa.Domain.Common;
using Shefaa.Domain.Enums;
using Shefaa.Domain.Identity;

namespace Shefaa.Domain.Notifications;

/// <summary>
/// In-app notification surfaced to a user. Optionally linked to an appointment or medical record.
/// </summary>
public class Notification : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser? User { get; set; }

    public NotificationType Type { get; set; } = NotificationType.General;

    public string Title { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public string? ActionUrl { get; set; }

    public int? AppointmentId { get; set; }
    public Appointments.Appointment? Appointment { get; set; }

    public int? MedicalRecordId { get; set; }
    public MedicalRecords.MedicalRecord? MedicalRecord { get; set; }

    public bool IsRead { get; set; }

    public DateTime? ReadAt { get; set; }

    public DateTime? SentAt { get; set; }
}