namespace Roue.Application.DTOs;

public sealed record CashbackLineDto(Guid RuleId, string RuleName, decimal Amount, Guid? CategoryId);

public sealed record CashbackDiscountDto(Guid RuleId, string RuleName, decimal Percentage, decimal? FixedAmount, Guid? CategoryId, DateTime? ExpiresAtUtc);

public sealed record CashbackPreviewDto(
    decimal BalanceAmount,
    IReadOnlyList<CashbackLineDto> BalanceBreakdown,
    IReadOnlyList<CashbackDiscountDto> DiscountRewards
);

public sealed record CashbackAppliedDto(
    decimal BalanceAmount,
    int PointsCredited,
    IReadOnlyList<CashbackLineDto> BalanceBreakdown,
    IReadOnlyList<CashbackDiscountDto> DiscountRewards
);

public sealed record RewardTransactionDto(Guid Id, string Type, decimal Amount, string Reference, DateTime CreatedAtUtc);

public sealed record RewardAccountDto(
    decimal Balance,
    IReadOnlyList<RewardTransactionDto> Transactions,
    IReadOnlyList<CashbackDiscountDto> DiscountRewards,
    DateTime? UpdatedAtUtc
);

public sealed record CashbackRuleDto(
    Guid Id,
    string Name,
    decimal PercentageBack,
    decimal? FixedAmount,
    bool RewardAsBalance,
    Guid? CategoryId,
    DateTime? StartsAtUtc,
    DateTime? EndsAtUtc,
    int? AppliesAfterOrders,
    decimal? MaxRewardPerOrder,
    string? Description
);
