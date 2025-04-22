using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Models;

namespace ReactApp1.Server.Models;

public partial class ParNote
{
    public int NoteId { get; set; }

    public int ParItemId { get; set; }

    public int? RuleId { get; set; }

    public string Note { get; set; } = null!;

    public int CreatedByUser { get; set; }

    public DateTime? DateCreated { get; set; }

    public virtual User CreatedByUserNavigation { get; set; } = null!;

    public virtual Item ParItem { get; set; } = null!;

    public virtual ParRule? Rule { get; set; }
}


public static class ParNoteEndpoints
{
	public static void MapParNoteEndpoints (this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/ParNote").WithTags(nameof(ParNote));

        group.MapGet("/", async (parDbContext db) =>
        {
            return await db.ParNotes.ToListAsync();
        })
        .WithName("GetAllParNotes")
        .WithOpenApi();

        group.MapGet("/{NoteId}", async Task<Results<Ok<ParNote>, NotFound>> (int noteid, parDbContext db) =>
        {
            return await db.ParNotes.AsNoTracking()
                .FirstOrDefaultAsync(model => model.NoteId == noteid)
                is ParNote model
                    ? TypedResults.Ok(model)
                    : TypedResults.NotFound();
        })
        .WithName("GetParNoteById")
        .WithOpenApi();

        group.MapPut("/{NoteId}", async Task<Results<Ok, NotFound>> (int noteid, ParNote parNote, parDbContext db) =>
        {
            var affected = await db.ParNotes
                .Where(model => model.NoteId == noteid)
                .ExecuteUpdateAsync(setters => setters
                  .SetProperty(m => m.ParItemId, parNote.ParItemId)
                  .SetProperty(m => m.RuleId, parNote.RuleId)
                  .SetProperty(m => m.Note, parNote.Note)
                  .SetProperty(m => m.CreatedByUser, parNote.CreatedByUser)
                  .SetProperty(m => m.DateCreated, parNote.DateCreated)
                  );
            return affected == 1 ? TypedResults.Ok() : TypedResults.NotFound();
        })
        .WithName("UpdateParNote")
        .WithOpenApi();

        group.MapPost("/", async (ParNote parNote, parDbContext db) =>
        {
            db.ParNotes.Add(parNote);
            await db.SaveChangesAsync();
            return TypedResults.Created($"/api/ParNote/{parNote.NoteId}",parNote);
        })
        .WithName("CreateParNote")
        .WithOpenApi();

        group.MapDelete("/{NoteId}", async Task<Results<Ok, NotFound>> (int noteid, parDbContext db) =>
        {
            var affected = await db.ParNotes
                .Where(model => model.NoteId == noteid)
                .ExecuteDeleteAsync();
            return affected == 1 ? TypedResults.Ok() : TypedResults.NotFound();
        })
        .WithName("DeleteParNote")
        .WithOpenApi();
    }
}