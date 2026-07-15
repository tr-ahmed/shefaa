using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Shefaa.Application.Common;
using Shefaa.Application.DTOs.Auth;
using Shefaa.Application.Interfaces;
using Shefaa.Domain.Identity;
using Shefaa.Infrastructure.Identity;
using Shefaa.Infrastructure.Persistence;

namespace Shefaa.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly ShefaaDbContext _db;
    private readonly IJwtTokenService _jwt;
    private readonly IEmailService _email;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager,
        SignInManager<ApplicationUser> signInManager,
        ShefaaDbContext db,
        IJwtTokenService jwt,
        IEmailService email,
        ILogger<AuthService> logger)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _signInManager = signInManager;
        _db = db;
        _jwt = jwt;
        _email = email;
        _logger = logger;
    }

    public async Task<ApiResponse<AuthResponse>> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        var existing = await _userManager.FindByEmailAsync(request.Email);
        if (existing != null)
        {
            return ApiResponse<AuthResponse>.Fail("Email already registered.", "EMAIL_TAKEN");
        }

        var requestedRoles = request.Roles
            .Where(role => !string.IsNullOrWhiteSpace(role))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (requestedRoles.Count == 0)
        {
            requestedRoles.Add(request.UserType switch
            {
                Domain.Enums.UserType.Patient => "Patient",
                Domain.Enums.UserType.Doctor => "Doctor",
                Domain.Enums.UserType.ClinicStaff => "ClinicStaff",
                Domain.Enums.UserType.ClinicAdmin => "ClinicAdmin",
                Domain.Enums.UserType.SystemAdmin => "SystemAdmin",
                _ => "Patient"
            });
        }

        foreach (var role in requestedRoles)
        {
            if (!await _roleManager.RoleExistsAsync(role))
            {
                return ApiResponse<AuthResponse>.Fail($"Role '{role}' is not configured.", "ROLE_NOT_FOUND");
            }
        }

        var primaryRole = AuthorizationCatalog.GetPrimaryRole(requestedRoles) ?? "Patient";
        var userType = primaryRole switch
        {
            "Patient" => "Patient",
            "Doctor" => "Doctor",
            "ClinicStaff" => "ClinicStaff",
            "ClinicAdmin" => "ClinicAdmin",
            "SystemAdmin" => "SystemAdmin",
            _ => "Patient"
        };

        var primaryUserType = primaryRole switch
        {
            "Doctor" => Domain.Enums.UserType.Doctor,
            "ClinicStaff" => Domain.Enums.UserType.ClinicStaff,
            "ClinicAdmin" => Domain.Enums.UserType.ClinicAdmin,
            "SystemAdmin" => Domain.Enums.UserType.SystemAdmin,
            _ => Domain.Enums.UserType.Patient
        };

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            PhoneNumber = request.PhoneNumber,
            Gender = request.Gender,
            DateOfBirth = request.DateOfBirth,
            UserType = requestedRoles.Count > 1 ? primaryUserType : request.UserType,
            EmailConfirmed = true, // dev only; require confirmation in production
            IsActive = primaryRole == "ClinicAdmin" ? false : true // ClinicAdmin requires approval
        };

        var createResult = await _userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            var errors = createResult.Errors.Select(e => e.Description).ToList();
            return ApiResponse<AuthResponse>.Fail("User creation failed.", errors);
        }

        foreach (var role in requestedRoles)
        {
            await _userManager.AddToRoleAsync(user, role);
        }

        // For Patients, create a Patient row automatically.
        if (requestedRoles.Contains("Patient", StringComparer.OrdinalIgnoreCase) || request.UserType == Domain.Enums.UserType.Patient)
        {
            _db.Patients.Add(new Domain.Patients.Patient
            {
                UserId = user.Id,
                RegistrationDate = DateTime.UtcNow,
                MedicalRecordNumber = $"MRN-{DateTime.UtcNow:yyyyMMdd}-{user.Id[..6].ToUpperInvariant()}"
            });
            await _db.SaveChangesAsync(ct);
        }

        var auth = await BuildAuthResponseAsync(user, ct);
        return ApiResponse<AuthResponse>.Ok(auth, "Registration successful.");
    }

    public async Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null || user.IsDeleted)
        {
            return ApiResponse<AuthResponse>.Fail("Invalid credentials.", "INVALID_CREDENTIALS");
        }

        // ClinicAdmin accounts require SystemAdmin approval — IsActive starts false
        if (user.UserType == Domain.Enums.UserType.ClinicAdmin && !user.IsActive)
        {
            return ApiResponse<AuthResponse>.Fail("Your account is pending approval by a system administrator.", "ACCOUNT_PENDING_APPROVAL");
        }

        if (!user.IsActive)
        {
            return ApiResponse<AuthResponse>.Fail("Invalid credentials.", "INVALID_CREDENTIALS");
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);
        if (!result.Succeeded)
        {
            return ApiResponse<AuthResponse>.Fail("Invalid credentials.", "INVALID_CREDENTIALS");
        }

        user.LastLoginAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        var auth = await BuildAuthResponseAsync(user, ct);
        return ApiResponse<AuthResponse>.Ok(auth, "Login successful.");
    }

    public async Task<ApiResponse<AuthResponse>> RefreshTokenAsync(string refreshToken, CancellationToken ct = default)
    {
        // Simple refresh-token model: any valid token returns a new access token.
        // For production: persist refresh tokens (hashed) and rotate them.
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return ApiResponse<AuthResponse>.Fail("Refresh token required.", "MISSING_TOKEN");
        }

        // We do not persist refresh tokens yet, so we cannot validate against a user.
        // For now return an explicit "not implemented" failure.
        await Task.CompletedTask;
        return ApiResponse<AuthResponse>.Fail("Refresh tokens are not yet persisted. Please log in again.", "REFRESH_NOT_SUPPORTED");
    }

    public async Task<ApiResponse> ChangePasswordAsync(string userId, ChangePasswordRequest request, CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return ApiResponse.Fail("User not found.", "NOT_FOUND");

        var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (!result.Succeeded)
        {
            return ApiResponse.Fail("Password change failed.", result.Errors.Select(e => e.Description).ToArray());
        }
        return ApiResponse.Ok("Password updated successfully.");
    }

    public async Task<ApiResponse> LogoutAsync(string userId, CancellationToken ct = default)
    {
        // JWT logout = client discards tokens. Server-side we could revoke, but for now no-op.
        await Task.CompletedTask;
        return ApiResponse.Ok("Logged out.");
    }

    public async Task<ApiResponse> ForgotPasswordAsync(ForgotPasswordRequest request, string frontendBaseUrl, CancellationToken ct = default)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            // Don't reveal that the user does not exist. Always return success.
            return ApiResponse.Ok("If the email exists, a reset link has been sent.");
        }
        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var encoded = Uri.EscapeDataString(token);
        var link = $"{frontendBaseUrl.TrimEnd('/')}/reset-password?email={Uri.EscapeDataString(user.Email!)}&token={encoded}";
        await _email.SendPasswordResetAsync(user.Email!, link, ct);
        _logger.LogInformation("Password reset email sent to {Email}", user.Email);
        return ApiResponse.Ok("If the email exists, a reset link has been sent.");
    }

    public async Task<ApiResponse> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken ct = default)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null) return ApiResponse.Fail("Invalid reset request.", "INVALID_TOKEN");

        var result = await _userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);
        if (!result.Succeeded)
            return ApiResponse.Fail("Password reset failed.", result.Errors.Select(e => e.Description).ToArray());
        return ApiResponse.Ok("Password has been reset. You can now log in.");
    }

    public async Task<UserDto?> GetCurrentUserAsync(string userId, CancellationToken ct = default)
    {
        var user = await _userManager.Users
            .Where(u => u.Id == userId && !u.IsDeleted)
            .FirstOrDefaultAsync(ct);
        if (user == null) return null;
        var roles = await _userManager.GetRolesAsync(user);
        return user.ToDto(roles);
    }

    public async Task<IReadOnlyList<UserDto>> GetPendingClinicAdminsAsync(CancellationToken ct = default)
    {
        var users = await _userManager.Users
            .Where(u => u.UserType == Domain.Enums.UserType.ClinicAdmin && !u.IsActive && !u.IsDeleted)
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync(ct);

        var result = new List<UserDto>();
        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            result.Add(user.ToDto(roles));
        }
        return result;
    }

    public async Task<ApiResponse> ApproveClinicAdminAsync(string userId, CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return ApiResponse.Fail("User not found.", "NOT_FOUND");
        if (user.UserType != Domain.Enums.UserType.ClinicAdmin)
            return ApiResponse.Fail("User is not a ClinicAdmin.", "INVALID_USER_TYPE");
        if (user.IsActive)
            return ApiResponse.Fail("User is already approved.", "ALREADY_APPROVED");

        user.IsActive = true;
        await _userManager.UpdateAsync(user);
        return ApiResponse.Ok("Clinic admin approved.");
    }

    public async Task<ApiResponse> RejectClinicAdminAsync(string userId, CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return ApiResponse.Fail("User not found.", "NOT_FOUND");
        if (user.UserType != Domain.Enums.UserType.ClinicAdmin)
            return ApiResponse.Fail("User is not a ClinicAdmin.", "INVALID_USER_TYPE");

        user.IsDeleted = true;
        user.DeletedAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);
        return ApiResponse.Ok("Clinic admin registration rejected.");
    }

    private async Task<AuthResponse> BuildAuthResponseAsync(ApplicationUser user, CancellationToken ct)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var permissions = AuthorizationCatalog.GetPermissions(roles);
        var (token, expiresAt, _) = await _jwt.GenerateAccessTokenAsync(user, roles);
        var refresh = _jwt.GenerateRefreshToken(out var refreshExpiresAt);

        return new AuthResponse
        {
            AccessToken = token,
            RefreshToken = refresh,
            AccessTokenExpiresAt = expiresAt,
            RefreshTokenExpiresAt = refreshExpiresAt,
            User = user.ToDto(roles)
        };
    }

    public async Task<PagedResult<UserDto>> GetUsersAsync(string? search, string? role, int page, int pageSize, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _userManager.Users.Where(u => !u.IsDeleted).AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(u =>
                (u.FirstName + " " + u.LastName).ToLower().Contains(term) ||
                (u.Email != null && u.Email.ToLower().Contains(term)) ||
                (u.PhoneNumber != null && u.PhoneNumber.Contains(term)));
        }

        if (!string.IsNullOrWhiteSpace(role))
        {
            query = query.Where(u => _db.UserRoles.Any(ur => ur.UserId == u.Id && _db.Roles.Any(r => r.Id == ur.RoleId && r.Name == role)));
        }

        var total = await query.CountAsync(ct);
        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var items = new List<UserDto>();
        foreach (var u in users)
        {
            var roles = await _userManager.GetRolesAsync(u);
            items.Add(u.ToDto(roles));
        }

        return new PagedResult<UserDto> { Items = items, TotalCount = total, Page = page, PageSize = pageSize };
    }

    public async Task<ApiResponse> ToggleUserActiveAsync(string userId, CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return ApiResponse.Fail("User not found.", "NOT_FOUND");

        user.IsActive = !user.IsActive;
        user.UpdatedAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);
        return ApiResponse.Ok($"User {(user.IsActive ? "activated" : "deactivated")}.");
    }

    public async Task<ApiResponse> DeleteUserAsync(string userId, CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return ApiResponse.Fail("User not found.", "NOT_FOUND");

        user.IsDeleted = true;
        user.DeletedAt = DateTime.UtcNow;
        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);
        return ApiResponse.Ok("User deleted.");
    }

    public async Task<ApiResponse> AdminResetPasswordAsync(string userId, string newPassword, CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return ApiResponse.Fail("User not found.", "NOT_FOUND");

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var result = await _userManager.ResetPasswordAsync(user, token, newPassword);
        if (!result.Succeeded)
            return ApiResponse.Fail("Password reset failed.", result.Errors.Select(e => e.Description).ToArray());
        return ApiResponse.Ok("Password has been reset.");
    }

    public async Task<ApiResponse> UpdateUserRoleAsync(string userId, string newRole, CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return ApiResponse.Fail("User not found.", "NOT_FOUND");

        var currentRoles = await _userManager.GetRolesAsync(user);
        if (currentRoles.Contains(newRole))
            return ApiResponse.Ok("User already has this role.");

        foreach (var r in currentRoles)
            await _userManager.RemoveFromRoleAsync(user, r);

        await _userManager.AddToRoleAsync(user, newRole);
        user.UserType = newRole switch
        {
            "SystemAdmin" => Domain.Enums.UserType.SystemAdmin,
            "ClinicAdmin" => Domain.Enums.UserType.ClinicAdmin,
            "Doctor" => Domain.Enums.UserType.Doctor,
            "Patient" => Domain.Enums.UserType.Patient,
            _ => user.UserType
        };
        user.UpdatedAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);
        return ApiResponse.Ok($"Role changed to {newRole}.");
    }
}