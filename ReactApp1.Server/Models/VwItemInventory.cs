using System;
using System.Collections.Generic;

namespace ReactApp1.Server.Models;

public partial class VwItemInventory
{
    public int ItemId { get; set; }

    public int ProductId { get; set; }

    public string? SerialNumber { get; set; }

    public string? Barcode { get; set; }

    public int? Quantity { get; set; }

    public int ConditionStatusId { get; set; }

    public int WorkflowStageId { get; set; }

    public string? WsoUemDeviceId { get; set; }

    public int WsoUemStatusId { get; set; }

    public DateTime? WsoUemLastSync { get; set; }

    public int? CurrentResponsibleEndUserId { get; set; }

    public int? CurrentResponsibleTeamId { get; set; }

    public int LastModifiedByAppUserId { get; set; }

    public int? BaseUnitCount { get; set; }

    public bool IsMultipack { get; set; }

    public int? UnitsPerPack { get; set; }

    public int? BaseProductId { get; set; }

    public int? TotalIndividualUnits { get; set; }
}
