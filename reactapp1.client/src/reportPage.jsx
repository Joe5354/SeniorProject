import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dropdown } from 'primereact/dropdown';
import { FloatLabel } from 'primereact/floatlabel';

function ReportPage() {
    const [allItemsRulePar, setAllItemsRulePar] = useState([]);
    const [onlyItemsRuleBelowPar, setOnlyItemsRuleBelowPar] = useState([]);
    const [onlyItemsHasRulePar, setOnlyItemsHasRulePar] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [products, setProducts] = useState([]);

    const reportChoices = [
        { code: 1, description: "All Items, their Rules (if any) and Par Values (if any)" },
        { code: 2, description: "Only Items with Rules and their Par Value" },
        { code: 3, description: "Only items Below Par" }
    ];

    useEffect(() => {
        fetch("https://localhost:7245/api/Product")
            .then(res => {
                if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
                return res.json();
            })
            .then(setProducts)
            .catch(err => console.error("Error fetching products:", err));

        fetch("https://localhost:7245/api/allitemsandpar")
            .then(res => {
                if (!res.ok) throw new Error(`Failed to fetch allitemsandpar: ${res.status}`);
                return res.json();
            })
            .then(setAllItemsRulePar)
            .catch(err => console.error("Error fetching allitemsandpar:", err));

        fetch("https://localhost:7245/api/belowparitemandrule")
            .then(res => {
                if (!res.ok) throw new Error(`Failed to fetch belowparitemandrule: ${res.status}`);
                return res.json();
            })
            .then(setOnlyItemsRuleBelowPar)
            .catch(err => console.error("Error fetching belowparitemandrule:", err));

        fetch("https://localhost:7245/api/onlyitemswithruleandpar")
            .then(res => {
                if (!res.ok) throw new Error(`Failed to fetch onlyitemswithruleandpar: ${res.status}`);
                return res.json();
            })
            .then(setOnlyItemsHasRulePar)
            .catch(err => console.error("Error fetching onlyitemswithruleandpar:", err));
    }, []);

    const getReportData = () => {
        if (!selectedReport) return [];
        switch (selectedReport.code) {
            case 1: return allItemsRulePar;
            case 2: return onlyItemsHasRulePar;
            case 3: return onlyItemsRuleBelowPar;
            default: return allItemsRulePar;
        }
    };

    const exportCSV = () => {
        const data = getReportData();

        const headers = [
            'Product ID',
            'Category Description',
            'Subcategory Description',
            'Serial Number',
            'Total Count',
            'Rule ID',
            'Description',
            'PAR Value',
            'Date Created',
            'Is Active',
            'Is Total Count Less Than PAR Value'
        ];

        // Convert JSON data to CSV
        const rows = data.map((item) => [
            item.productId,
            item.catDesc,
            item.subCatDesc,
            item.serialNumber,
            item.totalCount || '',
            item.ruleId || '',
            item.description || '',
            item.parValue || '',
            item.dateCreated || '',
            item.isActive !== null ? item.isActive : '',
            item.isTotalCountLessThanParValue || ''
        ]);

        // Add headers to the beginning of the rows array
        const csvContent = [headers, ...rows]
            .map((row) => row.join(','))
            .join('\n');

        // Create a blob and download the file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'report.csv');
        link.click();
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
                <h1>Select A Report</h1>
                    <Dropdown
                        inputId="report-type"
                        value={selectedReport?.code}
                        options={reportChoices}
                        onChange={(e) => {
                            const selected = reportChoices.find(r => r.code === e.value);
                            setSelectedReport(selected);
                        }}
                        optionLabel="description"
                        optionValue="code"
                        placeholder="Select Report Type"
                        className="w-60"
                    />
                {selectedReport && (
                    <Button
                        icon="pi pi-times"
                        className="p-button-text p-button-sm"
                        onClick={() => setSelectedReport(null)}
                        tooltip="Clear Report Selection"
                    />

                )}
                {selectedReport && (
                <Button
                    label="Export to CSV"
                    icon="pi pi-download"
                    onClick={exportCSV}
                    style={{ marginBottom: '10px' }}
                />)}
                
            </div>

            <div className="datatable-container">
                <DataTable
                    value={getReportData()}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[10, 20, 50]}
                    responsiveLayout="scroll"
                    scrollable
                    scrollHeight="400px"
                    stripedRows
                >
                    <Column field="productId" header="Product ID" style={{ width: '150px' }} />
                    <Column field="catDesc" header="Category Description" style={{ width: '200px' }} />
                    <Column field="subCatDesc" header="Subcategory Description" style={{ width: '200px' }} />
                    <Column field="serialNumber" header="Serial Number" style={{ width: '200px' }} />
                    <Column field="totalCount" header="Total Count" style={{ width: '150px' }} />
                    <Column field="ruleId" header="Rule ID" style={{ width: '150px' }} />
                    <Column field="description" header="Description" style={{ width: '250px' }} />
                    <Column field="parValue" header="PAR Value" style={{ width: '150px' }} />
                    <Column field="dateCreated" header="Date Created" style={{ width: '200px' }} />
                    <Column field="isActive" header="Is Active" style={{ width: '150px' }} />
                    <Column field="isTotalCountLessThanParValue" header="Is Total Count Less Than PAR Value" style={{ width: '250px' }} />
                </DataTable>
            </div>
        </div>
    );
}

export default ReportPage;
