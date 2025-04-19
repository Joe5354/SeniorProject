import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import CreateParRule from "./CreateParRule";
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

function RulesList({ userData, createRule, editRule }) {
    const [rules, setRules] = useState([]);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [loading, setLoading] = useState(true);
    const toast = useRef(null);
    console.log("userId:", userData.userId);
    console.log("createRule:", createRule);
    // Fetch rules from API
    const fetchRules = () => {
        console.log("Fetching rules...");
        setLoading(true);

        fetch("https://localhost:7245/api/ParRule")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch rules");
                }
                return response.json();
            })
            .then((data) => {
                console.log("Rules fetched:", data);
                setRules(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching rules:", error);
                setLoading(false);
                if (toast.current) {
                    toast.current.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to fetch rules: ' + error.message,
                        life: 3000
                    });
                }
            });
    };

    

    // Fetch data on component mount
    useEffect(() => {
        fetchRules();
    }, []);

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Status template
    const statusTemplate = (rowData) => {
        return (
            <span className={`status-badge ${rowData.isActive ? 'status-active' : 'status-inactive'}`}>
                {rowData.isActive ? 'Active' : 'Inactive'}
            </span>
        );
    };

    
    // Created by template
    const createdByTemplate = (rowData) => {
        //return getUserName(rowData.createdByUser);
    };

    // Handle successful rule creation
    const handleRuleCreated = (newRule) => {
        // Refresh the rules list only
        fetchRules();
    };

    return (
        <div className="p-6">
            <Toast ref={toast} />

            <div className="flex justify-content-between align-items-center mb-3">
                <h1>PAR Rules Management</h1>
                <Button
                    label={ createRule? "Create Rule": "No Permission" }
                    icon="pi pi-plus"
                    onClick={() => setShowCreateDialog(true)}
                    disabled={!userData.userId || !createRule}
                    tooltip={
                        !userData.userId
                        ? "Please log in to create rules"
                        : !createRule
                        ? "You don't have permission to create rules"
                        : "Create a new PAR rule"
                    }
                />
            </div>

            <DataTable
                value={rules}
                paginator
                rows={5}
                rowsPerPageOptions={[5, 10, 25]}
                responsiveLayout="scroll"
                emptyMessage="No rules found"
                loading={loading}
            >
                <Column field="ruleName" header="Rule Name" sortable />
                <Column field="parItemId" header="Par Item ID" sortable />
                <Column field="parValue" header="Par Value" sortable />
                <Column
                    field="createdByUser"
                    header="Created By"
                    body={createdByTemplate}
                    sortable
                />
                <Column
                    field="dateCreated"
                    header="Date Created"
                    sortable
                    body={(rowData) => formatDate(rowData.dateCreated)}
                />
                <Column
                    field="isActive"
                    header="Status"
                    sortable
                    body={statusTemplate}
                />
            </DataTable>

            <CreateParRule
                visible={showCreateDialog}
                onHide={() => setShowCreateDialog(false)}
                onSuccess={handleRuleCreated}
                userData={userData}
            />
        </div>
    );
}

export default RulesList;