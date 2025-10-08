using System;

namespace Roue.Domain.Analytics;

public sealed class UserActivity
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public DateTime OccurredAtUtc { get; private set; } = DateTime.UtcNow;

    public Guid? UserId { get; private set; }
    public string? UserEmail { get; private set; }
    public string EventType { get; private set; } = default!;
    public string? SubjectType { get; private set; }
    public string? SubjectId { get; private set; }
    public Guid? ProductId { get; private set; }
    public Guid? CartId { get; private set; }
    public Guid? WishlistId { get; private set; }
    public Guid? OrderId { get; private set; }
    public int? Quantity { get; private set; }
    public decimal? Amount { get; private set; }
    public string? MetadataJson { get; private set; }
    public string? Path { get; private set; }
    public string? Referrer { get; private set; }
    public string? IpAddress { get; private set; }
    public string? UserAgent { get; private set; }
    public string? CorrelationId { get; private set; }
    public string? SessionId { get; private set; }

    public UserActivity(string eventType)
    {
        if (string.IsNullOrWhiteSpace(eventType))
            throw new ArgumentException("EventType is required", nameof(eventType));
        EventType = eventType;
    }

    private UserActivity() { }

    public void WithUser(Guid? userId, string? email)
    {
        UserId = userId;
        UserEmail = email;
    }

    public void WithSubject(string? subjectType, string? subjectId)
    {
        SubjectType = subjectType;
        SubjectId = subjectId;
    }

    public void WithProduct(Guid? productId) => ProductId = productId;
    public void WithCart(Guid? cartId) => CartId = cartId;
    public void WithWishlist(Guid? wishlistId) => WishlistId = wishlistId;
    public void WithOrder(Guid? orderId) => OrderId = orderId;
    public void WithQuantity(int? quantity) => Quantity = quantity;
    public void WithAmount(decimal? amount) => Amount = amount;
    public void WithSession(string? sessionId) => SessionId = sessionId;

    public void WithRequest(string? path, string? referrer, string? ip, string? userAgent, string? correlationId)
    {
        Path = path;
        Referrer = referrer;
        IpAddress = ip;
        UserAgent = userAgent;
        CorrelationId = correlationId;
    }

    public void WithMetadata(string? json) => MetadataJson = json;
}
