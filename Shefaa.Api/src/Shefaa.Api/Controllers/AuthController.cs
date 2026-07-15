using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Shefaa.Application.DTOs.Auth;
using Shefaa.Application.Interfaces;

namespace Shefaa.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;
    private readonly IConfiguration _config;

    public AuthController(IAuthService auth, IConfiguration config)
    {
        _auth = auth;
        _config = config;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken ct)
    {
        var result = await _auth.RegisterAsync(request, ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var result = await _auth.LoginAsync(request, ct);
        return result.Success ? Ok(result) : Unauthorized(result);
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request, CancellationToken ct)
    {
        var result = await _auth.RefreshTokenAsync(request.RefreshToken, ct);
        return result.Success ? Ok(result) : Unauthorized(result);
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request, CancellationToken ct)
    {
        var frontend = _config["App:FrontendBaseUrl"] ?? "http://localhost:4200";
        var result = await _auth.ForgotPasswordAsync(request, frontend, ct);
        // Always return 200 to avoid email enumeration.
        return Ok(result);
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request, CancellationToken ct)
    {
        var result = await _auth.ResetPasswordAsync(request, ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me(CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (userId == null) return Unauthorized();
        var dto = await _auth.GetCurrentUserAsync(userId, ct);
        return dto == null ? NotFound() : Ok(dto);
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (userId == null) return Unauthorized();
        var result = await _auth.ChangePasswordAsync(userId, request, ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout(CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (userId == null) return Unauthorized();
        var result = await _auth.LogoutAsync(userId, ct);
        return Ok(result);
    }

    [HttpGet("pending-clinic-admins")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> GetPendingClinicAdmins(CancellationToken ct)
    {
        var list = await _auth.GetPendingClinicAdminsAsync(ct);
        return Ok(list);
    }

    [HttpPost("approve-clinic-admin/{userId}")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> ApproveClinicAdmin(string userId, CancellationToken ct)
    {
        var result = await _auth.ApproveClinicAdminAsync(userId, ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("reject-clinic-admin/{userId}")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> RejectClinicAdmin(string userId, CancellationToken ct)
    {
        var result = await _auth.RejectClinicAdminAsync(userId, ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }
}