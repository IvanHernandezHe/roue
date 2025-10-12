using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Roue.Infrastructure.Persistence.Migrations.Postgres
{
    /// <inheritdoc />
    public partial class AddCashbackAndPersonalizedRewards : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Reference",
                table: "RewardTransactions",
                type: "character varying(128)",
                maxLength: 128,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<Guid>(
                name: "CategoryId",
                table: "RewardTransactions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "OrderId",
                table: "RewardTransactions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "RuleId",
                table: "RewardTransactions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "RewardTransactions",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAtUtc",
                table: "RewardAccounts",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                table: "RewardAccounts",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateTable(
                name: "CashbackRules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    CategoryId = table.Column<Guid>(type: "uuid", nullable: true),
                    PercentageBack = table.Column<decimal>(type: "numeric", nullable: false),
                    FixedAmount = table.Column<decimal>(type: "numeric", nullable: true),
                    MaxRewardPerOrder = table.Column<decimal>(type: "numeric", nullable: true),
                    RewardForm = table.Column<int>(type: "integer", nullable: false),
                    StartsAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EndsAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AppliesAfterOrders = table.Column<int>(type: "integer", nullable: true),
                    Active = table.Column<bool>(type: "boolean", nullable: false),
                    Description = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CashbackRules", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PersonalizedDiscountRewards",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    RuleId = table.Column<Guid>(type: "uuid", nullable: false),
                    RuleName = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    CategoryId = table.Column<Guid>(type: "uuid", nullable: true),
                    Percentage = table.Column<decimal>(type: "numeric", nullable: false),
                    FixedAmount = table.Column<decimal>(type: "numeric", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiresAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Redeemed = table.Column<bool>(type: "boolean", nullable: false),
                    RedeemedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PersonalizedDiscountRewards", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RewardTransactions_UserId_CreatedAtUtc",
                table: "RewardTransactions",
                columns: new[] { "UserId", "CreatedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_RewardAccounts_UserId",
                table: "RewardAccounts",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CashbackRules_Active",
                table: "CashbackRules",
                column: "Active");

            migrationBuilder.CreateIndex(
                name: "IX_CashbackRules_EndsAtUtc",
                table: "CashbackRules",
                column: "EndsAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_CashbackRules_StartsAtUtc",
                table: "CashbackRules",
                column: "StartsAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_PersonalizedDiscountRewards_UserId_Redeemed",
                table: "PersonalizedDiscountRewards",
                columns: new[] { "UserId", "Redeemed" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CashbackRules");

            migrationBuilder.DropTable(
                name: "PersonalizedDiscountRewards");

            migrationBuilder.DropIndex(
                name: "IX_RewardTransactions_UserId_CreatedAtUtc",
                table: "RewardTransactions");

            migrationBuilder.DropIndex(
                name: "IX_RewardAccounts_UserId",
                table: "RewardAccounts");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "RewardTransactions");

            migrationBuilder.DropColumn(
                name: "OrderId",
                table: "RewardTransactions");

            migrationBuilder.DropColumn(
                name: "RuleId",
                table: "RewardTransactions");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "RewardTransactions");

            migrationBuilder.DropColumn(
                name: "CreatedAtUtc",
                table: "RewardAccounts");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                table: "RewardAccounts");

            migrationBuilder.AlterColumn<string>(
                name: "Reference",
                table: "RewardTransactions",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(128)",
                oldMaxLength: 128);
        }
    }
}
