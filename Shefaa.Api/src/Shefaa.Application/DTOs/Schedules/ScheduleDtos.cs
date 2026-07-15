using System.ComponentModel.DataAnnotations;
using Shefaa.Domain.Enums;

namespace Shefaa.Application.DTOs.Schedules;

public class DoctorScheduleDto
{
    public int Id { get; set; }
    public int DoctorId { get; set; }
    public int? ClinicId { get; set; }
    public string? ClinicName { get; set; }
    public WeekDay DayOfWeek { get; set; }
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public int SlotDurationMinutes { get; set; }
    public bool IsActive { get; set; }
}

public class CreateDoctorScheduleRequest
{
    public int? ClinicId { get; set; }

    [Required]
    public WeekDay DayOfWeek { get; set; }

    [Required]
    public string StartTime { get; set; } = string.Empty; // "HH:mm"

    [Required]
    public string EndTime { get; set; } = string.Empty;

    [Range(5, 240)]
    public int SlotDurationMinutes { get; set; } = 30;

    public DateTime? EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
}