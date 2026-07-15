using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Shefaa.Application.Common;

namespace Shefaa.Api.Filters;

/// <summary>
/// Converts ModelState validation errors into a uniform ApiResponse.
/// </summary>
public class ValidationFilter : IActionFilter
{
    public void OnActionExecuting(ActionExecutingContext context)
    {
        if (!context.ModelState.IsValid)
        {
            var errors = context.ModelState
                .Where(kv => kv.Value?.Errors.Count > 0)
                .Select(kv => $"{kv.Key}: {string.Join("; ", kv.Value!.Errors.Select(e => e.ErrorMessage))}")
                .ToList();
            var result = ApiResponse<object>.Fail("Validation failed.", errors);
            context.Result = new BadRequestObjectResult(result);
        }
    }

    public void OnActionExecuted(ActionExecutedContext context) { }
}