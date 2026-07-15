using Shefaa.Domain.Common;

namespace Shefaa.Domain.MedicalRecords;

/// <summary>
/// A single prescribed medication attached to a <see cref="MedicalRecord"/>.
/// </summary>
public class Prescription : BaseEntity
{
    public int MedicalRecordId { get; set; }
    public MedicalRecord? MedicalRecord { get; set; }

    public string MedicationName { get; set; } = string.Empty;

    public string? Dosage { get; set; }

    public string? Frequency { get; set; }

    public string? Duration { get; set; }

    public string? Route { get; set; }

    public string? Instructions { get; set; }

    public int? Quantity { get; set; }

    public bool RefillAllowed { get; set; }
}