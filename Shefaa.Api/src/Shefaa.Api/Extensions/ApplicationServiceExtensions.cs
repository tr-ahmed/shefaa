using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Shefaa.Application.Interfaces;
using Shefaa.Domain.Clinics;
using Shefaa.Domain.Doctors;
using Shefaa.Domain.Enums;
using Shefaa.Domain.Specialties;
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

            // Seed specialties (idempotent — inserts only those not already present by Name).
            var existingNames = await db.Specialties.Select(s => s.Name).ToListAsync();
            var seedSpecialties = new List<Specialty>
                {
                    new() { Name = "Cardiology",                    NameAr = "أمراض القلب",                        IsActive = true },
                    new() { Name = "Internal Medicine",            NameAr = "الباطنة العامة",                     IsActive = true },
                    new() { Name = "General Surgery",              NameAr = "الجراحة العامة",                     IsActive = true },
                    new() { Name = "Pediatrics",                   NameAr = "طب الأطفال",                         IsActive = true },
                    new() { Name = "Orthopedics",                  NameAr = "جراحة العظام",                       IsActive = true },
                    new() { Name = "Ophthalmology",                NameAr = "طب العيون",                          IsActive = true },
                    new() { Name = "Otorhinolaryngology (ENT)",    NameAr = "الأنف والأذن والحنجرة",               IsActive = true },
                    new() { Name = "Dermatology",                  NameAr = "الأمراض الجلدية",                     IsActive = true },
                    new() { Name = "Neurology",                    NameAr = "الأمراض العصبية",                     IsActive = true },
                    new() { Name = "Psychiatry",                   NameAr = "الطب النفسي",                        IsActive = true },
                    new() { Name = "Obstetrics & Gynecology",      NameAr = "النساء والتوليد",                    IsActive = true },
                    new() { Name = "Urology",                      NameAr = "المسالك البولية",                     IsActive = true },
                    new() { Name = "Gastroenterology",             NameAr = "أمراض الجهاز الهضمي",                 IsActive = true },
                    new() { Name = "Pulmonology",                  NameAr = "أمراض الصدر",                        IsActive = true },
                    new() { Name = "Nephrology",                   NameAr = "أمراض الكلى",                        IsActive = true },
                    new() { Name = "Endocrinology",                NameAr = "الغدد الصماء",                       IsActive = true },
                    new() { Name = "Rheumatology",                 NameAr = "أمراض الروماتيزم",                   IsActive = true },
                    new() { Name = "Hematology",                   NameAr = "أمراض الدم",                         IsActive = true },
                    new() { Name = "Oncology",                     NameAr = "الأورام",                            IsActive = true },
                    new() { Name = "Radiology",                    NameAr = "الأشعة",                             IsActive = true },
                    new() { Name = "Anesthesiology",               NameAr = "التخدير",                            IsActive = true },
                    new() { Name = "Emergency Medicine",           NameAr = "طب الطوارئ",                         IsActive = true },
                    new() { Name = "Family Medicine",              NameAr = "طب الأسرة",                          IsActive = true },
                    new() { Name = "Neurosurgery",                 NameAr = "جراحة المخ والأعصاب",                IsActive = true },
                    new() { Name = "Plastic Surgery",              NameAr = "الجراحة التجميلية",                  IsActive = true },
                    new() { Name = "Vascular Surgery",             NameAr = "جراحة الأوعية الدموية",              IsActive = true },
                    new() { Name = "Cardiothoracic Surgery",       NameAr = "جراحة القلب والصدر",                 IsActive = true },
                    new() { Name = "Pediatric Surgery",            NameAr = "جراحة الأطفال",                      IsActive = true },
                    new() { Name = "Physical Medicine & Rehab",    NameAr = "الطب الطبيعي والتأهيل",               IsActive = true },
                    new() { Name = "Infectious Diseases",          NameAr = "الأمراض المعدية",                    IsActive = true },
                    new() { Name = "Hepatology",                   NameAr = "أمراض الكبد",                        IsActive = true },
                    new() { Name = "Clinical Pathology",           NameAr = "الباثولوجيا الإكلينيكية",             IsActive = true },
                    new() { Name = "Forensic Medicine",            NameAr = "الطب الشرعي",                        IsActive = true },
                    new() { Name = "Nuclear Medicine",             NameAr = "الطب النووي",                        IsActive = true },
                    new() { Name = "Allergy & Immunology",         NameAr = "الحساسية والمناعة",                  IsActive = true },
                    new() { Name = "Intensive Care",               NameAr = "الرعاية المركزة",                     IsActive = true },
                    new() { Name = "Pain Management",              NameAr = "علاج الألم",                         IsActive = true },
                    new() { Name = "Sports Medicine",              NameAr = "الطب الرياضي",                       IsActive = true },
                    new() { Name = "Geriatrics",                   NameAr = "طب المسنين",                         IsActive = true },
                    new() { Name = "Neonatology",                  NameAr = "طب حديثي الولادة",                   IsActive = true },
                    new() { Name = "Pediatric Cardiology",         NameAr = "قلب أطفال",                          IsActive = true },
                    new() { Name = "Pediatric Neurology",          NameAr = "أعصاب أطفال",                        IsActive = true },
                    new() { Name = "Pediatric Oncology",           NameAr = "أورام أطفال",                        IsActive = true },
                    new() { Name = "Pediatric Nephrology",         NameAr = "كلى أطفال",                          IsActive = true },
                    new() { Name = "Pediatric Endocrinology",      NameAr = "غدد صماء أطفال",                     IsActive = true },
                    new() { Name = "Colorectal Surgery",           NameAr = "جراحة القولون والمستقيم",             IsActive = true },
                    new() { Name = "Breast Surgery",               NameAr = "جراحة الثدي",                        IsActive = true },
                    new() { Name = "Surgical Oncology",            NameAr = "جراحة الأورام",                      IsActive = true },
                    new() { Name = "Transplant Surgery",           NameAr = "جراحة زراعة الأعضاء",                IsActive = true },
                    new() { Name = "Interventional Cardiology",    NameAr = "قسطرة القلب التداخلية",              IsActive = true },
                    new() { Name = "Oral & Maxillofacial Surgery", NameAr = "جراحة الفم والوجه والفكين",          IsActive = true },
                    new() { Name = "Community Medicine",           NameAr = "طب المجتمع",                         IsActive = true },
                    new() { Name = "Tropical Medicine",            NameAr = "طب المناطق الحارة",                  IsActive = true },
                    new() { Name = "Genetic Medicine",             NameAr = "طب الوراثة",                         IsActive = true },
                    new() { Name = "Clinical Nutrition",           NameAr = "التغذية الإكلينيكية",                 IsActive = true },
                    new() { Name = "Physiotherapy",                NameAr = "العلاج الطبيعي",                     IsActive = true },
                    new() { Name = "Dentistry",                    NameAr = "طب الأسنان",                         IsActive = true },
                };

            var missing = seedSpecialties.Where(s => !existingNames.Contains(s.Name)).ToList();
            if (missing.Count != 0)
            {
                db.Specialties.AddRange(missing);
                await db.SaveChangesAsync();
                logger.LogInformation("Seeded {Count} new specialties.", missing.Count);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error during database seeding. App will continue without seeding.");
        }
    }
}