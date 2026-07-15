using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Shefaa.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddReportsAndAttachments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "role-clinicadmin",
                column: "CreatedAt",
                value: new DateTime(2026, 6, 30, 8, 6, 23, 654, DateTimeKind.Utc).AddTicks(1998));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "role-clinicstaff",
                column: "CreatedAt",
                value: new DateTime(2026, 6, 30, 8, 6, 23, 654, DateTimeKind.Utc).AddTicks(1997));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "role-doctor",
                column: "CreatedAt",
                value: new DateTime(2026, 6, 30, 8, 6, 23, 654, DateTimeKind.Utc).AddTicks(1995));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "role-patient",
                column: "CreatedAt",
                value: new DateTime(2026, 6, 30, 8, 6, 23, 654, DateTimeKind.Utc).AddTicks(1608));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "role-sysadmin",
                column: "CreatedAt",
                value: new DateTime(2026, 6, 30, 8, 6, 23, 654, DateTimeKind.Utc).AddTicks(2000));
        }
    }
}
