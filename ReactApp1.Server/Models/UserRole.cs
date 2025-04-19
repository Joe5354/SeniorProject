using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Models;

namespace ReactApp1.Server.Models;

public partial class UserRole
{
    public int UserRoleId { get; set; }

    public bool? CreateUser { get; set; }

    public bool? EditUser { get; set; }

    public bool? CreateRule { get; set; }

    public bool? EditRule { get; set; }

    public bool? CreateNote { get; set; }

    public bool? Refresh { get; set; }

    public bool? ReadData { get; set; }

    public bool? SeeAlerts { get; set; }

    public bool? GenReports { get; set; }

    public string Description { get; set; } = null!;

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}


public static class UserRoleEndpoints
{
	public static void MapUserRoleEndpoints (this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/UserRole").WithTags(nameof(UserRole));

        group.MapGet("/", async (parDbContext db) =>
        {
            return await db.UserRoles.ToListAsync();
        })
        .WithName("GetAllUserRoles")
        .WithOpenApi();

        group.MapGet("/{userRoleId}", async Task<Results<Ok<UserRole>, NotFound>> (int userroleid, parDbContext db) =>
        {
            return await db.UserRoles.AsNoTracking()
                .FirstOrDefaultAsync(model => model.UserRoleId == userroleid)
                is UserRole model
                    ? TypedResults.Ok(model)
                    : TypedResults.NotFound();
        })
        .WithName("GetUserRoleById")
        .WithOpenApi();
        /*
        group.MapPut("/{id}", async Task<Results<Ok, NotFound>> (int userroleid, UserRole userRole, parDbContext db) =>
        {
            var affected = await db.UserRoles
                .Where(model => model.UserRoleId == userroleid)
                .ExecuteUpdateAsync(setters => setters
                  .SetProperty(m => m.UserRoleId, userRole.UserRoleId)
                  .SetProperty(m => m.CreateUser, userRole.CreateUser)
                  .SetProperty(m => m.EditUser, userRole.EditUser)
                  .SetProperty(m => m.CreateRule, userRole.CreateRule)
                  .SetProperty(m => m.EditRule, userRole.EditRule)
                  .SetProperty(m => m.CreateNote, userRole.CreateNote)
                  .SetProperty(m => m.Refresh, userRole.Refresh)
                  .SetProperty(m => m.ReadData, userRole.ReadData)
                  .SetProperty(m => m.SeeAlerts, userRole.SeeAlerts)
                  .SetProperty(m => m.GenReports, userRole.GenReports)
                  .SetProperty(m => m.Description, userRole.Description)
                  );
            return affected == 1 ? TypedResults.Ok() : TypedResults.NotFound();
        })
        .WithName("UpdateUserRole")
        .WithOpenApi();

        group.MapPost("/", async (UserRole userRole, parDbContext db) =>
        {
            db.UserRoles.Add(userRole);
            await db.SaveChangesAsync();
            return TypedResults.Created($"/api/UserRole/{userRole.UserRoleId}",userRole);
        })
        .WithName("CreateUserRole")
        .WithOpenApi();

        group.MapDelete("/{id}", async Task<Results<Ok, NotFound>> (int userroleid, parDbContext db) =>
        {
            var affected = await db.UserRoles
                .Where(model => model.UserRoleId == userroleid)
                .ExecuteDeleteAsync();
            return affected == 1 ? TypedResults.Ok() : TypedResults.NotFound();
        })
        .WithName("DeleteUserRole")
        .WithOpenApi();*/
    }
}