using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;

namespace ReactApp1.Server.Models;

public partial class Onlyitemswithruleandpar
{
    public string? CatDesc { get; set; }

    public string? SubCatDesc { get; set; }

    public int ProductId { get; set; }

    public string? SerialNumber { get; set; }

    public int? TotalCount { get; set; }

    public int RuleId { get; set; }

    public string? Description { get; set; }

    public int ParValue { get; set; }

    public DateTime? DateCreated { get; set; }

    public bool? IsActive { get; set; }

    public string IsTotalCountLessThanParValue { get; set; } = null!;
}
public static class OnlyitemswithruleandparEndpoints
{
    public static void MapOnlyitemswithruleandparEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/onlyitemswithruleandpar").WithTags("OnlyItemsWithRuleAndPar");

        group.MapGet("/", async (parDbReportContext db) =>
        {
            Console.WriteLine("GetOnlyItemsWithRuleAndPar endpoint was hit.");
            return await db.Onlyitemswithruleandpar.ToListAsync(); // Get all records from the view
        })
        .WithName("GetOnlyItemsWithRuleAndPar")
        .WithOpenApi();
    }
}