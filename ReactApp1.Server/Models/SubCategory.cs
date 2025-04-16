using System;
using System.Collections.Generic;

namespace ReactApp1.Server.Models;

public partial class SubCategory
{
    public int SubCatId { get; set; }

    public int CatId { get; set; }

    public string? SubCatName { get; set; }

    public string? SubCatDesc { get; set; }

    public virtual Category Cat { get; set; } = null!;

    public virtual ICollection<Item> Items { get; set; } = new List<Item>();
}
