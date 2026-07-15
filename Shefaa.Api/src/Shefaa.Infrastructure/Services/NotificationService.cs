using Microsoft.EntityFrameworkCore;
using Shefaa.Application.Common;
using Shefaa.Application.DTOs.Notifications;
using Shefaa.Application.Interfaces;
using Shefaa.Infrastructure.Persistence;

namespace Shefaa.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly ShefaaDbContext _db;

    public NotificationService(ShefaaDbContext db) => _db = db;

    public async Task<PagedResult<NotificationDto>> GetForUserAsync(string userId, int page, int pageSize, bool unreadOnly, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _db.Notifications.AsNoTracking().Where(n => n.UserId == userId);
        if (unreadOnly) query = query.Where(n => !n.IsRead);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                Type = n.Type,
                Title = n.Title,
                Message = n.Message,
                ActionUrl = n.ActionUrl,
                AppointmentId = n.AppointmentId,
                MedicalRecordId = n.MedicalRecordId,
                IsRead = n.IsRead,
                ReadAt = n.ReadAt,
                SentAt = n.SentAt,
                CreatedAt = n.CreatedAt
            })
            .ToListAsync(ct);

        return new PagedResult<NotificationDto> { Items = items, TotalCount = total, Page = page, PageSize = pageSize };
    }

    public async Task<ApiResponse> MarkAsReadAsync(int id, string currentUserId, CancellationToken ct = default)
    {
        var n = await _db.Notifications.FirstOrDefaultAsync(x => x.Id == id && x.UserId == currentUserId, ct);
        if (n == null) return ApiResponse.Fail("Notification not found.", "NOT_FOUND");
        if (!n.IsRead)
        {
            n.IsRead = true;
            n.ReadAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);
        }
        return ApiResponse.Ok("Notification marked as read.");
    }

    public async Task<ApiResponse> MarkAllAsReadAsync(string currentUserId, CancellationToken ct = default)
    {
        var unread = await _db.Notifications.Where(n => n.UserId == currentUserId && !n.IsRead).ToListAsync(ct);
        var now = DateTime.UtcNow;
        foreach (var n in unread)
        {
            n.IsRead = true;
            n.ReadAt = now;
        }
        await _db.SaveChangesAsync(ct);
        return ApiResponse.Ok($"{unread.Count} notifications marked as read.");
    }

    public async Task<int> GetUnreadCountAsync(string userId, CancellationToken ct = default)
        => await _db.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead, ct);
}