using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shefaa.Application.DTOs.Appointments;
using Shefaa.Application.Interfaces;
using Shefaa.Domain.Enums;

namespace Shefaa.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AppointmentsController : ControllerBase
{
    private readonly IAppointmentService _svc;

    public AppointmentsController(IAppointmentService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> GetPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] int? patientId = null,
        [FromQuery] int? doctorId = null,
        [FromQuery] int? clinicId = null,
        [FromQuery] AppointmentStatus? status = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        CancellationToken ct = default)
    {
        var filter = new AppointmentQueryFilter
        {
            PatientId = patientId,
            DoctorId = doctorId,
            ClinicId = clinicId,
            Status = status,
            FromDate = fromDate,
            ToDate = toDate,
            CurrentUserId = User.GetUserId(),
            CurrentUserRole = User.GetRoles().FirstOrDefault()
        };
        var result = await _svc.GetPagedAsync(page, pageSize, filter, ct);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var dto = await _svc.GetByIdAsync(id, ct);
        return dto == null ? NotFound() : Ok(dto);
    }

    [HttpPost]
    [Authorize(Policy = "permission:appointments.book")]
    public async Task<IActionResult> Create([FromBody] CreateAppointmentRequest request, CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (userId == null) return Unauthorized();
        var result = await _svc.CreateAsync(request, userId, ct);
        return result.Success ? CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result) : BadRequest(result);
    }

    [HttpPost("{id:int}/cancel")]
    public async Task<IActionResult> Cancel(int id, [FromBody] CancelAppointmentRequest request, CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (userId == null) return Unauthorized();
        var result = await _svc.CancelAsync(id, request.Reason, userId, ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("{id:int}/reschedule")]
    public async Task<IActionResult> Reschedule(int id, [FromBody] RescheduleAppointmentRequest request, CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (userId == null) return Unauthorized();
        var result = await _svc.RescheduleAsync(id, request, userId, ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("{id:int}/status")]
    [Authorize(Policy = "permission:doctor.appointments.manage")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusRequest request, CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (userId == null) return Unauthorized();
        var result = await _svc.UpdateStatusAsync(id, request.Status, request.Notes, userId, ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }
    /// <summary>
    /// Patient marks the appointment as paid (after paying via Vodafone Cash / InstaPay at reception / online).
    /// </summary>
    [HttpPost("{id:int}/payment")]
    [Authorize]
    public async Task<IActionResult> MarkPaid(int id, [FromBody] MarkAppointmentPaidRequest request, CancellationToken ct = default)
    {
        var userId = User.GetUserId();
        if (userId == null) return Unauthorized();
        var result = await _svc.MarkPaidAsync(id, request, userId, ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }}

public class UpdateStatusRequest
{
    public AppointmentStatus Status { get; set; }
    public string? Notes { get; set; }
}