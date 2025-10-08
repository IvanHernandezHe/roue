using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Roue.Application.Interface;
using Roue.Domain.Analytics;
using Roue.Infrastructure.Persistence;

namespace Roue.Infrastructure.Services;

public sealed class HeatmapService : IHeatmapService
{
    private readonly AppDbContext _db;

    public HeatmapService(AppDbContext db)
    {
        _db = db;
    }

    public async Task TrackAsync(HeatmapEventCommand command, CancellationToken ct = default)
    {
        var entity = new UserHeatmapEvent(
            command.SessionId,
            command.PagePath,
            string.IsNullOrWhiteSpace(command.EventType) ? "click" : command.EventType,
            command.ElementSelector,
            command.OffsetX,
            command.OffsetY,
            command.ViewportWidth,
            command.ViewportHeight);

        entity.AttachUser(command.UserId);
        entity.WithDeviceInfo(command.DeviceType, command.Referrer);
        entity.WithElementText(command.ElementText);

        if (command.Metadata is not null)
        {
            var json = JsonSerializer.Serialize(command.Metadata, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });
            entity.WithMetadata(json);
        }

        await _db.UserHeatmapEvents.AddAsync(entity, ct);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<IReadOnlyList<HeatmapAggregateDto>> GetAggregatesAsync(string pagePath, DateTime? fromUtc = null, DateTime? toUtc = null, CancellationToken ct = default)
    {
        var query = _db.UserHeatmapEvents.AsNoTracking()
            .Where(e => e.PagePath == pagePath);

        if (fromUtc.HasValue)
        {
            query = query.Where(e => e.OccurredAtUtc >= fromUtc.Value);
        }
        if (toUtc.HasValue)
        {
            query = query.Where(e => e.OccurredAtUtc <= toUtc.Value);
        }

        var results = await query
            .GroupBy(e => new { e.PagePath, e.EventType, e.ElementSelector, e.ElementText })
            .Select(g => new HeatmapAggregateDto(
                g.Key.PagePath,
                g.Key.EventType,
                g.Key.ElementSelector,
                g.Key.ElementText,
                g.Average(x => x.OffsetX),
                g.Average(x => x.OffsetY),
                g.Count()))
            .OrderByDescending(x => x.Count)
            .ToListAsync(ct);

        return results;
    }
}
