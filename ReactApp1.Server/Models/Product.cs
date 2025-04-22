using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Models;

namespace ReactApp1.Server.Models;

public partial class Product
{
    public int ProductId { get; set; }

    public string? Sku { get; set; }

    public string Name { get; set; } = null!;

    public string Manufacturer { get; set; } = null!;

    public string? ShortDescription { get; set; }

    public string? LongDescription { get; set; }

    public string? Specifications { get; set; }

    public int SourceId { get; set; }

    public bool IsMultipack { get; set; }

    public int? BaseProductId { get; set; }

    public int? UnitsPerPack { get; set; }

    public string? ExternalSourceId { get; set; }

    public DateTime? LastSyncTimestamp { get; set; }

    public int? CategoryId { get; set; }

    public int? SubCategoryId { get; set; }

    public virtual Product? BaseProduct { get; set; }

    public virtual ICollection<Product> InverseBaseProduct { get; set; } = new List<Product>();
}


public static class ProductEndpoints
{
	public static void MapProductEndpoints (this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/Product").WithTags(nameof(Product));

        group.MapGet("/", async (IdealDbContext db) =>
        {
            return await db.Products.ToListAsync();
        })
        .WithName("GetAllProducts")
        .WithOpenApi();

        group.MapGet("/{id}", async Task<Results<Ok<Product>, NotFound>> (int productid, IdealDbContext db) =>
        {
            return await db.Products.AsNoTracking()
                .FirstOrDefaultAsync(model => model.ProductId == productid)
                is Product model
                    ? TypedResults.Ok(model)
                    : TypedResults.NotFound();
        })
        .WithName("GetProductById")
        .WithOpenApi();

    }
}