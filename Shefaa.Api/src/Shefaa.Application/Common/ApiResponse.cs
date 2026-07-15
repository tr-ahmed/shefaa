namespace Shefaa.Application.Common;

/// <summary>
/// Standard API response envelope used by all endpoints.
/// </summary>
public class ApiResponse<T>
{
    public bool Success { get; init; }
    public string? Message { get; init; }
    public T? Data { get; init; }
    public IReadOnlyList<string> Errors { get; init; } = Array.Empty<string>();

    public static ApiResponse<T> Ok(T data, string? message = null) =>
        new() { Success = true, Data = data, Message = message };

    public static ApiResponse<T> Fail(string message, params string[] errors) =>
        new() { Success = false, Message = message, Errors = errors };

    public static ApiResponse<T> Fail(string message, IReadOnlyList<string> errors) =>
        new() { Success = false, Message = message, Errors = errors };
}

public class ApiResponse
{
    public bool Success { get; init; }
    public string? Message { get; init; }
    public IReadOnlyList<string> Errors { get; init; } = Array.Empty<string>();

    public static ApiResponse Ok(string? message = null) =>
        new() { Success = true, Message = message };

    public static ApiResponse Fail(string message, params string[] errors) =>
        new() { Success = false, Message = message, Errors = errors };

    public static ApiResponse Fail(string message, IReadOnlyList<string> errors) =>
        new() { Success = false, Message = message, Errors = errors };
}

/// <summary>
/// Generic paged result wrapper.
/// </summary>
public class PagedResult<T>
{
    public IReadOnlyList<T> Items { get; init; } = Array.Empty<T>();
    public int TotalCount { get; init; }
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalCount / PageSize) : 0;
    public bool HasNextPage => Page < TotalPages;
    public bool HasPreviousPage => Page > 1;
}