using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Shefaa.Application.Common;
using Shefaa.Application.DTOs.MedicalRecords;
using Shefaa.Application.Interfaces;
using Shefaa.Domain.MedicalRecords;
using Shefaa.Infrastructure.Persistence;

namespace Shefaa.Infrastructure.Services;

public class AttachmentService : IAttachmentService
{
    private readonly ShefaaDbContext _db;
    private readonly IWebHostEnvironment _env;
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".pdf", ".jpg", ".jpeg", ".png", ".gif", ".webp", ".doc", ".docx", ".txt", ".csv"
    };
    private const long MaxFileSize = 10 * 1024 * 1024;

    public AttachmentService(ShefaaDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    public async Task<ApiResponse<AttachmentDto>> UploadAsync(int medicalRecordId, Stream fileStream, string fileName, string contentType, long fileSize, string? description, string currentUserId, CancellationToken ct = default)
    {
        if (fileStream == null || fileSize == 0)
            return ApiResponse<AttachmentDto>.Fail("No file uploaded.", "EMPTY_FILE");

        if (fileSize > MaxFileSize)
            return ApiResponse<AttachmentDto>.Fail($"File exceeds max size of {MaxFileSize / 1024 / 1024} MB.", "FILE_TOO_LARGE");

        var ext = Path.GetExtension(fileName);
        if (!AllowedExtensions.Contains(ext))
            return ApiResponse<AttachmentDto>.Fail($"Extension '{ext}' is not allowed.", "INVALID_EXTENSION");

        var record = await _db.MedicalRecords
            .Include(r => r.Doctor)
            .FirstOrDefaultAsync(r => r.Id == medicalRecordId, ct);
        if (record == null)
            return ApiResponse<AttachmentDto>.Fail("Medical record not found.", "NOT_FOUND");

        if (record.Doctor!.UserId != currentUserId)
            return ApiResponse<AttachmentDto>.Fail("Only the record's doctor can upload attachments.", "FORBIDDEN");

        var uploadsRoot = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "attachments");
        Directory.CreateDirectory(uploadsRoot);
        var storedFileName = $"{Guid.NewGuid():N}{ext}";
        var fullPath = Path.Combine(uploadsRoot, storedFileName);

        await using (var stream = new FileStream(fullPath, FileMode.Create))
        {
            await fileStream.CopyToAsync(stream, ct);
        }

        var attachment = new Attachment
        {
            MedicalRecordId = medicalRecordId,
            FileName = fileName,
            FileUrl = $"/uploads/attachments/{storedFileName}",
            ContentType = contentType,
            FileSize = fileSize,
            Description = description
        };
        _db.Attachments.Add(attachment);
        await _db.SaveChangesAsync(ct);

        var dto = new AttachmentDto
        {
            Id = attachment.Id,
            FileName = attachment.FileName,
            FileUrl = attachment.FileUrl,
            ContentType = attachment.ContentType,
            FileSize = attachment.FileSize,
            Description = attachment.Description
        };
        return ApiResponse<AttachmentDto>.Ok(dto, "File uploaded.");
    }

    public async Task<ApiResponse> DeleteAsync(int attachmentId, string currentUserId, CancellationToken ct = default)
    {
        var a = await _db.Attachments
            .Include(x => x.MedicalRecord).ThenInclude(r => r!.Doctor)
            .FirstOrDefaultAsync(x => x.Id == attachmentId, ct);
        if (a == null) return ApiResponse.Fail("Attachment not found.", "NOT_FOUND");
        if (a.MedicalRecord!.Doctor!.UserId != currentUserId)
            return ApiResponse.Fail("Forbidden.", "FORBIDDEN");

        try
        {
            var physicalPath = Path.Combine(_env.WebRootPath ?? "wwwroot", a.FileUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
            if (File.Exists(physicalPath)) File.Delete(physicalPath);
        }
        catch { }

        a.IsDeleted = true;
        a.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return ApiResponse.Ok("Attachment deleted.");
    }

    public async Task<(byte[] Bytes, string ContentType, string FileName)?> DownloadAsync(int attachmentId, CancellationToken ct = default)
    {
        var a = await _db.Attachments.FirstOrDefaultAsync(x => x.Id == attachmentId, ct);
        if (a == null) return null;
        var physicalPath = Path.Combine(_env.WebRootPath ?? "wwwroot", a.FileUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
        if (!File.Exists(physicalPath)) return null;
        var bytes = await File.ReadAllBytesAsync(physicalPath, ct);
        return (bytes, a.ContentType, a.FileName);
    }
}