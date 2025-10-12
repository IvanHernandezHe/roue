using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Roue.Application.DTOs;
using Roue.Application.Interface;
using Roue.Application.Validation;

namespace Roue.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class RewardsController : ControllerBase
{
    private readonly UserManager<IdentityUser<Guid>> _users;
    private readonly ICashbackService _cashback;
    private readonly IOrdersService _orders;

    public RewardsController(UserManager<IdentityUser<Guid>> users, ICashbackService cashback, IOrdersService orders)
    {
        _users = users;
        _cashback = cashback;
        _orders = orders;
    }

    [HttpGet("account")]
    public async Task<IActionResult> GetAccount(CancellationToken ct)
    {
        var user = await _users.GetUserAsync(User);
        if (user is null) return Unauthorized();
        var dto = await _cashback.GetAccountAsync(user.Id, ct);
        return Ok(dto);
    }

    [HttpGet("rules")]
    [AllowAnonymous]
    public async Task<IActionResult> GetRules(CancellationToken ct)
    {
        var rules = await _cashback.GetActiveRulesAsync(ct);
        return Ok(rules);
    }

    [HttpPost("preview")]
    [AllowAnonymous]
    public async Task<IActionResult> Preview([FromBody] CashbackPreviewRequest request, CancellationToken ct)
    {
        if (request is null || request.Items is null)
        {
            return BadRequest(new { error = "Debes enviar el listado de items" });
        }

        var lines = request.Items.Select(i => new CheckoutLineDto(i.ProductId, Math.Max(1, i.Quantity))).ToList();
        var validator = new CheckoutLinesValidator();
        var validation = validator.Validate(lines);
        if (!validation.IsValid)
        {
            var errors = validation.Errors.Select(e => e.ErrorMessage).ToArray();
            return BadRequest(new { errors });
        }

        Guid? userId = null;
        if (User?.Identity?.IsAuthenticated ?? false)
        {
            var user = await _users.GetUserAsync(User);
            userId = user?.Id;
        }

        try
        {
            var quote = await _orders.QuoteAsync(lines, request.DiscountCode, userId, ct);
            return Ok(quote.Cashback);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    public sealed record CashbackPreviewRequest(List<CashbackPreviewItem> Items, string? DiscountCode);
    public sealed record CashbackPreviewItem(Guid ProductId, int Quantity);
}
