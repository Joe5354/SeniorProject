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
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [uniqueProductsOnly, setUniqueProductsOnly] = useState(false);
    const [totalCountFilter, setTotalCountFilter] = useState(null);
    const [editingRow, setEditingRow] = useState(null);
    const [editedItem, setEditedItem] = useState(null);

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
        applyFilters();
    }, [items, selectedProducts, uniqueProductsOnly, totalCountFilter]);

    const applyFilters = () => {
        let filtered = [...items];

        if (selectedProducts.length > 0) {
            filtered = filtered.filter(item => selectedProducts.includes(item.productId));
        }

        if (uniqueProductsOnly) {
            const seen = new Set();
            filtered = filtered.filter(item => {
                if (seen.has(item.productId)) return false;
                seen.add(item.productId);
                return true;
            });
        }

        if (totalCountFilter !== null) {
            filtered = filtered.filter(item =>
                totalCountFilter ? item.totalCount !== null : item.totalCount === null
            );
        }

        setFilteredItems(filtered);
    };

    const productOptions = products.filter(p =>
        items.some(i => i.productId === p.productId)
    );

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

    const ItemFilters = ({
        selectedProducts, setSelectedProducts,
        uniqueProductsOnly, setUniqueProductsOnly,
        totalCountFilter, setTotalCountFilter,
        clearAllFilters,
        productOptions
    }) => {
        return (
            <div className="flex flex-wrap items-center gap-4 mb-4">
                {/* Product Filter */}
                <div className="flex items-center gap-2">
                    <MultiSelect
                        value={selectedProducts}
                        options={productOptions}
                        optionLabel="name"
                        optionValue="productId"
                        onChange={(e) => {
                            const value = e.value.length > 0 ? e.value : [];
                            setSelectedProducts(value);
                        }}
                        placeholder="Filter by Product"
                        display="chip"
                        className="w-64"
                    />
                    <Button
                        icon="pi pi-times"
                        className="p-button-outlined p-button-danger p-button-sm"
                        onClick={() => setSelectedProducts([])}
                        tooltip="Clear Product Filter"
                    />
                </div>

                {/* Unique Products Filter */}
                <div className="flex items-center gap-2">
                    <Dropdown
                        value={uniqueProductsOnly}
                        options={[
                            { label: 'Only Show Unique Products', value: true },
                            { label: '----', value: false }
                        ]}
                        onChange={(e) => setUniqueProductsOnly(e.value)}
                        placeholder="Unique Products Only"
                        className="w-48"
                    />
                    <Button
                        icon="pi pi-times"
                        className="p-button-outlined p-button-danger p-button-sm"
                        onClick={() => setUniqueProductsOnly(false)}
                        tooltip="Clear Unique Filter"
                    />
                </div>

                {/* Total Count Null/Not Null */}
                <div className="flex items-center gap-2">
                    <Dropdown
                        value={totalCountFilter}
                        options={[
                            { label: 'Has Total Count (Not Serialized)', value: true },
                            { label: 'No Total Count (Serialized)', value: false }
                        ]}
                        onChange={(e) => setTotalCountFilter(e.value)}
                        placeholder="Total Count"
                        className="w-48"
                    />
                    <Button
                        icon="pi pi-times"
                        className="p-button-outlined p-button-danger p-button-sm"
                        onClick={() => setTotalCountFilter(null)}
                        tooltip="Clear Total Count Filter"
                    />
                </div>

                {/* Clear All Filters */}
                <Button
                    label="Clear All"
                    icon="pi pi-filter-slash"
                    className="p-button-secondary p-button-sm"
                    onClick={clearAllFilters}
                />
            </div>
        );
    };

    return (
        <div className="p-4">
            <h1>Item List</h1>

            <ItemFilters
                selectedProducts={selectedProducts}
                setSelectedProducts={setSelectedProducts}
                uniqueProductsOnly={uniqueProductsOnly}
                setUniqueProductsOnly={setUniqueProductsOnly}
                totalCountFilter={totalCountFilter}
                setTotalCountFilter={setTotalCountFilter}
                clearAllFilters={() => {
                    setSelectedProducts([]);
                    setUniqueProductsOnly(false);
                    setTotalCountFilter(null);
                }}
                productOptions={productOptions}
            />

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
