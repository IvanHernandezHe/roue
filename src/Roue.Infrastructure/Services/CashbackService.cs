using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Roue.Application.DTOs;
using Roue.Application.Interface;
using Roue.Domain.Orders;
using Roue.Domain.Rewards;
using Roue.Infrastructure.Persistence;

namespace Roue.Infrastructure.Services;

public sealed class CashbackService : ICashbackService
{
    private readonly AppDbContext _db;
    private readonly ILogger<CashbackService> _logger;

    public CashbackService(AppDbContext db, ILogger<CashbackService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<CashbackPreviewDto> PreviewAsync(Guid? userId, IReadOnlyList<OrderItemLineDto> items, DateTime? orderDateUtc = null, CancellationToken ct = default)
    {
        var calculation = await CalculateInternalAsync(
            NormalizeUser(userId),
            items,
            orderDateUtc ?? DateTime.UtcNow,
            materializeTransactions: false,
            ct);

        return new CashbackPreviewDto(
            calculation.BalanceAmount,
            calculation.BalanceBreakdown,
            calculation.DiscountRewards);
    }

    public async Task<CashbackAppliedDto> ApplyAsync(Order order, CancellationToken ct = default)
    {
        if (order is null) throw new ArgumentNullException(nameof(order));

        var orderItems = await _db.OrderItems.AsNoTracking()
            .Where(i => i.OrderId == order.Id)
            .Select(i => new OrderItemLineDto(i.ProductId, i.ProductName, i.ProductSku, i.Size, i.UnitPrice, i.Quantity, i.UnitPrice * i.Quantity))
            .ToListAsync(ct);

        var calculation = await CalculateInternalAsync(
            order.UserId,
            orderItems,
            order.CreatedAtUtc,
            materializeTransactions: true,
            ct,
            order.Id);

        if (calculation.Transactions.Count > 0 && calculation.PointsCredited > 0)
        {
            var account = await _db.RewardAccounts.FirstOrDefaultAsync(a => a.UserId == order.UserId, ct);
            if (account is null)
            {
                account = new RewardAccount(order.UserId);
                _db.RewardAccounts.Add(account);
            }

            foreach (var txn in calculation.Transactions)
            {
                txn.AttachToAccount(account.Id);
                _db.RewardTransactions.Add(txn);
            }

            account.Credit(calculation.PointsCredited);
        }

        foreach (var reward in calculation.DiscountEntities)
        {
            _db.PersonalizedDiscountRewards.Add(reward);
        }

        if (calculation.PointsCredited == 0 && calculation.DiscountEntities.Count == 0)
        {
            _logger.LogDebug("Order {OrderId} did not qualify for cashback rewards.", order.Id);
        }

        return new CashbackAppliedDto(
            calculation.BalanceAmount,
            calculation.PointsCredited,
            calculation.BalanceBreakdown,
            calculation.DiscountRewards);
    }

    public async Task<RewardAccountDto> GetAccountAsync(Guid userId, CancellationToken ct = default)
    {
        var normalizedUser = NormalizeUser(userId);
        if (!normalizedUser.HasValue)
        {
            return new RewardAccountDto(0m, Array.Empty<RewardTransactionDto>(), Array.Empty<CashbackDiscountDto>(), null);
        }

        var account = await _db.RewardAccounts.AsNoTracking()
            .FirstOrDefaultAsync(a => a.UserId == normalizedUser.Value, ct);
        var balancePoints = account?.Balance ?? 0;
        var balanceAmount = Math.Round(balancePoints / 100m, 2, MidpointRounding.AwayFromZero);

        var transactions = await _db.RewardTransactions.AsNoTracking()
            .Where(t => t.UserId == normalizedUser.Value)
            .OrderByDescending(t => t.CreatedAtUtc)
            .Take(100)
            .Select(t => new RewardTransactionDto(
                t.Id,
                t.Type.ToString(),
                t.Amount,
                t.Reference,
                t.CreatedAtUtc))
            .ToListAsync(ct);

        var now = DateTime.UtcNow;
        var discounts = await _db.PersonalizedDiscountRewards.AsNoTracking()
            .Where(r => r.UserId == normalizedUser.Value && !r.Redeemed && (!r.ExpiresAtUtc.HasValue || r.ExpiresAtUtc > now))
            .OrderBy(r => r.ExpiresAtUtc ?? DateTime.MaxValue)
            .Select(r => new CashbackDiscountDto(r.Id, r.RuleName, r.Percentage, r.FixedAmount, r.CategoryId, r.ExpiresAtUtc))
            .ToListAsync(ct);

        return new RewardAccountDto(balanceAmount, transactions, discounts, account?.UpdatedAtUtc);
    }

    public async Task<IReadOnlyList<CashbackRuleDto>> GetActiveRulesAsync(CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var rules = await _db.CashbackRules.AsNoTracking()
            .Where(r => r.Active && (!r.StartsAtUtc.HasValue || r.StartsAtUtc <= now) && (!r.EndsAtUtc.HasValue || r.EndsAtUtc >= now))
            .OrderBy(r => r.Name)
            .Select(r => new CashbackRuleDto(
                r.Id,
                r.Name,
                r.PercentageBack,
                r.FixedAmount,
                r.RewardForm == CashbackRewardForm.Balance,
                r.CategoryId,
                r.StartsAtUtc,
                r.EndsAtUtc,
                r.AppliesAfterOrders,
                r.MaxRewardPerOrder,
                r.Description))
            .ToListAsync(ct);

        return rules;
    }

    private async Task<CalculationResult> CalculateInternalAsync(
        Guid? userId,
        IReadOnlyList<OrderItemLineDto> items,
        DateTime orderDateUtc,
        bool materializeTransactions,
        CancellationToken ct,
        Guid? orderIdForReference = null)
    {
        if (items is null || items.Count == 0)
        {
            return CalculationResult.Empty;
        }

        var normalizedItems = items
            .Where(i => i.Quantity > 0 && i.UnitPrice >= 0)
            .ToList();

        if (normalizedItems.Count == 0)
        {
            return CalculationResult.Empty;
        }

        var productIds = normalizedItems.Select(i => i.ProductId).Distinct().ToList();

        var productCategories = await _db.Products.AsNoTracking()
            .Where(p => productIds.Contains(p.Id))
            .Select(p => new { p.Id, p.CategoryId })
            .ToListAsync(ct);
        var categoryLookup = productCategories.ToDictionary(p => p.Id, p => p.CategoryId);

        var now = orderDateUtc;
        var rules = await _db.CashbackRules.AsNoTracking()
            .Where(r => r.Active && (!r.StartsAtUtc.HasValue || r.StartsAtUtc.Value <= now) && (!r.EndsAtUtc.HasValue || r.EndsAtUtc.Value >= now))
            .ToListAsync(ct);

        var completedOrders = 0;
        if (userId.HasValue)
        {
            var uid = userId.Value;
            completedOrders = await _db.Orders.AsNoTracking()
                .Where(o => o.UserId == uid && o.PaymentStatus == PaymentStatus.Succeeded && (!orderIdForReference.HasValue || o.Id != orderIdForReference.Value) && o.CreatedAtUtc <= now)
                .CountAsync(ct);
        }

        if (rules.Count == 0)
        {
            return CalculationResult.Empty;
        }

        var balanceBreakdown = new List<CashbackLineDto>();
        var discountDtos = new List<CashbackDiscountDto>();
        var discountEntities = new List<PersonalizedDiscountReward>();
        var transactions = new List<RewardTransaction>();
        decimal totalBalance = 0m;
        var totalPoints = 0;

        foreach (var rule in rules)
        {
            decimal applicableTotal = 0m;
            foreach (var line in normalizedItems)
            {
                var categoryId = categoryLookup.TryGetValue(line.ProductId, out var match) ? match : null;
                if (!rule.AppliesTo(orderDateUtc, categoryId, completedOrders))
                {
                    continue;
                }
                applicableTotal += line.LineTotal;
            }

            if (rule.RewardForm == CashbackRewardForm.PersonalizedDiscount)
            {
                if (applicableTotal <= 0) continue;
                var discountDto = new CashbackDiscountDto(
                    rule.Id,
                    rule.Name,
                    rule.PercentageBack,
                    rule.FixedAmount,
                    rule.CategoryId,
                    rule.EndsAtUtc);
                discountDtos.Add(discountDto);
                if (materializeTransactions && userId.HasValue)
                {
                    var createdReward = new PersonalizedDiscountReward(
                        userId.Value,
                        rule.Id,
                        rule.Name,
                        rule.CategoryId,
                        rule.PercentageBack,
                        rule.FixedAmount,
                        orderDateUtc,
                        rule.EndsAtUtc ?? orderDateUtc.AddMonths(3));
                    discountEntities.Add(createdReward);
                }
                continue;
            }

            if (applicableTotal <= 0 && (!rule.FixedAmount.HasValue || rule.FixedAmount.Value <= 0))
            {
                continue;
            }

            var rewardAmount = rule.CalculateReward(applicableTotal);
            if (rewardAmount <= 0)
            {
                continue;
            }

            totalBalance += rewardAmount;
            balanceBreakdown.Add(new CashbackLineDto(rule.Id, rule.Name, rewardAmount, rule.CategoryId));

            if (materializeTransactions && userId.HasValue && orderIdForReference.HasValue)
            {
                var points = ConvertToPoints(rewardAmount);
                totalPoints += points;
                var reference = $"order:{orderIdForReference.Value}";
                transactions.Add(new RewardTransaction(
                    userId.Value,
                    Guid.Empty, // placeholder, will be set later once account is ensured
                    RewardTxnType.Earn,
                    points,
                    $"{reference}:rule:{rule.Id}",
                    orderIdForReference.Value,
                    rule.Id,
                    rule.CategoryId));
            }
            else if (!materializeTransactions)
            {
                totalPoints += ConvertToPoints(rewardAmount);
            }
        }

        return totalBalance == 0m && discountDtos.Count == 0
            ? CalculationResult.Empty
            : new CalculationResult(
                Math.Round(totalBalance, 2, MidpointRounding.AwayFromZero),
                totalPoints,
                balanceBreakdown,
                discountDtos,
                transactions,
                discountEntities);
    }

    private static Guid? NormalizeUser(Guid? userId)
    {
        if (!userId.HasValue || userId.Value == Guid.Empty) return null;
        return userId;
    }

    private static int ConvertToPoints(decimal amount)
        => (int)Math.Round(amount * 100m, MidpointRounding.AwayFromZero);

    private sealed record CalculationResult(
        decimal BalanceAmount,
        int PointsCredited,
        IReadOnlyList<CashbackLineDto> BalanceBreakdown,
        IReadOnlyList<CashbackDiscountDto> DiscountRewards,
        IReadOnlyList<RewardTransaction> Transactions,
        IReadOnlyList<PersonalizedDiscountReward> DiscountEntities)
    {
        public static CalculationResult Empty { get; } = new(0m, 0, Array.Empty<CashbackLineDto>(), Array.Empty<CashbackDiscountDto>(), Array.Empty<RewardTransaction>(), Array.Empty<PersonalizedDiscountReward>());
    }
}
