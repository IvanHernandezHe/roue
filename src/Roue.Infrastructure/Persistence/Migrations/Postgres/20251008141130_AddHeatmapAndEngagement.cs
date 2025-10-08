using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Roue.Infrastructure.Persistence.Migrations.Postgres
{
    /// <inheritdoc />
    public partial class AddHeatmapAndEngagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EngagementCampaigns",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Channel = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    TriggerReason = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ScheduledForUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PayloadJson = table.Column<string>(type: "jsonb", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EngagementCampaigns", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserHeatmapEvents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OccurredAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
                    SessionId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    PagePath = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    EventType = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    ElementSelector = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    ElementText = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    OffsetX = table.Column<double>(type: "double precision", nullable: false),
                    OffsetY = table.Column<double>(type: "double precision", nullable: false),
                    ViewportWidth = table.Column<double>(type: "double precision", nullable: false),
                    ViewportHeight = table.Column<double>(type: "double precision", nullable: false),
                    DeviceType = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: true),
                    Referrer = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    AdditionalMetadataJson = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserHeatmapEvents", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserPreferences",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    AcceptsMarketingEmail = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    AcceptsMarketingPush = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    AcceptsMarketingWhatsapp = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPreferences", x => x.UserId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EngagementCampaigns_CreatedAtUtc",
                table: "EngagementCampaigns",
                column: "CreatedAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_EngagementCampaigns_UserId_Status",
                table: "EngagementCampaigns",
                columns: new[] { "UserId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_UserHeatmapEvents_PagePath_EventType",
                table: "UserHeatmapEvents",
                columns: new[] { "PagePath", "EventType" });

            migrationBuilder.CreateIndex(
                name: "IX_UserHeatmapEvents_SessionId_PagePath",
                table: "UserHeatmapEvents",
                columns: new[] { "SessionId", "PagePath" });

            migrationBuilder.CreateIndex(
                name: "IX_UserHeatmapEvents_UserId_OccurredAtUtc",
                table: "UserHeatmapEvents",
                columns: new[] { "UserId", "OccurredAtUtc" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EngagementCampaigns");

            migrationBuilder.DropTable(
                name: "UserHeatmapEvents");

            migrationBuilder.DropTable(
                name: "UserPreferences");
        }
    }
}
