using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;

namespace ReactApp1.Server.Models;

public partial class BelowParItemAndRule
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
public static class BelowParItemAndRuleEndpoints
{
    public static void MapBelowParItemAndRuleEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/belowparitemandrule").WithTags("BelowParItemAndRule");

        group.MapGet("/", async (parDbReportContext db) =>
        {
            Console.WriteLine("GetBelowParItemAndRule endpoint was hit.");
            return await db.BelowParItemAndRule.ToListAsync(); // Get all records from the view
        })
        .WithName("GetBelowParItemAndRule")
        .WithOpenApi();
    }
}