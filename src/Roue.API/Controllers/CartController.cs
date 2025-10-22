using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Serialization;
using Roue.Domain.Carts;
using Roue.Application.Interface;
using System;
using Roue.API.Services;

namespace Roue.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class CartController : ControllerBase
{
    private readonly UserManager<IdentityUser<Guid>> _users;
    private readonly IAuditLogger _audit;
    private readonly ICartService _svc;
    private readonly IActivityTracker _activity;
    private readonly ICartSessionManager _cartSession;

    public CartController(UserManager<IdentityUser<Guid>> users, IAuditLogger audit, ICartService svc, IActivityTracker activity, ICartSessionManager cartSession)
    {
        _users = users;
        _audit = audit;
        _svc = svc;
        _activity = activity;
        _cartSession = cartSession;
    }

    private Guid EnsureCookie(Guid id)
    {
        return _cartSession.StampCookie(HttpContext, id);
    }

    private async Task<(Guid? userId, Guid? cartId, Guid? cookieId)> ResolveIdsAsync()
    {
        Guid? userId = null; if (User?.Identity?.IsAuthenticated == true) userId = (await _users.GetUserAsync(User))?.Id;
        Guid? headerId = null;
        if (Request.Headers.TryGetValue("X-Cart-Id", out var headerVals))
        {
            var header = headerVals.FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(header) && Guid.TryParse(header, out var headerGuid)) headerId = headerGuid;
        }
        Guid? cookieId = _cartSession.ReadCartId(HttpContext);
        var cartId = headerId ?? cookieId;
        return (userId, cartId, cookieId);
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var (uid, cid, cookieId) = await ResolveIdsAsync();
        var dto = await _svc.GetAsync(uid, cid, HttpContext.RequestAborted);
        if (cookieId is null && uid is null) EnsureCookie(dto.Id);
        return Ok(dto);
    }

    public sealed record MergeItem(Guid ProductId, [property: JsonPropertyName("qty")] int Qty);
    public sealed record MergeRequest(List<MergeItem> Items);

    [HttpPost("merge")]
    [Authorize]
    public async Task<IActionResult> Merge([FromBody] MergeRequest req)
    {
        var user = await _users.GetUserAsync(User);
        if (user is null) return Unauthorized();
        var (_, _, cookieId) = await ResolveIdsAsync();
        var dto = await _svc.MergeAsync(user.Id, req.Items.Select(i => (i.ProductId, i.Qty)), cookieId, HttpContext.RequestAborted);
        var sessionGuid = cookieId ?? dto.Id;
        if (cookieId.HasValue) _cartSession.ClearCookie(HttpContext);
        try { await _audit.LogAsync("cart.merged", subjectType: nameof(Cart), subjectId: dto.Id.ToString(), metadata: new { items = dto.Items.Count }); } catch { }
        try
        {
            await _activity.TrackAsync("cart.merged",
                subjectType: nameof(Cart),
                subjectId: dto.Id.ToString(),
                cartId: dto.Id,
                metadata: new { sourceItems = req.Items.Count, cookieMerged = cookieId.HasValue },
                sessionId: sessionGuid.ToString());
        }
        catch { }
        return Ok(dto);
    }

    // Add a product to current cart (anonymous or user)
    [HttpPost("items")]
    public async Task<IActionResult> AddItem([FromBody] MergeItem req)
    {
        if (req.ProductId == Guid.Empty) return BadRequest("ProductId requerido");
        var (uid, cid, cookieId) = await ResolveIdsAsync();
        try
        {
            var dto = await _svc.AddAsync(uid, cid, req.ProductId, req.Qty, HttpContext.RequestAborted);
            try { await _audit.LogAsync("cart.item_added", subjectType: nameof(Cart), subjectId: dto.Id.ToString(), metadata: new { req.ProductId, req.Qty }); } catch { }
            var sessionGuid = cid ?? cookieId ?? dto.Id;
            if (cookieId is null && uid is null) EnsureCookie(dto.Id);
            try
            {
                await _activity.TrackAsync("cart.item_added",
                    subjectType: nameof(Cart),
                    subjectId: dto.Id.ToString(),
                    cartId: dto.Id,
                    productId: req.ProductId,
                    quantity: req.Qty,
                    metadata: new { req.ProductId, req.Qty },
                    sessionId: sessionGuid.ToString());
            }
            catch { }
            return Ok(dto);
        }
        catch (KeyNotFoundException) { return NotFound("Product not available"); }
    }

    public sealed record UpdateQty([property: JsonPropertyName("qty")] int Qty);

    // Set quantity for a product
    [HttpPut("items/{productId}")]
    public async Task<IActionResult> SetQuantity([FromRoute] Guid productId, [FromBody] UpdateQty body)
    {
        if (productId == Guid.Empty) return BadRequest();
        var (uid, cid, cookieId) = await ResolveIdsAsync();
        try
        {
            var dto = await _svc.SetQtyAsync(uid, cid, productId, Math.Max(0, body.Qty), HttpContext.RequestAborted);
            try { await _audit.LogAsync("cart.item_updated", subjectType: nameof(Cart), subjectId: dto.Id.ToString(), metadata: new { productId, body.Qty }); } catch { }
            Guid sessionGuid = cid ?? cookieId ?? dto.Id;
            try
            {
                await _activity.TrackAsync("cart.item_quantity_updated",
                    subjectType: nameof(Cart),
                    subjectId: dto.Id.ToString(),
                    cartId: dto.Id,
                    productId: productId,
                    quantity: Math.Max(0, body.Qty),
                    metadata: new { productId, body.Qty },
                    sessionId: sessionGuid.ToString());
            }
            catch { }
            return Ok(dto);
        }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    // Remove product from cart
    [HttpDelete("items/{productId}")]
    public async Task<IActionResult> RemoveItem([FromRoute] Guid productId)
    {
        var (uid, cid, cookieId) = await ResolveIdsAsync();
        try
        {
            var dto = await _svc.RemoveAsync(uid, cid, productId, HttpContext.RequestAborted);
            try { await _audit.LogAsync("cart.item_removed", subjectType: nameof(Cart), subjectId: dto.Id.ToString(), metadata: new { productId }); } catch { }
            Guid sessionGuid = cid ?? cookieId ?? dto.Id;
            try
            {
                await _activity.TrackAsync("cart.item_removed",
                    subjectType: nameof(Cart),
                    subjectId: dto.Id.ToString(),
                    cartId: dto.Id,
                    productId: productId,
                    metadata: new { productId },
                    sessionId: sessionGuid.ToString());
            }
            catch { }
            return Ok(dto);
        }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    // Clear cart
    [HttpDelete("clear")]
    public async Task<IActionResult> Clear()
    {
        var (uid, cid, cookieId) = await ResolveIdsAsync();
        var dto = await _svc.ClearAsync(uid, cid, HttpContext.RequestAborted);
        try { await _audit.LogAsync("cart.cleared", subjectType: nameof(Cart), subjectId: dto.Id.ToString()); } catch { }
        var sessionGuid = cid ?? cookieId ?? dto.Id;
        if (cookieId is null && uid is null) EnsureCookie(dto.Id);
        try
        {
            await _activity.TrackAsync("cart.cleared",
                subjectType: nameof(Cart),
                subjectId: dto.Id.ToString(),
                cartId: dto.Id,
                sessionId: sessionGuid.ToString());
        }
        catch { }
        return Ok(dto);
    }

    // serialization now in service
}
