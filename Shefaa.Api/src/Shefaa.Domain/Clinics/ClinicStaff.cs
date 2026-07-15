using Shefaa.Domain.Common;
using Shefaa.Domain.Enums;
using Shefaa.Domain.Identity;

namespace Shefaa.Domain.Clinics;

/// <summary>
/// Staff member (receptionist, nurse, manager) linked to a clinic and to an ApplicationUser.
/// </summary>
public class ClinicStaff : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser? User { get; set; }

    public int ClinicId { get; set; }
    public Clinic? Clinic { get; set; }

    public string Position { get; set; } = string.Empty;

    public StaffRole Role { get; set; } = StaffRole.Receptionist;

    public DateTime HireDate { get; set; } = DateTime.UtcNow;

    public bool IsActive { get; set; } = true;
}

public enum StaffRole
{
    Receptionist = 1,
    Nurse = 2,
    Manager = 3,
    Accountant = 4,
    Other = 99
}