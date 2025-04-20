using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Models;

namespace ReactApp1.Server.Models;

public partial class ParRule
{
    public int RuleId { get; set; }

    public int ParItemId { get; set; }

    public string RuleName { get; set; } = null!;

    public string? Description { get; set; }

    public int ParValue { get; set; }

    public int CreatedByUser { get; set; }

    public bool IsActive { get; set; }

    public DateTime? DateCreated { get; set; }

    public virtual User CreatedByUserNavigation { get; set; } = null!;

    public virtual Item ParItem { get; set; } = null!;

    public virtual ICollection<ParNote> ParNotes { get; set; } = new List<ParNote>();

}


public static class ParRuleEndpoints
{
	public static void MapParRuleEndpoints (this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/ParRule").WithTags(nameof(ParRule));

        group.MapGet("/", async (parDbContext db) =>
        {
            return await db.ParRules.ToListAsync();
        })
        .WithName("GetAllParRules")
        .WithOpenApi();

        group.MapGet("/{ruleid}", async Task<Results<Ok<ParRule>, NotFound>> (int ruleid, parDbContext db) =>
        {
            return await db.ParRules.AsNoTracking()
                .FirstOrDefaultAsync(model => model.RuleId == ruleid)
                is ParRule model
                    ? TypedResults.Ok(model)
                    : TypedResults.NotFound();
        })
        .WithName("GetParRuleById")
        .WithOpenApi();

        group.MapPut("/{ruleId}", async Task<Results<Ok, NotFound>> (int ruleid, ParRule parRule, parDbContext db) =>
        {
            var affected = await db.ParRules
                .Where(model => model.RuleId == ruleid)
                .ExecuteUpdateAsync(setters => setters
                  .SetProperty(m => m.ParItemId, parRule.ParItemId)
                  .SetProperty(m => m.RuleName, parRule.RuleName)
                  .SetProperty(m => m.Description, parRule.Description)
                  .SetProperty(m => m.ParValue, parRule.ParValue)
                  .SetProperty(m => m.CreatedByUser, parRule.CreatedByUser)
                  .SetProperty(m => m.IsActive, parRule.IsActive)
                  .SetProperty(m => m.DateCreated, parRule.DateCreated)
                  );
            return affected == 1 ? TypedResults.Ok() : TypedResults.NotFound();
        })
        .WithName("UpdateParRule")
        .WithOpenApi();

        group.MapPost("/", async (ParRule parRule, parDbContext db) =>
        {
            db.ParRules.Add(parRule);
            await db.SaveChangesAsync();
            return TypedResults.Created($"/api/ParRule/{parRule.RuleId}",parRule);
        })
        .WithName("CreateParRule")
        .WithOpenApi();

        group.MapDelete("/{ruleId}", async Task<Results<Ok, NotFound>> (int ruleid, parDbContext db) =>
        {
            var affected = await db.ParRules
                .Where(model => model.RuleId == ruleid)
                .ExecuteDeleteAsync();
            return affected == 1 ? TypedResults.Ok() : TypedResults.NotFound();
        })
        .WithName("DeleteParRule")
        .WithOpenApi();
    }
}


