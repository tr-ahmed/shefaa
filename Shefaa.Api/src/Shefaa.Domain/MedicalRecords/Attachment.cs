using Shefaa.Domain.Common;

namespace Shefaa.Domain.MedicalRecords;

/// <summary>
/// File attachment (lab result, x-ray, document) linked to a medical record.
/// </summary>
public class Attachment : BaseEntity
{
    public int MedicalRecordId { get; set; }
    public MedicalRecord? MedicalRecord { get; set; }

    public string FileName { get; set; } = string.Empty;

    public string FileUrl { get; set; } = string.Empty;

    public string ContentType { get; set; } = string.Empty;

    public long FileSize { get; set; }

    public string? Description { get; set; }
}