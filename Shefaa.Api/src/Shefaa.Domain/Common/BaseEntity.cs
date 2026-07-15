namespace Shefaa.Domain.Common;

/// <summary>
/// Base class for all persisted entities. Provides a primary key and standard audit fields.
/// </summary>
public abstract class BaseEntity : IBaseEntity
{
    public int Id { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string? CreatedBy { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public string? UpdatedBy { get; set; }

    public bool IsDeleted { get; set; }

    public DateTime? DeletedAt { get; set; }

    public string? DeletedBy { get; set; }
}