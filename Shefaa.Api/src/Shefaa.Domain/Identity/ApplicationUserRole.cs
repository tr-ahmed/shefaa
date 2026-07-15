using Microsoft.AspNetCore.Identity;

namespace Shefaa.Domain.Identity;

/// <summary>
/// Join entity between <see cref="ApplicationUser"/> and <see cref="ApplicationRole"/>.
/// Replaces the default IdentityUserRole&lt;string&gt; so we can attach audit fields later if needed.
/// </summary>
public class ApplicationUserRole : IdentityUserRole<string>
{
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
}