using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shefaa.Application.DTOs.Clinics;
using Shefaa.Application.DTOs.Doctors;
using Shefaa.Application.DTOs.Schedules;
using Shefaa.Application.Interfaces;

namespace Shefaa.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DoctorsController : ControllerBase
{
    private readonly IDoctorService _svc;

    public DoctorsController(IDoctorService svc) => _svc = svc;

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] int? specialtyId = null,
        [FromQuery] string? search = null,
        [FromQuery] bool availableOnly = true,
        CancellationToken ct = default)
    {
        var result = await _svc.GetPagedAsync(page, pageSize, specialtyId, search, availableOnly, ct);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var dto = await _svc.GetByIdAsync(id, ct);
        return dto == null ? NotFound() : Ok(dto);
    }

    [HttpGet("me")]
    [Authorize(Policy = "permission:doctor.dashboard.view")]
    public async Task<IActionResult> GetMe(CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (userId == null) return Unauthorized();
        var dto = await _svc.GetByUserIdAsync(userId, ct);
        return dto == null ? NotFound() : Ok(dto);
    }

    [HttpGet("me/patients")]
    [Authorize(Policy = "permission:doctor.dashboard.view")]
    public async Task<IActionResult> GetMyPatients([FromQuery] string? search = null, CancellationToken ct = default)
    {
        var userId = User.GetUserId();
        if (userId == null) return Unauthorized();
        var doctor = await _svc.GetByUserIdAsync(userId, ct);
        if (doctor == null) return NotFound();
        var patients = await _svc.GetMyPatientsAsync(doctor.Id, search, ct);
        return Ok(patients);
    }

    [HttpPost]
    [Authorize(Policy = "permission:admin.doctors.manage")]
    public async Task<IActionResult> Create([FromBody] CreateDoctorRequest request, CancellationToken ct)
    {
        var userId = User.GetUserId() ?? string.Empty;
        var result = await _svc.CreateAsync(request, userId, ct);
        return result.Success ? CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result) : BadRequest(result);
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = "permission:admin.doctors.manage")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateDoctorRequest request, CancellationToken ct)
    {
        var result = await _svc.UpdateAsync(id, request, ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = "permission:admin.doctors.manage")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var result = await _svc.DeleteAsync(id, ct);
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpGet("{id:int}/schedules")]
    [AllowAnonymous]
    public async Task<IActionResult> GetSchedules(int id, CancellationToken ct)
    {
        var list = await _svc.GetSchedulesAsync(id, ct);
        return Ok(list);
    }

    [HttpGet("{id:int}/clinics")]
    [AllowAnonymous]
    public async Task<IActionResult> GetClinics(int id, CancellationToken ct)
    {
        var list = await _svc.GetClinicsAsync(id, ct);
        return Ok(list);
    }

    [HttpPost("{id:int}/schedules")]
    [Authorize(Policy = "permission:doctor.schedule.manage")]
    public async Task<IActionResult> AddSchedule(int id, [FromBody] CreateDoctorScheduleRequest request, CancellationToken ct)
    {
        var result = await _svc.AddScheduleAsync(id, request, ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id:int}/schedules/{scheduleId:int}")]
    [Authorize(Policy = "permission:doctor.schedule.manage")]
    public async Task<IActionResult> RemoveSchedule(int id, int scheduleId, CancellationToken ct)
    {
        var result = await _svc.RemoveScheduleAsync(id, scheduleId, ct);
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpGet("{id:int}/available-slots")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAvailableSlots(int id, [FromQuery] DateTime date, [FromQuery] int? clinicId = null, CancellationToken ct = default)
    {
        if (date == default) date = DateTime.UtcNow.Date;
        var slots = await _svc.GetAvailableSlotsAsync(id, date, clinicId, ct);
        return Ok(slots);
    }

    [HttpGet("{id:int}/time-off")]
    [AllowAnonymous]
    public async Task<IActionResult> GetTimeOff(int id, CancellationToken ct)
    {
        var list = await _svc.GetTimeOffAsync(id, ct);
        return Ok(list);
    }

    [HttpPost("{id:int}/time-off")]
    [Authorize(Policy = "permission:doctor.time-off.manage")]
    public async Task<IActionResult> AddTimeOff(int id, [FromBody] CreateDoctorTimeOffRequest request, CancellationToken ct)
    {
        var userId = User.GetUserId() ?? string.Empty;
        var result = await _svc.AddTimeOffAsync(id, request, userId, ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id:int}/time-off/{timeOffId:int}")]
    [Authorize(Policy = "permission:doctor.time-off.manage")]
    public async Task<IActionResult> RemoveTimeOff(int id, int timeOffId, CancellationToken ct)
    {
        var userId = User.GetUserId() ?? string.Empty;
        var result = await _svc.RemoveTimeOffAsync(id, timeOffId, userId, ct);
        return result.Success ? Ok(result) : NotFound(result);
    }
}