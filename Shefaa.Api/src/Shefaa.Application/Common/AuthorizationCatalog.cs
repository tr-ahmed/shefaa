using System.Collections.Generic;
using System.Linq;

namespace Shefaa.Application.Common;

public static class AuthorizationCatalog
{
    public static readonly IReadOnlyDictionary<string, string[]> RolePermissions =
        new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase)
        {
            ["Patient"] = [
                "patient.dashboard.view",
                "patient.appointments.view",
                "patient.medical-records.view",
                "patient.profile.view",
                "appointments.book",
                "reviews.create"
            ],
            ["Doctor"] = [
                "doctor.dashboard.view",
                "doctor.appointments.manage",
                "doctor.schedule.manage",
                "doctor.time-off.manage",
                "doctor.records.manage",
                "attachments.manage",
                "medical-records.manage"
            ],
            ["ClinicStaff"] = [
                "admin.dashboard.view",
                "admin.appointments.manage",
                "admin.patients.manage",
                "reports.view"
            ],
            ["ClinicAdmin"] = [
                "admin.dashboard.view",
                "admin.appointments.manage",
                "admin.doctors.manage",
                "admin.clinics.manage",
                "admin.clinic-staff.manage",
                "admin.specialties.manage",
                "admin.patients.manage",
                "reports.view"
            ],
            ["SystemAdmin"] = [
                "system.admin"
            ]
        };

    public static IReadOnlyList<string> GetPermissions(IEnumerable<string> roles)
    {
        return roles
            .Where(role => !string.IsNullOrWhiteSpace(role))
            .SelectMany(role => RolePermissions.TryGetValue(role, out var permissions) ? permissions : Array.Empty<string>())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
    }

    public static string? GetPrimaryRole(IReadOnlyCollection<string> roles)
    {
        if (roles.Count == 0)
        {
            return null;
        }

        if (roles.Contains("SystemAdmin", StringComparer.OrdinalIgnoreCase)) return "SystemAdmin";
        if (roles.Contains("ClinicAdmin", StringComparer.OrdinalIgnoreCase)) return "ClinicAdmin";
        if (roles.Contains("ClinicStaff", StringComparer.OrdinalIgnoreCase)) return "ClinicStaff";
        if (roles.Contains("Doctor", StringComparer.OrdinalIgnoreCase)) return "Doctor";
        if (roles.Contains("Patient", StringComparer.OrdinalIgnoreCase)) return "Patient";

        return roles.First();
    }
}