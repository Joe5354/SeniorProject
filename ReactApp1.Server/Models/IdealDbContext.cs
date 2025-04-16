using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace ReactApp1.Server.Models;

public partial class IdealDbContext : DbContext
{
    public IdealDbContext()
    {
    }

    public IdealDbContext(DbContextOptions<IdealDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<VwItemInventory> VwItemInventories { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Data Source=LAPLET;Initial Catalog=IDEALDB;Integrated Security=True;Connect Timeout=30;Encrypt=True;Trust Server Certificate=True;Application Intent=ReadWrite;Multi Subnet Failover=False");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<VwItemInventory>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vw_ItemInventory");

            entity.Property(e => e.Barcode).HasMaxLength(100);
            entity.Property(e => e.BaseProductId).HasColumnName("BaseProductID");
            entity.Property(e => e.ConditionStatusId).HasColumnName("ConditionStatusID");
            entity.Property(e => e.CurrentResponsibleEndUserId).HasColumnName("CurrentResponsibleEndUserID");
            entity.Property(e => e.CurrentResponsibleTeamId).HasColumnName("CurrentResponsibleTeamID");
            entity.Property(e => e.ItemId).HasColumnName("ItemID");
            entity.Property(e => e.LastModifiedByAppUserId).HasColumnName("LastModifiedByAppUserID");
            entity.Property(e => e.ProductId).HasColumnName("ProductID");
            entity.Property(e => e.SerialNumber).HasMaxLength(255);
            entity.Property(e => e.WorkflowStageId).HasColumnName("WorkflowStageID");
            entity.Property(e => e.WsoUemDeviceId).HasMaxLength(100);
            entity.Property(e => e.WsoUemStatusId).HasColumnName("WsoUemStatusID");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    /*// Populate Items table on startup
    using (var scope = app.Services.CreateScope())
    {
        var Idealcontroller = scope.ServiceProvider.GetRequiredService<IdealInventoryViewController>();
        var idealContext = scope.ServiceProvider.GetRequiredService<IdealDbContext>();
        // Run the PopulateItems function
        List<VwItemInventory> invItems = await idealContext.VwItemInventories.ToListAsync();
        foreach (var idealItem in invItems) 
        { 
            await Idealcontroller.PushItem(idealItem.ItemId, idealItem);
        }
    }*/

}
