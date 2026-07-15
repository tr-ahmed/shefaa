using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shefaa.Application.DTOs.Specialties;
using Shefaa.Application.Interfaces;

namespace Shefaa.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SpecialtiesController : ControllerBase
{
    private readonly ISpecialtyService _svc;

    public SpecialtiesController(ISpecialtyService svc) => _svc = svc;

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? search = null,
        [FromQuery] bool activeOnly = true,
        CancellationToken ct = default)
    {
        var result = await _svc.GetPagedAsync(page, pageSize, search, activeOnly, ct);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var dto = await _svc.GetByIdAsync(id, ct);
        return dto == null ? NotFound() : Ok(dto);
    }

    [HttpPost]
    [Authorize(Roles = "SystemAdmin,ClinicAdmin")]
    public async Task<IActionResult> Create([FromBody] CreateSpecialtyRequest request, CancellationToken ct)
    {
        var result = await _svc.CreateAsync(request, ct);
        return result.Success ? CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result) : BadRequest(result);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "SystemAdmin,ClinicAdmin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateSpecialtyRequest request, CancellationToken ct)
    {
        var result = await _svc.UpdateAsync(id, request, ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var result = await _svc.DeleteAsync(id, ct);
        return result.Success ? Ok(result) : NotFound(result);
    }
}