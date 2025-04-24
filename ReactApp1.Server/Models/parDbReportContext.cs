using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace ReactApp1.Server.Models;

public partial class parDbReportContext : DbContext
{
    public parDbReportContext(DbContextOptions<parDbReportContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Allitemsandpar> Allitemsandpar { get; set; }

    public virtual DbSet<BelowParItemAndRule> BelowParItemAndRule { get; set; }

    public virtual DbSet<Onlyitemswithruleandpar> Onlyitemswithruleandpar { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
            optionsBuilder.UseSqlServer("Server=NeuraLynx\\MSSQLSERVER01;Database=par_db;Integrated Security=True;TrustServerCertificate=True;");
        
    }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configure Allitemsandpar view
        modelBuilder.Entity<Allitemsandpar>(entity =>
        {
            entity
                .HasNoKey()  // Indicates this is a read-only view
                .ToView("allitemsandpar");  // Maps to the view

            // Properties configuration (optional, based on your requirements)
            entity.Property(e => e.CatDesc)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.DateCreated)
                .HasColumnType("datetime");
            entity.Property(e => e.Description)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.IsTotalCountLessThanParValue)
                .HasMaxLength(3)
                .IsUnicode(false);
            entity.Property(e => e.ProductId)
                .HasColumnName("ProductID");
            entity.Property(e => e.RuleId)
                .HasColumnName("RuleID");
            entity.Property(e => e.SerialNumber)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.SubCatDesc)
                .HasMaxLength(255)
                .IsUnicode(false);
        });

        // Configure BelowParItemAndRule view
        modelBuilder.Entity<BelowParItemAndRule>(entity =>
        {
            entity
                .HasNoKey()  // Indicates this is a read-only view
                .ToView("belowParItemAndRule");  // Maps to the view

            // Properties configuration (optional, based on your requirements)
            entity.Property(e => e.CatDesc)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.DateCreated)
                .HasColumnType("datetime");
            entity.Property(e => e.Description)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.IsTotalCountLessThanParValue)
                .HasMaxLength(3)
                .IsUnicode(false);
            entity.Property(e => e.ProductId)
                .HasColumnName("ProductID");
            entity.Property(e => e.RuleId)
                .HasColumnName("RuleID");
            entity.Property(e => e.SerialNumber)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.SubCatDesc)
                .HasMaxLength(255)
                .IsUnicode(false);
        });

        // Configure Onlyitemswithruleandpar view
        modelBuilder.Entity<Onlyitemswithruleandpar>(entity =>
        {
            entity
                .HasNoKey()  // Indicates this is a read-only view
                .ToView("onlyitemswithruleandpar");  // Maps to the view

            // Properties configuration (optional, based on your requirements)
            entity.Property(e => e.CatDesc)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.DateCreated)
                .HasColumnType("datetime");
            entity.Property(e => e.Description)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.IsTotalCountLessThanParValue)
                .HasMaxLength(3)
                .IsUnicode(false);
            entity.Property(e => e.ProductId)
                .HasColumnName("ProductID");
            entity.Property(e => e.RuleId)
                .HasColumnName("RuleID");
            entity.Property(e => e.SerialNumber)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.SubCatDesc)
                .HasMaxLength(255)
                .IsUnicode(false);
        });

        OnModelCreatingPartial(modelBuilder);  // Allows additional configuration if needed
    }


    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
