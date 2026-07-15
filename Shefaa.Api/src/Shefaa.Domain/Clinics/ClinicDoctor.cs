using Shefaa.Domain.Common;
using Shefaa.Domain.Doctors;

namespace Shefaa.Domain.Clinics;

/// <summary>
/// Many-to-many join between clinics and doctors. Allows a doctor to work at multiple clinics
/// and a clinic to host multiple doctors.
/// </summary>
public class ClinicDoctor : BaseEntity
{
    public int ClinicId { get; set; }
    public Clinic? Clinic { get; set; }

    public int DoctorId { get; set; }
    public Doctor? Doctor { get; set; }

    public decimal? ConsultationFee { get; set; }

    public bool IsPrimary { get; set; }

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}