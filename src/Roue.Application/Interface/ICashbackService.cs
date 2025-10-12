using Roue.Application.DTOs;
using Roue.Domain.Orders;

namespace Roue.Application.Interface;

public interface ICashbackService
{
    Task<CashbackPreviewDto> PreviewAsync(Guid? userId, IReadOnlyList<OrderItemLineDto> items, DateTime? orderDateUtc = null, CancellationToken ct = default);
    Task<CashbackAppliedDto> ApplyAsync(Order order, CancellationToken ct = default);
    Task<RewardAccountDto> GetAccountAsync(Guid userId, CancellationToken ct = default);
    Task<IReadOnlyList<CashbackRuleDto>> GetActiveRulesAsync(CancellationToken ct = default);
}
