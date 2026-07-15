using Shefaa.Application.Common;
using Shefaa.Application.DTOs.Auth;

namespace Shefaa.Application.Interfaces;

public interface IAuthService
{
    Task<ApiResponse<AuthResponse>> RegisterAsync(RegisterRequest request, CancellationToken ct = default);
    Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request, CancellationToken ct = default);
    Task<ApiResponse<AuthResponse>> RefreshTokenAsync(string refreshToken, CancellationToken ct = default);
    Task<ApiResponse> ChangePasswordAsync(string userId, ChangePasswordRequest request, CancellationToken ct = default);
    Task<ApiResponse> ForgotPasswordAsync(ForgotPasswordRequest request, string frontendBaseUrl, CancellationToken ct = default);
    Task<ApiResponse> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken ct = default);
    Task<ApiResponse> LogoutAsync(string userId, CancellationToken ct = default);
    Task<UserDto?> GetCurrentUserAsync(string userId, CancellationToken ct = default);
    Task<IReadOnlyList<UserDto>> GetPendingClinicAdminsAsync(CancellationToken ct = default);
    Task<ApiResponse> ApproveClinicAdminAsync(string userId, CancellationToken ct = default);
    Task<ApiResponse> RejectClinicAdminAsync(string userId, CancellationToken ct = default);

    // User management
    Task<PagedResult<UserDto>> GetUsersAsync(string? search, string? role, int page, int pageSize, CancellationToken ct = default);
    Task<ApiResponse> ToggleUserActiveAsync(string userId, CancellationToken ct = default);
    Task<ApiResponse> DeleteUserAsync(string userId, CancellationToken ct = default);
    Task<ApiResponse> AdminResetPasswordAsync(string userId, string newPassword, CancellationToken ct = default);
    Task<ApiResponse> UpdateUserRoleAsync(string userId, string newRole, CancellationToken ct = default);
}