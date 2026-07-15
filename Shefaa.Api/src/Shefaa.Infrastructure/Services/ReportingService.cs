using Microsoft.EntityFrameworkCore;
using Shefaa.Application.DTOs.Reports;
using Shefaa.Application.Interfaces;
using Shefaa.Domain.Enums;
using Shefaa.Infrastructure.Persistence;

namespace Shefaa.Infrastructure.Services;

public class ReportingService : IReportingService
{
    private readonly ShefaaDbContext _db;

    public ReportingService(ShefaaDbContext db) => _db = db;

    // ─── Dashboard Summary (global) ───
    public async Task<DashboardSummaryDto> GetDashboardSummaryAsync(CancellationToken ct = default)
        => await BuildSummaryAsync(null, ct);

    // ─── Dashboard Summary (clinic-scoped) ───
    public async Task<DashboardSummaryDto> GetDashboardSummaryAsync(int clinicId, CancellationToken ct = default)
        => await BuildSummaryAsync(clinicId, ct);

    private async Task<DashboardSummaryDto> BuildSummaryAsync(int? clinicId, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var startOfDay = now.Date;
        var endOfDay = startOfDay.AddDays(1);
        var startOfWeek = now.AddDays(-(int)now.DayOfWeek).Date;
        var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var startOfLastMonth = startOfMonth.AddMonths(-1);
        var endOfLastMonth = startOfMonth;

        IQueryable<Domain.Appointments.Appointment> appts = _db.Appointments;
        if (clinicId.HasValue)
            appts = appts.Where(a => a.ClinicId == clinicId.Value);

        var totalPatients = clinicId.HasValue
            ? await appts.Select(a => a.PatientId).Distinct().CountAsync(ct)
            : await _db.Patients.CountAsync(ct);

        var totalDoctors = clinicId.HasValue
            ? await _db.ClinicDoctors.CountAsync(cd => cd.ClinicId == clinicId.Value, ct)
            : await _db.Doctors.CountAsync(ct);

        var totalClinics = clinicId.HasValue
            ? 1
            : await _db.Clinics.CountAsync(ct);

        var totalAppointments = await appts.CountAsync(ct);

        var today = await appts.CountAsync(a => a.ScheduledStart >= startOfDay && a.ScheduledStart < endOfDay, ct);
        var week = await appts.CountAsync(a => a.ScheduledStart >= startOfWeek, ct);
        var month = await appts.CountAsync(a => a.ScheduledStart >= startOfMonth, ct);

        var monthRevenue = await appts
            .Where(a => a.ScheduledStart >= startOfMonth
                && (a.Status == AppointmentStatus.Completed || a.Status == AppointmentStatus.Confirmed))
            .SumAsync(a => a.ConsultationFee ?? 0m, ct);

        var lastMonthRevenue = await appts
            .Where(a => a.ScheduledStart >= startOfLastMonth && a.ScheduledStart < endOfLastMonth
                && (a.Status == AppointmentStatus.Completed || a.Status == AppointmentStatus.Confirmed))
            .SumAsync(a => a.ConsultationFee ?? 0m, ct);

        var revenueGrowth = lastMonthRevenue > 0
            ? (double)((monthRevenue - lastMonthRevenue) / lastMonthRevenue * 100)
            : monthRevenue > 0 ? 100 : 0;

        var byStatus = await appts
            .GroupBy(a => a.Status)
            .Select(g => new StatusCountDto { Status = g.Key, Count = g.Count() })
            .ToListAsync(ct);

        var completed = byStatus.FirstOrDefault(s => s.Status == AppointmentStatus.Completed)?.Count ?? 0;
        var cancelled = byStatus.FirstOrDefault(s => s.Status == AppointmentStatus.Cancelled)?.Count ?? 0;
        var noShow = byStatus.FirstOrDefault(s => s.Status == AppointmentStatus.NoShow)?.Count ?? 0;

        var completionRate = totalAppointments > 0 ? (double)completed / totalAppointments * 100 : 0;
        var noShowRate = totalAppointments > 0 ? (double)noShow / totalAppointments * 100 : 0;
        var cancellationRate = totalAppointments > 0 ? (double)cancelled / totalAppointments * 100 : 0;

        var avgFee = await appts
            .Where(a => a.ConsultationFee.HasValue && a.ConsultationFee > 0)
            .AverageAsync(a => a.ConsultationFee, ct);

        var newPatientsThisMonth = clinicId.HasValue
            ? await appts.Where(a => a.ScheduledStart >= startOfMonth).Select(a => a.PatientId).Distinct().CountAsync(ct)
            : await _db.Patients.CountAsync(p => p.CreatedAt >= startOfMonth, ct);

        var newPatientsThisWeek = clinicId.HasValue
            ? await appts.Where(a => a.ScheduledStart >= startOfWeek).Select(a => a.PatientId).Distinct().CountAsync(ct)
            : await _db.Patients.CountAsync(p => p.CreatedAt >= startOfWeek, ct);

        var newDoctorsThisMonth = clinicId.HasValue
            ? 0
            : await _db.Doctors.CountAsync(d => d.CreatedAt >= startOfMonth, ct);

        return new DashboardSummaryDto
        {
            TotalPatients = totalPatients,
            TotalDoctors = totalDoctors,
            TotalClinics = totalClinics,
            TotalAppointments = totalAppointments,
            AppointmentsToday = today,
            AppointmentsThisWeek = week,
            AppointmentsThisMonth = month,
            EstimatedRevenueThisMonth = monthRevenue,
            EstimatedRevenueLastMonth = lastMonthRevenue,
            RevenueGrowthPercent = Math.Round(revenueGrowth, 1),
            NewPatientsThisMonth = newPatientsThisMonth,
            NewPatientsThisWeek = newPatientsThisWeek,
            NewDoctorsThisMonth = newDoctorsThisMonth,
            AvgConsultationFee = avgFee ?? 0m,
            CompletionRate = Math.Round(completionRate, 1),
            NoShowRate = Math.Round(noShowRate, 1),
            CancellationRate = Math.Round(cancellationRate, 1),
            AppointmentsByStatus = byStatus
        };
    }

