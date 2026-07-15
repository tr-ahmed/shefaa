using Shefaa.Application.Common;
using Shefaa.Application.DTOs.MedicalRecords;

namespace Shefaa.Application.Interfaces;

public interface IAttachmentService
{
    Task<ApiResponse<AttachmentDto>> UploadAsync(int medicalRecordId, Stream fileStream, string fileName, string contentType, long fileSize, string? description, string currentUserId, CancellationToken ct = default);
    Task<ApiResponse> DeleteAsync(int attachmentId, string currentUserId, CancellationToken ct = default);
    Task<(byte[] Bytes, string ContentType, string FileName)?> DownloadAsync(int attachmentId, CancellationToken ct = default);
}