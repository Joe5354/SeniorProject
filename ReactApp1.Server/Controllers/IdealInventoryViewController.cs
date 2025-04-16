using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ReactApp1.Server.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.OpenApi;

namespace ReactApp1.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class IdealInventoryViewController : ControllerBase
    {
        private readonly IdealDbContext _idealContext;
        private parDbContext _parContext;  // For ParDB (Items table)

        public IdealInventoryViewController(IdealDbContext idealContext, parDbContext parContext)
        {
            _idealContext = idealContext;
            _parContext = parContext;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<VwItemInventory>>> GetItemInventory()
        {
            return await _idealContext.VwItemInventories.ToListAsync();
        }


        [HttpPost("destroy-populate-items")]
        public async Task<IActionResult> DestroyAndRepopulate()
        {

            var items = await _parContext.Items.ToListAsync();
            _parContext.Items.RemoveRange(items);
            await _parContext.SaveChangesAsync();

            // Step 1: Fetch data from the view in IdealDB
            var inventoryItems = await _idealContext.VwItemInventories.ToListAsync();

            foreach (var inventoryItem in inventoryItems)
            {
                var newItem = new Item
                {
                    ItemId = inventoryItem.ItemId,
                    ProductId = inventoryItem.ProductId,
                    SerialNumber = inventoryItem.SerialNumber,
                    Barcode = inventoryItem.Barcode,
                    TotalCount = inventoryItem.TotalIndividualUnits,
                    Source1Name = "",
                    Source1Status = "",
                    Source2Name = "",
                    Source2Status = "",
                    CatId = 1,
                    SubCatId = null,
                    ConditionStatus = inventoryItem.ConditionStatusId.ToString(),
                    WorkflowStage = inventoryItem.WorkflowStageId.ToString(),
                    Serialized = (inventoryItem.SerialNumber != null)
                };

                _parContext.Items.Add(newItem);
            }

            await _parContext.SaveChangesAsync();

            return Ok("Items populated successfully");
        }

        [HttpPut("{ItemId}")]
        public async Task<IActionResult> PushItem(int ItemId, VwItemInventory updatedItem)
        {


            // Find the existing item
            var item = await _parContext.Items
            .Where(i => i.ItemId == ItemId)  // Compare to the ItemId column
            .FirstOrDefaultAsync();

            if (item == null)
            {
                var newItem = new Item
                {
                    ItemId = updatedItem.ItemId,
                    ProductId = updatedItem.ProductId,
                    SerialNumber = updatedItem.SerialNumber,
                    Barcode = updatedItem.Barcode,
                    TotalCount = updatedItem.TotalIndividualUnits,
                    Source1Name = "",
                    Source1Status = "",
                    Source2Name = "",
                    Source2Status = "",
                    CatId = 1, //we can add Cat to table in par_db with descr "Unassaigneed"?
                    SubCatId = null,
                    ConditionStatus = updatedItem.ConditionStatusId.ToString(),
                    WorkflowStage = updatedItem.WorkflowStageId.ToString(),
                    Serialized = (updatedItem.SerialNumber != null)
                };
                _parContext.Items.Add(newItem);


                await _parContext.SaveChangesAsync();

                return Ok("Items populated successfully");
            }
            else
            {
                // Update only fields that have changed
                if (item.ProductId != updatedItem.ProductId)
                    item.ProductId = updatedItem.ProductId;

                if (item.SerialNumber != updatedItem.SerialNumber)
                    item.SerialNumber = updatedItem.SerialNumber;

                if (item.Barcode != updatedItem.Barcode)
                    item.Barcode = updatedItem.Barcode;
                /*
                if (item.Source1Name != updatedItem.Source1Name)
                    item.Source1Name = updatedItem.Source1Name;

                if (item.Source1status != updatedItem.Source1status)
                    item.Source1status = updatedItem.Source1status;

                if (item.Source2Name != updatedItem.Source2Name)
                    item.Source2Name = updatedItem.Source2Name;

                if (item.Source2status != updatedItem.Source2status)
                    item.Source2status = updatedItem.Source2status;

                if (item.CatId != updatedItem.CatId)
                    item.CatId = updatedItem.CatId;

                if (item.SubCatId != updatedItem.SubCatId)
                    item.SubCatId = updatedItem.SubCatId;
                */
               if (item.TotalCount != updatedItem.TotalIndividualUnits)
                    item.TotalCount = updatedItem.TotalIndividualUnits;

                if (item.ConditionStatus != updatedItem.ConditionStatusId.ToString())
                    item.ConditionStatus = updatedItem.ConditionStatusId.ToString();

                if (item.WorkflowStage != updatedItem.WorkflowStageId.ToString())
                    item.WorkflowStage = updatedItem.WorkflowStageId.ToString();

                if (item.Serialized != (updatedItem.SerialNumber != null))
                    item.Serialized = (updatedItem.SerialNumber != null);

                // Save the changes only if something was modified
                var modifiedEntities = _parContext.ChangeTracker.Entries()
                    .Where(e => e.State == EntityState.Modified)
                    .ToList();

                // If there are modified entities, save changes
                if (modifiedEntities.Any())
                {
                    await _parContext.SaveChangesAsync();
                    return NoContent();
                }

            }

            return NoContent();
        }

    }



}
