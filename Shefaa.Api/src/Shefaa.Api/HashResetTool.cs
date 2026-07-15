using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Shefaa.Domain.Identity;
using Shefaa.Infrastructure.Persistence;

namespace Shefaa.Api
{
    /// <summary>
    /// Standalone helper to reset a doctor's password to a known value.
    /// Run via: `dotnet run --project src/Shefaa.Api -- --reset-password admin@mail.com Doctor@123`
    /// </summary>
    public class HashResetTool
    {
        public static async Task<int> RunAsync(IServiceProvider services, string email, string newPassword)
        {
            using var scope = services.CreateScope();
            var sp = scope.ServiceProvider;
            var userManager = sp.GetRequiredService<UserManager<ApplicationUser>>();
            var user = await userManager.FindByEmailAsync(email);
            if (user == null)
            {
                Console.WriteLine($"User '{email}' not found.");
                return 1;
            }

            // Generate a fresh reset token then immediately consume it to set the password.
            var token = await userManager.GeneratePasswordResetTokenAsync(user);
            var result = await userManager.ResetPasswordAsync(user, token, newPassword);
            if (result.Succeeded)
            {
                Console.WriteLine($"Password for '{email}' has been reset to '{newPassword}'.");
                return 0;
            }
            Console.WriteLine("Failed: " + string.Join(", ", result.Errors));
            return 1;
        }
    }
}