    // ─── Top Doctors (global) ───
    public async Task<List<TopDoctorDto>> GetTopDoctorsAsync(int count, CancellationToken ct = default)
        => await GetTopDoctorsInternalAsync(null, count, ct);

    // ─── Top Doctors (clinic-scoped) ───
    public async Task<List<TopDoctorDto>> GetTopDoctorsAsync(int clinicId, int count, CancellationToken ct = default)
        => await GetTopDoctorsInternalAsync(clinicId, count, ct);

    private async Task<List<TopDoctorDto>> GetTopDoctorsInternalAsync(int? clinicId, int count, CancellationToken ct)
    {
        count = Math.Clamp(count, 1, 50);
        IQueryable<Domain.Appointments.Appointment> appts = _db.Appointments
            .Where(a => a.Status == AppointmentStatus.Completed);

        if (clinicId.HasValue)
            appts = appts.Where(a => a.ClinicId == clinicId.Value);

        return await appts
            .GroupBy(a => new { a.DoctorId, a.Doctor!.User!.FirstName, a.Doctor.User.LastName, a.Doctor.Specialty!.Name, a.Doctor.Rating, a.Doctor.TotalReviews })
            .Select(g => new TopDoctorDto
            {
                DoctorId = g.Key.DoctorId,
                DoctorName = g.Key.FirstName + " " + g.Key.LastName,
                SpecialtyName = g.Key.Name,
                CompletedAppointments = g.Count(),
                Rating = g.Key.Rating,
                TotalReviews = g.Key.TotalReviews
            })
            .OrderByDescending(d => d.CompletedAppointments)
            .Take(count)
            .ToListAsync(ct);
    }

    // ─── Revenue by Month (global) ───
    public async Task<List<RevenueByMonthDto>> GetMonthlyRevenueAsync(int months, CancellationToken ct = default)
        => await GetMonthlyRevenueInternalAsync(null, months, ct);

    // ─── Revenue by Month (clinic-scoped) ───
    public async Task<List<RevenueByMonthDto>> GetMonthlyRevenueAsync(int clinicId, int months, CancellationToken ct = default)
        => await GetMonthlyRevenueInternalAsync(clinicId, months, ct);

