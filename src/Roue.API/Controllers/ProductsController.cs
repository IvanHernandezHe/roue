using Roue.Application.Interface;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Roue.Domain.Products;
using System;

namespace Roue.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductQueryService _svc;
    private readonly IActivityTracker _activity;
    public ProductsController(IProductQueryService svc, IActivityTracker activity)
    {
        _svc = svc;
        _activity = activity;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> Get([FromQuery] string? q, [FromQuery] string? category)
    {
        var items = await _svc.SearchAsync(q, category, 50, HttpContext.RequestAborted);
        try
        {
            await _activity.TrackAsync("catalog.search",
                metadata: new { query = q, category, results = items.Count });
        }
        catch { }
        return Ok(items);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById([FromRoute] Guid id)
    {
        var item = await _svc.GetByIdAsync(id, HttpContext.RequestAborted);
        if (item is null) return NotFound();
        try
        {
            await _activity.TrackAsync("product.view",
                subjectType: nameof(Product),
                subjectId: item.Id.ToString(),
                productId: item.Id,
                metadata: new { item.Brand, item.Category });
        }
        catch { }
        return Ok(item);
    }
}
