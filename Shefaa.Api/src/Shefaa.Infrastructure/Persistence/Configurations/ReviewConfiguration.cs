using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Shefaa.Domain.Reviews;

namespace Shefaa.Infrastructure.Persistence.Configurations;

public class ReviewConfiguration : IEntityTypeConfiguration<Review>
{
    public void Configure(EntityTypeBuilder<Review> builder)
    {
        builder.ToTable("Reviews");
        builder.HasKey(r => r.Id);
        builder.ApplySoftDeleteFilter();

        builder.Property(r => r.Comment).HasMaxLength(2000);

        builder.HasOne(r => r.Appointment)
            .WithOne(a => a.Review)
            .HasForeignKey<Review>(r => r.AppointmentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(r => r.Patient)
            .WithMany()
            .HasForeignKey(r => r.PatientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.Doctor)
            .WithMany(d => d.Reviews)
            .HasForeignKey(r => r.DoctorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(r => r.AppointmentId).IsUnique();
        builder.HasIndex(r => new { r.DoctorId, r.IsVisible });
        builder.HasIndex(r => r.Rating);
    }
}