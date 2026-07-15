using Shefaa.Domain.Common;
using Shefaa.Domain.Enums;

namespace Shefaa.Domain.Appointments;

/// <summary>
/// Audit log of all status transitions for an appointment.
/// </summary>
public class AppointmentStatusHistory : BaseEntity
{
    public int AppointmentId { get; set; }
    public Appointment? Appointment { get; set; }

    public AppointmentStatus? FromStatus { get; set; }

    public AppointmentStatus ToStatus { get; set; }

    public string? ChangedBy { get; set; }

    public string? Notes { get; set; }

    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
}