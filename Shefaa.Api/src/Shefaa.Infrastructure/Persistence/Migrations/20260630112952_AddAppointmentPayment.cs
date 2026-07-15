using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Shefaa.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAppointmentPayment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "role-clinicadmin",
                column: "CreatedAt",
                value: new DateTime(2026, 6, 30, 11, 29, 51, 325, DateTimeKind.Utc).AddTicks(2096));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "role-clinicstaff",
                column: "CreatedAt",
                value: new DateTime(2026, 6, 30, 11, 29, 51, 325, DateTimeKind.Utc).AddTicks(2095));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "role-doctor",
                column: "CreatedAt",
                value: new DateTime(2026, 6, 30, 11, 29, 51, 325, DateTimeKind.Utc).AddTicks(2093));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "role-patient",
                column: "CreatedAt",
                value: new DateTime(2026, 6, 30, 11, 29, 51, 325, DateTimeKind.Utc).AddTicks(1698));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "role-sysadmin",
                column: "CreatedAt",
                value: new DateTime(2026, 6, 30, 11, 29, 51, 325, DateTimeKind.Utc).AddTicks(2098));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "role-clinicadmin",
                column: "CreatedAt",
                value: new DateTime(2026, 6, 30, 8, 48, 6, 889, DateTimeKind.Utc).AddTicks(1828));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "role-clinicstaff",
                column: "CreatedAt",
                value: new DateTime(2026, 6, 30, 8, 48, 6, 889, DateTimeKind.Utc).AddTicks(1826));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "role-doctor",
                column: "CreatedAt",
                value: new DateTime(2026, 6, 30, 8, 48, 6, 889, DateTimeKind.Utc).AddTicks(1824));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "role-patient",
                column: "CreatedAt",
                value: new DateTime(2026, 6, 30, 8, 48, 6, 889, DateTimeKind.Utc).AddTicks(1384));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "role-sysadmin",
                column: "CreatedAt",
                value: new DateTime(2026, 6, 30, 8, 48, 6, 889, DateTimeKind.Utc).AddTicks(1829));
        }
    }
}
