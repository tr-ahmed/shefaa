using Microsoft.EntityFrameworkCore;
using Shefaa.Application.Common;
using Shefaa.Application.DTOs.Reviews;
using Shefaa.Application.Interfaces;
using Shefaa.Domain.Enums;
using Shefaa.Domain.Reviews;
using Shefaa.Infrastructure.Persistence;

namespace Shefaa.Infrastructure.Services;

public class ReviewService : IReviewService
{
    private readonly ShefaaDbContext _db;

    public ReviewService(ShefaaDbContext db) => _db = db;

    public async Task<PagedResult<ReviewDto>> GetForDoctorAsync(int doctorId, int page, int pageSize, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _db.Reviews.AsNoTracking()
            .Where(r => r.DoctorId == doctorId && r.IsVisible);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new ReviewDto
            {
                Id = r.Id,
                AppointmentId = r.AppointmentId,
                DoctorId = r.DoctorId,
                PatientId = r.PatientId,
                PatientDisplayName = r.IsAnonymous
                    ? "Anonymous"
                    : r.Patient!.User!.FirstName + " " + r.Patient.User.LastName,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync(ct);

        return new PagedResult<ReviewDto> { Items = items, TotalCount = total, Page = page, PageSize = pageSize };
    }

    public async Task<ApiResponse<ReviewDto>> CreateAsync(CreateReviewRequest request, string currentUserId, CancellationToken ct = default)
    {
        var patient = await _db.Patients.FirstOrDefaultAsync(p => p.UserId == currentUserId, ct);
        if (patient == null) return ApiResponse<ReviewDto>.Fail("Patient profile not found.", "PATIENT_PROFILE_REQUIRED");

        var appointment = await _db.Appointments
            .FirstOrDefaultAsync(a => a.Id == request.AppointmentId && a.PatientId == patient.Id, ct);
        if (appointment == null)
            return ApiResponse<ReviewDto>.Fail("Appointment not found for this patient.", "NOT_FOUND");

        if (appointment.Status != AppointmentStatus.Completed)
            return ApiResponse<ReviewDto>.Fail("Reviews can only be left on completed appointments.", "INVALID_STATE");

        if (await _db.Reviews.AnyAsync(r => r.AppointmentId == request.AppointmentId, ct))
            return ApiResponse<ReviewDto>.Fail("A review already exists for this appointment.", "DUPLICATE");

        var review = new Review
        {
            AppointmentId = request.AppointmentId,
            PatientId = patient.Id,
            DoctorId = appointment.DoctorId,
            Rating = request.Rating,
            Comment = request.Comment,
            IsAnonymous = request.IsAnonymous,
            IsVisible = true
        };
        _db.Reviews.Add(review);
        await _db.SaveChangesAsync(ct);

        // Recompute doctor rating
        var avg = await _db.Reviews.Where(r => r.DoctorId == appointment.DoctorId && r.IsVisible).AverageAsync(r => (double?)r.Rating, ct) ?? 0;
        var count = await _db.Reviews.CountAsync(r => r.DoctorId == appointment.DoctorId && r.IsVisible, ct);
        var doctor = await _db.Doctors.FirstAsync(d => d.Id == appointment.DoctorId, ct);
        doctor.Rating = (decimal)avg;
        doctor.TotalReviews = count;
        await _db.SaveChangesAsync(ct);

        var dto = new ReviewDto
        {
            Id = review.Id,
            AppointmentId = review.AppointmentId,
            DoctorId = review.DoctorId,
            PatientId = review.PatientId,
            PatientDisplayName = review.IsAnonymous ? "Anonymous" : patient.User.FirstName + " " + patient.User.LastName,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        };
        return ApiResponse<ReviewDto>.Ok(dto, "Review submitted. Thank you!");
    }
}