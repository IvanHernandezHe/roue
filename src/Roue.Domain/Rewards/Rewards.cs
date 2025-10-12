namespace Roue.Domain.Rewards;

public enum RewardTxnType
{
    Earn,
    Redeem,
    Adjust
}

public enum CashbackRewardForm
{
    Balance = 0,
    PersonalizedDiscount = 1
}

public sealed class RewardAccount
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public Guid UserId { get; private set; }
    public int Balance { get; private set; }
    public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; private set; } = DateTime.UtcNow;

    public RewardAccount(Guid userId)
    {
        if (userId == Guid.Empty) throw new ArgumentException(nameof(userId));
        UserId = userId;
        Balance = 0;
        var now = DateTime.UtcNow;
        CreatedAtUtc = now;
        UpdatedAtUtc = now;
    }

    private RewardAccount() { }

    public void Credit(int points)
    {
        if (points <= 0) return;
        Balance += points;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public bool TryDebit(int points)
    {
        if (points <= 0) return false;
        if (Balance < points) return false;
        Balance -= points;
        UpdatedAtUtc = DateTime.UtcNow;
        return true;
    }

    public void Adjust(int delta)
    {
        Balance += delta;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}

public sealed class RewardTransaction
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public Guid UserId { get; private set; }
    public Guid AccountId { get; private set; }
    public Guid? OrderId { get; private set; }
    public Guid? RuleId { get; private set; }
    public Guid? CategoryId { get; private set; }
    public RewardTxnType Type { get; private set; }
    public int Points { get; private set; }
    public string Reference { get; private set; } = default!; // OrderId, ajuste, etc.
    public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;

    public decimal Amount => Points / 100m;

    public RewardTransaction(Guid userId, Guid accountId, RewardTxnType type, int points, string reference, Guid? orderId = null, Guid? ruleId = null, Guid? categoryId = null)
    {
        if (userId == Guid.Empty) throw new ArgumentException(nameof(userId));
        if (string.IsNullOrWhiteSpace(reference)) throw new ArgumentException(nameof(reference));
        UserId = userId;
        AccountId = accountId;
        Type = type;
        Points = points;
        Reference = reference;
        OrderId = orderId;
        RuleId = ruleId;
        CategoryId = categoryId;
        CreatedAtUtc = DateTime.UtcNow;
    }

    private RewardTransaction() { }

    public void AttachToAccount(Guid accountId)
    {
        if (accountId == Guid.Empty) throw new ArgumentException(nameof(accountId));
        if (AccountId != Guid.Empty && AccountId != accountId)
            throw new InvalidOperationException("Transaction already linked to another account.");
        AccountId = accountId;
    }
}

public sealed class CashbackRule
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string Name { get; private set; } = default!;
    public Guid? CategoryId { get; private set; }
    public decimal PercentageBack { get; private set; }
    public decimal? FixedAmount { get; private set; }
    public decimal? MaxRewardPerOrder { get; private set; }
    public CashbackRewardForm RewardForm { get; private set; } = CashbackRewardForm.Balance;
    public DateTime? StartsAtUtc { get; private set; }
    public DateTime? EndsAtUtc { get; private set; }
    public int? AppliesAfterOrders { get; private set; }
    public bool Active { get; private set; } = true;
    public string? Description { get; private set; }

    public CashbackRule(string name, decimal percentageBack, decimal? fixedAmount = null, CashbackRewardForm rewardForm = CashbackRewardForm.Balance)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException(nameof(name));
        if (percentageBack < 0) throw new ArgumentOutOfRangeException(nameof(percentageBack));
        if (fixedAmount.HasValue && fixedAmount.Value < 0) throw new ArgumentOutOfRangeException(nameof(fixedAmount));
        Name = name;
        PercentageBack = percentageBack;
        FixedAmount = fixedAmount;
        RewardForm = rewardForm;
    }

    private CashbackRule() { }

    public bool AppliesTo(DateTime orderDateUtc, Guid? categoryId, int completedOrders)
    {
        if (!Active) return false;
        if (StartsAtUtc.HasValue && orderDateUtc < StartsAtUtc.Value) return false;
        if (EndsAtUtc.HasValue && orderDateUtc > EndsAtUtc.Value) return false;
        if (CategoryId.HasValue && CategoryId != categoryId) return false;
        if (AppliesAfterOrders.HasValue && completedOrders < AppliesAfterOrders.Value) return false;
        return true;
    }

    public decimal CalculateReward(decimal baseAmount)
    {
        if (baseAmount <= 0) return 0m;
        decimal reward = 0m;
        if (PercentageBack > 0)
        {
            reward += baseAmount * (PercentageBack / 100m);
        }
        if (FixedAmount.HasValue)
        {
            reward += FixedAmount.Value;
        }
        if (MaxRewardPerOrder.HasValue)
        {
            reward = Math.Min(reward, MaxRewardPerOrder.Value);
        }
        return reward < 0 ? 0 : Math.Round(reward, 2, MidpointRounding.AwayFromZero);
    }
}

public sealed class PersonalizedDiscountReward
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public Guid UserId { get; private set; }
    public Guid RuleId { get; private set; }
    public string RuleName { get; private set; } = default!;
    public Guid? CategoryId { get; private set; }
    public decimal Percentage { get; private set; }
    public decimal? FixedAmount { get; private set; }
    public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;
    public DateTime? ExpiresAtUtc { get; private set; }
    public bool Redeemed { get; private set; }
    public DateTime? RedeemedAtUtc { get; private set; }

    public PersonalizedDiscountReward(Guid userId, Guid ruleId, string ruleName, Guid? categoryId, decimal percentage, decimal? fixedAmount, DateTime createdAtUtc, DateTime? expiresAtUtc)
    {
        if (userId == Guid.Empty) throw new ArgumentException(nameof(userId));
        if (ruleId == Guid.Empty) throw new ArgumentException(nameof(ruleId));
        if (string.IsNullOrWhiteSpace(ruleName)) throw new ArgumentException(nameof(ruleName));
        UserId = userId;
        RuleId = ruleId;
        RuleName = ruleName;
        CategoryId = categoryId;
        Percentage = percentage;
        FixedAmount = fixedAmount;
        CreatedAtUtc = createdAtUtc;
        ExpiresAtUtc = expiresAtUtc;
    }

    private PersonalizedDiscountReward() { }

    public void MarkRedeemed(DateTime redeemedAtUtc)
    {
        if (Redeemed) return;
        Redeemed = true;
        RedeemedAtUtc = redeemedAtUtc;
    }
}
