using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Shefaa.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class MakeClinicAddressOptionalAndAddSpecialtyLink : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Address",
                table: "Clinics",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.AddColumn<int>(
                name: "SpecialtyId",
                table: "Clinics",
                type: "int",
                nullable: true);



            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "role-clinicadmin",
                column: "CreatedAt",
                value: new DateTime(2026, 7, 9, 8, 28, 51, 710, DateTimeKind.Utc).AddTicks(7134));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "role-clinicstaff",
                column: "CreatedAt",
                value: new DateTime(2026, 7, 9, 8, 28, 51, 710, DateTimeKind.Utc).AddTicks(7132));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "role-doctor",
                column: "CreatedAt",
                value: new DateTime(2026, 7, 9, 8, 28, 51, 710, DateTimeKind.Utc).AddTicks(7130));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "role-patient",
                column: "CreatedAt",
                value: new DateTime(2026, 7, 9, 8, 28, 51, 710, DateTimeKind.Utc).AddTicks(6727));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: "role-sysadmin",
                column: "CreatedAt",
                value: new DateTime(2026, 7, 9, 8, 28, 51, 710, DateTimeKind.Utc).AddTicks(7135));

            migrationBuilder.CreateIndex(
                name: "IX_Clinics_SpecialtyId",
                table: "Clinics",
                column: "SpecialtyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Clinics_Specialties_SpecialtyId",
                table: "Clinics",
                column: "SpecialtyId",
                principalTable: "Specialties",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Clinics_Specialties_SpecialtyId",
                table: "Clinics");

            migrationBuilder.DropIndex(
                name: "IX_Clinics_SpecialtyId",
                table: "Clinics");

            migrationBuilder.DropColumn(
                name: "SpecialtyId",
                table: "Clinics");



            migrationBuilder.AlterColumn<string>(
                name: "Address",
                table: "Clinics",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

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
    }
}
