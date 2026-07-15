using Microsoft.AspNetCore.Authorization;

namespace Shefaa.Api.Filters;

/// <summary>
/// Authorization requirement that checks for a specific permission claim in the JWT.
/// Claims are added by <see cref="Shefaa.Infrastructure.Identity.JwtTokenService"/>
/// using the "permission" claim type, derived from <see cref="Shefaa.Application.Common.AuthorizationCatalog"/>.
/// </summary>
public class PermissionRequirement : IAuthorizationRequirement
{
    public string Permission { get; }

    public PermissionRequirement(string permission)
    {
        Permission = permission;
    }
}

/// <summary>
/// Handles <see cref="PermissionRequirement"/> by checking that the principal
/// has a "permission" claim matching the required value.
/// </summary>
public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        var permissions = context.User.FindAll("permission").Select(c => c.Value).ToList();
        
        // SystemAdmin has superset access
        var hasClaim = permissions.Any(p => string.Equals(p, "system.admin", StringComparison.OrdinalIgnoreCase)) ||
                       permissions.Any(p => string.Equals(p, requirement.Permission, StringComparison.OrdinalIgnoreCase));

        if (hasClaim)
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
