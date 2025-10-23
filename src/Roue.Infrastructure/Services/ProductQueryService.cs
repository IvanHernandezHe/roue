using Microsoft.EntityFrameworkCore;
using Roue.Application.DTOs;
using Roue.Application.Interface;
using Roue.Domain.Inventory;
using Roue.Infrastructure.Persistence;

namespace Roue.Infrastructure.Services;

public sealed class ProductQueryService : IProductQueryService
{
    private readonly AppDbContext _db;
    public ProductQueryService(AppDbContext db) { _db = db; }

    public async Task<IReadOnlyList<ProductListItemDto>> SearchAsync(string? q, string? category = null, int take = 50, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var query =
            from p in _db.Products.AsNoTracking().Where(p => p.Active)
            join br in _db.Brands.AsNoTracking().Where(b => b.Active) on p.BrandId equals br.Id
            join cat in _db.ProductCategories.AsNoTracking() on p.CategoryId equals cat.Id into cjoin
            from c in cjoin.DefaultIfEmpty()
            join inv in _db.Inventory.AsNoTracking() on p.Id equals inv.ProductId into invJoin
            from inv in invJoin.DefaultIfEmpty()
            join tireSpecs in _db.TireSpecs.AsNoTracking() on p.Id equals tireSpecs.ProductId into tireJoin
            from tire in tireJoin.DefaultIfEmpty()
            select new { Product = p, Brand = br, Category = c, Inventory = inv, Tire = tire };

        if (!string.IsNullOrWhiteSpace(q))
        {
            query = query.Where(row => row.Brand.Name.Contains(q) || row.Product.ModelName.Contains(q) || row.Product.Sku.Contains(q));
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(row => row.Category != null && (row.Category.Slug == category || row.Category.Name == category));
        }

        var list = await (
            from row in query
            let reserved = (_db.InventoryReservations
                .Where(r => r.ProductId == row.Product.Id && r.Status == ReservationStatus.Active && r.ExpiresAtUtc > now)
                .Sum(r => (int?)r.Quantity)) ?? 0
            let onHand = row.Inventory == null ? 0 : row.Inventory.OnHand
            let stock = (onHand - reserved) < 0 ? 0 : (onHand - reserved)
            let tireDto = row.Tire == null ? null : new TireSpecsDto(row.Tire.Type, row.Tire.LoadIndex, row.Tire.SpeedRating)
            orderby row.Brand.Name
            select new ProductListItemDto(
                row.Product.Id,
                row.Product.Sku,
                row.Brand.Name,
                row.Product.ModelName,
                row.Product.Size,
                row.Product.Price,
                row.Product.Active,
                stock,
                row.Category != null ? row.Category.Name : null,
                row.Brand.LogoUrl,
                tireDto,
                row.Product.PromoLabel,
                row.Product.IsFeatured)
        ).Take(take).ToListAsync(ct);
        return list;
    }

    public async Task<ProductDetailDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var row = await (
            from p in _db.Products.AsNoTracking().Where(x => x.Id == id && x.Active)
            join br in _db.Brands.AsNoTracking().Where(b => b.Active) on p.BrandId equals br.Id
            join cat in _db.ProductCategories.AsNoTracking() on p.CategoryId equals cat.Id into cjoin
            from c in cjoin.DefaultIfEmpty()
            join inv in _db.Inventory.AsNoTracking() on p.Id equals inv.ProductId into invJoin
            from inv in invJoin.DefaultIfEmpty()
            select new { Product = p, Brand = br, Category = c, Inventory = inv }
        ).FirstOrDefaultAsync(ct);
        if (row is null) return null;
        var reserved = await _db.InventoryReservations
            .Where(r => r.ProductId == id && r.Status == ReservationStatus.Active && r.ExpiresAtUtc > now)
            .SumAsync(r => (int?)r.Quantity, ct) ?? 0;
        var onHand = row.Inventory?.OnHand ?? 0;
        var stock = (onHand - reserved) < 0 ? 0 : (onHand - reserved);

        IReadOnlyList<string> images = Array.Empty<string>();
        if (!string.IsNullOrWhiteSpace(row.Product.ImagesJson))
        {
            try { images = System.Text.Json.JsonSerializer.Deserialize<string[]>(row.Product.ImagesJson!) ?? Array.Empty<string>(); }
            catch { images = Array.Empty<string>(); }
        }
        // Normalize any stored file-system-like paths to web URLs (e.g., ensure '/assets/..')
        images = images
            .Where(s => !string.IsNullOrWhiteSpace(s))
            .Select(NormalizeImageUrl)
            .Where(s => !string.IsNullOrWhiteSpace(s))
            .ToArray();
        var tireSpecs = await _db.TireSpecs.AsNoTracking().FirstOrDefaultAsync(ts => ts.ProductId == id, ct);
        var rimSpecs = await _db.RimSpecs.AsNoTracking().FirstOrDefaultAsync(rs => rs.ProductId == id, ct);

        TireSpecsDto? tire = tireSpecs is null ? null : new TireSpecsDto(tireSpecs.Type, tireSpecs.LoadIndex, tireSpecs.SpeedRating);
        RimSpecsDto? rim = rimSpecs is null ? null : new RimSpecsDto(rimSpecs.DiameterIn, rimSpecs.WidthIn, rimSpecs.BoltPattern, rimSpecs.OffsetMm, rimSpecs.CenterBoreMm, rimSpecs.Material, rimSpecs.Finish);

        return new ProductDetailDto(
            row.Product.Id,
            row.Product.Sku,
            row.Brand.Name,
            row.Product.ModelName,
            row.Product.Size,
            row.Product.Price,
            row.Product.Active,
            stock,
            row.Brand.LogoUrl,
            images,
            tire,
            rim,
            row.Category?.Name,
            row.Product.PromoLabel,
            row.Product.IsFeatured);
    }

    private static string NormalizeImageUrl(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return string.Empty;
        var s = raw.Trim();
        // Allow absolute URLs as-is
        if (s.StartsWith("http://", StringComparison.OrdinalIgnoreCase) || s.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            return s;
        // If it already looks like a web path under /assets, collapse anything before 'assets/' and ensure leading '/'
        var idx = s.IndexOf("assets/", StringComparison.OrdinalIgnoreCase);
        if (idx >= 0)
        {
            var slice = s.Substring(idx).Replace("\\", "/");
            if (!slice.StartsWith("/")) slice = "/" + slice;
            return slice;
        }
        // Strip common local prefixes like 'public/' or '/public/'
        if (s.StartsWith("public/", StringComparison.OrdinalIgnoreCase)) s = s.Substring("public/".Length);
        if (s.StartsWith("/public/", StringComparison.OrdinalIgnoreCase)) s = s.Substring("/public/".Length);
        s = s.Replace("\\", "/");
        if (!s.StartsWith("/")) s = "/" + s;
        return s;
    }
}
