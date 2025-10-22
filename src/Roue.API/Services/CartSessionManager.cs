using System;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Roue.API.Services;

public interface ICartSessionManager
{
    Guid? ReadCartId(HttpContext context);
    Guid StampCookie(HttpContext context, Guid cartId);
    void ClearCookie(HttpContext context);
    string CookieName { get; }
}

public sealed class CartSessionManager : ICartSessionManager
{
    private readonly string _cookieName;
    private readonly SameSiteMode _sameSite;
    private readonly CookieSecurePolicy _securePolicy;
    private readonly bool _httpOnly;
    private readonly TimeSpan _lifetime;
    private readonly string? _domain;
    private readonly string _path;
    private readonly bool _isEssential;

    public CartSessionManager(IConfiguration cfg)
    {
        var section = cfg.GetSection("Cart");
        _cookieName = section["CookieName"] ?? "cart_id";
        var sameSite = section["CookieSameSite"] ?? "None";
        _sameSite = sameSite.Equals("Strict", StringComparison.OrdinalIgnoreCase)
            ? SameSiteMode.Strict
            : sameSite.Equals("Lax", StringComparison.OrdinalIgnoreCase) ? SameSiteMode.Lax : SameSiteMode.None;
        var secure = section["CookieSecure"] ?? "Conditional";
        _securePolicy = secure.Equals("Always", StringComparison.OrdinalIgnoreCase)
            ? CookieSecurePolicy.Always
            : secure.Equals("None", StringComparison.OrdinalIgnoreCase) ? CookieSecurePolicy.None : CookieSecurePolicy.SameAsRequest;
        _httpOnly = !bool.TryParse(section["CookieHttpOnly"], out var httpOnly) || httpOnly;
        _domain = section["CookieDomain"];
        _path = string.IsNullOrWhiteSpace(section["CookiePath"]) ? "/" : section["CookiePath"]!;
        _isEssential = !bool.TryParse(section["CookieIsEssential"], out var essential) || essential;

        if (int.TryParse(section["CookieLifetimeDays"], out var days) && days > 0)
        {
            _lifetime = TimeSpan.FromDays(days);
        }
        else
        {
            _lifetime = TimeSpan.FromDays(90);
        }
    }

    public string CookieName => _cookieName;

    public Guid? ReadCartId(HttpContext context)
    {
        if (context.Request.Cookies.TryGetValue(_cookieName, out var raw) && Guid.TryParse(raw, out var parsed))
        {
            return parsed;
        }
        return null;
    }

    public Guid StampCookie(HttpContext context, Guid cartId)
    {
        var options = BuildOptions(context, isDelete: false);
        context.Response.Cookies.Append(_cookieName, cartId.ToString(), options);
        return cartId;
    }

    public void ClearCookie(HttpContext context)
    {
        var options = BuildOptions(context, isDelete: true);
        context.Response.Cookies.Delete(_cookieName, options);
    }

    private CookieOptions BuildOptions(HttpContext context, bool isDelete)
    {
        var secure = _securePolicy switch
        {
            CookieSecurePolicy.Always => true,
            CookieSecurePolicy.None => false,
            _ => context.Request.IsHttps || IsLoopback(context.Request.Host.Host)
        };

        return new CookieOptions
        {
            HttpOnly = _httpOnly,
            Secure = secure,
            SameSite = _sameSite,
            Domain = _domain,
            Path = _path,
            IsEssential = _isEssential,
            Expires = isDelete ? DateTimeOffset.UnixEpoch : DateTimeOffset.UtcNow.Add(_lifetime)
        };
    }

    private static bool IsLoopback(string? host)
    {
        if (string.IsNullOrWhiteSpace(host)) return false;
        return string.Equals(host, "localhost", StringComparison.OrdinalIgnoreCase)
               || string.Equals(host, "127.0.0.1", StringComparison.OrdinalIgnoreCase)
               || string.Equals(host, "::1", StringComparison.OrdinalIgnoreCase);
    }
}
