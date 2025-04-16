using System;
using System.Collections.Generic;

namespace ReactApp1.Server.Models;

public partial class UserRole
{
    public int UserRoleId { get; set; }

    public bool? CreateUser { get; set; }

    public bool? EditUser { get; set; }

    public bool? CreateRule { get; set; }

    public bool? EditRule { get; set; }

    public bool? CreateNote { get; set; }

    public bool? Refresh { get; set; }

    public bool? ReadData { get; set; }

    public bool? SeeAlerts { get; set; }

    public bool? GenReports { get; set; }

    public string Description { get; set; } = null!;

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
