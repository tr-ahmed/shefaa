using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shefaa.Application.Interfaces;

namespace Shefaa.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _svc;

    public NotificationsController(INotificationService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> GetPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] bool unreadOnly = false,
        CancellationToken ct = default)
    {
        var userId = User.GetUserId();
        if (userId == null) return Unauthorized();
        var result = await _svc.GetForUserAsync(userId, page, pageSize, unreadOnly, ct);
        return Ok(result);
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount(CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (userId == null) return Unauthorized();
        var count = await _svc.GetUnreadCountAsync(userId, ct);
        return Ok(new { count });
    }

    [HttpPost("{id:int}/read")]
    public async Task<IActionResult> MarkAsRead(int id, CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (userId == null) return Unauthorized();
        var result = await _svc.MarkAsReadAsync(id, userId, ct);
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllAsRead(CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (userId == null) return Unauthorized();
        var result = await _svc.MarkAllAsReadAsync(userId, ct);
        return Ok(result);
    }
}