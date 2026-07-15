using System.ComponentModel.DataAnnotations;

namespace Shefaa.Application.DTOs.Schedules;

public class DoctorTimeOffDto
{
    public int Id { get; set; }
    public int DoctorId { get; set; }
    public DateTime StartAt { get; set; }
    public DateTime EndAt { get; set; }
    public string? Reason { get; set; }
    public bool IsFullDay { get; set; }
}

public class CreateDoctorTimeOffRequest
{
    [Required]
    public DateTime StartAt { get; set; }

    [Required]
    public DateTime EndAt { get; set; }

    [MaxLength(500)]
    public string? Reason { get; set; }

    public bool IsFullDay { get; set; }
}