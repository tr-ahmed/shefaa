using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Shefaa.Domain.Notifications;

namespace Shefaa.Infrastructure.Persistence.Configurations;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("Notifications");
        builder.HasKey(n => n.Id);
        builder.ApplySoftDeleteFilter();

        builder.Property(n => n.Title).IsRequired().HasMaxLength(200);
        builder.Property(n => n.Message).IsRequired().HasMaxLength(2000);
        builder.Property(n => n.ActionUrl).HasMaxLength(500);

        builder.HasOne(n => n.User)
            .WithMany(u => u.Notifications)
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Restrict); // Restrict to avoid multiple cascade paths with Appointment -> MedicalRecord chain.

        builder.HasOne(n => n.Appointment)
            .WithMany()
            .HasForeignKey(n => n.AppointmentId)
            .OnDelete(DeleteBehavior.Restrict); // Restrict (instead of SetNull) to break the Appointment -> MedicalRecord -> Notification cascade chain.

        builder.HasOne(n => n.MedicalRecord)
            .WithMany()
            .HasForeignKey(n => n.MedicalRecordId)
            .OnDelete(DeleteBehavior.Restrict); // Restrict (instead of SetNull) to break the cascade chain.

        builder.HasIndex(n => new { n.UserId, n.IsRead });
        builder.HasIndex(n => n.SentAt);
    }
}