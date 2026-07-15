using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shefaa.Application.DTOs.Reviews;
using Shefaa.Application.Interfaces;

namespace Shefaa.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _svc;

    public ReviewsController(IReviewService svc) => _svc = svc;

    [HttpGet("doctor/{doctorId:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetForDoctor(int doctorId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await _svc.GetForDoctorAsync(doctorId, page, pageSize, ct);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Patient")]
    public async Task<IActionResult> Create([FromBody] CreateReviewRequest request, CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (userId == null) return Unauthorized();
        var result = await _svc.CreateAsync(request, userId, ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }
}