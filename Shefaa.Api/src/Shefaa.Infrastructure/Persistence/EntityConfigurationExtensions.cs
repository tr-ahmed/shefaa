using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Shefaa.Domain.Common;

namespace Shefaa.Infrastructure.Persistence;

/// <summary>
/// Helper extensions for entity configurations.
/// </summary>
public static class EntityConfigurationExtensions
{
    /// <summary>
    /// Applies a soft-delete query filter on the entity (where <c>IsDeleted == false</c>).
    /// Must be invoked from each <see cref="IEntityTypeConfiguration{TEntity}"/> so the filter
    /// is included in the EF Core model snapshot.
    /// </summary>
    public static void ApplySoftDeleteFilter<TEntity>(this EntityTypeBuilder<TEntity> builder)
        where TEntity : class, IBaseEntity
    {
        builder.HasQueryFilter(e => !e.IsDeleted);
    }
}