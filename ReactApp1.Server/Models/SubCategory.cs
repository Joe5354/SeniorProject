using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Models;

namespace ReactApp1.Server.Models;

public partial class SubCategory
{
    public int SubCatId { get; set; }

    public int CatId { get; set; }

    public string? SubCatName { get; set; }

    public string? SubCatDesc { get; set; }

    public virtual Category Cat { get; set; } = null!;

    public virtual ICollection<Item> Items { get; set; } = new List<Item>();
}


public static class SubCategoryEndpoints
{
	public static void MapSubCategoryEndpoints (this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/SubCategory").WithTags(nameof(SubCategory));

        group.MapGet("/", async (parDbContext db) =>
        {
            return await db.SubCategories.ToListAsync();
        })
        .WithName("GetAllSubCategories")
        .WithOpenApi();

        group.MapGet("/{subCatId}", async Task<Results<Ok<SubCategory>, NotFound>> (int subcatid, parDbContext db) =>
        {
            return await db.SubCategories.AsNoTracking()
                .FirstOrDefaultAsync(model => model.SubCatId == subcatid)
                is SubCategory model
                    ? TypedResults.Ok(model)
                    : TypedResults.NotFound();
        })
        .WithName("GetSubCategoryById")
        .WithOpenApi();

    }
}