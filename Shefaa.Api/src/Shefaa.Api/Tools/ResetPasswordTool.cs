namespace Shefaa.Api.Tools;

using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Shefaa.Domain.Identity;
using Shefaa.Infrastructure.Persistence;

/// <summary>
/// One-off CLI tool to reset a user's password. Run via:
///   dotnet run --project src/Shefaa.Api -- --reset-password email newPassword
/// </summary>
public static class ResetPasswordTool
{
    public static async Task<int> RunAsync(string email, string newPassword, string connectionString)
    {
        var services = new ServiceCollection();
        services.AddLogging(b => b.AddConsole());
        services.AddDbContext<ShefaaDbContext>(o => o.UseSqlServer(connectionString));
        services.AddIdentity<ApplicationUser, ApplicationRole>()
            .AddEntityFrameworkStores<ShefaaDbContext>()
            .AddDefaultTokenProviders();

        var sp = services.BuildServiceProvider();
        var um = sp.GetRequiredService<UserManager<ApplicationUser>>();
        var user = await um.FindByEmailAsync(email);
        if (user == null)
        {
            Console.Error.WriteLine($"User '{email}' not found.");
            return 1;
        }
        var token = await um.GeneratePasswordResetTokenAsync(user);
        var result = await um.ResetPasswordAsync(user, token, newPassword);
        if (result.Succeeded)
        {
            Console.WriteLine($"Password for '{email}' has been set to '{newPassword}'.");
            return 0;
        }
        Console.Error.WriteLine("Failed: " + string.Join(", ", result.Errors));
        return 1;
    }
}
