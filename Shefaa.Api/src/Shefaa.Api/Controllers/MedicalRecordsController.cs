using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shefaa.Application.DTOs.MedicalRecords;
using Shefaa.Application.Interfaces;

namespace Shefaa.Api.Controllers;

[ApiController]
[Route("api/medical-records")]
[Authorize]
public class MedicalRecordsController : ControllerBase
{
    private readonly IMedicalRecordService _svc;

    public MedicalRecordsController(IMedicalRecordService svc) => _svc = svc;

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var dto = await _svc.GetByIdAsync(id, ct);
        return dto == null ? NotFound() : Ok(dto);
    }

    [HttpGet("doctor/{doctorId:int}")]
    [Authorize(Roles = "Doctor,SystemAdmin,ClinicAdmin")]
    public async Task<IActionResult> GetByDoctorId(int doctorId, CancellationToken ct)
    {
        var list = await _svc.GetByDoctorIdAsync(doctorId, ct);
        return Ok(list);
    }

    [HttpPost]
    [Authorize(Roles = "Doctor")]
    public async Task<IActionResult> Create([FromBody] CreateMedicalRecordRequest request, CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (userId == null) return Unauthorized();
        var result = await _svc.CreateAsync(request, userId, ct);
        return result.Success ? CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result) : BadRequest(result);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Doctor")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateMedicalRecordRequest request, CancellationToken ct)
    {
        var result = await _svc.UpdateAsync(id, request, ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }
}