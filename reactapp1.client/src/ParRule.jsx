import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dropdown } from 'primereact/dropdown';
import CreateParRule from "./CreateParRule";
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

function RulesList({ userData, createRule, editRule }) {
    const [rules, setRules] = useState([]);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingRowId, setEditingRowId] = useState(null);  // Track the ruleId of the row being edited
    const [editedRule, setEditedRule] = useState(null);  // Store edited rule data
    const [users, setUsers] = useState([]);
    const statusOptions = [
        { label: "Active", code: true },
        { label: "Inactive", code: false }
    ];
    const toast = useRef(null);

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
    const fetchUsers = () => {
        console.log("Fetching users...");

        fetch("https://localhost:7245/api/User")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch users");
                }
                return response.json();
            })
            .then((data) => {
                console.log("Users fetched:", data);
                setUsers(data);
            })
            .catch((error) => {
                console.error("Error fetching users:", error);
                if (toast.current) {
                    toast.current.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to fetch users: ' + error.message,
                        life: 3000
                    });
                }
            });
    };
    // Fetch data on component mount
    useEffect(() => {
        fetchRules();
        fetchUsers();
    }, []);

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };
    const statusTemplate = (rowData) => {
        return (
            <span className={`status-badge ${rowData.isActive ? 'status-active' : 'status-inactive'}`}>
                {rowData.isActive ? 'Active' : 'Inactive'}
            </span>
        );
    };
    // Handle edit change
    const handleEditChange = (e, field) => {
        const { value } = e.target;
        setEditedRule((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };
    const getUserName = (userId) => {
        const user = users.find(u => u.userId === userId);
        return user ? `${user.firstName} ${user.lastName}` : `User ID: ${userId}`;
    };
    // Start editing a row
    const onRowEditInit = (rowData) => {
        setEditingRowId(rowData.ruleId);  // Track the ruleId of the row being edited
        setEditedRule({ ...rowData });  // Set the edited rule data
    };
    const handleRuleCreated = (newRule) => {
        // Refresh the rules list only
        fetchRules();
    };
    // Cancel editing
    const onRowEditCancel = () => {
        setEditingRowId(null);  // Reset the editing row
        setEditedRule(null);  // Reset the edited rule data
    };

    // Save edited row
    const onRowEditSave = () => {
        const { ruleId, ...ruleToUpdate } = editedRule;

        fetch("https://localhost:7245/api/ParRule/" + ruleId, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(editedRule)
        })
            .then(async (res) => {
                const contentType = res.headers.get("content-type");

                if (!res.ok) throw new Error("Failed to update rule");

                if (contentType && contentType.includes("application/json")) {
                    return await res.json();
                } else {
                    return {}; // safely handle empty response
                }
            })
            .then((data) => {
                console.log("Rule updated:", data);

                // Reset editing mode
                setEditingRowId(null);
                setEditedRule(null);

                // Optionally, refresh the rules list or show success toast
                fetchRules();
                if (toast.current) {
                    toast.current.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Rule updated successfully',
                        life: 3000
                    });
                }
            })
            .catch((err) => {
                console.error("Error saving rule:", err);
                if (toast.current) {
                    toast.current.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to update rule: ' + err.message,
                        life: 3000
                    });
                }
            });
    };

    

    // Editable dropdown cell
    const editableDropdownCell = (field, options, rowData, labelField, valueField = field) => {
        if (editingRowId === rowData.ruleId) {  // Check if the row is being edited
            return (
                <Dropdown
                    value={editedRule[field]}
                    options={options}
                    onChange={(e) => handleEditChange({ target: { value: e.value } }, field)}
                    optionLabel={labelField}
                    optionValue={valueField}
                    placeholder="Select"
                />
            );
        }

        if (field === "isActive") {
            return (
                <span className={`status-badge ${rowData[field] ? 'status-active' : 'status-inactive'}`}>
                    {rowData[field] ? 'Active' : 'Inactive'}
                </span>
            );
        }

        const found = options?.find((opt) => opt[valueField] === rowData[field]);
        return found ? found[labelField] : rowData[field];
    };

    return (
        <div className="p-6">
            <Toast ref={toast} />

            <div className="flex justify-content-between align-items-center mb-3">
                <h1>PAR Rules Management</h1>
                {userData?.userId && createRule && (
                    <Button
                        label={createRule ? "Create Rule" : "No Permission"}
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
                    />)}
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
                    body={(rowData) => getUserName(rowData.createdByUser)}
                    sortable
                />}
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
                    body={(rowData) =>
                        editableDropdownCell("isActive", statusOptions, rowData, "label", "code")
                    }
                />
                <Column
                    body={(rowData) => (
                        <>
                            {editRule === 1 || userData ? (
                                editingRowId === rowData.ruleId ? (
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