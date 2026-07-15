using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Shefaa.Domain.Appointments;
using Shefaa.Domain.Clinics;
using Shefaa.Domain.Doctors;
using Shefaa.Domain.Identity;
using Shefaa.Domain.MedicalRecords;
using Shefaa.Domain.Notifications;
using Shefaa.Domain.Patients;
using Shefaa.Domain.Reviews;
using Shefaa.Domain.Schedules;
using Shefaa.Domain.Specialties;

namespace Shefaa.Infrastructure.Persistence;

/// <summary>
/// Main EF Core database context for the Shefaa application.
/// Combines ASP.NET Core Identity tables with domain entities.
/// </summary>
public class ShefaaDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, string,
    IdentityUserClaim<string>, ApplicationUserRole, IdentityUserLogin<string>,
    IdentityRoleClaim<string>, IdentityUserToken<string>>
{
    public ShefaaDbContext(DbContextOptions<ShefaaDbContext> options) : base(options) { }

    // Domain
    public DbSet<Specialty> Specialties => Set<Specialty>();
    public DbSet<Clinic> Clinics => Set<Clinic>();
    public DbSet<ClinicDoctor> ClinicDoctors => Set<ClinicDoctor>();
    public DbSet<ClinicStaff> ClinicStaff => Set<ClinicStaff>();

    public DbSet<Doctor> Doctors => Set<Doctor>();
    public DbSet<Patient> Patients => Set<Patient>();

    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<AppointmentStatusHistory> AppointmentStatusHistories => Set<AppointmentStatusHistory>();

    public DbSet<MedicalRecord> MedicalRecords => Set<MedicalRecord>();
    public DbSet<Prescription> Prescriptions => Set<Prescription>();
    public DbSet<Attachment> Attachments => Set<Attachment>();

    public DbSet<DoctorSchedule> DoctorSchedules => Set<DoctorSchedule>();
    public DbSet<DoctorTimeOff> DoctorTimeOffs => Set<DoctorTimeOff>();

    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Review> Reviews => Set<Review>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all IEntityTypeConfiguration implementations in this assembly.
        // Each config is responsible for calling ApplySoftDeleteFilter() so the filter
        // is included in the EF Core model snapshot.
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ShefaaDbContext).Assembly);
    }
}