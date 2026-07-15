using Microsoft.AspNetCore.Identity;
using Shefaa.Domain.Enums;

namespace Shefaa.Domain.Identity;

/// <summary>
/// Custom role mapped 1:1 to <see cref="UserType"/> enum values.
/// </summary>
public class ApplicationRole : IdentityRole<string>
{
    public ApplicationRole() { }

    public ApplicationRole(string roleName, UserType userType, string? description = null)
    {
        Name = roleName;
        NormalizedName = roleName.ToUpperInvariant();
        UserType = userType;
        Description = description;
    }

    public UserType UserType { get; set; }

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}