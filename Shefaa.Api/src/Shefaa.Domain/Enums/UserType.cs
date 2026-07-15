namespace Shefaa.Domain.Enums;

/// <summary>
/// Logical user role discriminator. Maps to ASP.NET Identity roles via seed data.
/// </summary>
public enum UserType
{
    Patient = 1,
    Doctor = 2,
    ClinicStaff = 3,
    ClinicAdmin = 4,
    SystemAdmin = 5
}