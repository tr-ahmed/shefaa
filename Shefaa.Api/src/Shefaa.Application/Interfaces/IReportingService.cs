using Shefaa.Application.DTOs.Reports;

namespace Shefaa.Application.Interfaces;

public interface IReportingService
{
    Task<DashboardSummaryDto> GetDashboardSummaryAsync(CancellationToken ct = default);
    Task<DashboardSummaryDto> GetDashboardSummaryAsync(int clinicId, CancellationToken ct = default);
    Task<List<TopDoctorDto>> GetTopDoctorsAsync(int count, CancellationToken ct = default);
    Task<List<TopDoctorDto>> GetTopDoctorsAsync(int clinicId, int count, CancellationToken ct = default);
    Task<List<RevenueByMonthDto>> GetMonthlyRevenueAsync(int months, CancellationToken ct = default);
    Task<List<RevenueByMonthDto>> GetMonthlyRevenueAsync(int clinicId, int months, CancellationToken ct = default);

    Task<AdminReportDto> GetAdminReportAsync(int months = 6, CancellationToken ct = default);
    Task<ClinicReportDto> GetClinicReportAsync(int clinicId, int months = 6, CancellationToken ct = default);

    Task<List<AppointmentTrendDto>> GetAppointmentTrendsAsync(int months = 6, CancellationToken ct = default);
    Task<List<SpecialtyStatsDto>> GetSpecialtyStatsAsync(CancellationToken ct = default);
    Task<List<PatientRegistrationTrendDto>> GetPatientTrendsAsync(int months = 6, CancellationToken ct = default);
    Task<List<PeakHourDto>> GetPeakHoursAsync(CancellationToken ct = default);
    Task<List<DayOfWeekStatsDto>> GetDayOfWeekStatsAsync(CancellationToken ct = default);
    Task<List<GenderDistributionDto>> GetGenderDistributionAsync(CancellationToken ct = default);
    Task<List<DoctorPerformanceDto>> GetDoctorPerformanceAsync(int? clinicId = null, CancellationToken ct = default);
}
