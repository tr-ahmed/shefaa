using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authorization;
using Shefaa.Api.Extensions;
using Shefaa.Api.Filters;
using Shefaa.Api.Middleware;
using Shefaa.Application.Common;

var builder = WebApplication.CreateBuilder(args);

// Application services
builder.Services.AddShefaaDatabase(builder.Configuration);
builder.Services.AddShefaaIdentity();
builder.Services.AddShefaaJwtAuthentication(builder.Configuration);
builder.Services.AddShefaaCors(builder.Configuration);
builder.Services.AddShefaaSwagger();
builder.Services.AddShefaaApplicationServices(builder.Configuration);

// Rate limiting
builder.Services.AddRateLimiter(options =>
{
    // Strict policy for auth endpoints to prevent brute-force.
    options.AddPolicy("auth", context =>
    {
        var key = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(key, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 10,
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 0,
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst
        });
    });

    // General policy for everything else.
    options.AddPolicy("general", context =>
    {
        var key = context.User.Identity?.Name ?? context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(key, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 200,
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 0,
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst
        });
    });

    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

// MVC + Auth
builder.Services.AddControllers(options =>
{
    // Custom validation filter that returns our standard error format.
    options.Filters.Add<Shefaa.Api.Filters.ValidationFilter>();
})
.AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    options.JsonSerializerOptions.DictionaryKeyPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
});

// Suppress the default ModelState invalid filter so our ValidationFilter runs first.
builder.Services.Configure<Microsoft.AspNetCore.Mvc.ApiBehaviorOptions>(options =>
{
    options.SuppressModelStateInvalidFilter = true;
});

// Register the custom permission handler
builder.Services.AddSingleton<IAuthorizationHandler, PermissionAuthorizationHandler>();

builder.Services.AddAuthorization(options =>
{
    // ── Role-based policies (kept for backward compatibility) ──────────────────
    options.AddPolicy("RequirePatient",     p => p.RequireRole("Patient"));
    options.AddPolicy("RequireDoctor",      p => p.RequireRole("Doctor"));
    options.AddPolicy("RequireClinicStaff", p => p.RequireRole("ClinicStaff", "ClinicAdmin"));
    options.AddPolicy("RequireClinicAdmin", p => p.RequireRole("ClinicAdmin"));
    options.AddPolicy("RequireSystemAdmin", p => p.RequireRole("SystemAdmin"));

    // ── Permission-based policies (derived from AuthorizationCatalog) ──────────
    // A user satisfies the policy when the JWT contains a matching "permission" claim.
    // Claims are embedded by JwtTokenService for every role the user holds.
    var allPermissions = AuthorizationCatalog.RolePermissions
        .Values
        .SelectMany(p => p)
        .Distinct(StringComparer.OrdinalIgnoreCase);

    foreach (var permission in allPermissions)
    {
        // Policy name convention: "permission:{permission.key}"
        // Usage on a controller: [Authorize(Policy = "permission:admin.dashboard.view")]
        options.AddPolicy($"permission:{permission}",
            p => p.AddRequirements(new PermissionRequirement(permission)));
    }
});

var app = builder.Build();

// Run migrations + seed
await app.SeedAsync();

// Pipeline
app.UseMiddleware<GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Shefaa API v1");
        c.RoutePrefix = "swagger";
    });
}


app.UseCors("ShefaaCorsPolicy");

// Serve static files (uploaded attachments)
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.UseRateLimiter();

app.MapControllers();

// Health endpoint
app.MapGet("/health", () => Results.Ok(new { status = "healthy", service = "Shefaa.Api", timestamp = DateTime.UtcNow }))
    .AllowAnonymous();

// One-off CLI: --reset-password email newPassword
if (args.Length >= 1 && args[0] == "--reset-password")
{
    var email = args.Length > 1 ? args[1] : "admin@mail.com";
    var newPwd = args.Length > 2 ? args[2] : "Doctor@123";
    var conn = builder.Configuration.GetConnectionString("ShefaaConnection") ?? "";
    return await Shefaa.Api.Tools.ResetPasswordTool.RunAsync(email, newPwd, conn);
}

await app.RunAsync();
return 0;