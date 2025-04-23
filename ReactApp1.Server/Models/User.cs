using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Models;

namespace ReactApp1.Server.Models;

public partial class User
{
    public int UserId { get; set; }

    public string Username { get; set; } = null!;

    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string? EmployeeId { get; set; }

    public bool IsActive { get; set; }

    public int UserRoleId { get; set; }

    public virtual ICollection<Item> Items { get; set; } = new List<Item>();

    public virtual ICollection<ParNote> ParNotes { get; set; } = new List<ParNote>();

    public virtual ICollection<ParRule> ParRules { get; set; } = new List<ParRule>();

    public virtual UserRole UserRole { get; set; } = null!;
}


public static class UserEndpoints
{
	public static void MapUserEndpoints (this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/User").WithTags(nameof(User));

        group.MapGet("/", async (parDbContext db) =>
        {
            return await db.Users.ToListAsync();
        })
        .WithName("GetAllUsers")
        .WithOpenApi();

        group.MapGet("/{UserId}", async Task<Results<Ok<User>, NotFound>> (int userid, parDbContext db) =>
        {
            return await db.Users.AsNoTracking()
                .FirstOrDefaultAsync(model => model.UserId == userid)
                is User model
                    ? TypedResults.Ok(model)
                    : TypedResults.NotFound();
        })
        .WithName("GetUserById")
        .WithOpenApi();

        group.MapPut("/{UserId}", async Task<Results<Ok, NotFound>> (int userid, User user, parDbContext db) =>
        {
            var affected = await db.Users
                .Where(model => model.UserId == userid)
                .ExecuteUpdateAsync(setters => setters
                  .SetProperty(m => m.Username, user.Username)
                  .SetProperty(m => m.FirstName, user.FirstName)
                  .SetProperty(m => m.LastName, user.LastName)
                  .SetProperty(m => m.Email, user.Email)
                  .SetProperty(m => m.EmployeeId, user.EmployeeId)
                  .SetProperty(m => m.IsActive, user.IsActive)
                  .SetProperty(m => m.UserRoleId, user.UserRoleId)
                  );
            return affected == 1 ? TypedResults.Ok() : TypedResults.NotFound();
        })
        .WithName("UpdateUser")
        .WithOpenApi();

        group.MapPost("/", async (User user, parDbContext db) =>
        {
            db.Users.Add(user);
            await db.SaveChangesAsync();
            return TypedResults.Created($"/api/User/{user.UserId}",user);
        })
        .WithName("CreateUser")
        .WithOpenApi();

        group.MapDelete("/{UserId}", async Task<Results<Ok, NotFound>> (int userid, parDbContext db) =>
        {
            var affected = await db.Users
                .Where(model => model.UserId == userid)
                .ExecuteDeleteAsync();
            return affected == 1 ? TypedResults.Ok() : TypedResults.NotFound();
        })
        .WithName("DeleteUser")
        .WithOpenApi();

    }
}