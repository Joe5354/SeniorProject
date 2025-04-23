import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Checkbox } from 'primereact/checkbox';
import { Button } from "primereact/button";
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';

import { FloatLabel } from 'primereact/floatlabel';

function AllItemsList({ permissionData }) {
    const [items, setItems] = useState([]);
    const [rules, setRules] = useState([]);
    
    const [products, setProducts] = useState([]);
    const [cats, setCats] = useState([]);
    const [sCats, setSCats] = useState([]);
    const [editingRow, setEditingRow] = useState(null);
    const [editedItem, setEditedItem] = useState(null);

    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedSubCategories, setSelectedSubCategories] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [onlyParAlerts, setOnlyParAlerts] = useState(false);
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
        fetch("https://localhost:7245/api/parRule")
            .then((response) => {
                if (!response.ok) throw new Error("Failed to fetch subCategories");
                return response.json();
            })
            .then((data) => setRules(data))
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

        if (selectedCategories.length > 0) {
            result = result.filter(i => selectedCategories.includes(i.catId));
        }

        if (selectedSubCategories.length > 0) {
            result = result.filter(i => selectedSubCategories.includes(i.subCatId));
        }

        if (onlyUnique) {
            const seen = new Set();
            result = result.filter(i => {
                if (seen.has(i.productId)) return false;
                seen.add(i.productId);
                return true;
            });
        }


        if (onlyParAlerts) {
            result = result.filter(item => {
                const matchingRule = rules.find(
                    rule => rule.parItemId === item.parItemId && rule.isActive === true
                );
                return matchingRule && item.totalCount <= matchingRule.parValue;
            });
        }

        setFilteredItems(result);
    }, [items, selectedCountFilter, selectedProducts, selectedCategories, selectedSubCategories, onlyUnique, onlyParAlerts]);

    

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
        const { productId, parItemId, ...fieldsToUpdate } = editedItem;

        fetch(`https://localhost:7245/api/item/products/${productId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(fieldsToUpdate),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to update items");
                }
                return response.json(); // Assuming this returns updated items
            })
            .then((updatedItems) => {
                // Replace items with same productId
                setItems((prevItems) =>
                    prevItems.map((item) =>
                        item.productId === productId
                            ? { ...item, ...fieldsToUpdate }
                            : item
                    )
                );
                setEditingRow(null);
                setEditedItem(null);
            })
            .catch((error) => {
                console.error("Error saving items:", error);
                alert("Error saving items");
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
            // Add the "None" option to the dropdown options with the same structure as the other options
            const dropdownOptions = field === "subCatId"
                ? [{
                    subCatId: null,
                    catId: null,
                    subCatName: "None",  // Display "None" in the dropdown
                    subCatDesc: "None",  // Optionally, you can set a description as well
                    cat: null,
                    items: []
                }, ...options] // Empty value for "None" option
                : options;

            return (
                <Dropdown
                    value={editedItem[field] ?? ''} // Use empty string if null or undefined
                    options={dropdownOptions}
                    onChange={(e) => handleEditChange({ target: { value: e.value } }, field)}
                    optionLabel={labelField}
                    optionValue={valueField}
                    placeholder="Select"
                    emptyMessage="No options available"
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

        if (selectedCategories.length > 0) {
            result = result.filter(i => selectedCategories.includes(i.catId));
        }

        if (selectedSubCategories.length > 0) {
            result = result.filter(i => selectedSubCategories.includes(i.subCatId));
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
    }, [items, selectedCountFilter, selectedProducts, selectedCategories, selectedSubCategories, onlyUnique]);

    const dynamicFilteredItems = items.filter(item => {
    const countMatch =
        selectedCountFilter === 'null' ? item.totalCount === null :
        selectedCountFilter === '!null' ? item.totalCount !== null :
        true;

    const productMatch = selectedProducts.length === 0 || selectedProducts.includes(item.productId);
    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(item.catId);
    const subCategoryMatch = selectedSubCategories.length === 0 || selectedSubCategories.includes(item.subCatId);

    return countMatch && productMatch && categoryMatch && subCategoryMatch;
});
    const productOptions = products
        .filter(p => {
            const matchingItems = items.filter(item => item.productId === p.productId);
            if (matchingItems.length === 0) return false;

            return matchingItems.some(item =>
                (selectedCategories.length === 0 || selectedCategories.includes(item.catId)) &&
                (selectedSubCategories.length === 0 || selectedSubCategories.includes(item.subCatId))
            );
        })
        .map(p => ({ label: p.name, value: p.productId }));

    const categoryOptions = cats
    .filter(c => 
        // Only include categories that match the selected subcategories' catId
        (selectedSubCategories.length === 0 || selectedSubCategories.some(scId => {
            const subCat = sCats.find(sc => sc.subCatId === scId); // Find subcategory by ID
            return subCat && subCat.catId === c.catId; // Check if subcategory's catId matches category's catId
        })) &&
        // Only include categories that match the selected products' catId
        (selectedProducts.length === 0 || selectedProducts.some(p => {
            const associatedItem = items.find(i => i.productId === p); // Find the item for the product
            return associatedItem && associatedItem.catId === c.catId; // Check if product's associated catId matches category's catId
        }))
    )
    .map(c => ({ label: c.catDesc, value: c.catId }));

    const subCategoryOptions = sCats
        .filter(sc =>
            // Filter by selected products' associated item's catId
            (selectedProducts.length === 0 || selectedProducts.some(p => {
                const associatedItem = items.find(i => i.productId === p); // Find the item for the product
                return associatedItem && associatedItem.subCatId === sc.subCatId; // Check if the product's item catId matches the subcategory's catId
            })) &&
            // Filter by selected categories' catId
            (selectedCategories.length === 0 || selectedCategories.includes(sc.catId))
        )
        .map(sc => ({ label: sc.subCatDesc, value: sc.subCatId }));

    const clearAllFilters = () => {
        setSelectedCountFilter(null);
        setSelectedCategories([]);
        setSelectedSubCategories([]);
        setSelectedProducts([]);
        setOnlyUnique(false);
    };
    return (
        <div className="parent-container">

                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '1.5rem',
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                    backgroundColor: '#fff',
                    borderRadius: '1rem',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
                <h1>Item List</h1>
                {/* Only Par Alerts */}
                    <Checkbox
                        inputId="onlyParAlerts"
                        checked={onlyParAlerts}
                        onChange={(e) => setOnlyParAlerts(e.checked)}
                    />
                    <label htmlFor="onlyParAlerts">Only Par Alerts</label>
                    {onlyParAlerts && (
                        <Button
                            icon="pi pi-times"
                            className="p-button-text p-button-sm"
                            onClick={() => setOnlyParAlerts(false)}
                            tooltip="Clear Par Alerts filter"
                        />
                    )}
                {/* Category Filter */}
                <FloatLabel className="w-full md:w-30rem">
                    <MultiSelect
                        value={selectedCategories}
                        options={categoryOptions}
                        onChange={(e) => setSelectedCategories(e.value)}
                        placeholder="Filter by Categories"
                        className="w-60"
                        display="chip"
                    />
                    <label htmlFor="ms-items">Select Categories</label>
                    {selectedCategories.length > 0 && (
                        <Button
                            icon="pi pi-times"
                            className="p-button-text p-button-sm"
                            onClick={() => setSelectedCategories([])}
                            tooltip="Clear Category filter"
                        />)}
                </FloatLabel>
                {/* Subcategory Filter */}
                <FloatLabel className="w-full md:w-30rem">
                    <MultiSelect
                        value={selectedSubCategories}
                        options={subCategoryOptions}
                        onChange={(e) => setSelectedSubCategories(e.value)}
                        placeholder="Filter by Subcategories"
                        className="w-60"
                        display="chip"
                />
                <label htmlFor="ms-items">Select Subcategories</label>
                    {selectedSubCategories.length > 0 && (
                        <Button
                            icon="pi pi-times"
                            className="p-button-text p-button-sm"
                            onClick={() => setSelectedSubCategories([])}
                            tooltip="Clear Subcategory filter"
                        />)}
                </FloatLabel>
                    {/* TotalCount Filter */}
                    <Dropdown
                        value={selectedCountFilter}
                        options={totalCountOptions.map(opt => ({ label: opt === 'null' ? 'Null' : 'Not Null', value: opt }))}
                        onChange={(e) => setSelectedCountFilter(e.value)}
                        placeholder="Filter by Total Count"
                        className="w-60"
                />
                    {selectedCountFilter && (
                        <Button
                            icon="pi pi-times"
                            className="p-button-text p-button-sm"
                            onClick={() => setSelectedCountFilter(null)}
                            tooltip="Clear Total Count filter"
                        />)}
                        {/* Product Filter */}
                        <FloatLabel className="w-full md:w-30rem">
                    <MultiSelect
                        value={selectedProducts}
                        options={productOptions}
                        onChange={(e) => setSelectedProducts(e.value)}
                        placeholder="Filter by Products"
                        className="w-60"
                        display="chip"
                />
                <label htmlFor="ms-items">Select Products</label>
                    {selectedProducts.length > 0 && (
                        <Button
                            icon="pi pi-times"
                            className="p-button-text p-button-sm"
                            onClick={() => setSelectedProducts([])}
                            tooltip="Clear Product filter"
                        />
                    )}
                </FloatLabel>
                {/* Unique Checkbox */}
                    <Checkbox
                        inputId="onlyParAlerts"
                        checked={onlyUnique}
                        onChange={(e) => setOnlyUnique(e.checked)}
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

                {/* Clear All Filters Button */}
                <Button
                    label="Clear All"
                    icon="pi pi-filter-slash"
                    className="p-button-secondary p-button-sm"
                    onClick={clearAllFilters}
                />
            </div>


            <div className="datatable-container">
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
                <Column field="productId" header="Product Name" sortable body={(rowData) => getProductName(rowData.parItemId)} style={{ width: '350px' }} />
                <Column field="catId"
                    header="Category"
                    sortable
                    body={(rowData) =>
                        editableDropdownCell("catId", cats, rowData, "catDesc", "catId")
                    }
                    style={{ width: '100px' }}
                />
                <Column
                    field="subCatId"
                    header="Subcategory"
                    sortable
                    body={(rowData) =>
                        editableDropdownCell(
                            "subCatId",
                            sCats.filter((subCat) => subCat.catId === (editingRow?.parItemId === rowData.parItemId ? editedItem?.catId : rowData.catId)),
                            rowData,
                            "subCatDesc",
                            "subCatId"
                        )
                    }
                    style={{ width: '100px' }}
                />
                {/*<Column field="barcode" header="Barcode" sortable style={{ width: '0px' }} />*/}
                <Column field="totalCount" header="Total Count" sortable style={{ width: '50px' }} />
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
                    style={{ width: '50px' }}
                />
                </DataTable>
            </div>
        </div>
    );
}

export default AllItemsList;