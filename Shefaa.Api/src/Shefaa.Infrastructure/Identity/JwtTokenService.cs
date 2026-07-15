using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Shefaa.Application.Interfaces;
using Shefaa.Application.Common;
using Shefaa.Domain.Identity;

namespace Shefaa.Infrastructure.Identity;

public class JwtSettings
{
    public string SecretKey { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int AccessTokenExpirationMinutes { get; set; } = 60;
    public int RefreshTokenExpirationDays { get; set; } = 14;
}

public interface IJwtTokenService
{
    Task<(string token, DateTime expiresAt, string jti)> GenerateAccessTokenAsync(ApplicationUser user, IList<string> roles);
    string GenerateRefreshToken(out DateTime expiresAt);
}

public class JwtTokenService : IJwtTokenService
{
    private readonly JwtSettings _settings;
    private readonly UserManager<ApplicationUser> _userManager;

    public JwtTokenService(JwtSettings settings, UserManager<ApplicationUser> userManager)
    {
        _settings = settings;
        _userManager = userManager;
    }

    public async Task<(string token, DateTime expiresAt, string jti)> GenerateAccessTokenAsync(ApplicationUser user, IList<string> roles)
    {
        var jti = Guid.NewGuid().ToString();
        var expiresAt = DateTime.UtcNow.AddMinutes(_settings.AccessTokenExpirationMinutes);
        var permissions = AuthorizationCatalog.GetPermissions(roles);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new(JwtRegisteredClaimNames.Jti, jti),
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Name, user.UserName ?? user.Email ?? string.Empty),
            new("user_type", ((int)user.UserType).ToString()),
            new("first_name", user.FirstName),
            new("last_name", user.LastName),
        };

        // Include roles
        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        foreach (var permission in permissions)
        {
            claims.Add(new Claim("permission", permission));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.SecretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: _settings.Audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: expiresAt,
            signingCredentials: creds);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt, jti);
    }

    public string GenerateRefreshToken(out DateTime expiresAt)
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);

        expiresAt = DateTime.UtcNow.AddDays(_settings.RefreshTokenExpirationDays);
        return Convert.ToBase64String(randomBytes);
    }
}

public static class JwtSettingsBinder
{
    public static JwtSettings Bind(IConfiguration configuration)
    {
        var section = configuration.GetSection("JwtSettings");
        var settings = new JwtSettings();
        section.Bind(settings);
        if (string.IsNullOrWhiteSpace(settings.SecretKey) || settings.SecretKey.Length < 32)
        {
            throw new InvalidOperationException(
                "JwtSettings:SecretKey is missing or shorter than 32 characters. Configure it in appsettings.json.");
        }
        return settings;
    }
}