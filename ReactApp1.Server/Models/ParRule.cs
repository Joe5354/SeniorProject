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

	public string? parSeenStatus { get; set; }

	public string? orderStatus { get; set; }
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
            // Step 1: Retrieve the rule to update
            var existingRule = await db.ParRules
                .Where(model => model.RuleId == ruleid)
                .FirstOrDefaultAsync();

            if (existingRule == null)
            {
                return TypedResults.NotFound();
            }

            // Step 2: If the rule is being set to active, deactivate any other active rule for the same ParItemId
            if (parRule.IsActive)
            {
				var productId = await db.Items
	            .Where(i => i.ParItemId == parRule.ParItemId)
	            .Select(i => i.ProductId)
	            .FirstOrDefaultAsync();

				var activeRules = await db.ParRules
					.Where(rule => rule.IsActive && db.Items
						.Any(item => item.ParItemId == rule.ParItemId && item.ProductId == productId))
					.ToListAsync();

				foreach (var activeRule in activeRules)
                {
                    activeRule.IsActive = false;  // Deactivate other active rules
                    db.ParRules.Update(activeRule);
                }
            }

            // Step 3: Update the rule
            existingRule.ParItemId = parRule.ParItemId;
			existingRule.parSeenStatus = parRule.parSeenStatus;
			existingRule.orderStatus = parRule.orderStatus;
			existingRule.RuleName = parRule.RuleName;
            existingRule.Description = parRule.Description;
            existingRule.ParValue = parRule.ParValue;
            existingRule.CreatedByUser = parRule.CreatedByUser;
            existingRule.IsActive = parRule.IsActive;
            existingRule.DateCreated = parRule.DateCreated;

            db.ParRules.Update(existingRule);
            await db.SaveChangesAsync();

            return TypedResults.Ok();
        })
        .WithName("UpdateParRule")
        .WithOpenApi();

        group.MapPost("/", async (ParRule parRule, parDbContext db) =>
        {
            // Step 1: Deactivate any active rule for the same ParItemId
            if (parRule.IsActive)
            {
				var productId = await db.Items
				.Where(i => i.ParItemId == parRule.ParItemId)
				.Select(i => i.ProductId)
				.FirstOrDefaultAsync();

				var activeRules = await db.ParRules
					.Where(rule => rule.IsActive && db.Items
						.Any(item => item.ParItemId == rule.ParItemId && item.ProductId == productId))
					.ToListAsync();

				foreach (var activeRule in activeRules)
                {
                    activeRule.IsActive = false;  // Deactivate other active rules
                    db.ParRules.Update(activeRule);
                }
            }

            // Step 2: Add the new rule
            db.ParRules.Add(parRule);
            await db.SaveChangesAsync();

            return TypedResults.Created($"/api/ParRule/{parRule.RuleId}", parRule);
        })
        .WithName("CreateParRule")
        .WithOpenApi();
    }
}


