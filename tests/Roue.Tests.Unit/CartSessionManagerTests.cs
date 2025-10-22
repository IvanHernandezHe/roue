using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Net.Http.Headers;
using Roue.API.Services;
using HeaderSameSiteMode = Microsoft.Net.Http.Headers.SameSiteMode;

namespace Roue.Tests.Unit;

public sealed class CartSessionManagerTests
{
    [Fact]
    public void StampCookie_AppendsCookieWithConfiguredAttributes()
    {
        var cfg = BuildConfiguration(new Dictionary<string, string?>
        {
            ["Cart:CookieName"] = "custom_cart",
            ["Cart:CookieSameSite"] = "Lax",
            ["Cart:CookieSecure"] = "Always",
            ["Cart:CookieLifetimeDays"] = "10",
            ["Cart:CookieDomain"] = "example.com",
            ["Cart:CookiePath"] = "/store",
            ["Cart:CookieHttpOnly"] = "false",
            ["Cart:CookieIsEssential"] = "true"
        });

        var manager = new CartSessionManager(cfg);
        var httpContext = new DefaultHttpContext();
        httpContext.Request.Scheme = "https";
        httpContext.Request.Host = new HostString("shop.example.com");

        var cartId = Guid.NewGuid();

        manager.StampCookie(httpContext, cartId);

        var header = Assert.Single(httpContext.Response.Headers["Set-Cookie"].ToArray());
        var parsed = SetCookieHeaderValue.Parse(header);

        Assert.Equal("custom_cart", parsed.Name.ToString());
        Assert.Equal(cartId.ToString(), parsed.Value.ToString());
        Assert.Equal("example.com", parsed.Domain.ToString());
        Assert.Equal("/store", parsed.Path.ToString());
        Assert.True(parsed.Secure);
        Assert.False(parsed.HttpOnly);
        Assert.Equal(HeaderSameSiteMode.Lax, parsed.SameSite);
        Assert.True(parsed.Expires.HasValue);
        Assert.True((parsed.Expires!.Value - DateTimeOffset.UtcNow).TotalDays > 9);
    }

    [Fact]
    public void ClearCookie_EmitsExpiredCookie()
    {
        var cfg = BuildConfiguration(new Dictionary<string, string?>());
        var manager = new CartSessionManager(cfg);
        var httpContext = new DefaultHttpContext();
        httpContext.Request.Scheme = "http";
        httpContext.Request.Host = new HostString("localhost");

        manager.ClearCookie(httpContext);

        var header = Assert.Single(httpContext.Response.Headers["Set-Cookie"].ToArray());
        var parsed = SetCookieHeaderValue.Parse(header);

        Assert.Equal(manager.CookieName, parsed.Name.ToString());
        Assert.True(parsed.Expires.HasValue);
        Assert.True(parsed.Expires!.Value <= DateTimeOffset.UtcNow);
        Assert.True(parsed.Secure); // localhost treated as loopback => secure cookie
        Assert.Equal(HeaderSameSiteMode.None, parsed.SameSite);
    }

    [Fact]
    public void ReadCartId_ReturnsGuid_WhenCookiePresent()
    {
        var cfg = BuildConfiguration(new Dictionary<string, string?>());
        var manager = new CartSessionManager(cfg);
        var httpContext = new DefaultHttpContext();
        var cartId = Guid.NewGuid();
        httpContext.Request.Headers["Cookie"] = $"{manager.CookieName}={cartId}";

        var result = manager.ReadCartId(httpContext);

        Assert.Equal(cartId, result);
    }

    [Fact]
    public void ReadCartId_ReturnsNull_WhenCookieMissingOrInvalid()
    {
        var cfg = BuildConfiguration(new Dictionary<string, string?>());
        var manager = new CartSessionManager(cfg);
        var httpContext = new DefaultHttpContext();
        httpContext.Request.Headers["Cookie"] = $"{manager.CookieName}=not-a-guid";

        var result = manager.ReadCartId(httpContext);

        Assert.Null(result);
    }

    private static IConfiguration BuildConfiguration(IDictionary<string, string?> overrides)
    {
        var dict = new Dictionary<string, string?>
        {
            ["Cart:CookieName"] = "cart_id",
            ["Cart:CookieSameSite"] = "None",
            ["Cart:CookieSecure"] = "Conditional",
            ["Cart:CookieLifetimeDays"] = "90",
            ["Cart:CookieHttpOnly"] = "true",
            ["Cart:CookieIsEssential"] = "true"
        };

        foreach (var pair in overrides)
        {
            dict[pair.Key] = pair.Value;
        }

        return new ConfigurationBuilder()
            .AddInMemoryCollection(dict!)
            .Build();
    }
}
