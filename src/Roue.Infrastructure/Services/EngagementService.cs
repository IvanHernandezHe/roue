using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Roue.Application.Interface;
using Roue.Domain.Analytics;
using Roue.Infrastructure.Persistence;

namespace Roue.Infrastructure.Services;

public sealed class EngagementService : IEngagementService
{
    private readonly AppDbContext _db;

    public EngagementService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<int> GenerateInactiveCustomerCampaignsAsync(TimeSpan inactivityThreshold, DateTime asOfUtc, CancellationToken ct = default)
    {
        var cutoff = asOfUtc - inactivityThreshold;

        var optedUsers = await _db.UserPreferences.AsNoTracking()
            .Where(p => p.AcceptsMarketingEmail || p.AcceptsMarketingPush || p.AcceptsMarketingWhatsapp)
            .Select(p => new
            {
                p.UserId,
                p.AcceptsMarketingEmail,
                p.AcceptsMarketingPush,
                p.AcceptsMarketingWhatsapp,
                p.UpdatedAtUtc
            })
            .ToListAsync(ct);
        if (optedUsers.Count == 0) return 0;

        var userIds = optedUsers.Select(p => p.UserId).ToList();

        var lastActivities = await _db.UserActivities.AsNoTracking()
            .Where(a => a.UserId != null && userIds.Contains(a.UserId.Value))
            .GroupBy(a => a.UserId!.Value)
            .Select(g => new { UserId = g.Key, Last = g.Max(x => x.OccurredAtUtc) })
            .ToDictionaryAsync(x => x.UserId, x => x.Last, ct);

        var lastOrders = await _db.Orders.AsNoTracking()
            .Where(o => userIds.Contains(o.UserId))
            .GroupBy(o => o.UserId)
            .Select(g => new { UserId = g.Key, Last = g.Max(x => x.CreatedAtUtc) })
            .ToDictionaryAsync(x => x.UserId, x => x.Last, ct);

        var existingActiveCampaigns = await _db.EngagementCampaigns.AsNoTracking()
            .Where(c => userIds.Contains(c.UserId) && (c.Status == EngagementCampaignStatus.Pending || c.Status == EngagementCampaignStatus.Scheduled))
            .GroupBy(c => c.UserId)
            .Select(g => new { UserId = g.Key, LastCreated = g.Max(x => x.CreatedAtUtc) })
            .ToDictionaryAsync(x => x.UserId, x => x.LastCreated, ct);

        var toCreate = new List<EngagementCampaign>();

        foreach (var pref in optedUsers)
        {
            var lastActivity = lastActivities.TryGetValue(pref.UserId, out var activityUtc) ? activityUtc : (DateTime?)null;
            var lastOrder = lastOrders.TryGetValue(pref.UserId, out var orderUtc) ? orderUtc : (DateTime?)null;
            var lastInteraction = new[] { lastActivity, lastOrder, pref.UpdatedAtUtc }.Where(x => x.HasValue).Select(x => x!.Value).DefaultIfEmpty(pref.UpdatedAtUtc).Max();
            if (lastInteraction > cutoff)
            {
                continue;
            }

            if (existingActiveCampaigns.TryGetValue(pref.UserId, out var lastCampaignUtc) && lastCampaignUtc >= cutoff)
            {
                continue;
            }

            EngagementChannel channel = pref.AcceptsMarketingEmail ? EngagementChannel.Email
                : pref.AcceptsMarketingPush ? EngagementChannel.Push
                : EngagementChannel.Whatsapp;

            var payload = new
            {
                reason = "inactive-user",
                lastInteractionUtc = lastInteraction,
                suggestedIncentive = "personalized-discount",
                inactivityDays = (asOfUtc - lastInteraction).TotalDays
            };

            var json = JsonSerializer.Serialize(payload, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

            var campaign = new EngagementCampaign(pref.UserId, channel, "inactive-user", asOfUtc.AddHours(1), json);
            campaign.MarkScheduled(asOfUtc.AddHours(1));

            toCreate.Add(campaign);
        }

        if (toCreate.Count == 0) return 0;

        await _db.EngagementCampaigns.AddRangeAsync(toCreate, ct);
        await _db.SaveChangesAsync(ct);
        return toCreate.Count;
    }

    public async Task<IReadOnlyList<EngagementCampaignDto>> GetPendingCampaignsAsync(CancellationToken ct = default)
    {
        var results = await _db.EngagementCampaigns.AsNoTracking()
            .OrderByDescending(c => c.CreatedAtUtc)
            .Take(1000)
            .Select(c => new EngagementCampaignDto(
                c.Id,
                c.UserId,
                c.Channel.ToString(),
                c.TriggerReason,
                c.Status.ToString(),
                c.CreatedAtUtc,
                c.ScheduledForUtc,
                c.CompletedAtUtc,
                c.PayloadJson))
            .ToListAsync(ct);
        return results;
    }
}
