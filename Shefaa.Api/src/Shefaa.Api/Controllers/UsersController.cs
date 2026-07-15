using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shefaa.Application.DTOs.Auth;
using Shefaa.Application.Interfaces;

namespace Shefaa.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "SystemAdmin")]
public class UsersController : ControllerBase
{
    private readonly IAuthService _auth;

    public UsersController(IAuthService auth) => _auth = auth;

    [HttpGet]
    public async Task<IActionResult> GetUsers(
        [FromQuery] string? search,
        [FromQuery] string? role,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
    {
        var result = await _auth.GetUsersAsync(search, role, page, pageSize, ct);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(string id, CancellationToken ct)
    {
        var dto = await _auth.GetCurrentUserAsync(id, ct);
        return dto == null ? NotFound() : Ok(dto);
    }

    [HttpPost("{id}/toggle-active")]
    public async Task<IActionResult> ToggleActive(string id, CancellationToken ct)
    {
        var result = await _auth.ToggleUserActiveAsync(id, ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("{id}/reset-password")]
    public async Task<IActionResult> ResetPassword(string id, [FromBody] AdminResetPasswordRequest request, CancellationToken ct)
    {
        var result = await _auth.AdminResetPasswordAsync(id, request.NewPassword, ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("{id}/role")]
    public async Task<IActionResult> UpdateRole(string id, [FromBody] UpdateRoleRequest request, CancellationToken ct)
    {
        var result = await _auth.UpdateUserRoleAsync(id, request.Role, ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        var result = await _auth.DeleteUserAsync(id, ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }
}

public class AdminResetPasswordRequest
{
    public string NewPassword { get; set; } = string.Empty;
}

public class UpdateRoleRequest
{
    public string Role { get; set; } = string.Empty;
}
