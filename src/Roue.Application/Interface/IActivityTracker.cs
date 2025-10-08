using System;
using System.Threading;

namespace Roue.Application.Interface;

public interface IActivityTracker
{
    Task TrackAsync(string eventType,
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
                    CancellationToken ct = default);
}
