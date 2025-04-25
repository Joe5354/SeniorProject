import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import CreateNewUserForm from "./CreateNewUserForm";
import { Checkbox } from 'primereact/checkbox';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import { FloatLabel } from 'primereact/floatlabel';

function UsersList({editUser, createUser }) { 
    const [users, setUsers] = useState([]); 
    const [roles, setRoles] = useState([]);
    const [showCreateUserDialog, setShowCreateUserDialog] = useState(false); 
    const [editingRowId, setEditingRowId] = useState(null);  
    const [editedUser, setEditedUser] = useState(null);  
    const toast = useRef(null);

    const [filteredUsers, setFilteredUsers] = useState([]);

    const [selectedUsernames, setSelectedUsernames] = useState([]);
    const [selectedEmpIds, setSelectedEmpIds] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [onlyActive, setOnlyActive] = useState(false);

    useEffect(() => {
        let result = [...users];

        if (selectedUsernames.length > 0) {
            result = result.filter(user => selectedUsernames.includes(user.username));
        }

        if (selectedEmpIds.length > 0) {
            result = result.filter(user => selectedEmpIds.includes(user.employeeId));
        }

        if (selectedRoles.length > 0) {
            result = result.filter(user => selectedRoles.includes(user.userRoleId));
        }

        if (onlyActive) {
            result = result.filter(user => user.isActive === true);
        }

        setFilteredUsers(result);
    }, [users, selectedUsernames, selectedEmpIds, selectedRoles, onlyActive]);




    const fetchRoles = () => {
        console.log("Fetching roles...");

        fetch("https://localhost:7245/api/UserRole")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch roles");
                }
                return response.json();
            })
            .then((data) => {
                console.log("Roles fetched:", data);
                setRoles(data);
            })
            .catch((error) => {
                console.error("Error fetching roles:", error);
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


    useEffect(() => {//get the backend data (7245 is the port my backend is running on. this may be different for you.)
        fetch("https://localhost:7245/api/user")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch items");
                }
                return response.json();
            })
            .then((data) => setUsers(data))
            .catch((error) => console.error("Error fetching items:", error));
        fetchRoles();
    }, []); 
    const statusTemplate = (rowData) => {
        return (
            <span className={`status-badge ${rowData.isActive ? 'status-active' : 'status-inactive'}`}>
                {rowData.isActive ? 'Active' : 'Inactive'}
            </span>
        );
    };
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
    // Handle edit change
    const handleEditChange = (e, field) => {
        const { value } = e.target;
        setEditedUser((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const statusOptions = [
        { label: "Active", code: true },
        { label: "Inactive", code: false }
    ];

    const roleSetOptions = [
        { label: "Editor", code: 2 },
        { label: "Viewer", code: 3 }
    ];

    //displaying user's name instead of user id
    const getUserName = (userId) => {
        const user = users.find(u => u.userId === userId);
        return user ? `${user.firstName} ${user.lastName}` : `User ID: ${userId}`;
    };

    const onRowEditInit = (rowData) => {
        if (rowData.userRoleId === 1) return;
        setEditingRowId(rowData.userId);
        setEditedUser({ ...rowData });
    };


    // Cancel editing
    const onRowEditCancel = () => {
        setEditingRowId(null);  // Reset the editing row
        setEditedUser(null);  
    };

    const onRowEditSave = () => {
        const { userId, ...userToUpdate } = editedUser;

        fetch("https://localhost:7245/api/user/" + userId, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(editedUser)
        })
            .then(async (res) => {
                const contentType = res.headers.get("content-type");

                if (!res.ok) throw new Error("Failed to update user");

                if (contentType && contentType.includes("application/json")) {
                    return await res.json();
                } else {
                    return {}; 
                }
            })
            .then((data) => {
                console.log("user updated:", data);

                setEditingRowId(null);
                setEditedUser(null);

                fetchUsers();
                if (toast.current) {
                    toast.current.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'User updated successfully',
                        life: 3000
                    });
                }
            })
            .catch((err) => {
                console.error("Error saving user:", err);
                if (toast.current) {
                    toast.current.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to update user: ' + err.message,
                        life: 3000
                    });
                }
            });
    };

    // Editable dropdown cell - editable row but you have to choose from dropdown list
    const editableDropdownCell = (field, options, rowData, labelField, valueField = field) => {
        if (editingRowId === rowData.userId) {
            return (
                <Dropdown
                    value={editedUser?.[field]}
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

    const editableCell = (field, rowData) => {
        if (editingRowId === rowData.userId) {
            return (
                <InputText
                    value={editedUser[field]}
                    onChange={(e) => handleEditChange(e, field)}
                />
            );
        }
        return rowData[field]; // Display value if not in edit mode
    };
    const getRoleDescription = (userRoleId) => {
        const role = roles.find(r => r.userRoleId === userRoleId);
        return role ? role.description : `Role ID: ${userRoleId}`;
    };


    const usernameOptions = users
        .filter(user =>
            // Filter by selected empIds (if any)
            (selectedEmpIds.length === 0 || selectedEmpIds.includes(user.employeeId)) &&
            // Filter by selected roles (if any)
            (selectedRoles.length === 0 || selectedRoles.includes(user.userRoleId)) &&
            // Filter by active status (if any)
            (!onlyActive || user.isActive === true)
        )
        .map(user => ({ label: user.username, value: user.username }));

    // Employee ID options based on selected filters
    const empIdOptions = users
        .filter(user =>
            // Filter by selected usernames (if any)
            (selectedUsernames.length === 0 || selectedUsernames.includes(user.username)) &&
            // Filter by selected roles (if any)
            (selectedRoles.length === 0 || selectedRoles.includes(user.userRoleId)) &&
            // Filter by active status (if any)
            (!onlyActive || user.isActive === true)
        )
        .map(user => ({ label: user.employeeId, value: user.employeeId }));

    // Role options based on selected filters
    const roleOptions = roles
        .filter(role =>
            // Filter roles by selected usernames (based on users' username)
            (selectedUsernames.length === 0 || users.some(user => user.userRoleId === role.userRoleId && selectedUsernames.includes(user.username))) &&
            // Filter roles by selected empIds (based on users' employeeId)
            (selectedEmpIds.length === 0 || users.some(user => user.userRoleId === role.userRoleId && selectedEmpIds.includes(user.employeeId))) &&
            // Filter by active status (based on users' isActive)
            (!onlyActive || users.some(user => user.userRoleId === role.userRoleId && user.isActive === true))
        )
        .map(role => ({ label: getRoleDescription(role.userRoleId), value: role.userRoleId }));

    const clearAllFilters = () => {
        setSelectedUsernames([]);  // Reset selected usernames
        setSelectedEmpIds([]);     // Reset selected employee IDs
        setSelectedRoles([]);      // Reset selected roles
        setOnlyActive(false);      // Reset "only active" checkbox
    };



    return (//this is a javascript/ primereact datatable where we pass our fetched .json table "items". From here, refer to Primereact datatable documentation.
        <div className="p-4">
            
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
                <h1>User List</h1>
                {/* Username Filter */}
                <FloatLabel className="w-full md:w-30rem">
                            <MultiSelect
                                value={selectedUsernames}
                                options={usernameOptions}
                                onChange={(e) => setSelectedUsernames(e.value)}
                                placeholder="Select Usernames"
                                display="chip"
                                className="p-mb-3"
                    />
                    <label htmlFor="ms-items">Select Usernames</label>
                            <Button
                                icon="pi pi-times"
                                className="p-button-text p-button-sm p-ml-2"
                                onClick={() => setSelectedUsernames([])}
                                tooltip="Clear Usernames"
                            />
                </FloatLabel>
                {/* Employee ID Filter */}
                <FloatLabel className="w-full md:w-30rem">
                            <MultiSelect
                                value={selectedEmpIds}
                                options={empIdOptions}
                                onChange={(e) => setSelectedEmpIds(e.value)}
                                placeholder="Select Employee IDs"
                                display="chip"
                                className="p-mb-3"
                    />
                    <label htmlFor="ms-items">Select Employee Ids</label>
                            <Button
                                icon="pi pi-times"
                                className="p-button-text p-button-sm p-ml-2"
                                onClick={() => setSelectedEmpIds([])}
                                tooltip="Clear Employee IDs"
                            />
                </FloatLabel>
                {/* Role Filter */}
                <FloatLabel className="w-full md:w-30rem">
                            <MultiSelect
                                value={selectedRoles}
                                options={roleOptions}
                                onChange={(e) => setSelectedRoles(e.value)}
                                placeholder="Select Roles"
                                display="chip"
                                className="p-mb-3"
                    />
                    <label htmlFor="ms-items">Select Roles</label>
                            <Button
                                icon="pi pi-times"
                                className="p-button-text p-button-sm p-ml-2"
                                onClick={() => setSelectedRoles([])}
                                tooltip="Clear Roles"
                            />
                </FloatLabel>
                    {/* Active Status Filter */}
                            <label htmlFor="activeOnly">Only Active Users</label>
                            <Checkbox
                                inputId="onlyActive"
                                checked={onlyActive}
                                onChange={(e) => setOnlyActive(e.checked)}
                                label="Show Only Active Users"
                                className="p-mb-3"
                            />
                            <Button
                                icon="pi pi-times"
                                className="p-button-text p-button-sm p-ml-2"
                                onClick={() => setOnlyActive(false)}
                                tooltip="Clear Active Status Filter"
                            />

                {/* Clear All Filters Button */}
                <Button
                    label="Clear All"
                    icon="pi pi-filter-slash"
                    className="p-button-secondary p-button-sm"
                    onClick={clearAllFilters}
                />
                <Button
                    label="Create New User"
                    icon="pi pi-user-plus"
                    onClick={() => setShowCreateUserDialog(true)}
                    style={{ marginTop: '1rem' }}
                />
                <CreateNewUserForm
                    visible={showCreateUserDialog}
                    onHide={() => setShowCreateUserDialog(false)}
                    onSuccess={(newUser) => {
                        console.log("New user created:", newUser);
                        // Refresh users list or show toast
                    }}
                />
            </div>





            <DataTable value={filteredUsers} paginator rows={25} rowsPerPageOptions={[15, 25, 50]} responsiveLayout="scroll" scrollable scrollHeight="1000px" stripedRows>
                <Column field="userId" header="User" sortable />
                <Column field="username" header="Username" sortable body={(rowData) => editableCell("username", rowData)} />
                <Column field="email" header="Email" sortable body={(rowData) => editableCell("email", rowData)} />
                <Column field="employeeId" header="Employee ID" sortable body={(rowData) => editableCell("employeeId", rowData)} />
                <Column
                    field="userRoleId"
                    header="Role"
                    sortable
                    body={(rowData) =>
                        editingRowId === rowData.userId && rowData.userRoleId > 1
                            ? editableDropdownCell("userRoleId", roleSetOptions, rowData, "label", "code")
                            : getRoleDescription(rowData.userRoleId)
                    }
                />
                <Column field="isActive" header="Account is Active?" sortable body={(rowData) => editableDropdownCell("isActive", statusOptions, rowData, "label", "code")} />
                {editUser && (
                    <Column
                        body={(rowData) => (
                            rowData.userRoleId !== 1 && editUser ? (
                                editingRowId === rowData.userId ? (
                                    <>
                                        <Button icon="pi pi-check" onClick={onRowEditSave} className="p-button-success p-mr-2" />
                                        <Button icon="pi pi-times" onClick={onRowEditCancel} className="p-button-danger" />
                                    </>
                                ) : (
                                    <Button icon="pi pi-pencil" onClick={() => onRowEditInit(rowData)} />
                                )
                            ) : null
                        )}
                        style={{ width: "6rem" }}
                    />

                )}
            </DataTable>
        </div>
    );
}

export default UsersList;