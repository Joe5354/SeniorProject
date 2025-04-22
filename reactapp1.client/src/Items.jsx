import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';

function AllItemsList({ permissionData }) {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [products, setProducts] = useState([]);
    const [cats, setCats] = useState([]);
    const [sCats, setSCats] = useState([]);
    const [editingRow, setEditingRow] = useState(null);
    const [editedItem, setEditedItem] = useState(null);




    const [selectedCountFilter, setSelectedCountFilter] = useState(null); // 'null', '!null', or null
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [onlyUnique, setOnlyUnique] = useState(false);


    useEffect(() => {
        fetch("https://localhost:7245/api/item")
            .then((response) => {
                if (!response.ok) throw new Error("Failed to fetch items");
                return response.json();
            })
            .then((data) => {
                setItems(data);
                setFilteredItems(data);
            })
            .catch((error) => console.error("Error fetching items:", error));

        fetch("https://localhost:7245/api/Product")
            .then((response) => {
                if (!response.ok) throw new Error("Failed to fetch products");
                return response.json();
            })
            .then((data) => setProducts(data))
            .catch((error) => console.error("Error fetching products:", error));

        fetch("https://localhost:7245/api/category")
            .then((response) => {
                if (!response.ok) throw new Error("Failed to fetch categories");
                return response.json();
            })
            .then((data) => setCats(data))
            .catch((error) => console.error("Error fetching categories:", error));

        fetch("https://localhost:7245/api/subCategory")
            .then((response) => {
                if (!response.ok) throw new Error("Failed to fetch subCategories");
                return response.json();
            })
            .then((data) => setSCats(data))
            .catch((error) => console.error("Error fetching subCategories:", error));
    }, []);

    useEffect(() => {
        let result = [...items];

        if (selectedCountFilter === 'null') {
            result = result.filter(i => i.totalCount === null);
        } else if (selectedCountFilter === '!null') {
            result = result.filter(i => i.totalCount !== null);
        }

        if (selectedProducts.length > 0) {
            result = result.filter(i => selectedProducts.includes(i.productId));
        }

        if (onlyUnique) {
            const seen = new Set();
            result = result.filter(i => {
                if (seen.has(i.productId)) return false;
                seen.add(i.productId);
                return true;
            });
        }

        setFilteredItems(result);
    }, [items, selectedCountFilter, selectedProducts, onlyUnique]);


    const getProductName = (parItemId) => {
        const item = items.find(i => i.parItemId === parItemId);
        if (item) {
            const product = products.find(p => p.productId === item.productId);
            return product ? product.name : "No Product Name";
        }
        return "No Product Name";
    };
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

    const intermediateFilteredItems = items.filter(item => {
        const matchesCountFilter =
            selectedCountFilter === 'null' ? item.totalCount === null :
                selectedCountFilter === '!null' ? item.totalCount !== null :
                    true;

        const matchesProductFilter =
            selectedProducts.length === 0 || selectedProducts.includes(item.productId);

        return matchesCountFilter && matchesProductFilter;
    });

    // Get available totalCount options based on filtered items
    const totalCountOptions = [];
    if (intermediateFilteredItems.some(item => item.totalCount === null)) totalCountOptions.push('null');
    if (intermediateFilteredItems.some(item => item.totalCount !== null)) totalCountOptions.push('!null');

    // Get available product options based on filtered items
    const productOptions = products
        .filter(p => intermediateFilteredItems.some(i => i.productId === p.productId))
        .map(p => ({ label: p.name, value: p.productId }));



    return (
        <div className="p-4">
            <h1>Item List</h1>


            <div className="p-mb-4 flex gap-4 items-end flex-wrap">
                {/* TotalCount Filter */}
                <div className="flex items-center gap-2">
                    <Dropdown
                        value={selectedCountFilter}
                        options={totalCountOptions.map(opt => ({ label: opt === 'null' ? 'Null' : 'Not Null', value: opt }))}
                        onChange={(e) => setSelectedCountFilter(e.value)}
                        placeholder="Filter by Total Count"
                        className="w-60"
                    />
                    <Button
                        icon="pi pi-times"
                        className="p-button-text p-button-sm"
                        onClick={() => setSelectedCountFilter(null)}
                        tooltip="Clear Total Count filter"
                    />
                </div>

                {/* Product Filter */}
                <div className="flex items-center gap-2">
                    <MultiSelect
                        value={selectedProducts}
                        options={productOptions}
                        onChange={(e) => setSelectedProducts(e.value)}
                        placeholder="Filter by Products"
                        className="w-60"
                        display="chip"
                    />
                    <Button
                        icon="pi pi-times"
                        className="p-button-text p-button-sm"
                        onClick={() => setSelectedProducts([])}
                        tooltip="Clear Product filter"
                    />
                </div>

                {/* Unique Checkbox */}
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={onlyUnique}
                        onChange={(e) => setOnlyUnique(e.target.checked)}
                    />
                    <label>Only Unique Products</label>
                    {onlyUnique && (
                        <Button
                            icon="pi pi-times"
                            className="p-button-text p-button-sm"
                            onClick={() => setOnlyUnique(false)}
                            tooltip="Clear Unique filter"
                        />
                    )}
                </div>
            </div>




            <DataTable
                value={filteredItems}
                paginator
                rows={10}
                rowsPerPageOptions={[10, 20, 50]}
                responsiveLayout="scroll"
                dataKey="parItemId"
                scrollable
                scrollHeight="400px"
                stripedRows
            >
                <Column field="productId" header="Product Name" sortable body={(rowData) => getProductName(rowData.parItemId)} syle={{width:'250px'}} />
                <Column field="catId"
                    header="Category"
                    sortable
                    filter
                    body={(rowData) =>
                        editableDropdownCell("catId", cats, rowData, "catDesc", "catId")
                    }
                />
                <Column
                    field="subCatId"
                    header="Subcategory"
                    sortable
                    filter
                    filterPlaceholder="Search"
                    body={(rowData) =>
                        editableDropdownCell(
                            "subCatId",
                            sCats.filter((subCat) => subCat.catId === (editingRow?.parItemId === rowData.parItemId ? editedItem?.catId : rowData.catId)),
                            rowData,
                            "subCatDesc",
                            "subCatId"
                        )
                    }
                />
                <Column field="barcode" header="Barcode" sortable />
                <Column field="totalCount" header="Total Count" sortable />
                <Column
                    body={(rowData) => (
                        <>
                            {(permissionData?.userRoleId === 1 || permissionData?.userRoleId === 2) && (
                                editingRow?.parItemId === rowData.parItemId ? (
                                    <>
                                        <Button icon="pi pi-check" onClick={onRowEditSave} className="p-button-success p-mr-2" />
                                        <Button icon="pi pi-times" onClick={onRowEditCancel} className="p-button-danger" />
                                    </>
                                ) : (
                                    <Button icon="pi pi-pencil" onClick={() => onRowEditInit(rowData)} />
                                )
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
