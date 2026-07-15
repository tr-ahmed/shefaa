using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Shefaa.Domain.Specialties;

namespace Shefaa.Infrastructure.Persistence.Configurations;

public class SpecialtyConfiguration : IEntityTypeConfiguration<Specialty>
{
    public void Configure(EntityTypeBuilder<Specialty> builder)
    {
        builder.ToTable("Specialties");
        builder.HasKey(s => s.Id);
        builder.ApplySoftDeleteFilter();

        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(s => s.NameAr)
            .HasMaxLength(150);

        builder.Property(s => s.Description)
            .HasMaxLength(1000);

        builder.Property(s => s.IconUrl)
            .HasMaxLength(500);

        builder.HasIndex(s => s.Name).IsUnique();
        builder.HasIndex(s => s.IsActive);
    }
}