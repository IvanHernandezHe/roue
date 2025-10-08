using System;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
using System.Threading;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Roue.Application.Interface;
using Roue.Domain.Analytics;
using Roue.Infrastructure.Persistence;

namespace Roue.Infrastructure.Logging;

public sealed class ActivityTracker : IActivityTracker
{
    private const string CartCookieName = "cart_id";
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IHttpContextAccessor _http;

    public ActivityTracker(IServiceScopeFactory scopeFactory, IHttpContextAccessor http)
    {
        _scopeFactory = scopeFactory;
        _http = http;
    }

    public async Task TrackAsync(string eventType,
                                 string? subjectType = null,
                                 string? subjectId = null,
                                 Guid? productId = null,
                                 Guid? cartId = null,
                                 Guid? wishlistId = null,
                                 Guid? orderId = null,
                                 int? quantity = null,
                                 decimal? amount = null,
                                 object? metadata = null,
                                 string? sessionId = null,
                                 CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(eventType))
        {
            throw new ArgumentException("Event type is required", nameof(eventType));
        }

        var ctx = _http.HttpContext;
        Guid? userId = null;
        string? email = null;
        string? ip = null;
        string? userAgent = null;
        string? path = null;
        string? referrer = null;
        string? correlationId = null;
        var resolvedSessionId = sessionId;

        if (ctx is not null)
        {
            var uid = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (Guid.TryParse(uid, out var parsedUserId))
            {
                userId = parsedUserId;
            }
            email = ctx.User.FindFirstValue(ClaimTypes.Email);
            ip = ctx.Connection.RemoteIpAddress?.ToString();
            userAgent = ctx.Request.Headers.UserAgent.ToString();
            path = ctx.Request.Path.HasValue ? ctx.Request.Path.Value : null;
            referrer = ctx.Request.Headers.Referer.ToString();

            if (string.IsNullOrWhiteSpace(resolvedSessionId))
            {
                if (ctx.Request.Headers.TryGetValue("X-Session-Id", out var sessionHeader))
                {
                    resolvedSessionId = sessionHeader.FirstOrDefault();
                }
            }

            if (string.IsNullOrWhiteSpace(resolvedSessionId) && ctx.Request.Headers.TryGetValue("X-Cart-Id", out var cartHeader))
            {
                resolvedSessionId = cartHeader.FirstOrDefault();
            }

            if (string.IsNullOrWhiteSpace(resolvedSessionId) && ctx.Request.Cookies.TryGetValue(CartCookieName, out var cookieCartId))
            {
                resolvedSessionId = cookieCartId;
            }

            if (ctx.Items.TryGetValue("correlationId", out var cid) && cid is string correlation)
            {
                correlationId = correlation;
            }
            else
            {
                correlationId = ctx.TraceIdentifier;
            }
        }

        var activity = new UserActivity(eventType);
        activity.WithUser(userId, email);
        activity.WithSubject(subjectType, subjectId);
        activity.WithProduct(productId);
        activity.WithCart(cartId);
        activity.WithWishlist(wishlistId);
        activity.WithOrder(orderId);
        activity.WithQuantity(quantity);
        activity.WithAmount(amount);
        activity.WithSession(resolvedSessionId);
        activity.WithRequest(path, referrer, ip, userAgent, correlationId);

        if (metadata is not null)
        {
            var json = JsonSerializer.Serialize(metadata, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });
            activity.WithMetadata(json);
        }

        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.UserActivities.Add(activity);
        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch
        {
            // Ignore analytics logging failures to avoid harming main flow
        }
    }
}
