import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Checkbox } from 'primereact/checkbox';
import { Button } from "primereact/button";
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';

import { FloatLabel } from 'primereact/floatlabel';

function AllItemsList({ permissionData }) {

    const [allItemsRulePar, setAllItemsRulePar] = useState([]);
    const [onlyItemsRuleBelowPar, setOnlyItemsRuleBelowPar] = useState([]);
    const [onlyItemsHasRulePar, setOInlyItemsHasRulePar] = useState([]);

    const [selectedReport, setSelectedReport] = useState([]);

    const [products, setProducts] = useState([]);

    const [selectedReports, setProducts] = useState([]);


    useEffect(() => {
        fetch("https://localhost:7245/api/Product")
            .then((response) => {
                if (!response.ok) throw new Error("Failed to fetch products");
                return response.json();
            })
            .then((data) => {
                setItems(data);
                setFilteredItems(data);
            })
            .catch((error) => console.error("Error fetching ptoducts:", error));

    }, []);


    const getProductName = (parItemId) => {
        const item = items.find(i => i.parItemId === parItemId);
        if (item) {
            const product = products.find(p => p.productId === item.productId);
            return product ? product.name : "No Product Name";
        }
        return "No Product Name";
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
                <FloatLabel className="w-full md:w-30rem">
                    <Dropdown
                        value={selectedReport}
                        options={reportOptions}
                        onChange={(e) => setSelectedReport(e.value)}
                        placeholder="Filter by Categories"
                        className="w-60"
                        display="chip"
                    />
                    <label htmlFor="ms-items">Select Report Type</label>
                    {selectedCategories.length > 0 && (
                        <Button
                            icon="pi pi-times"
                            className="p-button-text p-button-sm"
                            onClick={() => setSelectedReport([])}
                            tooltip="Clear Category filter"
                        />)}
                </FloatLabel>
                />
            </div>


            <div className="datatable-container">
                <DataTable
                    value={selectedReport}
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
                    
                </DataTable>
            </div>
        </div>
    );
}

export default AllItemsList;