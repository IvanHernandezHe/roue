using System;

namespace Roue.Domain.Accounts;

public sealed class UserPreference
{
    public Guid UserId { get; private set; }
    public bool AcceptsMarketingEmail { get; private set; }
    public bool AcceptsMarketingPush { get; private set; }
    public bool AcceptsMarketingWhatsapp { get; private set; }
    public DateTime UpdatedAtUtc { get; private set; } = DateTime.UtcNow;

    private UserPreference() { }

    public UserPreference(Guid userId,
                          bool acceptsMarketingEmail = false,
                          bool acceptsMarketingPush = false,
                          bool acceptsMarketingWhatsapp = false)
    {
        UserId = userId;
        AcceptsMarketingEmail = acceptsMarketingEmail;
        AcceptsMarketingPush = acceptsMarketingPush;
        AcceptsMarketingWhatsapp = acceptsMarketingWhatsapp;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void Update(bool email, bool push, bool whatsapp)
    {
        AcceptsMarketingEmail = email;
        AcceptsMarketingPush = push;
        AcceptsMarketingWhatsapp = whatsapp;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
