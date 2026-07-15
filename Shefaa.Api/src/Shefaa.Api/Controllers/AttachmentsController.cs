using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shefaa.Application.Interfaces;
using Shefaa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Shefaa.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AttachmentsController : ControllerBase
{
    private readonly IAttachmentService _svc;
    private readonly ShefaaDbContext _db;

    public AttachmentsController(IAttachmentService svc, ShefaaDbContext db)
    {
        _svc = svc;
        _db = db;
    }

    [HttpPost("medical-record/{medicalRecordId:int}")]
    [Authorize(Roles = "Doctor")]
    [RequestSizeLimit(12 * 1024 * 1024)]
    public async Task<IActionResult> Upload(int medicalRecordId, IFormFile file, [FromForm] string? description, CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();
        if (file == null || file.Length == 0) return BadRequest("file is required");

        await using var stream = file.OpenReadStream();
        var result = await _svc.UploadAsync(medicalRecordId, stream, file.FileName, file.ContentType, file.Length, description, userId, ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Doctor")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();
        var result = await _svc.DeleteAsync(id, userId, ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet("{id:int}/download")]
    public async Task<IActionResult> Download(int id, CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var userRoles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();

        // Doctors, SystemAdmin, ClinicAdmin can download any attachment
        // Patients can only download attachments from their own medical records
        if (userRoles.Contains("Patient"))
        {
            var attachment = await _db.Attachments
                .Include(a => a.MedicalRecord).ThenInclude(m => m!.Patient)
                .FirstOrDefaultAsync(a => a.Id == id, ct);

            if (attachment?.MedicalRecord?.Patient == null) return NotFound();

            var patientUserId = attachment.MedicalRecord.Patient.UserId;
            if (patientUserId != userId) return Forbid("You can only access your own attachments.");
        }

        var result = await _svc.DownloadAsync(id, ct);
        if (result == null) return NotFound();
        return File(result.Value.Bytes, result.Value.ContentType, result.Value.FileName);
    }
}