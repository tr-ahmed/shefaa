using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Shefaa.Domain.Schedules;

namespace Shefaa.Infrastructure.Persistence.Configurations;

public class DoctorScheduleConfiguration : IEntityTypeConfiguration<DoctorSchedule>
{
    public void Configure(EntityTypeBuilder<DoctorSchedule> builder)
    {
        builder.ToTable("DoctorSchedules");
        builder.HasKey(s => s.Id);
        builder.ApplySoftDeleteFilter();

        builder.HasOne(s => s.Doctor)
            .WithMany(d => d.Schedules)
            .HasForeignKey(s => s.DoctorId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(s => s.Clinic)
            .WithMany()
            .HasForeignKey(s => s.ClinicId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(s => new { s.DoctorId, s.DayOfWeek });
        builder.HasIndex(s => s.IsActive);
    }
}

public class DoctorTimeOffConfiguration : IEntityTypeConfiguration<DoctorTimeOff>
{
    public void Configure(EntityTypeBuilder<DoctorTimeOff> builder)
    {
        builder.ToTable("DoctorTimeOffs");
        builder.HasKey(t => t.Id);
        builder.ApplySoftDeleteFilter();

        builder.Property(t => t.Reason).HasMaxLength(500);

        builder.HasOne(t => t.Doctor)
            .WithMany()
            .HasForeignKey(t => t.DoctorId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(t => new { t.DoctorId, t.StartAt, t.EndAt });
    }
}