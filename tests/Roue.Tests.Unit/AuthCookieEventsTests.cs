using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.Net.Http.Headers;
using Roue.API.Extensions;
using Roue.API.Services;
using Roue.Application.DTOs;
using Roue.Application.Interface;
using System.Security.Claims;
using System.Linq;

namespace Roue.Tests.Unit;

public sealed class AuthCookieEventsTests
{
    [Fact]
    public async Task OnSignedIn_MergesAnonymousCart_AndReissuesCookie()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Database:Provider"] = "CosmosPostgres",
                ["Database:Host"] = "localhost",
                ["Database:Port"] = "5432",
                ["Database:Database"] = "roue_test",
                ["Database:Username"] = "postgres",
                ["Database:Password"] = "postgres",
                ["Auth:CookieSameSite"] = "Lax",
                ["Auth:CookieSecure"] = "Conditional",
                ["Cart:CookieName"] = "cart_id",
                ["Cart:CookieSameSite"] = "None",
                ["Cart:CookieSecure"] = "Conditional",
                ["Cart:CookieLifetimeDays"] = "90",
                ["Cart:CookieHttpOnly"] = "true",
                ["Cart:CookieIsEssential"] = "true"
            }!)
            .Build();

        var services = new ServiceCollection();
        services.AddLogging();
        services.AddSingleton<IConfiguration>(configuration);
        services.AddInfrastructure(configuration);

        var fakeAudit = new FakeAuditLogger();
        var fakeCart = new FakeCartService();

        services.AddSingleton<IAuditLogger>(fakeAudit);
        services.AddSingleton(fakeAudit);
        services.AddSingleton<ICartService>(fakeCart);
        services.AddSingleton(fakeCart);

        using var provider = services.BuildServiceProvider();
        using var scope = provider.CreateScope();
        var scopedProvider = scope.ServiceProvider;

        var optionsMonitor = scopedProvider.GetRequiredService<IOptionsMonitor<CookieAuthenticationOptions>>();
        var options = optionsMonitor.Get(IdentityConstants.ApplicationScheme);
        var events = Assert.IsType<CookieAuthenticationEvents>(options.Events);
        Assert.NotNull(events.OnSignedIn);

        var httpContext = new DefaultHttpContext();
        httpContext.RequestServices = scopedProvider;
        httpContext.Request.Scheme = "https";
        httpContext.Request.Host = new HostString("shop.test");

        var cartSession = scopedProvider.GetRequiredService<ICartSessionManager>();
        var anonymousCartId = Guid.NewGuid();
        httpContext.Request.Headers["Cookie"] = $"{cartSession.CookieName}={anonymousCartId}";

        var userId = Guid.NewGuid();
        var principal = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString())
        }, IdentityConstants.ApplicationScheme));

        var properties = new AuthenticationProperties();
        var scheme = new AuthenticationScheme(IdentityConstants.ApplicationScheme, IdentityConstants.ApplicationScheme, typeof(CookieAuthenticationHandler));
        var context = new CookieSignedInContext(httpContext, scheme, principal, properties, options);

        await events.OnSignedIn!(context);

        Assert.True(fakeCart.MergeCalled);
        Assert.Equal(userId, fakeCart.MergeUserId);
        Assert.Equal(anonymousCartId, fakeCart.MergeCookieId);
        Assert.Equal(0, fakeCart.MergeItemCount);

        Assert.Contains(fakeAudit.Events, e => e.Action == "auth.signed_in");
        Assert.Contains(fakeAudit.Events, e => e.Action == "cart.adopted_on_login");

        var header = Assert.Single(httpContext.Response.Headers["Set-Cookie"].ToArray());
        var parsed = SetCookieHeaderValue.Parse(header);
        Assert.Equal(fakeCart.MergeResultId.ToString(), parsed.Value.ToString());
    }

    private sealed class FakeCartService : ICartService
    {
        public bool MergeCalled { get; private set; }
        public Guid? MergeCookieId { get; private set; }
        public Guid MergeUserId { get; private set; }
        public int MergeItemCount { get; private set; }
        public Guid MergeResultId { get; private set; } = Guid.NewGuid();

        public Task<CartDto> MergeAsync(Guid userId, IEnumerable<(Guid productId, int qty)> items, Guid? cookieCartId, CancellationToken ct = default)
        {
            MergeCalled = true;
            MergeUserId = userId;
            MergeCookieId = cookieCartId;
            MergeItemCount = items.Count();
            return Task.FromResult(new CartDto(MergeResultId, userId, Array.Empty<CartItemDto>(), 0m));
        }

        Task<CartDto> ICartService.GetAsync(Guid? userId, Guid? cookieCartId, CancellationToken ct) => throw new NotImplementedException();
        Task<CartDto> ICartService.AddAsync(Guid? userId, Guid? cookieCartId, Guid productId, int qty, CancellationToken ct) => throw new NotImplementedException();
        Task<CartDto> ICartService.SetQtyAsync(Guid? userId, Guid? cookieCartId, Guid productId, int qty, CancellationToken ct) => throw new NotImplementedException();
        Task<CartDto> ICartService.RemoveAsync(Guid? userId, Guid? cookieCartId, Guid productId, CancellationToken ct) => throw new NotImplementedException();
        Task<CartDto> ICartService.ClearAsync(Guid? userId, Guid? cookieCartId, CancellationToken ct) => throw new NotImplementedException();
    }

    private sealed class FakeAuditLogger : IAuditLogger
    {
        public List<AuditEvent> Events { get; } = new();

        public Task LogAsync(string action, string? subjectType = null, string? subjectId = null, string? description = null, object? metadata = null, CancellationToken ct = default)
        {
            Events.Add(new AuditEvent(action, subjectType, subjectId, description, metadata, null));
            return Task.CompletedTask;
        }

        public Task LogAsync(string action, string? subjectType, string? subjectId, string? description, object? metadata, Roue.Domain.Auditing.AuditSeverity severity, CancellationToken ct = default)
        {
            Events.Add(new AuditEvent(action, subjectType, subjectId, description, metadata, severity));
            return Task.CompletedTask;
        }
    }

    private sealed record AuditEvent(string Action, string? SubjectType, string? SubjectId, string? Description, object? Metadata, Roue.Domain.Auditing.AuditSeverity? Severity);
}
