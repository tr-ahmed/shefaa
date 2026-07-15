using Shefaa.Domain.Common;
using Shefaa.Domain.Enums;

namespace Shefaa.Domain.Schedules;

/// <summary>
/// Recurring working slot for a doctor at a clinic on a specific day of the week.
/// </summary>
public class DoctorSchedule : BaseEntity
{
    public int DoctorId { get; set; }
    public Doctors.Doctor? Doctor { get; set; }

    public int? ClinicId { get; set; }
    public Clinics.Clinic? Clinic { get; set; }

    public WeekDay DayOfWeek { get; set; }

    public TimeSpan StartTime { get; set; }

    public TimeSpan EndTime { get; set; }

    public int SlotDurationMinutes { get; set; } = 30;

    public bool IsActive { get; set; } = true;

    public DateTime? EffectiveFrom { get; set; }

    public DateTime? EffectiveTo { get; set; }
}