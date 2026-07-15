namespace Shefaa.Domain.Common;

/// <summary>
/// Marker interface that exposes audit fields common to all persisted entities.
/// Implemented by <see cref="BaseEntity"/> and by classes that inherit from a third-party
/// base class (e.g. <c>IdentityUser</c>) but still want to participate in soft-delete filtering.
/// </summary>
public interface IBaseEntity
{
    DateTime CreatedAt { get; set; }
    string? CreatedBy { get; set; }
    DateTime? UpdatedAt { get; set; }
    string? UpdatedBy { get; set; }
    bool IsDeleted { get; set; }
    DateTime? DeletedAt { get; set; }
    string? DeletedBy { get; set; }
}