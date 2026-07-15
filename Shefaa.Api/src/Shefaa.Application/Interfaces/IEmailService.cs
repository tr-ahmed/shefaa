namespace Shefaa.Application.Interfaces;

public interface IEmailService
{
    Task SendAsync(string to, string subject, string htmlBody, CancellationToken ct = default);
    Task SendPasswordResetAsync(string to, string resetLink, CancellationToken ct = default);
    Task SendAppointmentConfirmationAsync(string to, string patientName, string doctorName, DateTime scheduledStart, string clinicName, string confirmationCode, CancellationToken ct = default);
}