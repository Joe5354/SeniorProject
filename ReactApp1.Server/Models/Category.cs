using System;
using System.Collections.Generic;

namespace ReactApp1.Server.Models;

public partial class Category
{
    public int CatId { get; set; }

    public string? CatName { get; set; }

    public string? CatDesc { get; set; }

    public virtual ICollection<Item> Items { get; set; } = new List<Item>();

    public virtual ICollection<SubCategory> SubCategories { get; set; } = new List<SubCategory>();
}
