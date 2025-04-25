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

    public virtual DbSet<Product> Products { get; set; }
    public virtual DbSet<VwItemInventory> VwItemInventories { get; set; }
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Data Source=LAPLET;Initial Catalog=IDEALDB;Integrated Security=True;Connect Timeout=30;Encrypt=True;Trust Server Certificate=True;Application Intent=ReadWrite;Multi Subnet Failover=False");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.ProductId).HasName("PK__Products__B40CC6ED29462B8B");

            entity.HasIndex(e => e.ExternalSourceId, "IX_Products_ExternalSourceID").HasFilter("([ExternalSourceID] IS NOT NULL)");

            entity.Property(e => e.ProductId).HasColumnName("ProductID");
            entity.Property(e => e.BaseProductId).HasColumnName("BaseProductID");
            entity.Property(e => e.CategoryId).HasColumnName("CategoryID");
            entity.Property(e => e.ExternalSourceId)
                .HasMaxLength(255)
                .HasColumnName("ExternalSourceID");
            entity.Property(e => e.Manufacturer).HasMaxLength(100);
            entity.Property(e => e.Name).HasMaxLength(255);
            entity.Property(e => e.ShortDescription).HasMaxLength(255);
            entity.Property(e => e.Sku)
                .HasMaxLength(255)
                .HasColumnName("SKU");
            entity.Property(e => e.SourceId).HasColumnName("SourceID");
            entity.Property(e => e.SubCategoryId).HasColumnName("SubCategoryID");

            entity.HasOne(d => d.BaseProduct).WithMany(p => p.InverseBaseProduct)
                .HasForeignKey(d => d.BaseProductId)
                .HasConstraintName("FK_Products_BaseProduct");
        });
        modelBuilder.Entity<VwItemInventory>(entity =>
        {
            entity.HasNoKey(); // Marks the view as read-only (no primary key)
            entity.ToView("vw_ItemInventory"); // Optional, but makes it clear it's a view

            // Example of mapping properties (optional if EF inferred them correctly)
            entity.Property(e => e.ItemId).HasColumnName("ItemID");
            entity.Property(e => e.ProductId).HasColumnName("ProductID");
            // Add other property mappings if needed
        });
        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
