using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Shefaa.Domain.Identity;

namespace Shefaa.Infrastructure.Persistence.Configurations;

public class ApplicationUserConfiguration : IEntityTypeConfiguration<ApplicationUser>
{
    public void Configure(EntityTypeBuilder<ApplicationUser> builder)
    {
        builder.ToTable("Users");
        builder.HasKey(u => u.Id);
        builder.Property(u => u.Id).ValueGeneratedOnAdd();
        builder.ApplySoftDeleteFilter();

        builder.Property(u => u.FirstName).IsRequired().HasMaxLength(100);
        builder.Property(u => u.LastName).IsRequired().HasMaxLength(100);
        builder.Property(u => u.ProfileImageUrl).HasMaxLength(500);
        builder.Property(u => u.NationalId).HasMaxLength(50);
        builder.Property(u => u.Address).HasMaxLength(500);
        builder.Property(u => u.City).HasMaxLength(100);
        builder.Property(u => u.Country).HasMaxLength(100);

        builder.HasIndex(u => u.NormalizedEmail).HasDatabaseName("EmailIndex");
        builder.HasIndex(u => u.NormalizedUserName).HasDatabaseName("UserNameIndex").IsUnique();
        builder.HasIndex(u => u.PhoneNumber);
        builder.HasIndex(u => u.UserType);

        // Ignore computed full name (not mapped)
        builder.Ignore(u => u.FullName);
    }
}

public class ApplicationRoleConfiguration : IEntityTypeConfiguration<ApplicationRole>
{
    public void Configure(EntityTypeBuilder<ApplicationRole> builder)
    {
        builder.ToTable("Roles");
        builder.HasKey(r => r.Id);

        builder.Property(r => r.Description).HasMaxLength(500);

        builder.HasIndex(r => r.NormalizedName).HasDatabaseName("RoleNameIndex").IsUnique();

        // Seed default roles with explicit string Ids for deterministic migrations.
        builder.HasData(
            new ApplicationRole { Id = "role-patient", Name = "Patient", NormalizedName = "PATIENT", UserType = Shefaa.Domain.Enums.UserType.Patient, Description = "Default patient role" },
            new ApplicationRole { Id = "role-doctor", Name = "Doctor", NormalizedName = "DOCTOR", UserType = Shefaa.Domain.Enums.UserType.Doctor, Description = "Doctor role" },
            new ApplicationRole { Id = "role-clinicstaff", Name = "ClinicStaff", NormalizedName = "CLINICSTAFF", UserType = Shefaa.Domain.Enums.UserType.ClinicStaff, Description = "Clinic staff role" },
            new ApplicationRole { Id = "role-clinicadmin", Name = "ClinicAdmin", NormalizedName = "CLINICADMIN", UserType = Shefaa.Domain.Enums.UserType.ClinicAdmin, Description = "Clinic administrator" },
            new ApplicationRole { Id = "role-sysadmin", Name = "SystemAdmin", NormalizedName = "SYSTEMADMIN", UserType = Shefaa.Domain.Enums.UserType.SystemAdmin, Description = "System administrator" }
        );
    }
}

public class ApplicationUserRoleConfiguration : IEntityTypeConfiguration<ApplicationUserRole>
{
    public void Configure(EntityTypeBuilder<ApplicationUserRole> builder)
    {
        builder.ToTable("UserRoles");
        builder.HasKey(ur => new { ur.UserId, ur.RoleId });
    }
}

public class IdentityUserClaimConfiguration : IEntityTypeConfiguration<IdentityUserClaim<string>>
{
    public void Configure(EntityTypeBuilder<IdentityUserClaim<string>> builder)
    {
        builder.ToTable("UserClaims");
    }
}

public class IdentityRoleClaimConfiguration : IEntityTypeConfiguration<IdentityRoleClaim<string>>
{
    public void Configure(EntityTypeBuilder<IdentityRoleClaim<string>> builder)
    {
        builder.ToTable("RoleClaims");
    }
}

public class IdentityUserLoginConfiguration : IEntityTypeConfiguration<IdentityUserLogin<string>>
{
    public void Configure(EntityTypeBuilder<IdentityUserLogin<string>> builder)
    {
        builder.ToTable("UserLogins");
    }
}

public class IdentityUserTokenConfiguration : IEntityTypeConfiguration<IdentityUserToken<string>>
{
    public void Configure(EntityTypeBuilder<IdentityUserToken<string>> builder)
    {
        builder.ToTable("UserTokens");
    }
}