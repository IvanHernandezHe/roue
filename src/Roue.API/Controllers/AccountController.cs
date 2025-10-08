using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Roue.Application.Interface;

namespace Roue.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class AccountController : ControllerBase
{
    private readonly UserManager<IdentityUser<Guid>> _users;
    private readonly IAuditLogger _audit;
    private readonly IUserPreferenceService _preferences;
    public AccountController(UserManager<IdentityUser<Guid>> users, IAuditLogger audit, IUserPreferenceService preferences)
    { _users = users; _audit = audit; _preferences = preferences; }

    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var user = await _users.GetUserAsync(User);
        if (user is null) return Unauthorized();
        var claims = await _users.GetClaimsAsync(user);
        var displayName = claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
        var isAdmin = User.IsInRole("Admin") || claims.Any(c => c.Type == ClaimTypes.Role && string.Equals(c.Value, "Admin", StringComparison.OrdinalIgnoreCase));
        var prefs = await _preferences.GetAsync(user.Id, HttpContext.RequestAborted);
        return Ok(new
        {
            id = user.Id,
            email = user.Email,
            phoneNumber = user.PhoneNumber,
            emailConfirmed = user.EmailConfirmed,
            displayName,
            isAdmin,
            marketing = prefs is null ? null : new
            {
                email = prefs.AcceptsEmail,
                push = prefs.AcceptsPush,
                whatsapp = prefs.AcceptsWhatsapp,
                updatedAtUtc = prefs.UpdatedAtUtc
            }
        });
    }

    public sealed record UpdateProfileRequest(string? PhoneNumber, string? DisplayName);

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest req)
    {
        var user = await _users.GetUserAsync(User);
        if (user is null) return Unauthorized();

        if (!string.IsNullOrWhiteSpace(req.PhoneNumber))
        {
            user.PhoneNumber = req.PhoneNumber;
        }
        var result = await _users.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });
        }
        await _audit.LogAsync("account.profile_updated", subjectType: "User", subjectId: user.Id.ToString());

        if (req.DisplayName is not null)
        {
            var claims = await _users.GetClaimsAsync(user);
            var nameClaim = claims.FirstOrDefault(c => c.Type == ClaimTypes.Name);
            if (nameClaim is not null)
            {
                await _users.RemoveClaimAsync(user, nameClaim);
            }
            if (!string.IsNullOrWhiteSpace(req.DisplayName))
            {
                await _users.AddClaimAsync(user, new Claim(ClaimTypes.Name, req.DisplayName));
            }
        }

        return NoContent();
    }

    public sealed record ChangePasswordRequest(string CurrentPassword, string NewPassword);

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req)
    {
        var user = await _users.GetUserAsync(User);
        if (user is null) return Unauthorized();
        var result = await _users.ChangePasswordAsync(user, req.CurrentPassword, req.NewPassword);
        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });
        }
        await _audit.LogAsync("account.password_changed", subjectType: "User", subjectId: user.Id.ToString());
        return NoContent();
    }

    public sealed record UpdateMarketingRequest(bool Email, bool Push, bool Whatsapp);

    [HttpPut("marketing")]
    public async Task<IActionResult> UpdateMarketing([FromBody] UpdateMarketingRequest req)
    {
        var user = await _users.GetUserAsync(User);
        if (user is null) return Unauthorized();
        var dto = await _preferences.UpsertMarketingAsync(user.Id, req.Email, req.Push, req.Whatsapp, HttpContext.RequestAborted);
        await _audit.LogAsync("account.marketing_updated", subjectType: "User", subjectId: user.Id.ToString(), metadata: new { dto.AcceptsEmail, dto.AcceptsPush, dto.AcceptsWhatsapp });
        return Ok(dto);
    }
}
