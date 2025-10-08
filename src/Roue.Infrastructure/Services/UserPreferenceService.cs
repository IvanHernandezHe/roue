using Microsoft.EntityFrameworkCore;
using Roue.Application.Interface;
using Roue.Domain.Accounts;
using Roue.Infrastructure.Persistence;

namespace Roue.Infrastructure.Services;

public sealed class UserPreferenceService : IUserPreferenceService
{
    private readonly AppDbContext _db;

    public UserPreferenceService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<UserPreferenceDto?> GetAsync(Guid userId, CancellationToken ct = default)
    {
        var entity = await _db.UserPreferences.AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId, ct);
        if (entity is null) return null;
        return new UserPreferenceDto(entity.UserId, entity.AcceptsMarketingEmail, entity.AcceptsMarketingPush, entity.AcceptsMarketingWhatsapp, entity.UpdatedAtUtc);
    }

    public async Task<UserPreferenceDto> UpsertMarketingAsync(Guid userId, bool acceptsEmail, bool acceptsPush, bool acceptsWhatsapp, CancellationToken ct = default)
    {
        var pref = await _db.UserPreferences.FirstOrDefaultAsync(p => p.UserId == userId, ct);
        if (pref is null)
        {
            pref = new UserPreference(userId, acceptsEmail, acceptsPush, acceptsWhatsapp);
            await _db.UserPreferences.AddAsync(pref, ct);
        }
        else
        {
            pref.Update(acceptsEmail, acceptsPush, acceptsWhatsapp);
        }

        await _db.SaveChangesAsync(ct);
        return new UserPreferenceDto(pref.UserId, pref.AcceptsMarketingEmail, pref.AcceptsMarketingPush, pref.AcceptsMarketingWhatsapp, pref.UpdatedAtUtc);
    }
}
