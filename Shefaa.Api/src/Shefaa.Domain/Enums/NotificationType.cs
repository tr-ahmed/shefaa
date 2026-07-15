namespace Shefaa.Domain.Enums;

public enum NotificationType
{
    AppointmentCreated = 1,
    AppointmentConfirmed = 2,
    AppointmentCancelled = 3,
    AppointmentRescheduled = 4,
    AppointmentReminder = 5,
    PrescriptionReady = 6,
    MedicalRecordUpdated = 7,
    General = 99
}