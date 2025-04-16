using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace ReactApp1.Server.Models;

public partial class parDbContext : DbContext
{
    public parDbContext()
    {
    }

    public parDbContext(DbContextOptions<parDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<Item> Items { get; set; }

    public virtual DbSet<ParNote> ParNotes { get; set; }

    public virtual DbSet<ParRule> ParRules { get; set; }

    public virtual DbSet<SubCategory> SubCategories { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserRole> UserRoles { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Data Source=LAPLET;Initial Catalog=par_db;Integrated Security=True;Connect Timeout=30;Encrypt=True;Trust Server Certificate=True;Application Intent=ReadWrite;Multi Subnet Failover=False");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.CatId).HasName("PK__Category__6A1C8ADA02F5EA81");

            entity.ToTable("Category");

            entity.Property(e => e.CatId)
                .ValueGeneratedNever()
                .HasColumnName("CatID");
            entity.Property(e => e.CatDesc)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.CatName)
                .HasMaxLength(255)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Item>(entity =>
        {
            entity.HasKey(e => e.ParItemId).HasName("PK__Items__3D55B4EBCE127A83");

            entity.Property(e => e.ParItemId).HasColumnName("ParItemID");
            entity.Property(e => e.Barcode)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.CatId).HasColumnName("CatID");
            entity.Property(e => e.ConditionStatus)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.CurrentResponsibleTeamId).HasColumnName("CurrentResponsibleTeamID");
            entity.Property(e => e.CurrentResponsibleUserId).HasColumnName("CurrentResponsibleUserID");
            entity.Property(e => e.ItemId).HasColumnName("ItemID");
            entity.Property(e => e.ProductId).HasColumnName("ProductID");
            entity.Property(e => e.SerialNumber)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.Source1Name)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Source1Status)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Source2Name)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Source2Status)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.SubCatId).HasColumnName("SubCatID");
            entity.Property(e => e.WorkflowStage)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.WorkspaceOneTrackingId).HasColumnName("WorkspaceOneTrackingID");

            entity.HasOne(d => d.Cat).WithMany(p => p.Items)
                .HasForeignKey(d => d.CatId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Items__CatID__44FF419A");

            entity.HasOne(d => d.CurrentResponsibleUser).WithMany(p => p.Items)
                .HasForeignKey(d => d.CurrentResponsibleUserId)
                .HasConstraintName("FK__Items__CurrentRe__46E78A0C");

            entity.HasOne(d => d.SubCat).WithMany(p => p.Items)
                .HasForeignKey(d => d.SubCatId)
                .HasConstraintName("FK__Items__SubCatID__45F365D3");
        });

        modelBuilder.Entity<ParNote>(entity =>
        {
            entity.HasKey(e => e.NoteId).HasName("PK__ParNotes__EACE357FD054AE4D");

            entity.Property(e => e.NoteId).HasColumnName("NoteID");
            entity.Property(e => e.DateCreated)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Note)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.ParItemId).HasColumnName("ParItemID");
            entity.Property(e => e.RuleId).HasColumnName("RuleID");

            entity.HasOne(d => d.CreatedByUserNavigation).WithMany(p => p.ParNotes)
                .HasForeignKey(d => d.CreatedByUser)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ParNotes__Create__52593CB8");

            entity.HasOne(d => d.ParItem).WithMany(p => p.ParNotes)
                .HasForeignKey(d => d.ParItemId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ParNotes__ParIte__5070F446");

            entity.HasOne(d => d.Rule).WithMany(p => p.ParNotes)
                .HasForeignKey(d => d.RuleId)
                .HasConstraintName("FK__ParNotes__RuleID__5165187F");
        });

        modelBuilder.Entity<ParRule>(entity =>
        {
            entity.HasKey(e => e.RuleId).HasName("PK__ParRules__110458C2BC1944DC");

            entity.HasIndex(e => e.RuleName, "UQ__ParRules__B88BAC0EEFBC98FB").IsUnique();

            entity.Property(e => e.RuleId).HasColumnName("RuleID");
            entity.Property(e => e.DateCreated)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Description)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.ParItemId).HasColumnName("ParItemID");
            entity.Property(e => e.RuleName)
                .HasMaxLength(255)
                .IsUnicode(false);

            entity.HasOne(d => d.CreatedByUserNavigation).WithMany(p => p.ParRules)
                .HasForeignKey(d => d.CreatedByUser)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ParRules__Create__4CA06362");

            entity.HasOne(d => d.ParItem).WithMany(p => p.ParRules)
                .HasForeignKey(d => d.ParItemId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ParRules__ParIte__4BAC3F29");
        });

        modelBuilder.Entity<SubCategory>(entity =>
        {
            entity.HasKey(e => e.SubCatId).HasName("PK__SubCateg__39637975409BD21A");

            entity.ToTable("SubCategory");

            entity.Property(e => e.SubCatId)
                .ValueGeneratedNever()
                .HasColumnName("SubCatID");
            entity.Property(e => e.CatId).HasColumnName("CatID");
            entity.Property(e => e.SubCatDesc)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.SubCatName)
                .HasMaxLength(255)
                .IsUnicode(false);

            entity.HasOne(d => d.Cat).WithMany(p => p.SubCategories)
                .HasForeignKey(d => d.CatId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__SubCatego__CatID__412EB0B6");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CCACC9F74657");

            entity.HasIndex(e => e.Username, "UQ__Users__536C85E4FFA09ACE").IsUnique();

            entity.HasIndex(e => e.EmployeeId, "UQ__Users__7AD04FF0C9083FBC").IsUnique();

            entity.HasIndex(e => e.Email, "UQ__Users__A9D10534CBE8891D").IsUnique();

            entity.Property(e => e.UserId).HasColumnName("UserID");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.EmployeeId)
                .HasMaxLength(50)
                .HasColumnName("EmployeeID");
            entity.Property(e => e.FirstName)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.LastName)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.UserRoleId).HasColumnName("UserRoleID");
            entity.Property(e => e.Username)
                .HasMaxLength(255)
                .IsUnicode(false);

            entity.HasOne(d => d.UserRole).WithMany(p => p.Users)
                .HasForeignKey(d => d.UserRoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Users__UserRoleI__3C69FB99");
        });

        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.HasKey(e => e.UserRoleId).HasName("PK__UserRole__3D978A55255275FF");

            entity.ToTable("UserRole");

            entity.Property(e => e.UserRoleId)
                .ValueGeneratedNever()
                .HasColumnName("UserRoleID");
            entity.Property(e => e.Description)
                .HasMaxLength(255)
                .IsUnicode(false);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
