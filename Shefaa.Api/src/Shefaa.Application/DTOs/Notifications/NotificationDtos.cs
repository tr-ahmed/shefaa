using Shefaa.Domain.Enums;

namespace Shefaa.Application.DTOs.Notifications;

public class NotificationDto
{
    public int Id { get; set; }
    public NotificationType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? ActionUrl { get; set; }
    public int? AppointmentId { get; set; }
    public int? MedicalRecordId { get; set; }
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
    public DateTime? SentAt { get; set; }
    public DateTime CreatedAt { get; set; }
}