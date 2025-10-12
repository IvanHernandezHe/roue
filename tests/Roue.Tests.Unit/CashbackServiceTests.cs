using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Roue.Application.DTOs;
using Roue.Domain.Products;
using Roue.Domain.Rewards;
using Roue.Infrastructure.Persistence;
using Roue.Infrastructure.Services;

namespace Roue.Tests.Unit;

public sealed class CashbackServiceTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly CashbackService _sut;

    public CashbackServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _db = new AppDbContext(options);
        _db.Database.EnsureCreated();
        _sut = new CashbackService(_db, NullLogger<CashbackService>.Instance);

        SeedCatalog();
    }

    [Fact]
    public async Task Preview_ReturnsCashbackForCategoryRule()
    {
        var (product, rule) = await SeedRuleAsync(percentage: 5m);

        var items = new List<OrderItemLineDto>
        {
            new(product.Id, $"{product.Brand.Name} {product.ModelName}", product.Sku, product.Size, product.Price, 2, product.Price * 2)
        };

        var preview = await _sut.PreviewAsync(null, items, DateTime.UtcNow, CancellationToken.None);

        Assert.NotNull(preview);
        Assert.Equal(100m, preview.BalanceAmount);
        Assert.Single(preview.BalanceBreakdown);
        Assert.Equal(rule.Id, preview.BalanceBreakdown.First().RuleId);
    }

    [Fact]
    public async Task ApplyAsync_CreatesAccountAndTransactionForUser()
    {
        var userId = Guid.NewGuid();
        var (product, rule) = await SeedRuleAsync(percentage: 10m);

        var order = new Roue.Domain.Orders.Order();
        order.GetType().GetProperty(nameof(Roue.Domain.Orders.Order.Id))!.SetValue(order, Guid.NewGuid());
        order.GetType().GetProperty(nameof(Roue.Domain.Orders.Order.UserId))!.SetValue(order, userId);
        order.GetType().GetProperty(nameof(Roue.Domain.Orders.Order.Subtotal))!.SetValue(order, 2000m);
        order.GetType().GetProperty(nameof(Roue.Domain.Orders.Order.Total))!.SetValue(order, 2000m);
        order.GetType().GetProperty(nameof(Roue.Domain.Orders.Order.CreatedAtUtc))!.SetValue(order, DateTime.UtcNow);

        var orderItem = new Roue.Domain.Orders.OrderItem();
        orderItem.GetType().GetProperty(nameof(Roue.Domain.Orders.OrderItem.Id))!.SetValue(orderItem, Guid.NewGuid());
        orderItem.GetType().GetProperty(nameof(Roue.Domain.Orders.OrderItem.OrderId))!.SetValue(orderItem, order.Id);
        orderItem.GetType().GetProperty(nameof(Roue.Domain.Orders.OrderItem.ProductId))!.SetValue(orderItem, product.Id);
        orderItem.GetType().GetProperty(nameof(Roue.Domain.Orders.OrderItem.ProductName))!.SetValue(orderItem, $"{product.Brand.Name} {product.ModelName}");
        orderItem.GetType().GetProperty(nameof(Roue.Domain.Orders.OrderItem.ProductSku))!.SetValue(orderItem, product.Sku);
        orderItem.GetType().GetProperty(nameof(Roue.Domain.Orders.OrderItem.Size))!.SetValue(orderItem, product.Size);
        orderItem.GetType().GetProperty(nameof(Roue.Domain.Orders.OrderItem.UnitPrice))!.SetValue(orderItem, product.Price);
        orderItem.GetType().GetProperty(nameof(Roue.Domain.Orders.OrderItem.Quantity))!.SetValue(orderItem, 2);

        _db.Orders.Add(order);
        _db.OrderItems.Add(orderItem);
        await _db.SaveChangesAsync();

        var result = await _sut.ApplyAsync(order, CancellationToken.None);
        await _db.SaveChangesAsync();

        Assert.Equal(200m, result.BalanceAmount);
        Assert.Equal(20000, result.PointsCredited);
        Assert.Single(result.BalanceBreakdown);
        Assert.Equal(rule.Id, result.BalanceBreakdown.First().RuleId);

        var account = await _db.RewardAccounts.AsNoTracking().FirstOrDefaultAsync(a => a.UserId == userId);
        Assert.NotNull(account);
        Assert.Equal(20000, account!.Balance);

        var transaction = await _db.RewardTransactions.AsNoTracking().FirstOrDefaultAsync(t => t.UserId == userId);
        Assert.NotNull(transaction);
        Assert.Equal(20000, transaction!.Points);
        Assert.Equal(rule.Id, transaction.RuleId);
    }

    private async Task<(Product product, CashbackRule rule)> SeedRuleAsync(decimal percentage)
    {
        var brand = await _db.Brands.AsNoTracking().FirstAsync();
        var category = await _db.ProductCategories.AsNoTracking().FirstAsync();
        var product = new Product("SKU-1", brand.Id, "Touring", "205/55R16", 1000m, category.Id);
        _db.Products.Add(product);

        var rule = new CashbackRule("Rule Touring", percentage);
        typeof(CashbackRule).GetProperty(nameof(CashbackRule.CategoryId))!.SetValue(rule, category.Id);
        _db.CashbackRules.Add(rule);

        await _db.SaveChangesAsync();
        product = await _db.Products.Include(p => p.Brand).FirstAsync();
        return (product, rule);
    }

    private void SeedCatalog()
    {
        if (!_db.Brands.Any())
        {
            _db.Brands.Add(new Brand("Seed brand"));
        }
        if (!_db.ProductCategories.Any())
        {
            _db.ProductCategories.Add(new ProductCategory("Touring", "touring"));
        }
        _db.SaveChanges();
    }

    public void Dispose()
    {
        _db.Dispose();
    }
}
