using System;

namespace Roue.Domain.Analytics;

public sealed class UserHeatmapEvent
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public DateTime OccurredAtUtc { get; private set; } = DateTime.UtcNow;
    public Guid? UserId { get; private set; }
    public string SessionId { get; private set; } = default!;
    public string PagePath { get; private set; } = default!;
    public string EventType { get; private set; } = "click";
    public string ElementSelector { get; private set; } = default!;
    public string? ElementText { get; private set; }
    public double OffsetX { get; private set; }
    public double OffsetY { get; private set; }
    public double ViewportWidth { get; private set; }
    public double ViewportHeight { get; private set; }
    public string? DeviceType { get; private set; }
    public string? Referrer { get; private set; }
    public string? AdditionalMetadataJson { get; private set; }

    private UserHeatmapEvent() { }

    public UserHeatmapEvent(string sessionId,
                            string pagePath,
                            string eventType,
                            string elementSelector,
                            double offsetX,
                            double offsetY,
                            double viewportWidth,
                            double viewportHeight)
    {
        if (string.IsNullOrWhiteSpace(sessionId)) throw new ArgumentException("Session id is required", nameof(sessionId));
        if (string.IsNullOrWhiteSpace(pagePath)) throw new ArgumentException("Page path is required", nameof(pagePath));
        if (string.IsNullOrWhiteSpace(eventType)) throw new ArgumentException("Event type is required", nameof(eventType));
        if (string.IsNullOrWhiteSpace(elementSelector)) throw new ArgumentException("Element selector is required", nameof(elementSelector));

        SessionId = sessionId;
        PagePath = pagePath;
        EventType = eventType;
        ElementSelector = elementSelector;
        OffsetX = offsetX;
        OffsetY = offsetY;
        ViewportWidth = viewportWidth;
        ViewportHeight = viewportHeight;
    }

    public void AttachUser(Guid? userId) => UserId = userId;
    public void WithDeviceInfo(string? deviceType, string? referrer)
    {
        DeviceType = deviceType;
        Referrer = referrer;
    }

    public void WithElementText(string? text) => ElementText = text;
    public void WithMetadata(string? json) => AdditionalMetadataJson = json;
}
