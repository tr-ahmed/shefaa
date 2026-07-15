using Shefaa.Domain.Common;

namespace Shefaa.Domain.Schedules;

/// <summary>
/// A doctor-specific time off block (vacation, sick leave, conference) used to exclude slots from booking.
/// </summary>
public class DoctorTimeOff : BaseEntity
{
    public int DoctorId { get; set; }
    public Doctors.Doctor? Doctor { get; set; }

    public DateTime StartAt { get; set; }

    public DateTime EndAt { get; set; }

    public string? Reason { get; set; }

    public bool IsFullDay { get; set; }
}