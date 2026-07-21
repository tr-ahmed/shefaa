using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shefaa.Application.Interfaces;

namespace Shefaa.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "SystemAdmin,ClinicAdmin,ClinicStaff,Doctor")]
public class ReportsController : ControllerBase
{
    private readonly IReportingService _reports;
    private readonly IClinicService _clinics;

    public ReportsController(IReportingService reports, IClinicService clinics)
    {
        _reports = reports;
        _clinics = clinics;
    }

    private string? GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);

    private async Task<int?> ResolveClinicIdAsync()
    {
        if (!User.IsInRole("ClinicAdmin")) return null;
        var userId = GetUserId();
        if (userId == null) return null;
        var clinics = await _clinics.GetByOwnerUserIdAsync(userId);
        return clinics.FirstOrDefault()?.Id;
    }

    // ─── Legacy endpoints (kept for backwards compat) ───

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard(CancellationToken ct)
    {
        var clinicId = await ResolveClinicIdAsync();
        var data = clinicId.HasValue
            ? await _reports.GetDashboardSummaryAsync(clinicId.Value, ct)
            : await _reports.GetDashboardSummaryAsync(ct);
        return Ok(data);
    }

    [HttpGet("top-doctors")]
    public async Task<IActionResult> TopDoctors([FromQuery] int count = 10, CancellationToken ct = default)
    {
        var clinicId = await ResolveClinicIdAsync();
        var data = clinicId.HasValue
            ? await _reports.GetTopDoctorsAsync(clinicId.Value, count, ct)
            : await _reports.GetTopDoctorsAsync(count, ct);
        return Ok(data);
    }

    [HttpGet("revenue/monthly")]
    public async Task<IActionResult> MonthlyRevenue([FromQuery] int months = 6, CancellationToken ct = default)
    {
        var clinicId = await ResolveClinicIdAsync();
        var data = clinicId.HasValue
            ? await _reports.GetMonthlyRevenueAsync(clinicId.Value, months, ct)
            : await _reports.GetMonthlyRevenueAsync(months, ct);
        return Ok(data);
    }

    // ─── Comprehensive Admin Report ───

    [HttpGet("admin-report")]
    public async Task<IActionResult> AdminReport([FromQuery] int months = 6, CancellationToken ct = default)
    {
        if (User.IsInRole("ClinicAdmin"))
            return Forbid();

        var data = await _reports.GetAdminReportAsync(months, ct);
        return Ok(data);
    }

    // ─── Clinic-Specific Report ───

    [HttpGet("clinic-report")]
    [Authorize(Roles = "SystemAdmin,ClinicAdmin")]
    public async Task<IActionResult> ClinicReport(
        [FromQuery] int? clinicId = null,
        [FromQuery] int months = 6,
        CancellationToken ct = default)
    {
        int? targetClinicId;

        if (User.IsInRole("ClinicAdmin"))
        {
            targetClinicId = await ResolveClinicIdAsync();
            if (targetClinicId == null) return NotFound("No clinic found for this admin.");
        }
        else
        {
            targetClinicId = clinicId;
            if (targetClinicId == null) return BadRequest("clinicId is required for SystemAdmin.");
        }

        var data = await _reports.GetClinicReportAsync(targetClinicId.Value, months, ct);
        return Ok(data);
    }

    // ─── Granular report endpoints ───

    [HttpGet("appointment-trends")]
    public async Task<IActionResult> AppointmentTrends([FromQuery] int months = 6, CancellationToken ct = default)
    {
        var clinicId = await ResolveClinicIdAsync();
        var data = clinicId.HasValue
            ? await _reports.GetAppointmentTrendsAsync(months, ct) // TODO: clinic-scoped version
            : await _reports.GetAppointmentTrendsAsync(months, ct);
        return Ok(data);
    }

    [HttpGet("specialty-stats")]
    public async Task<IActionResult> SpecialtyStats(CancellationToken ct = default)
    {
        var data = await _reports.GetSpecialtyStatsAsync(ct);
        return Ok(data);
    }

    [HttpGet("patient-trends")]
    public async Task<IActionResult> PatientTrends([FromQuery] int months = 6, CancellationToken ct = default)
    {
        var data = await _reports.GetPatientTrendsAsync(months, ct);
        return Ok(data);
    }

    [HttpGet("peak-hours")]
    public async Task<IActionResult> PeakHours(CancellationToken ct = default)
    {
        var data = await _reports.GetPeakHoursAsync(ct);
        return Ok(data);
    }

    [HttpGet("day-of-week")]
    public async Task<IActionResult> DayOfWeek(CancellationToken ct = default)
    {
        var data = await _reports.GetDayOfWeekStatsAsync(ct);
        return Ok(data);
    }

    [HttpGet("gender-distribution")]
    public async Task<IActionResult> GenderDistribution(CancellationToken ct = default)
    {
        var data = await _reports.GetGenderDistributionAsync(ct);
        return Ok(data);
    }

    [HttpGet("doctor-performance")]
    public async Task<IActionResult> DoctorPerformance(
        [FromQuery] int? clinicId = null,
        CancellationToken ct = default)
    {
        var targetClinicId = await ResolveClinicIdAsync() ?? clinicId;
        var data = await _reports.GetDoctorPerformanceAsync(targetClinicId, ct);
        return Ok(data);
    }
}
