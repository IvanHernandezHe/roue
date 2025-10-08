using System;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Roue.Application.Interface;

namespace Roue.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AnalyticsController : ControllerBase
{
    private readonly IHeatmapService _heatmap;
    private readonly IEngagementService _engagement;
    private readonly UserManager<IdentityUser<Guid>> _users;

    public AnalyticsController(IHeatmapService heatmap, IEngagementService engagement, UserManager<IdentityUser<Guid>> users)
    {
        _heatmap = heatmap;
        _engagement = engagement;
        _users = users;
    }

    public sealed record HeatmapEventRequest(
        string Page,
        string ElementSelector,
        double X,
        double Y,
        double ViewportWidth,
        double ViewportHeight,
        string? EventType,
        string? ElementText,
        string? SessionId,
        string? DeviceType,
        string? Referrer,
        object? Metadata);

    [HttpPost("heatmap/events")]
    [AllowAnonymous]
    public async Task<IActionResult> TrackHeatmap([FromBody] HeatmapEventRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Page) || string.IsNullOrWhiteSpace(request.ElementSelector))
        {
            return BadRequest(new { error = "Datos incompletos" });
        }

        var sessionId = request.SessionId;
        if (string.IsNullOrWhiteSpace(sessionId))
        {
            if (Request.Headers.TryGetValue("X-Session-Id", out var headerSession))
            {
                sessionId = headerSession.FirstOrDefault();
            }
        }
        if (string.IsNullOrWhiteSpace(sessionId))
        {
            sessionId = Request.Cookies.TryGetValue("cart_id", out var cookieSession) ? cookieSession : Guid.NewGuid().ToString();
        }

        Guid? userId = null;
        if (User?.Identity?.IsAuthenticated == true)
        {
            var user = await _users.GetUserAsync(User);
            if (user is not null)
            {
                userId = user.Id;
            }
        }

        var command = new HeatmapEventCommand(
            sessionId,
            request.Page,
            string.IsNullOrWhiteSpace(request.EventType) ? "click" : request.EventType!,
            request.ElementSelector,
            request.ElementText,
            request.X,
            request.Y,
            request.ViewportWidth,
            request.ViewportHeight,
            userId,
            request.DeviceType,
            string.IsNullOrWhiteSpace(request.Referrer) ? Request.Headers.Referer.ToString() : request.Referrer,
            request.Metadata);

        await _heatmap.TrackAsync(command, HttpContext.RequestAborted);
        return Accepted();
    }

    [HttpGet("heatmap")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetHeatmap([FromQuery] string page, [FromQuery] DateTime? fromUtc, [FromQuery] DateTime? toUtc)
    {
        if (string.IsNullOrWhiteSpace(page)) return BadRequest(new { error = "Page requerida" });
        var aggregates = await _heatmap.GetAggregatesAsync(page, fromUtc, toUtc, HttpContext.RequestAborted);
        return Ok(aggregates);
    }

    public sealed record EngagementScanRequest(int InactivityDays = 30);

    [HttpPost("engagement/scan-inactive")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> TriggerInactiveScan([FromBody] EngagementScanRequest request)
    {
        var days = request.InactivityDays < 1 ? 30 : request.InactivityDays;
        var created = await _engagement.GenerateInactiveCustomerCampaignsAsync(TimeSpan.FromDays(days), DateTime.UtcNow, HttpContext.RequestAborted);
        return Ok(new { created });
    }

    [HttpGet("engagement/campaigns")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ListCampaigns()
    {
        var campaigns = await _engagement.GetPendingCampaignsAsync(HttpContext.RequestAborted);
        return Ok(campaigns);
    }
}
