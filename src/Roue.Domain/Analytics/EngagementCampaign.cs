using System;

namespace Roue.Domain.Analytics;

public enum EngagementChannel
{
    Email = 0,
    Push = 1,
    Whatsapp = 2
}

public enum EngagementCampaignStatus
{
    Pending = 0,
    Scheduled = 1,
    Sent = 2,
    Failed = 3,
    Dismissed = 4
}

public sealed class EngagementCampaign
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public Guid UserId { get; private set; }
    public EngagementChannel Channel { get; private set; }
    public EngagementCampaignStatus Status { get; private set; } = EngagementCampaignStatus.Pending;
    public string TriggerReason { get; private set; } = default!;
    public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;
    public DateTime? ScheduledForUtc { get; private set; }
    public DateTime? CompletedAtUtc { get; private set; }
    public string? PayloadJson { get; private set; }

    private EngagementCampaign() { }

    public EngagementCampaign(Guid userId, EngagementChannel channel, string triggerReason, DateTime? scheduledForUtc = null, string? payloadJson = null)
    {
        UserId = userId;
        Channel = channel;
        TriggerReason = triggerReason;
        ScheduledForUtc = scheduledForUtc;
        PayloadJson = payloadJson;
    }

    public void MarkScheduled(DateTime scheduleUtc)
    {
        ScheduledForUtc = scheduleUtc;
        Status = EngagementCampaignStatus.Scheduled;
    }

    public void MarkSent()
    {
        Status = EngagementCampaignStatus.Sent;
        CompletedAtUtc = DateTime.UtcNow;
    }

    public void MarkFailed()
    {
        Status = EngagementCampaignStatus.Failed;
        CompletedAtUtc = DateTime.UtcNow;
    }

    public void Dismiss()
    {
        Status = EngagementCampaignStatus.Dismissed;
        CompletedAtUtc = DateTime.UtcNow;
    }
}
