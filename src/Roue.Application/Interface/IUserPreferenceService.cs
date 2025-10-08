using System;

namespace Roue.Application.Interface;

public interface IUserPreferenceService
{
    Task<UserPreferenceDto?> GetAsync(Guid userId, CancellationToken ct = default);
    Task<UserPreferenceDto> UpsertMarketingAsync(Guid userId,
                                                 bool acceptsEmail,
                                                 bool acceptsPush,
                                                 bool acceptsWhatsapp,
                                                 CancellationToken ct = default);
}

public sealed record UserPreferenceDto(Guid UserId,
                                       bool AcceptsEmail,
                                       bool AcceptsPush,
                                       bool AcceptsWhatsapp,
                                       DateTime UpdatedAtUtc);
