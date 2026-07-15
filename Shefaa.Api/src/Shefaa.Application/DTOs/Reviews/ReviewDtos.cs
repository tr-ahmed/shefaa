using System.ComponentModel.DataAnnotations;

namespace Shefaa.Application.DTOs.Reviews;

public class ReviewDto
{
    public int Id { get; set; }
    public int AppointmentId { get; set; }
    public int DoctorId { get; set; }
    public int PatientId { get; set; }
    public string? PatientDisplayName { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateReviewRequest
{
    [Required]
    public int AppointmentId { get; set; }

    [Range(1, 5)]
    public int Rating { get; set; }

    [MaxLength(2000)]
    public string? Comment { get; set; }

    public bool IsAnonymous { get; set; }
}