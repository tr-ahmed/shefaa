using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shefaa.Application.DTOs.Clinics;
using Shefaa.Application.Interfaces;

namespace Shefaa.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClinicsController : ControllerBase
{
    private readonly IClinicService _svc;

    public ClinicsController(IClinicService svc) => _svc = svc;

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? search = null,
        [FromQuery] bool activeOnly = true,
        [FromQuery] string? city = null,
        CancellationToken ct = default)
    {
        var result = await _svc.GetPagedAsync(page, pageSize, search, activeOnly, city, ct);
        return Ok(result);
    }

    [HttpGet("my")]
    [Authorize(Roles = "ClinicAdmin")]
    public async Task<IActionResult> GetMyClinic(CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (userId == null) return Unauthorized();
        var dto = await _svc.GetByOwnerUserIdAsync(userId, ct);
        return dto == null ? NotFound() : Ok(dto);
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
    public async Task<IActionResult> Create([FromBody] CreateClinicRequest request, CancellationToken ct)
    {
        var userId = User.GetUserId() ?? string.Empty;
        var result = await _svc.CreateAsync(request, userId, ct);
        return result.Success ? CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result) : BadRequest(result);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "SystemAdmin,ClinicAdmin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateClinicRequest request, CancellationToken ct)
    {
        var result = await _svc.UpdateAsync(id, request, ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "SystemAdmin,ClinicAdmin")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var result = await _svc.DeleteAsync(id, ct);
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpGet("{id:int}/doctors")]
    [AllowAnonymous]
    public async Task<IActionResult> GetClinicDoctors(int id, CancellationToken ct)
    {
        var list = await _svc.GetClinicDoctorsAsync(id, ct);
        return Ok(list);
    }

    [HttpGet("{id:int}/staff")]
    [Authorize(Roles = "SystemAdmin,ClinicAdmin")]
    public async Task<IActionResult> GetClinicStaff(int id, CancellationToken ct)
    {
        var list = await _svc.GetClinicStaffAsync(id, ct);
        return Ok(list);
    }

    [HttpPost("{id:int}/doctors")]
    [Authorize(Roles = "SystemAdmin,ClinicAdmin,ClinicStaff")]
    public async Task<IActionResult> AddDoctor(int id, [FromBody] AddDoctorToClinicRequest request, CancellationToken ct)
    {
        var result = await _svc.AddDoctorAsync(id, request, ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id:int}/doctors/{doctorId:int}")]
    [Authorize(Roles = "SystemAdmin,ClinicAdmin,ClinicStaff")]
    public async Task<IActionResult> RemoveDoctor(int id, int doctorId, CancellationToken ct)
    {
        var result = await _svc.RemoveDoctorAsync(id, doctorId, ct);
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpPost("{id:int}/staff")]
    [Authorize(Roles = "SystemAdmin,ClinicAdmin")]
    public async Task<IActionResult> AddStaff(int id, [FromBody] CreateClinicStaffRequest request, CancellationToken ct)
    {
        var userId = User.GetUserId() ?? string.Empty;
        var result = await _svc.AddStaffAsync(id, request, userId, ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id:int}/staff/{staffId:int}")]
    [Authorize(Roles = "SystemAdmin,ClinicAdmin")]
    public async Task<IActionResult> RemoveStaff(int id, int staffId, CancellationToken ct)
    {
        var result = await _svc.RemoveStaffAsync(id, staffId, ct);
        return result.Success ? Ok(result) : NotFound(result);
    }
}