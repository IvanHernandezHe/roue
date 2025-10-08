using System;

namespace Roue.Application.Interface;

public interface IHeatmapService
{
    Task TrackAsync(HeatmapEventCommand command, CancellationToken ct = default);
    Task<IReadOnlyList<HeatmapAggregateDto>> GetAggregatesAsync(string pagePath, DateTime? fromUtc = null, DateTime? toUtc = null, CancellationToken ct = default);
}

public sealed record HeatmapEventCommand(string SessionId,
                                         string PagePath,
                                         string EventType,
                                         string ElementSelector,
                                         string? ElementText,
                                         double OffsetX,
                                         double OffsetY,
                                         double ViewportWidth,
                                         double ViewportHeight,
                                         Guid? UserId,
                                         string? DeviceType,
                                         string? Referrer,
                                         object? Metadata);

public sealed record HeatmapAggregateDto(string PagePath,
                                         string EventType,
                                         string ElementSelector,
                                         string? ElementText,
                                         double AverageX,
                                         double AverageY,
                                         int Count);
