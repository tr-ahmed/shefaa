using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Shefaa.Domain.Clinics;

namespace Shefaa.Infrastructure.Persistence.Configurations;

public class ClinicConfiguration : IEntityTypeConfiguration<Clinic>
{
    public void Configure(EntityTypeBuilder<Clinic> builder)
    {
        builder.ToTable("Clinics");
        builder.HasKey(c => c.Id);
        builder.ApplySoftDeleteFilter();

        builder.Property(c => c.Name).IsRequired().HasMaxLength(200);
        builder.Property(c => c.NameAr).HasMaxLength(200);
        builder.Property(c => c.Description).HasMaxLength(2000);
        builder.Property(c => c.Address).HasMaxLength(500);
        builder.Property(c => c.City).HasMaxLength(100);
        builder.Property(c => c.Governorate).HasMaxLength(100);
        builder.Property(c => c.PhoneNumber).HasMaxLength(30);
        builder.Property(c => c.Email).HasMaxLength(200);
        builder.Property(c => c.Website).HasMaxLength(300);
        builder.Property(c => c.LogoUrl).HasMaxLength(500);
        builder.Property(c => c.Latitude).HasPrecision(9, 6);
        builder.Property(c => c.Longitude).HasPrecision(9, 6);

        builder.HasOne(c => c.OwnerUser)
            .WithMany()
            .HasForeignKey(c => c.OwnerUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(c => c.Name);
        builder.HasIndex(c => c.City);
        builder.HasIndex(c => c.IsActive);

        builder.HasOne(c => c.Specialty)
            .WithMany(s => s.Clinics)
            .HasForeignKey(c => c.SpecialtyId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class ClinicDoctorConfiguration : IEntityTypeConfiguration<ClinicDoctor>
{
    public void Configure(EntityTypeBuilder<ClinicDoctor> builder)
    {
        builder.ToTable("ClinicDoctors");
        builder.HasKey(cd => cd.Id);
        builder.ApplySoftDeleteFilter();

        builder.Property(cd => cd.ConsultationFee).HasPrecision(18, 2);

        builder.HasOne(cd => cd.Clinic)
            .WithMany(c => c.ClinicDoctors)
            .HasForeignKey(cd => cd.ClinicId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(cd => cd.Doctor)
            .WithMany(d => d.ClinicMemberships)
            .HasForeignKey(cd => cd.DoctorId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(cd => new { cd.ClinicId, cd.DoctorId }).IsUnique();
    }
}

public class ClinicStaffConfiguration : IEntityTypeConfiguration<ClinicStaff>
{
    public void Configure(EntityTypeBuilder<ClinicStaff> builder)
    {
        builder.ToTable("ClinicStaff");
        builder.HasKey(s => s.Id);
        builder.ApplySoftDeleteFilter();

        builder.Property(s => s.Position).IsRequired().HasMaxLength(100);

        builder.HasOne(s => s.User)
            .WithMany(u => u.ClinicStaff)
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(s => s.Clinic)
            .WithMany(c => c.Staff)
            .HasForeignKey(s => s.ClinicId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(s => new { s.UserId, s.ClinicId }).IsUnique();
    }
}