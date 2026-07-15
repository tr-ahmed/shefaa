using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Shefaa.Domain.Appointments;

namespace Shefaa.Infrastructure.Persistence.Configurations;

public class AppointmentConfiguration : IEntityTypeConfiguration<Appointment>
{
    public void Configure(EntityTypeBuilder<Appointment> builder)
    {
        builder.ToTable("Appointments");
        builder.HasKey(a => a.Id);
        builder.ApplySoftDeleteFilter();

        builder.Property(a => a.ReasonForVisit).HasMaxLength(500);
        builder.Property(a => a.PatientNotes).HasMaxLength(2000);
        builder.Property(a => a.DoctorNotes).HasMaxLength(4000);
        builder.Property(a => a.CancellationReason).HasMaxLength(1000);
        builder.Property(a => a.CancelledBy).HasMaxLength(100);
        builder.Property(a => a.ConsultationFee).HasPrecision(18, 2);
        builder.Property(a => a.PaymentReference).HasMaxLength(200);
        builder.Property(a => a.PaymentMethod).HasConversion<int>();
        builder.Property(a => a.ConfirmationCode).HasMaxLength(50);

        builder.HasOne(a => a.Patient)
            .WithMany(p => p.Appointments)
            .HasForeignKey(a => a.PatientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Doctor)
            .WithMany(d => d.Appointments)
            .HasForeignKey(a => a.DoctorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Clinic)
            .WithMany(c => c.Appointments)
            .HasForeignKey(a => a.ClinicId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(a => a.ScheduledStart);
        builder.HasIndex(a => new { a.DoctorId, a.ScheduledStart });
        builder.HasIndex(a => new { a.PatientId, a.ScheduledStart });
        builder.HasIndex(a => a.Status);
        builder.HasIndex(a => a.ConfirmationCode).IsUnique();
    }
}

public class AppointmentStatusHistoryConfiguration : IEntityTypeConfiguration<AppointmentStatusHistory>
{
    public void Configure(EntityTypeBuilder<AppointmentStatusHistory> builder)
    {
        builder.ToTable("AppointmentStatusHistories");
        builder.HasKey(h => h.Id);
        builder.ApplySoftDeleteFilter();

        builder.Property(h => h.ChangedBy).HasMaxLength(100);
        builder.Property(h => h.Notes).HasMaxLength(1000);

        builder.HasOne(h => h.Appointment)
            .WithMany()
            .HasForeignKey(h => h.AppointmentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(h => h.AppointmentId);
        builder.HasIndex(h => h.ChangedAt);
    }
}