import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from 'primereact/dropdown';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

function AllItemsList({ permissionData }) {
    const [items, setItems] = useState([]);
    const [cats, setCats] = useState([]);
    const [sCats, setSCats] = useState([]);
    const [editingRow, setEditingRow] = useState(null);
    const [editedItem, setEditedItem] = useState(null);
    const sourceStatuses = [
        { code: "in_stock", label: "In Stock" },
        { code: "out_of_stock", label: "Out of Stock" },
        { code: "backordered", label: "Backordered" },
        { code: "discontinued", label: "Discontinued" }
    ];
    const sources = [
        { code: "dell", label: "DELL" },
        { code: "srcExamp2", label: "src2" },
        { code: "srcExamp3", label: "src3" },
        { code: "srcExamp4", label: "src4" }
    ];
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

        fetch("https://localhost:7245/api/category")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch cats");
                }
                return response.json();
            })
            .then((data) => setCats(data))
            .catch((error) => console.error("Error fetching cats:", error));
        console.log("CATEGORIES: "+JSON.stringify(cats, null, 2));
        fetch("https://localhost:7245/api/subCategory")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch subCats");
                }
                return response.json();
            })
            .then((data) => setSCats(data))
            .catch((error) => console.error("Error fetching subCats:", error));

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

    const getCategoryDescription = (catId) => {
        const cat = cats.find(c => c.catId === catId);
        return cat ? cat.catDesc : catId; 
    };

    const getSubCategoryDescription = (subCatId) => {
        const subCat = sCats.find(sc => sc.subCatId === subCatId);
        return subCat ? subCat.subCatDesc : subCatId;
    };

    const editableDropdownCell = (field, options, rowData, labelField, valueField = field) => {
        if (editingRow && editingRow.parItemId === rowData.parItemId) {
            return (
                <Dropdown
                    value={editedItem[field]}
                    options={options}
                    onChange={(e) => handleEditChange({ target: { value: e.value } }, field)}
                    optionLabel={labelField}
                    optionValue={valueField}
                    placeholder="Select"
                />
            );
        }

        if (field === "catId") return getCategoryDescription(rowData[field]);
        if (field === "subCatId") return getSubCategoryDescription(rowData[field]);

        const found = options?.find((opt) => opt[valueField] === rowData[field]);
        return found ? found[labelField] : rowData[field];
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

                <Column field="catId"
                    header="Category"
                    sortable
                    filter
                    body={(rowData) =>
                        editableDropdownCell("catId", cats, rowData, "catDesc", "catId")
                    }
                />
                <Column field="subCatId" header="Subcategory" sortable filter filterPlaceholder="Search"
                    body={(rowData) => {
                        if (editingRow && editedItem) {
                            return editableDropdownCell(
                                "subCatId",
                                sCats.filter((subCat) => subCat.catId === editedItem.catId),
                                editedItem,
                                "subCatDesc",
                                "subCatId"
                            );
                        } else {
                            const subCat = sCats.find((sCat) => sCat.subCatId === rowData.subCatId);
                            return subCat ? subCat.subCatDesc : rowData.subCatId;
                        }
                    }} />

                <Column field="source1Name" header="Source 1 Name" sortable filter filterPlaceholder="Search"
                    body={(rowData) =>
                        editableDropdownCell("source1Name", sources, rowData, "label", "code")
                    } />
                <Column field="source1Status" header="Source 1 Status" sortable filter filterPlaceholder="Search"

                    body={(rowData) =>
                        editableDropdownCell("source1Status", sourceStatuses, rowData, "label", "code")
                    } />

                <Column field="source2Name" header="Source 2 Name" sortable filter filterPlaceholder="Search"
                    body={(rowData) =>
                        editableDropdownCell("source2Name", sources, rowData, "label", "code")
                    } />
                <Column field="source2Status" header="Source 2 Status" sortable filter filterPlaceholder="Search"
                    body={(rowData) =>
                        editableDropdownCell("source2Status", sourceStatuses, rowData, "label", "code")
                    } />

                <Column field="serialized" header="Serialized" sortable filter filterPlaceholder="Search" />
                <Column field="conditionStatus" header="Condition Status" sortable filter filterPlaceholder="Search" />
                <Column field="workflowStage" header="Workflow Stage" sortable filter filterPlaceholder="Search" />
                <Column field="workspaceOneTrackingId" header="WS1 Tracking ID" sortable filter filterPlaceholder="Search" />
                <Column field="currentResponsibleTeamId" header="Team ID" sortable filter filterPlaceholder="Search" />
                <Column field="currentResponsibleUserId" header="User ID" sortable filter filterPlaceholder="Search" />

                <Column
                    body={(rowData) => (
                        <>
                            {permissionData?.userRoleId === 1 || permissionData?.userRoleId === 2 ? (
                                editingRow && editingRow.parItemId === rowData.parItemId ? (
                                    <>
                                        <Button icon="pi pi-check" onClick={onRowEditSave} className="p-button-success p-mr-2" />
                                        <Button icon="pi pi-times" onClick={onRowEditCancel} className="p-button-danger" />
                                    </>
                                ) : (
                                    <Button icon="pi pi-pencil" onClick={() => onRowEditInit(rowData)} />
                                )
                            ) : null}
                        </>
                    )}
                    style={{ width: "6rem" }}
                />
            </DataTable>
        </div>
    );
}

export default AllItemsList;