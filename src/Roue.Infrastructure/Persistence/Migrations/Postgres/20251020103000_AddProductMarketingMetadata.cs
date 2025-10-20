using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Roue.Infrastructure.Persistence.Migrations.Postgres
{
    /// <inheritdoc />
    public partial class AddProductMarketingMetadata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsFeatured",
                table: "Products",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PromoLabel",
                table: "Products",
                type: "character varying(160)",
                maxLength: 160,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsFeatured",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "PromoLabel",
                table: "Products");
        }
    }
}
