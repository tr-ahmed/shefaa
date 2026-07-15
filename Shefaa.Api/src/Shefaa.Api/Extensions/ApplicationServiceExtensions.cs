using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Shefaa.Application.Interfaces;
using Shefaa.Domain.Clinics;
using Shefaa.Domain.Doctors;
using Shefaa.Domain.Enums;
using Shefaa.Domain.Identity;
using Shefaa.Domain.Patients;
using Shefaa.Domain.Schedules;
using Shefaa.Infrastructure.Identity;
using Shefaa.Infrastructure.Persistence;
using Shefaa.Infrastructure.Services;

namespace Shefaa.Api.Extensions;

public static class ApplicationServiceExtensions
{
    public static IServiceCollection AddShefaaApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Settings
        var jwtSettings = JwtSettingsBinder.Bind(configuration);
        services.AddSingleton(jwtSettings);

        var smtpSettings = new SmtpSettings();
        configuration.GetSection("Smtp").Bind(smtpSettings);
        services.Configure<SmtpSettings>(configuration.GetSection("Smtp"));

        // Token service
        services.AddHttpContextAccessor();
        services.AddScoped<IJwtTokenService, JwtTokenService>();

        // Application services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ISpecialtyService, SpecialtyService>();
        services.AddScoped<IClinicService, ClinicService>();
        services.AddScoped<IDoctorService, DoctorService>();
        services.AddScoped<IPatientService, PatientService>();
        services.AddScoped<IAppointmentService, AppointmentService>();
        services.AddScoped<IMedicalRecordService, MedicalRecordService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IReviewService, ReviewService>();
        services.AddScoped<IAttachmentService, AttachmentService>();
        services.AddScoped<IReportingService, ReportingService>();
        services.AddScoped<IEmailService, EmailService>();

        return services;
    }

    /// <summary>
    /// Seeds default roles (already configured in EF), default system admin, and a few sample specialties.
    /// </summary>
    public static async Task SeedAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger("Seeder");

        try
        {
            var db = services.GetRequiredService<ShefaaDbContext>();
            var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = services.GetRequiredService<RoleManager<ApplicationRole>>();

            // Ensure database exists (for first-run convenience). Migrations are still the recommended path.
            var dbProvider = Environment.GetEnvironmentVariable("DB_PROVIDER") ?? "SqlServer";
            if (dbProvider.Equals("Sqlite", StringComparison.OrdinalIgnoreCase))
            {
                await db.Database.EnsureCreatedAsync();
            }
            else
            {
                await db.Database.MigrateAsync();
            }

            // Roles are seeded via EF Core configuration; ensure they exist (idempotent).
            string[] roles = { "Patient", "Doctor", "ClinicStaff", "ClinicAdmin", "SystemAdmin" };
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    var userType = Enum.TryParse<UserType>(role, out var t) ? t : UserType.Patient;
                    await roleManager.CreateAsync(new ApplicationRole(role, userType));
                }
            }

            // Default admin
            const string adminEmail = "admin@shefaa.local";
            if (await userManager.FindByEmailAsync(adminEmail) == null)
            {
                var admin = new ApplicationUser
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    FirstName = "System",
                    LastName = "Admin",
                    UserType = UserType.SystemAdmin,
                    EmailConfirmed = true
                };
                var result = await userManager.CreateAsync(admin, "Admin@1234");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(admin, "SystemAdmin");
                    logger.LogInformation("Seeded default admin user: {Email}", adminEmail);
                }
                else
                {
                    logger.LogWarning("Failed to seed admin: {Errors}", string.Join(", ", result.Errors.Select(e => e.Description)));
                }
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error during database seeding.");
            throw;
        }
    }
}