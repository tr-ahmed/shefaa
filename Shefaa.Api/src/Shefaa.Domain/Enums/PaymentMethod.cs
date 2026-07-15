namespace Shefaa.Domain.Enums;

/// <summary>
/// How the patient intends to / has paid for the appointment.
/// </summary>
public enum PaymentMethod
{
    /// <summary>Pay by cash at the clinic reception.</summary>
    Cash = 1,

    /// <summary>Pay by Visa / MasterCard / Meeza at the clinic POS.</summary>
    Card = 2,

    /// <summary>Pay via Vodafone Cash mobile wallet.</summary>
    VodafoneCash = 3,

    /// <summary>Pay via InstaPay instant transfer.</summary>
    InstaPay = 4
}