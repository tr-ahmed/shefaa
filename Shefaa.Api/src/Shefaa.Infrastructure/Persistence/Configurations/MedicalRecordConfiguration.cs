using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Shefaa.Domain.MedicalRecords;

namespace Shefaa.Infrastructure.Persistence.Configurations;

public class MedicalRecordConfiguration : IEntityTypeConfiguration<MedicalRecord>
{
    public void Configure(EntityTypeBuilder<MedicalRecord> builder)
    {
        builder.ToTable("MedicalRecords");
        builder.HasKey(r => r.Id);
        builder.ApplySoftDeleteFilter();

        builder.Property(r => r.ChiefComplaint).HasMaxLength(1000);
        builder.Property(r => r.Diagnosis).HasMaxLength(2000);
        builder.Property(r => r.Symptoms).HasMaxLength(2000);
        builder.Property(r => r.TreatmentPlan).HasMaxLength(4000);
        builder.Property(r => r.Investigations).HasMaxLength(2000);
        builder.Property(r => r.Notes).HasMaxLength(4000);

        builder.HasOne(r => r.Appointment)
            .WithOne(a => a.MedicalRecord)
            .HasForeignKey<MedicalRecord>(r => r.AppointmentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(r => r.Patient)
            .WithMany(p => p.MedicalRecords)
            .HasForeignKey(r => r.PatientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.Doctor)
            .WithMany(d => d.MedicalRecords)
            .HasForeignKey(r => r.DoctorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(r => r.AppointmentId).IsUnique();
        builder.HasIndex(r => new { r.PatientId, r.RecordDate });
        builder.HasIndex(r => r.DoctorId);
    }
}

public class PrescriptionConfiguration : IEntityTypeConfiguration<Prescription>
{
    public void Configure(EntityTypeBuilder<Prescription> builder)
    {
        builder.ToTable("Prescriptions");
        builder.HasKey(p => p.Id);
        builder.ApplySoftDeleteFilter();

        builder.Property(p => p.MedicationName).IsRequired().HasMaxLength(200);
        builder.Property(p => p.Dosage).HasMaxLength(100);
        builder.Property(p => p.Frequency).HasMaxLength(100);
        builder.Property(p => p.Duration).HasMaxLength(100);
        builder.Property(p => p.Route).HasMaxLength(50);
        builder.Property(p => p.Instructions).HasMaxLength(1000);

        builder.HasOne(p => p.MedicalRecord)
            .WithMany(r => r.Prescriptions)
            .HasForeignKey(p => p.MedicalRecordId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(p => p.MedicalRecordId);
    }
}

public class AttachmentConfiguration : IEntityTypeConfiguration<Attachment>
{
    public void Configure(EntityTypeBuilder<Attachment> builder)
    {
        builder.ToTable("Attachments");
        builder.HasKey(a => a.Id);
        builder.ApplySoftDeleteFilter();

        builder.Property(a => a.FileName).IsRequired().HasMaxLength(300);
        builder.Property(a => a.FileUrl).IsRequired().HasMaxLength(1000);
        builder.Property(a => a.ContentType).IsRequired().HasMaxLength(100);
        builder.Property(a => a.Description).HasMaxLength(500);

        builder.HasOne(a => a.MedicalRecord)
            .WithMany(r => r.Attachments)
            .HasForeignKey(a => a.MedicalRecordId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(a => a.MedicalRecordId);
    }
}