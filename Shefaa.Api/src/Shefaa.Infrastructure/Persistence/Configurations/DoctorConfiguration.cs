using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Shefaa.Domain.Doctors;

namespace Shefaa.Infrastructure.Persistence.Configurations;

public class DoctorConfiguration : IEntityTypeConfiguration<Doctor>
{
    public void Configure(EntityTypeBuilder<Doctor> builder)
    {
        builder.ToTable("Doctors");
        builder.HasKey(d => d.Id);
        builder.ApplySoftDeleteFilter();

        builder.Property(d => d.LicenseNumber).IsRequired().HasMaxLength(100);
        builder.Property(d => d.Biography).HasMaxLength(2000);
        builder.Property(d => d.Education).HasMaxLength(1000);
        builder.Property(d => d.DefaultConsultationFee).HasPrecision(18, 2);
        builder.Property(d => d.Rating).HasPrecision(3, 2);

        builder.HasOne(d => d.User)
            .WithOne(u => u.Doctor)
            .HasForeignKey<Doctor>(d => d.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(d => d.Specialty)
            .WithMany(s => s.Doctors)
            .HasForeignKey(d => d.SpecialtyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(d => d.UserId).IsUnique();
        builder.HasIndex(d => d.LicenseNumber).IsUnique();
        builder.HasIndex(d => new { d.SpecialtyId, d.IsActive });
    }
}