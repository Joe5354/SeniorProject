import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import CreateParRule from "./CreateParRule";
import { Checkbox } from 'primereact/checkbox';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

function RulesList({ userData, createRule, editRule }) {
    //tabular data
    const [rules, setRules] = useState([]);
    const [users, setUsers] = useState([]);
    const [items, setItems] = useState([]);
    const [products, setProducts] = useState([]);


    const [filteredRules, setFilteredRules] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [showOnlyActive, setShowOnlyActive] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);

    //form dialog
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    //not sure i forgot
    const [loading, setLoading] = useState(true);

    //editing row stuff
    const [editingRowId, setEditingRowId] = useState(null);  // Track the ruleId of the row being edited
    const [editedRule, setEditedRule] = useState(null);  // Store edited rule data
    
    //isActive maps to true false bool
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
                setFilteredRules(data);
                setLoading(false);
                fetchUsers(data); // pass rules directly
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


    const fetchProducts = async () => {
        try {
            const response = await fetch("https://localhost:7245/api/Product");
            if (!response.ok) throw new Error("Failed to fetch");

            const data = await response.json();
            setProducts(data); // or whatever state setter you're using
            console.log("Fetched product data:", data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
        
    };


    //Get users
    const fetchUsers = (fetchedRules) => {
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

    //Get items
    const fetchItems = () => {
        console.log("Fetching items...");

        fetch("https://localhost:7245/api/Item")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch items");
                }
                return response.json();
            })
            .then((data) => {
                console.log("Items fetched:", data);
                setItems(data);
            })
            .catch((error) => {
                console.error("Error fetching uItems:", error);
                if (toast.current) {
                    toast.current.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to fetch Items: ' + error.message,
                        life: 3000
                    });
                }
            });
    };

    // Fetch data on component mount
    useEffect(() => {
        fetchRules();
        fetchItems();
        fetchUsers();
        fetchProducts();
        
    }, []);


    useEffect(() => {
        if (!rules.length || !items.length || !products.length) return;

        let result = [...rules];

        // Filter by selected items
        if (selectedItems.length > 0) {
            result = result.filter(rule =>
                selectedItems.includes(rule.parItemId)
            );
        }

        // Filter by active status
        if (showOnlyActive) {
            result = result.filter(rule => rule.isActive);
        }

        // Filter by selected users (use selected users only for filtering filteredRules)
        if (selectedUsers.length > 0) {
            result = result.filter(rule =>
                selectedUsers.includes(rule.createdByUser)
            );
        }

        setFilteredRules(result);
    }, [rules, items, products, selectedItems, showOnlyActive, selectedUsers]);






    // Clear Filters

    const clearItemFilter = () => {
    setFilters(prev => ({ ...prev, selectedItems: null }));
    };

    const clearMakerFilter = () => {
        setFilters(prev => ({ ...prev, selectedMakers: null }));
    };

    const clearActiveFilter = () => {
        setFilters(prev => ({ ...prev, isActive: null }));
    };

    const clearFilters = () => {
        setFilters({
            isActive: null,
            selectedItems: null,
            selectedMakers: null
        });
        setFilteredRules(rules); // Reset to show all rules
    };






    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    //Green/Red box for Active/ Inactive on IsActive (bit) column
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

    //displaying user's name instead of user id
    const getUserName = (userId) => {
        const user = users.find(u => u.userId === userId);
        return user ? `${user.firstName} ${user.lastName}` : `User ID: ${userId}`;
    };

    // Start editing a row
    const onRowEditInit = (rowData) => {
        setEditingRowId(rowData.ruleId);  // Track the ruleId of the row being edited
        setEditedRule({ ...rowData });  // Set the edited rule data
    };

    //made new rule, let's refresh
    const handleRuleCreated = (newRule) => {
        // Refresh the rules list only
        fetchRules();
    };

    // Cancel editing
    const onRowEditCancel = () => {
        setEditingRowId(null);  // Reset the editing row
        setEditedRule(null);  // Reset the edited rule data
    };

    // Save edited rule row to par_db
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
    
    const getProductName = (parItemId) => {
        console.log("Checking parItemId:", parItemId); // Log each parItemId passed to getProductName
        const item = items.find(i => i.parItemId === parItemId);
        if (item) {
            const product = products.find(v => v.productId === item.productId);
            console.log("Found product:", product); // Log found product for the given parItemId
            return product ? product.name : "No Product Name";
        }
        console.log("No item found for parItemId:", parItemId); // Log if item not found
        return "No Product Name2"; // Fallback if item is not found
    };

    const itemOptions = items.length && products.length ? items
        .filter(item => {
            return (selectedUsers.length === 0
                ? rules.some(rule =>
                    rule.parItemId === item.parItemId &&
                    (!showOnlyActive || rule.isActive))
                : selectedUsers.some(userId =>
                    rules.some(rule =>
                        rule.createdByUser === userId &&
                        rule.parItemId === item.parItemId &&
                        (!showOnlyActive || rule.isActive)))
            );
        })
        .map(item => ({
            label: getProductName(item.parItemId),
            value: item.parItemId
        })) : [];

    // ruleMakers: Filter users based on selected items (items with rules created by those users)
    const ruleMakers = users.length && rules.length ? users
        .filter(user =>
            selectedItems.length === 0
                ? rules.some(rule =>
                    rule.createdByUser === user.userId &&
                    (!showOnlyActive || rule.isActive))
                : selectedItems.some(parItemId =>
                    rules.some(rule =>
                        rule.createdByUser === user.userId &&
                        rule.parItemId === parItemId &&
                        (!showOnlyActive || rule.isActive))
                )
        )
        .map(user => ({
            label: `${user.firstName} ${user.lastName}`,
            value: user.userId
        })) : [];

    

    // Editable dropdown cell - editable row but you have to choose from dropdown list
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
        //tailored for the isActive column - could be a checkbox?
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



    const clearAllFilters = () => {
        setSelectedItems([]); // Clear selected items filter
        setShowOnlyActive(false); // Uncheck "Only Active" checkbox
        setSelectedUsers([]); // Clear selected users filter
        setFilteredRules(rules); // Reset filtered rules to show all rules
    };

    //The Display:::::::
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

            <div className="p-mb-4 flex gap-4 items-end flex-wrap">
                {/* Item Filter */}
                <div className="flex items-center gap-2">
                    <MultiSelect
                        value={selectedItems}
                        onChange={(e) => setSelectedItems(e.value)}
                        options={items.length && products.length ? itemOptions : []}  // Only render options when data is available
                        placeholder="Select Item"
                        display="chip"
                    />
                    <Button
                        icon="pi pi-times"
                        className="p-button-text p-button-sm p-ml-2"
                        onClick={() => setSelectedItems([])}
                        tooltip="Clear Selected Items"
                    />
                </div>

                {/* Active Checkbox */}
                <div className="flex items-center gap-2">
                    <Checkbox inputId="activeOnly" checked={showOnlyActive} onChange={(e) => setShowOnlyActive(e.checked)} />
                    <label htmlFor="activeOnly">Only Active Rules</label>
                    <Button
                        icon="pi pi-times"
                        className="p-button-text p-button-sm p-ml-2"
                        onClick={() => setShowOnlyActive(false)}
                        tooltip="Clear Show Only Active"
                    />
                </div>

                {/* Created By Filter */}
                <div className="flex items-center gap-2">
                    <MultiSelect
                        value={selectedUsers}
                        options={ruleMakers}  // Use the ruleMakers here
                        onChange={(e) => setSelectedUsers(e.value)}
                        placeholder="Filter by Created By"
                        className="w-60"
                        display="chip"
                    />
                    <Button
                        icon="pi pi-times"
                        className="p-button-text p-button-sm p-ml-2"
                        onClick={() => setSelectedUsers([])}
                        tooltip="Clear Selected users"
                    />
                </div>

                {/* Clear All Filters Button */}
                <Button
                    label="Clear All"
                    icon="pi pi-filter-slash"
                    className="p-button-secondary p-button-sm"
                    onClick={clearAllFilters}
                />
            </div>
            <div className = "datatable-container">
            <DataTable
                value={filteredRules.length > 0 ? filteredRules : rules}  // Show filtered or all rules
                paginator
                rows={15}
                rowsPerPageOptions={[15, 25, 50]}
                responsiveLayout="scroll"
                emptyMessage="No rules found"
                loading={loading}
                sortMode = "multiple"
            >
                <Column
                    field="ruleName"
                    header="Rule Name"
                    sortable
                    style={{ width: '90px' }}
                    body={(rowData) => `${rowData.ruleName} ID: ${rowData.ruleId}`}
                />
                <Column
                    field="parItemId"
                    header="Product Name"
                    sortable
                    style={{ width : '500px' }}
                    body={(rowData) => getProductName(rowData.parItemId)} />
                <Column
                    field="parValue"
                    header="Par Value"
                    sortable
                    style={{width: '50px'}}
                />
                <Column
                    field="createdByUser"
                    header="Created By"
                    body={(rowData) => getUserName(rowData.createdByUser)}
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
                    body={(rowData) =>
                        editableDropdownCell("isActive", statusOptions, rowData, "label", "code")
                    }
                />
                {editRule && (
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
                />)}
            </DataTable>
            </div>
            {createRule && (
                <CreateParRule
                    visible={showCreateDialog}
                    onHide={() => setShowCreateDialog(false)}
                    onSuccess={handleRuleCreated}
                    userData={userData}
                />
            )}
        </div>
    );
}

export default RulesList;