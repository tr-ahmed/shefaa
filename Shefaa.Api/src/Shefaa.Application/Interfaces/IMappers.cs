using System.Security.Claims;
using Shefaa.Application.Common;
using Shefaa.Application.DTOs.Auth;
using Shefaa.Domain.Identity;
namespace Shefaa.Application.Interfaces;

public static class UserMappingExtensions
{
    /// <summary>
    /// Maps an ApplicationUser + roles to a UserDto.
    /// </summary>
    public static UserDto ToDto(this ApplicationUser user, IList<string> roles)
    {
        var permissions = AuthorizationCatalog.GetPermissions(roles);

        return new UserDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            FirstName = user.FirstName,
            LastName = user.LastName,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber,
            ProfileImageUrl = user.ProfileImageUrl,
            Gender = user.Gender,
            UserType = user.UserType,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            Roles = roles.ToArray(),
            Permissions = permissions
        };
    }

    /// <summary>
    /// Extracts the user id from the JWT principal.
    /// </summary>
    public static string? GetUserId(this ClaimsPrincipal principal)
        => principal.FindFirstValue(ClaimTypes.NameIdentifier);

    /// <summary>
    /// Extracts the role names from the JWT principal.
    /// </summary>
    public static List<string> GetRoles(this ClaimsPrincipal principal)
        => principal.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
}