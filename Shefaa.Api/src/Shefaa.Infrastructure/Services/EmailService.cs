using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Shefaa.Application.Interfaces;

namespace Shefaa.Infrastructure.Services;

public class SmtpSettings
{
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; } = 587;
    public bool UseSsl { get; set; } = true;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FromAddress { get; set; } = "no-reply@shefaa.local";
    public string FromName { get; set; } = "Shefaa Clinic";
    public bool Enabled { get; set; } = false; // disabled by default in dev; set to true with real SMTP credentials
}

public class EmailService : IEmailService
{
    private readonly SmtpSettings _settings;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IOptions<SmtpSettings> settings, ILogger<EmailService> logger)
    {
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task SendAsync(string to, string subject, string htmlBody, CancellationToken ct = default)
    {
        if (!_settings.Enabled)
        {
            // Dev mode: log instead of actually sending.
            _logger.LogInformation("[Email DISABLED] To: {To} Subject: {Subject}\n{Body}", to, subject, htmlBody);
            return;
        }

        using var client = new SmtpClient(_settings.Host, _settings.Port)
        {
            EnableSsl = _settings.UseSsl,
            Credentials = string.IsNullOrEmpty(_settings.Username)
                ? CredentialCache.DefaultNetworkCredentials
                : new NetworkCredential(_settings.Username, _settings.Password)
        };
        using var message = new MailMessage
        {
            From = new MailAddress(_settings.FromAddress, _settings.FromName),
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true
        };
        message.To.Add(to);
        await client.SendMailAsync(message, ct);
    }

    public Task SendPasswordResetAsync(string to, string resetLink, CancellationToken ct = default)
    {
        var subject = "Reset your Shefaa password";
        var body = $@"<p>We received a request to reset your password.</p>
                      <p>Click the link below to set a new password (valid for 1 hour):</p>
                      <p><a href=""{resetLink}"">Reset password</a></p>
                      <p>If you did not request this, you can safely ignore this email.</p>";
        return SendAsync(to, subject, body, ct);
    }

    public Task SendAppointmentConfirmationAsync(string to, string patientName, string doctorName, DateTime scheduledStart, string clinicName, string confirmationCode, CancellationToken ct = default)
    {
        var subject = $"Appointment confirmation #{confirmationCode}";
        var body = $@"<p>Dear {patientName},</p>
                      <p>Your appointment is confirmed:</p>
                      <ul>
                        <li><b>Doctor:</b> Dr. {doctorName}</li>
                        <li><b>Clinic:</b> {clinicName}</li>
                        <li><b>When:</b> {scheduledStart:dddd, dd MMM yyyy HH:mm}</li>
                        <li><b>Confirmation code:</b> {confirmationCode}</li>
                      </ul>
                      <p>Please arrive 10 minutes early.</p>";
        return SendAsync(to, subject, body, ct);
    }
}