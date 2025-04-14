import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

function AllItemsList() {
    const [items, setItems] = useState([]);
    const [editingRow, setEditingRow] = useState(null);
    const [editedItem, setEditedItem] = useState(null);

    useEffect(() => {
        fetch("https://localhost:7245/api/item")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch items");
                }
                return response.json();
            })
            .then((data) => setItems(data))
            .catch((error) => console.error("Error fetching items:", error));
    }, []); // Runs once on mount

    const handleEditChange = (e, field) => {
        const { value } = e.target;
        setEditedItem((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const onRowEditInit = (rowData) => {
        setEditingRow(rowData);
        setEditedItem({ ...rowData });
    };

    const onRowEditSave = () => {
        // Remove `parItemId` from the item data to avoid updating the identity column
        const { parItemId, ...itemToUpdate } = editedItem;

        // Call the API to update the item in the database
        fetch(`https://localhost:7245/api/item/${parItemId}`, {
            method: "PUT", // PUT method to update
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(itemToUpdate), // Send the updated item data without parItemId
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to update item");
                }
                return response.json();
            })
            .then((data) => {
                // Update the items state with the updated data
                setItems((prevItems) =>
                    prevItems.map((item) =>
                        item.parItemId === parItemId ? { ...item, ...itemToUpdate } : item
                    )
                );
                // Reset the editing state
                setEditingRow(null);
                setEditedItem(null);
            })
            .catch((error) => {
                console.error("Error saving item:", error);
                alert("Error saving item");
            });
    };

    const onRowEditCancel = () => {
        setEditingRow(null);
        setEditedItem(null);
    };

    const editableCell = (field, rowData) => {
        if (editingRow && editingRow.parItemId === rowData.parItemId) {
            return (
                <InputText
                    value={editedItem[field]}
                    onChange={(e) => handleEditChange(e, field)}
                />
            );
        }
        return rowData[field]; // Display value if not in edit mode
    };

    return (
        <div className="p-4">
            <h1>Item List</h1>
            <DataTable
                value={items}
                paginator
                rows={5}
                responsiveLayout="scroll"
                dataKey="parItemId"
                filterDisplay="menu"
                style={{ maxWidth: "100%" }}  // Max width for responsiveness
                scrollable // Add scrolling
                scrollHeight="400px"
            >
                <Column field="parItemId" header="Par Item ID" sortable filter filterPlaceholder="Search" />
                <Column field="itemId" header="Item ID" sortable filter filterPlaceholder="Search" />
                <Column field="productId" header="Product ID" sortable filter filterPlaceholder="Search" />
                <Column field="serialNumber" header="Serial Number" sortable filter filterPlaceholder="Search" />
                <Column field="barcode" header="Barcode" sortable filter filterPlaceholder="Search" />
                <Column field="totalCount" header="Total Count" sortable filter filterPlaceholder="Search" />

                <Column field="catId" header="Category ID" sortable filter filterPlaceholder="Search"
                    body={(rowData) => editableCell("catId", rowData)} />
                <Column field="subCatId" header="Subcategory ID" sortable filter filterPlaceholder="Search"
                    body={(rowData) => editableCell("subCatId", rowData)} />

                <Column field="source1Name" header="Source 1 Name" sortable filter filterPlaceholder="Search"
                    body={(rowData) => editableCell("source1Name", rowData)} />
                <Column field="source1Status" header="Source 1 Status" sortable filter filterPlaceholder="Search"
                    body={(rowData) => editableCell("source1Status", rowData)} />
                <Column field="source2Name" header="Source 2 Name" sortable filter filterPlaceholder="Search"
                    body={(rowData) => editableCell("source2Name", rowData)} />
                <Column field="source2Status" header="Source 2 Status" sortable filter filterPlaceholder="Search"
                    body={(rowData) => editableCell("source2Status", rowData)} />

                <Column field="serialized" header="Serialized" sortable filter filterPlaceholder="Search" />
                <Column field="conditionStatus" header="Condition Status" sortable filter filterPlaceholder="Search" />
                <Column field="workflowStage" header="Workflow Stage" sortable filter filterPlaceholder="Search" />
                <Column field="workspaceOneTrackingId" header="WS1 Tracking ID" sortable filter filterPlaceholder="Search" />
                <Column field="currentResponsibleTeamId" header="Team ID" sortable filter filterPlaceholder="Search" />
                <Column field="currentResponsibleUserId" header="User ID" sortable filter filterPlaceholder="Search" />

                <Column
                    body={(rowData) => (
                        <>
                            {editingRow && editingRow.parItemId === rowData.parItemId ? (
                                <>
                                    <Button icon="pi pi-check" onClick={onRowEditSave} className="p-button-success p-mr-2" />
                                    <Button icon="pi pi-times" onClick={onRowEditCancel} className="p-button-danger" />
                                </>
                            ) : (
                                <Button icon="pi pi-pencil" onClick={() => onRowEditInit(rowData)} />
                            )}
                        </>
                    )}
                    style={{ width: "6rem" }}
                />
            </DataTable>
        </div>
    );
}

export default AllItemsList;