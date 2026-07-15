using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Shefaa.Domain.Patients;

namespace Shefaa.Infrastructure.Persistence.Configurations;

public class PatientConfiguration : IEntityTypeConfiguration<Patient>
{
    public void Configure(EntityTypeBuilder<Patient> builder)
    {
        builder.ToTable("Patients");
        builder.HasKey(p => p.Id);
        builder.ApplySoftDeleteFilter();

        builder.Property(p => p.MedicalRecordNumber).HasMaxLength(50);
        builder.Property(p => p.Allergies).HasMaxLength(2000);
        builder.Property(p => p.ChronicDiseases).HasMaxLength(2000);
        builder.Property(p => p.CurrentMedications).HasMaxLength(2000);
        builder.Property(p => p.EmergencyContactName).HasMaxLength(150);
        builder.Property(p => p.EmergencyContactPhone).HasMaxLength(30);
        builder.Property(p => p.InsuranceProvider).HasMaxLength(200);
        builder.Property(p => p.InsurancePolicyNumber).HasMaxLength(100);
        builder.Property(p => p.Notes).HasMaxLength(2000);

        builder.HasOne(p => p.User)
            .WithOne(u => u.Patient)
            .HasForeignKey<Patient>(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(p => p.UserId).IsUnique();
        builder.HasIndex(p => p.MedicalRecordNumber).IsUnique();
    }
}