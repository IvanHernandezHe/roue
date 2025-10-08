using System;

namespace Roue.Application.Interface;

public interface IEngagementService
{
    Task<int> GenerateInactiveCustomerCampaignsAsync(TimeSpan inactivityThreshold,
                                                     DateTime asOfUtc,
                                                     CancellationToken ct = default);
    Task<IReadOnlyList<EngagementCampaignDto>> GetPendingCampaignsAsync(CancellationToken ct = default);
}

public sealed record EngagementCampaignDto(Guid Id,
                                           Guid UserId,
                                           string Channel,
                                           string TriggerReason,
                                           string Status,
                                           DateTime CreatedAtUtc,
                                           DateTime? ScheduledForUtc,
                                           DateTime? CompletedAtUtc,
                                           string? PayloadJson);
