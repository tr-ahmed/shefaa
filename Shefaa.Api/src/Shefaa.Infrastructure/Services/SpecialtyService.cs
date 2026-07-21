using Microsoft.EntityFrameworkCore;
using Shefaa.Application.Common;
using Shefaa.Application.DTOs.Specialties;
using Shefaa.Application.Interfaces;
using Shefaa.Domain.Specialties;
using Shefaa.Infrastructure.Persistence;

namespace Shefaa.Infrastructure.Services;

public class SpecialtyService : ISpecialtyService
{
    private readonly ShefaaDbContext _db;

    public SpecialtyService(ShefaaDbContext db) => _db = db;

    public async Task<PagedResult<SpecialtyDto>> GetPagedAsync(int page, int pageSize, string? search, bool activeOnly, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        var query = _db.Specialties.AsNoTracking().AsQueryable();
        if (activeOnly) query = query.Where(s => s.IsActive);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(s => s.Name.ToLower().Contains(term)
                || (s.NameAr != null && s.NameAr.ToLower().Contains(term)));
        }

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderBy(s => s.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new SpecialtyDto
            {
                Id = s.Id,
                Name = s.Name,
                NameAr = s.NameAr,
                Description = s.Description,
                IconUrl = s.IconUrl,
                IsActive = s.IsActive,
                DoctorsCount = s.Doctors.Count(d => !d.IsDeleted)
            })
            .ToListAsync(ct);

        return new PagedResult<SpecialtyDto>
        {
            Items = items,
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<SpecialtyDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return await _db.Specialties.AsNoTracking()
            .Where(s => s.Id == id)
            .Select(s => new SpecialtyDto
            {
                Id = s.Id,
                Name = s.Name,
                NameAr = s.NameAr,
                Description = s.Description,
                IconUrl = s.IconUrl,
                IsActive = s.IsActive,
                DoctorsCount = s.Doctors.Count(d => !d.IsDeleted)
            })
            .FirstOrDefaultAsync(ct);
    }

    public async Task<ApiResponse<SpecialtyDto>> CreateAsync(CreateSpecialtyRequest request, CancellationToken ct = default)
    {
        var exists = await _db.Specialties.AnyAsync(s => s.Name == request.Name, ct);
        if (exists) return ApiResponse<SpecialtyDto>.Fail("A specialty with this name already exists.", "DUPLICATE");

        var entity = new Specialty
        {
            Name = request.Name.Trim(),
            NameAr = request.NameAr?.Trim(),
            Description = request.Description,
            IconUrl = request.IconUrl,
            IsActive = request.IsActive
        };
        _db.Specialties.Add(entity);
        await _db.SaveChangesAsync(ct);

        var dto = await GetByIdAsync(entity.Id, ct);
        return ApiResponse<SpecialtyDto>.Ok(dto!, "Specialty created.");
    }

    public async Task<ApiResponse<SpecialtyDto>> UpdateAsync(int id, UpdateSpecialtyRequest request, CancellationToken ct = default)
    {
        var entity = await _db.Specialties.FirstOrDefaultAsync(s => s.Id == id, ct);
        if (entity == null) return ApiResponse<SpecialtyDto>.Fail("Specialty not found.", "NOT_FOUND");

        var dup = await _db.Specialties.AnyAsync(s => s.Id != id && s.Name == request.Name, ct);
        if (dup) return ApiResponse<SpecialtyDto>.Fail("Another specialty with this name already exists.", "DUPLICATE");

        entity.Name = request.Name.Trim();
        entity.NameAr = request.NameAr?.Trim();
        entity.Description = request.Description;
        entity.IconUrl = request.IconUrl;
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        var dto = await GetByIdAsync(id, ct);
        return ApiResponse<SpecialtyDto>.Ok(dto!, "Specialty updated.");
    }

    public async Task<ApiResponse> DeleteAsync(int id, CancellationToken ct = default)
    {
        var entity = await _db.Specialties.FirstOrDefaultAsync(s => s.Id == id, ct);
        if (entity == null) return ApiResponse.Fail("Specialty not found.", "NOT_FOUND");

        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return ApiResponse.Ok("Specialty deleted.");
    }
}