using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Models;

namespace ReactApp1.Server.Models;

public partial class Category
{
    public int CatId { get; set; }

    public string? CatName { get; set; }

    public string? CatDesc { get; set; }

    public virtual ICollection<Item> Items { get; set; } = new List<Item>();

    public virtual ICollection<SubCategory> SubCategories { get; set; } = new List<SubCategory>();
}


public static class CategoryEndpoints
{
	public static void MapCategoryEndpoints (this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/Category").WithTags(nameof(Category));

        group.MapGet("/", async (parDbContext db) =>
        {
            return await db.Categories.ToListAsync();
        })
        .WithName("GetAllCategories")
        .WithOpenApi();

        group.MapGet("/{id}", async Task<Results<Ok<Category>, NotFound>> (int catid, parDbContext db) =>
        {
            return await db.Categories.AsNoTracking()
                .FirstOrDefaultAsync(model => model.CatId == catid)
                is Category model
                    ? TypedResults.Ok(model)
                    : TypedResults.NotFound();
        })
        .WithName("GetCategoryById")
        .WithOpenApi();

        group.MapPut("/{catId}", async Task<Results<Ok, NotFound>> (int catid, Category category, parDbContext db) =>
        {
            var affected = await db.Categories
                .Where(model => model.CatId == catid)
                .ExecuteUpdateAsync(setters => setters
                  .SetProperty(m => m.CatId, category.CatId)
                  .SetProperty(m => m.CatName, category.CatName)
                  .SetProperty(m => m.CatDesc, category.CatDesc)
                  );
            return affected == 1 ? TypedResults.Ok() : TypedResults.NotFound();
        })
        .WithName("UpdateCategory")
        .WithOpenApi();
    }
}