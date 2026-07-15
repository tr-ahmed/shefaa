using Shefaa.Domain.Enums;

namespace Shefaa.Application.DTOs.Reports;

// ── Dashboard Summary (existing, enhanced) ──
public class DashboardSummaryDto
{
    public int TotalPatients { get; set; }
    public int TotalDoctors { get; set; }
    public int TotalClinics { get; set; }
    public int TotalAppointments { get; set; }
    public int AppointmentsToday { get; set; }
    public int AppointmentsThisWeek { get; set; }
    public int AppointmentsThisMonth { get; set; }
    public decimal EstimatedRevenueThisMonth { get; set; }
    public decimal EstimatedRevenueLastMonth { get; set; }
    public double RevenueGrowthPercent { get; set; }
    public int NewPatientsThisMonth { get; set; }
    public int NewPatientsThisWeek { get; set; }
    public int NewDoctorsThisMonth { get; set; }
    public decimal AvgConsultationFee { get; set; }
    public double CompletionRate { get; set; }
    public double NoShowRate { get; set; }
    public double CancellationRate { get; set; }
    public List<StatusCountDto> AppointmentsByStatus { get; set; } = new();
}

public class StatusCountDto
{
    public AppointmentStatus Status { get; set; }
    public int Count { get; set; }
}

// ── Top Doctors ──
public class TopDoctorDto
{
    public int DoctorId { get; set; }
    public string DoctorName { get; set; } = string.Empty;
    public string SpecialtyName { get; set; } = string.Empty;
    public int CompletedAppointments { get; set; }
    public decimal? Rating { get; set; }
    public int TotalReviews { get; set; }
}

// ── Revenue ──
public class RevenueByMonthDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public string Label { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public int AppointmentCount { get; set; }
}

// ── Appointment Trends ──
public class AppointmentTrendDto
{
    public string Label { get; set; } = string.Empty; // "2026-01"
    public int Total { get; set; }
    public int Completed { get; set; }
    public int Cancelled { get; set; }
    public int NoShow { get; set; }
}

// ── Specialty Stats ──
public class SpecialtyStatsDto
{
    public int SpecialtyId { get; set; }
    public string SpecialtyName { get; set; } = string.Empty;
    public int DoctorCount { get; set; }
    public int AppointmentCount { get; set; }
    public decimal Revenue { get; set; }
}

// ── Patient Registration Trends ──
public class PatientRegistrationTrendDto
{
    public string Label { get; set; } = string.Empty;
    public int Count { get; set; }
}

// ── Peak Hours ──
public class PeakHourDto
{
    public int Hour { get; set; }
    public int Count { get; set; }
}

// ── Day of Week Stats ──
public class DayOfWeekStatsDto
{
    public string DayName { get; set; } = string.Empty;
    public int Count { get; set; }
}

// ── Doctor Performance (for clinic view) ──
public class DoctorPerformanceDto
{
    public int DoctorId { get; set; }
    public string DoctorName { get; set; } = string.Empty;
    public string SpecialtyName { get; set; } = string.Empty;
    public int TotalAppointments { get; set; }
    public int CompletedAppointments { get; set; }
    public int CancelledAppointments { get; set; }
    public decimal Revenue { get; set; }
    public decimal? Rating { get; set; }
    public int TotalReviews { get; set; }
    public double CompletionRate { get; set; }
}

// ── Gender Distribution ──
public class GenderDistributionDto
{
    public string Gender { get; set; } = string.Empty;
    public int Count { get; set; }
}

// ── Comprehensive Admin Report ──
public class AdminReportDto
{
    public DashboardSummaryDto Summary { get; set; } = new();
    public List<AppointmentTrendDto> AppointmentTrends { get; set; } = new();
    public List<SpecialtyStatsDto> SpecialtyStats { get; set; } = new();
    public List<PatientRegistrationTrendDto> PatientTrends { get; set; } = new();
    public List<PeakHourDto> PeakHours { get; set; } = new();
    public List<DayOfWeekStatsDto> DayOfWeekStats { get; set; } = new();
    public List<GenderDistributionDto> GenderDistribution { get; set; } = new();
    public List<TopDoctorDto> TopDoctors { get; set; } = new();
    public List<RevenueByMonthDto> RevenueByMonth { get; set; } = new();
}

// ── Clinic-Specific Report ──
public class ClinicReportDto
{
    public ClinicSummaryDto Summary { get; set; } = new();
    public List<DoctorPerformanceDto> DoctorPerformance { get; set; } = new();
    public List<AppointmentTrendDto> AppointmentTrends { get; set; } = new();
    public List<DayOfWeekStatsDto> DayOfWeekStats { get; set; } = new();
    public List<PeakHourDto> PeakHours { get; set; } = new();
    public List<RevenueByMonthDto> RevenueByMonth { get; set; } = new();
    public List<StatusCountDto> AppointmentsByStatus { get; set; } = new();
}

public class ClinicSummaryDto
{
    public string ClinicName { get; set; } = string.Empty;
    public int TotalDoctors { get; set; }
    public int TotalPatients { get; set; }
    public int TotalAppointments { get; set; }
    public int AppointmentsToday { get; set; }
    public int AppointmentsThisWeek { get; set; }
    public decimal RevenueThisMonth { get; set; }
    public decimal RevenueLastMonth { get; set; }
    public double RevenueGrowthPercent { get; set; }
    public double CompletionRate { get; set; }
    public double NoShowRate { get; set; }
    public int NewPatientsThisMonth { get; set; }
}
