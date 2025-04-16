using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Models;

namespace ReactApp1.Server.Models;

public partial class Item
{
    public int ParItemId { get; }

    public int ItemId { get; set; }

    public int ProductId { get; set; }

    public string? SerialNumber { get; set; }

    public string? Barcode { get; set; }

    public int? TotalCount { get; set; }

    public int CatId { get; set; }

    public int? SubCatId { get; set; }

    public string? Source1Name { get; set; }

    public string? Source1Status { get; set; }

    public string? Source2Name { get; set; }

    public string? Source2Status { get; set; }

    public bool? Serialized { get; set; }

    public string ConditionStatus { get; set; } = null!;

    public string WorkflowStage { get; set; } = null!;

    public int? WorkspaceOneTrackingId { get; set; }

    public int? CurrentResponsibleTeamId { get; set; }

    public int? CurrentResponsibleUserId { get; set; }

    public virtual Category Cat { get; set; } = null!;

    public virtual User? CurrentResponsibleUser { get; set; }

    public virtual ICollection<ParNote> ParNotes { get; set; } = new List<ParNote>();

    public virtual ICollection<ParRule> ParRules { get; set; } = new List<ParRule>();

    public virtual SubCategory? SubCat { get; set; }
}


public static class ItemEndpoints //created by making a Controller vv
{
	public static void MapItemEndpoints (this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/Item").WithTags(nameof(Item));

        group.MapGet("/", async (parDbContext db) => // get all items as .json table
        {
            Console.WriteLine("GetAllItems endpoint was hit.");
            return await db.Items.ToListAsync();
        })
        .WithName("GetAllItems")
        .WithOpenApi();

        group.MapGet("/{paritemid}", async Task<Results<Ok<Item>, NotFound>> (int paritemid, parDbContext db) => //get specific item by paritemid
        {
            return await db.Items.AsNoTracking()
                .FirstOrDefaultAsync(model => model.ParItemId == paritemid)
                is Item model
                    ? TypedResults.Ok(model)
                    : TypedResults.NotFound();
        })
        .WithName("GetItemById")
        .WithOpenApi();

        group.MapPut("/{paritemid}", async Task<Results<Ok<Item>, NotFound>> (int paritemid, Item item, parDbContext db) =>
        {
            var affected = await db.Items
                .Where(model => model.ParItemId == paritemid)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(m => m.CatId, item.CatId)
                    .SetProperty(m => m.SubCatId, item.SubCatId)
                    .SetProperty(m => m.Source1Name, item.Source1Name)
                    .SetProperty(m => m.Source1Status, item.Source1Status)
                    .SetProperty(m => m.Source2Name, item.Source2Name)
                    .SetProperty(m => m.Source2Status, item.Source2Status)
                    .SetProperty(m => m.Serialized, item.Serialized)
                );

            return affected == 1 ? TypedResults.Ok(item) : TypedResults.NotFound();
        })
        .WithName("UpdateItem")
        .WithOpenApi();

        group.MapPost("/", async (Item item, parDbContext db) =>
        {
            db.Items.Add(item);
            await db.SaveChangesAsync();
            return TypedResults.Created($"/api/Item/{item.ParItemId}",item);
        })
        .WithName("CreateItem")
        .WithOpenApi();

        group.MapDelete("/{paritemid}", async Task<Results<Ok, NotFound>> (int paritemid, parDbContext db) => //delete an item in the DB by paritemID
        {
            var affected = await db.Items
                .Where(model => model.ParItemId == paritemid)
                .ExecuteDeleteAsync();
            return affected == 1 ? TypedResults.Ok() : TypedResults.NotFound();
        })
        .WithName("DeleteItem")
        .WithOpenApi();
    }


}

