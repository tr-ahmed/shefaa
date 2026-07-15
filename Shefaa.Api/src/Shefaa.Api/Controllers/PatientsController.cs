using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shefaa.Application.DTOs.Patients;
using Shefaa.Application.Interfaces;

namespace Shefaa.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PatientsController : ControllerBase
{
    private readonly IPatientService _svc;

    public PatientsController(IPatientService svc) => _svc = svc;

    [HttpGet]
    [Authorize(Roles = "SystemAdmin,ClinicAdmin,Doctor,ClinicStaff")]
    public async Task<IActionResult> Search([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 50, CancellationToken ct = default)
    {
        var result = await _svc.SearchAsync(search, page, pageSize, ct);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "SystemAdmin,ClinicAdmin,Doctor,ClinicStaff")]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var dto = await _svc.GetByIdAsync(id, ct);
        return dto == null ? NotFound() : Ok(dto);
    }

    [HttpGet("me")]
    [Authorize(Roles = "Patient")]
    public async Task<IActionResult> GetMe(CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (userId == null) return Unauthorized();
        var dto = await _svc.GetByUserIdAsync(userId, ct);
        return dto == null ? NotFound() : Ok(dto);
    }

    [HttpPost]
    [Authorize(Roles = "SystemAdmin,ClinicAdmin,ClinicStaff")]
    public async Task<IActionResult> Create([FromBody] CreatePatientRequest request, CancellationToken ct)
    {
        var userId = User.GetUserId() ?? string.Empty;
        var result = await _svc.CreateAsync(request, userId, ct);
        return result.Success ? CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result) : BadRequest(result);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "SystemAdmin,ClinicAdmin,Patient")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePatientRequest request, CancellationToken ct)
    {
        // Patients can only update their own record
        if (User.IsInRole("Patient"))
        {
            var userId = User.GetUserId();
            if (userId == null) return Unauthorized();
            var existing = await _svc.GetByUserIdAsync(userId, ct);
            if (existing == null || existing.Id != id)
                return Forbid("You can only update your own profile.");
        }

        var result = await _svc.UpdateAsync(id, request, ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet("{id:int}/medical-records")]
    [Authorize(Roles = "SystemAdmin,ClinicAdmin,Doctor,ClinicStaff,Patient")]
    public async Task<IActionResult> GetMedicalRecords(int id, CancellationToken ct)
    {
        var list = await _svc.GetMedicalRecordsAsync(id, ct);
        return Ok(list);
    }
}