    private async Task<List<RevenueByMonthDto>> GetMonthlyRevenueInternalAsync(int? clinicId, int months, CancellationToken ct)
    {
        months = Math.Clamp(months, 1, 24);
        var startMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-(months - 1));

        IQueryable<Domain.Appointments.Appointment> appts = _db.Appointments.AsNoTracking()
            .Where(a => a.ScheduledStart >= startMonth
                && (a.Status == AppointmentStatus.Completed || a.Status == AppointmentStatus.Confirmed));

        if (clinicId.HasValue)
            appts = appts.Where(a => a.ClinicId == clinicId.Value);

        var data = await appts
            .Select(a => new { a.ScheduledStart.Year, a.ScheduledStart.Month, Fee = a.ConsultationFee ?? 0m })
            .ToListAsync(ct);

        return data
            .GroupBy(x => new { x.Year, x.Month })
            .Select(g => new RevenueByMonthDto
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                Label = $"{g.Key.Year}-{g.Key.Month:D2}",
                Revenue = g.Sum(x => x.Fee),
                AppointmentCount = g.Count()
            })
            .OrderBy(r => r.Year).ThenBy(r => r.Month)
            .ToList();
    }

    // ─── Comprehensive Admin Report ───
    public async Task<AdminReportDto> GetAdminReportAsync(int months = 6, CancellationToken ct = default)
    {
        var summary = await GetDashboardSummaryAsync(ct);
        var trends = await GetAppointmentTrendsAsync(months, ct);
        var specialties = await GetSpecialtyStatsAsync(ct);
        var patientTrends = await GetPatientTrendsAsync(months, ct);
        var peakHours = await GetPeakHoursAsync(ct);
        var dowStats = await GetDayOfWeekStatsAsync(ct);
        var gender = await GetGenderDistributionAsync(ct);
        var topDocs = await GetTopDoctorsAsync(10, ct);
        var revenue = await GetMonthlyRevenueAsync(months, ct);

        return new AdminReportDto
        {
            Summary = summary,
            AppointmentTrends = trends,
            SpecialtyStats = specialties,
            PatientTrends = patientTrends,
            PeakHours = peakHours,
            DayOfWeekStats = dowStats,
            GenderDistribution = gender,
            TopDoctors = topDocs,
            RevenueByMonth = revenue
        };
    }

    // ─── Clinic-Specific Report ───
    public async Task<ClinicReportDto> GetClinicReportAsync(int clinicId, int months = 6, CancellationToken ct = default)
    {
        var summary = await BuildSummaryAsync(clinicId, ct);
        var trends = await GetAppointmentTrendsInternalAsync(clinicId, months, ct);
        var dowStats = await GetDayOfWeekStatsInternalAsync(clinicId, ct);
        var peakHours = await GetPeakHoursInternalAsync(clinicId, ct);
        var revenue = await GetMonthlyRevenueInternalAsync(clinicId, months, ct);
        var doctorPerf = await GetDoctorPerformanceAsync(clinicId, ct);

        var clinic = await _db.Clinics.FindAsync(clinicId);

        var apptsQuery = _db.Appointments.Where(a => a.ClinicId == clinicId);
        var byStatus = await apptsQuery
            .GroupBy(a => a.Status)
            .Select(g => new StatusCountDto { Status = g.Key, Count = g.Count() })
            .ToListAsync(ct);

        return new ClinicReportDto
        {
            Summary = new ClinicSummaryDto
            {
                ClinicName = clinic?.Name ?? "",
                TotalDoctors = summary.TotalDoctors,
                TotalPatients = summary.TotalPatients,
                TotalAppointments = summary.TotalAppointments,
                AppointmentsToday = summary.AppointmentsToday,
                AppointmentsThisWeek = summary.AppointmentsThisWeek,
                RevenueThisMonth = summary.EstimatedRevenueThisMonth,
                RevenueLastMonth = summary.EstimatedRevenueLastMonth,
                RevenueGrowthPercent = summary.RevenueGrowthPercent,
                CompletionRate = summary.CompletionRate,
                NoShowRate = summary.NoShowRate,
                NewPatientsThisMonth = summary.NewPatientsThisMonth
            },
            DoctorPerformance = doctorPerf,
            AppointmentTrends = trends,
            DayOfWeekStats = dowStats,
            PeakHours = peakHours,
            RevenueByMonth = revenue,
            AppointmentsByStatus = byStatus
        };
    }

    // ─── Appointment Trends ───
    public async Task<List<AppointmentTrendDto>> GetAppointmentTrendsAsync(int months = 6, CancellationToken ct = default)
        => await GetAppointmentTrendsInternalAsync(null, months, ct);

    private async Task<List<AppointmentTrendDto>> GetAppointmentTrendsInternalAsync(int? clinicId, int months, CancellationToken ct)
    {
        months = Math.Clamp(months, 1, 24);
        var startMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-(months - 1));

        IQueryable<Domain.Appointments.Appointment> appts = _db.Appointments.AsNoTracking()
            .Where(a => a.ScheduledStart >= startMonth);

        if (clinicId.HasValue)
            appts = appts.Where(a => a.ClinicId == clinicId.Value);

        var data = await appts
            .Select(a => new
            {
                a.ScheduledStart.Year,
                a.ScheduledStart.Month,
                a.Status
            })
            .ToListAsync(ct);

        return data
            .GroupBy(x => new { x.Year, x.Month })
            .Select(g => new AppointmentTrendDto
            {
                Label = $"{g.Key.Year}-{g.Key.Month:D2}",
                Total = g.Count(),
                Completed = g.Count(x => x.Status == AppointmentStatus.Completed),
                Cancelled = g.Count(x => x.Status == AppointmentStatus.Cancelled),
                NoShow = g.Count(x => x.Status == AppointmentStatus.NoShow)
            })
            .OrderBy(t => t.Label)
            .ToList();
    }

    // ─── Specialty Stats ───
    public async Task<List<SpecialtyStatsDto>> GetSpecialtyStatsAsync(CancellationToken ct = default)
    {
        return await _db.Doctors.AsNoTracking()
            .Where(d => d.IsActive)
            .GroupBy(d => new { d.SpecialtyId, d.Specialty!.Name })
            .Select(g => new SpecialtyStatsDto
            {
                SpecialtyId = g.Key.SpecialtyId,
                SpecialtyName = g.Key.Name,
                DoctorCount = g.Count(),
                AppointmentCount = _db.Appointments.Count(a => a.DoctorId == g.Select(d => d.Id).FirstOrDefault()),
                Revenue = _db.Appointments
                    .Where(a => a.DoctorId == g.Select(d => d.Id).FirstOrDefault()
                        && (a.Status == AppointmentStatus.Completed || a.Status == AppointmentStatus.Confirmed))
                    .Sum(a => a.ConsultationFee ?? 0m)
            })
            .OrderByDescending(s => s.AppointmentCount)
            .ToListAsync(ct);
    }

    // ─── Patient Registration Trends ───
    public async Task<List<PatientRegistrationTrendDto>> GetPatientTrendsAsync(int months = 6, CancellationToken ct = default)
    {
        months = Math.Clamp(months, 1, 24);
        var startMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-(months - 1));

        var data = await _db.Patients.AsNoTracking()
            .Where(p => p.CreatedAt >= startMonth)
            .Select(p => new { p.CreatedAt.Year, p.CreatedAt.Month })
            .ToListAsync(ct);

        return data
            .GroupBy(x => new { x.Year, x.Month })
            .Select(g => new PatientRegistrationTrendDto
            {
                Label = $"{g.Key.Year}-{g.Key.Month:D2}",
                Count = g.Count()
            })
            .OrderBy(t => t.Label)
            .ToList();
    }

    // ─── Peak Hours ───
    public async Task<List<PeakHourDto>> GetPeakHoursAsync(CancellationToken ct = default)
        => await GetPeakHoursInternalAsync(null, ct);

    private async Task<List<PeakHourDto>> GetPeakHoursInternalAsync(int? clinicId, CancellationToken ct)
    {
        IQueryable<Domain.Appointments.Appointment> appts = _db.Appointments.AsNoTracking();

        if (clinicId.HasValue)
            appts = appts.Where(a => a.ClinicId == clinicId.Value);

        var data = await appts
            .Select(a => a.ScheduledStart.Hour)
            .ToListAsync(ct);

        return Enumerable.Range(6, 16) // 6 AM to 9 PM
            .Select(h => new PeakHourDto
            {
                Hour = h,
                Count = data.Count(x => x == h)
            })
            .ToList();
    }

    // ─── Day of Week Stats ───
    public async Task<List<DayOfWeekStatsDto>> GetDayOfWeekStatsAsync(CancellationToken ct = default)
        => await GetDayOfWeekStatsInternalAsync(null, ct);

    private async Task<List<DayOfWeekStatsDto>> GetDayOfWeekStatsInternalAsync(int? clinicId, CancellationToken ct)
    {
        IQueryable<Domain.Appointments.Appointment> appts = _db.Appointments.AsNoTracking();

        if (clinicId.HasValue)
            appts = appts.Where(a => a.ClinicId == clinicId.Value);

        var data = await appts
            .Select(a => a.ScheduledStart.DayOfWeek)
            .ToListAsync(ct);

        var dayOrder = new[] { DayOfWeek.Sunday, DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday, DayOfWeek.Saturday };

        return dayOrder
            .Select(d => new DayOfWeekStatsDto
            {
                DayName = d.ToString(),
                Count = data.Count(x => x == d)
            })
            .ToList();
    }

    // ─── Gender Distribution ───
    public async Task<List<GenderDistributionDto>> GetGenderDistributionAsync(CancellationToken ct = default)
    {
        var data = await _db.Patients.AsNoTracking()
            .Join(_db.Users, p => p.UserId, u => u.Id, (p, u) => u.Gender)
            .GroupBy(g => g)
            .Select(g => new GenderDistributionDto
            {
                Gender = g.Key.ToString(),
                Count = g.Count()
            })
            .ToListAsync(ct);

        return data;
    }

    // ─── Doctor Performance ───
    public async Task<List<DoctorPerformanceDto>> GetDoctorPerformanceAsync(int? clinicId = null, CancellationToken ct = default)
    {
        IQueryable<Domain.Appointments.Appointment> appts = _db.Appointments.AsNoTracking();

        if (clinicId.HasValue)
            appts = appts.Where(a => a.ClinicId == clinicId.Value);

        var doctorIds = await appts.Select(a => a.DoctorId).Distinct().ToListAsync(ct);

        var result = new List<DoctorPerformanceDto>();
        foreach (var docId in doctorIds)
        {
            var docAppts = appts.Where(a => a.DoctorId == docId);
            var total = await docAppts.CountAsync(ct);
            var completed = await docAppts.CountAsync(a => a.Status == AppointmentStatus.Completed, ct);
            var cancelled = await docAppts.CountAsync(a => a.Status == AppointmentStatus.Cancelled, ct);
            var revenue = await docAppts
                .Where(a => a.Status == AppointmentStatus.Completed || a.Status == AppointmentStatus.Confirmed)
                .SumAsync(a => a.ConsultationFee ?? 0m, ct);

            var doc = await _db.Doctors
                .Include(d => d.User).Include(d => d.Specialty)
                .FirstOrDefaultAsync(d => d.Id == docId, ct);

            if (doc == null) continue;

            result.Add(new DoctorPerformanceDto
            {
                DoctorId = docId,
                DoctorName = $"{doc.User?.FirstName} {doc.User?.LastName}",
                SpecialtyName = doc.Specialty?.Name ?? "",
                TotalAppointments = total,
                CompletedAppointments = completed,
                CancelledAppointments = cancelled,
                Revenue = revenue,
                Rating = doc.Rating,
                TotalReviews = doc.TotalReviews,
                CompletionRate = total > 0 ? Math.Round((double)completed / total * 100, 1) : 0
            });
        }

        return result.OrderByDescending(d => d.CompletedAppointments).ToList();
    }
}
