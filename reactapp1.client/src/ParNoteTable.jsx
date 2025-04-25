import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from "primereact/button";
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import CreateParNote from "./CreateParNote";
import { MultiSelect } from 'primereact/multiselect';
import { Checkbox } from 'primereact/checkbox';
import { FloatLabel } from 'primereact/floatlabel';
import { Dialog } from 'primereact/dialog';
function NotesTable({ userId }) {
    const [notes, setNotes] = useState([]);
    const [editingRow, setEditingRow] = useState(null);
    const [editedNote, setEditedNote] = useState(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [items, setItems] = useState([]);
    const [rules, setRules] = useState([]);
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedRow, setSelectedRow] = useState(null);
    const [filteredNotes, setFilteredNotes] = useState([]);

    const [selectedItems, setSelectedItems] = useState([]);
    const [showOnlyActive, setShowOnlyActive] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedRules, setSelectedRules] = useState([]);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState(null);

    const getRule = (ruleId) => {
        const rule = rules.find(r => r.ruleId === ruleId);
        if (rule) {
            return { isActive: rule.isActive, ruleId: rule.ruleId };
        }
        return { isActive: false, ruleId: null };  // Return a default value if the rule is not found
    };

    useEffect(() => {
        if (!notes.length || !rules.length) return;

        let result = [...notes];

        // Filter by selected items
        if (selectedItems.length > 0) {
            result = result.filter(note => selectedItems.includes(note.parItemId));
        }

        // Filter by selected rule IDs (this applies regardless of rule active status)
        if (selectedRules.length > 0) {
            result = result.filter(note => selectedRules.includes(note.ruleId));
        }

        // Filter by active status using getRule, apply only if showOnlyActive is checked
        if (showOnlyActive) {
            result = result.filter(note => {
                const rule = getRule(note.ruleId);  // Get the rule associated with the note
                return rule && rule.isActive;  // Only include active rules if showOnlyActive is true
            });
        }

        // Filter by selected users
        if (selectedUsers.length > 0) {
            result = result.filter(note => selectedUsers.includes(note.createdByUser));
        }

        setFilteredNotes(result);
    }, [notes, selectedItems, showOnlyActive, selectedUsers, selectedRules, rules]);





    const fetchNotes = () => {
        fetch("https://localhost:7245/api/ParNote")
            .then((res) => res.json())
            .then((data) => setNotes(data))
            .catch((error) => console.error("Error fetching notes:", error));
    };
    const fetchItems = () => {
        fetch("https://localhost:7245/api/Item")
            .then((res) => res.json())
            .then((data) => setItems(data))
            .catch((error) => console.error("Error fetching notes:", error));
    };
    const fetchRules = () => {
        fetch("https://localhost:7245/api/ParRule")
            .then((res) => res.json())
            .then((data) => setRules(data))
            .catch((error) => console.error("Error fetching notes:", error));
    };
    const fetchProducts = () => {
        fetch("https://localhost:7245/api/Product")
            .then((res) => res.json())
            .then((data) => setProducts(data))
            .catch((error) => console.error("Error fetching notes:", error));
    };
    const fetchUsers = () => {
        fetch("https://localhost:7245/api/User")
            .then((res) => res.json())
            .then((data) => setUsers(data))
            .catch((error) => console.error("Error fetching notes:", error));
    };


    const deleteNote = () => {
        if (noteToDelete) {
            fetch(`https://localhost:7245/api/ParNote/${noteToDelete}`, {
                method: 'DELETE',
            })
                .then(response => {
                    if (response.ok) {
                        setNotes(prevNotes => prevNotes.filter(note => note.noteId !== noteToDelete));
                        setShowDeleteDialog(false);  // Close the dialog
                    } else {
                        alert("Failed to delete note");
                    }
                })
                .catch(error => {
                    console.error("Error deleting note:", error);
                    alert("Error deleting note");
                });
        }
    };

    // Cancel the deletion action
    const cancelDelete = () => {
        setShowDeleteDialog(false); // Close the dialog without deleting
        setNoteToDelete(null);
    };

    const handleDeleteNote = (noteId) => {
        setNoteToDelete(noteId);  // Store the noteId for deletion
        setShowDeleteDialog(true); // Show the confirmation dialog
    };

    useEffect(() => {
        fetchNotes();
        fetchItems();
        fetchRules();
        fetchProducts();
        fetchUsers();
    }, []);
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
    const clearRuleFilter = () => {
        setFilters(prev => ({ ...prev, selectedRules: null }));
    };

    const clearFilters = () => {
        setFilters({
            isActive: null,
            selectedItems: null,
            selectedMakers: null,
            selectedRules: null
        });
        setFilteredRules(rules); // Reset to show all rules
    };


    const handleEditChange = (e, field) => {
        const { value } = e.target;
        setEditedNote((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const onRowEditInit = (rowData) => {
        setEditingRow(rowData);
        setEditedNote({ ...rowData });
    };

    const onRowEditSave = () => {
        const { noteId, ...noteToUpdate } = editedNote;

        // Call the API to update the item in the database
        fetch(`https://localhost:7245/api/parnote/${noteId}`, {
            method: "PUT", // PUT method to update
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(noteToUpdate), // Send the updated item data without parItemId
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to update note");
                }
                // Don't parse body if there's no content
                return response.status === 204 || response.headers.get("content-length") === "0"
                    ? null
                    : response.json();
            })
            .then((data) => {
                setNotes((prevNote) =>
                    prevNote.map((note) =>
                        note.noteId === noteId ? { ...note, ...noteToUpdate } : note
                    )
                );
                // Reset the editing state
                setEditingRow(null);
                setEditedNote(null);
            })
            .catch((error) => {
                console.error("Error saving note:", error);
                alert("Error saving note");
            });
    };

    const onRowEditCancel = () => {
        setEditingRow(null);
        setEditedNote(null);
    };

    const editableCell = (field, rowData) => {
        if (editingRow && editingRow.noteId === rowData.noteId) {
            return (
                <InputText
                    value={editedNote[field]}
                    onChange={(e) => handleEditChange(e, field)}
                />
            );
        }
        return rowData[field]; // Display value if not in edit mode
    };

    const handleNoteCreated = () => {
        setShowCreateDialog(false);
        fetchNotes();
    };
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const getProductName = (parItemId) => {
        const item = items.find(i => i.parItemId === parItemId);
        if (item) {
            const product = products.find(p => p.productId === item.productId);
            return product ? product.name : "No Product Name";
        }
        return "No Product Name";
    };
    const getUserName = (userId) => {
        const user = users.find(u => u.userId === userId);
        return user ? `${user.firstName} ${user.lastName}` : `User ID: ${userId}`;
    };

    const itemOptions = items.length && products.length ? items
        .filter(item => {
            return (selectedUsers.length === 0
                ? notes.some(note => {
                    const rule = getRule(note.ruleId); // Get the rule for this note
                    return note.parItemId === item.parItemId &&
                        (!showOnlyActive || rule.isActive);  // Check if rule is active
                })
                : selectedUsers.some(userId => {
                    return notes.some(note => {
                        const rule = getRule(note.ruleId); // Get the rule for this note
                        return note.createdByUser === userId &&
                            note.parItemId === item.parItemId &&
                            (!showOnlyActive || rule.isActive); // Check if rule is active
                    });
                })
            );
        })
        .map(item => ({
            label: getProductName(item.parItemId),
            value: item.parItemId
        })) : [];

    const noteMakers = users.length && notes.length ? users
    .filter(user => {
        return (selectedItems.length === 0
            ? notes.some(note => 
                note.createdByUser === user.userId &&
                (!selectedRules.length || selectedRules.includes(note.ruleId)) // Check if note's ruleId matches selected rules
            )
            : selectedItems.some(parItemId => {
                return notes.some(note => 
                    note.createdByUser === user.userId &&
                    note.parItemId === parItemId &&
                    (!selectedRules.length || selectedRules.includes(note.ruleId)) // Check if note's ruleId matches selected rules
                );
            })
        );
    })
    .map(user => ({
        label: `${user.firstName} ${user.lastName}`,
        value: user.userId
    })) : [];


    const ruleOptions = rules.length ? rules
        // First, filter the rules that are associated with at least one note
        .filter(rule => notes.some(note => note.ruleId === rule.ruleId))
        // If there are selected users, filter rules to include only those with notes from selected users
        .filter(rule => {
            if (selectedUsers.length > 0) {
                return notes.some(note =>
                    note.ruleId === rule.ruleId && selectedUsers.includes(note.createdByUser)
                );
            }
            return true;  // If no selected users, include all rules
        })
        // Apply the showOnlyActive filter (only show active rules if checked)
        .filter(rule => !showOnlyActive || rule.isActive)
        .map(rule => ({
            label: `RuleID: (${rule.ruleId}) Active: ${rule.isActive ? 'Y' : 'N'}`,
            value: rule.ruleId
        })) : [];

  

    return (
        <div className="p-4">
            
            <div className="inline-flex items-center gap-2">
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
                    <h1>Note List</h1>
                 <FloatLabel className="w-full md:w-30rem">
                    <MultiSelect
                        value={selectedItems}
                        onChange={(e) => setSelectedItems(e.value)}
                        options={itemOptions} 
                        placeholder="Select Item"
                        display="chip"
                        className="w-full md:w-20rem"
                    />
                    <label htmlFor="ms-items">Select Items</label>
                    <Button icon="pi pi-times" className="p-button-text p-button-sm" onClick={() => setSelectedItems([])} />
                </FloatLabel>
                <FloatLabel className="w-full md:w-30rem">
                    <MultiSelect
                        value={selectedRules}
                        onChange={(e) => setSelectedRules(e.value)}
                        options={ruleOptions}  
                        placeholder="Select Rule"
                        display="chip"
                        />
                        <label htmlFor="ms-items">Select Rules</label>
                    <Button icon="pi pi-times" className="p-button-text p-button-sm" onClick={() => setSelectedItems([])} />
                </FloatLabel>
                <FloatLabel className="w-full md:w-30rem">
                    <MultiSelect
                        value={selectedUsers}
                        onChange={(e) => setSelectedUsers(e.value)}
                        options={noteMakers} 
                        placeholder="Select Users"
                        display="chip"
                    />
                    <label htmlFor="ms-items">Select Users</label>
                    <Button icon="pi pi-times" className="p-button-text p-button-sm" onClick={() => setSelectedItems([])} />
                    </FloatLabel>
                        <Checkbox inputId="activeOnly" checked={showOnlyActive} onChange={(e) => setShowOnlyActive(e.checked)} />
                        <label htmlFor="ms-items"> Only Show Active Items</label>
            
            <Button
                label="Create New Note"
                icon="pi pi-plus"
                onClick={() => setShowCreateDialog(true)}
                />

            <CreateParNote
                visible={showCreateDialog}
                onHide={() => setShowCreateDialog(false)}
                onSuccess={handleNoteCreated}
                userId={userId}
                    />
                </div>
             <div className="flex-container">
            <DataTable
                            value={filteredNotes}
                            paginator
                            rows={10}
                            rowsPerPageOptions={[10, 20, 50]}
                            responsiveLayout="scroll"
                            dataKey="noteId"
                            filterDisplay="menu"
                            style={{ maxWidth: "100%" }}  
                            scrollable 
                            scrollHeight="400px"
                            selection={selectedRow}
                            onSelectionChange={(e) => setSelectedRow(e.value)}  
                            selectionMode="single"


            >
                <Column field="productId" header="Product Name" sortable body={(rowData) => getProductName(rowData.parItemId)} style={{ width: '250px' }} />
                <Column field="ruleId" header="Rule ID" sortable />
                <Column field="createdByUser" header="Created By" sortable body={(rowData) => getUserName(rowData.createdByUser)} />
                <Column field="dateCreated" header="Date Created" body={(rowData) => formatDate(rowData.dateCreated)}/>
                
                <Column
                    body={(rowData) => (
                        userId.toString() === rowData.createdByUser.toString() ? (
                            <>
                                {editingRow && editingRow.noteId === rowData.noteId ? (
                                    <>
                                        <Button icon="pi pi-check" onClick={onRowEditSave} className="p-button-success p-mr-2" />
                                        <Button icon="pi pi-times" onClick={onRowEditCancel} className="p-button-danger" />
                                    </>
                                ) : (
                                    <Button icon="pi pi-pencil" onClick={() => onRowEditInit(rowData)} />
                                )}
                            </>
                        ) : null
                    )}
                            style={{ width: "3rem" }}

                />
                        <Column
                            body={(rowData) => {
                                // Find the current user from the users array
                                const currentUser = users.find(user => Number(user.userId) === Number(userId));
                                if (currentUser && (currentUser.userRoleId === 1 || rowData.createdByUser === Number(userId))) {
                                    return (
                                        <Button
                                            icon="pi pi-trash"
                                            className="p-button-danger"
                                            onClick={() => handleDeleteNote(rowData.noteId)}  // Pass the noteId to handleDeleteNote
                                        />
                                    );
                                }

                                return null;  // Don't show the button if the user isn't allowed to delete
                            }}
                            style={{ width: "3rem" }}
                        />
                </DataTable>
                    <div className="selected-note-container">
                        <label htmlFor="selectedNote">Selected Note</label>
                        <InputTextarea
                            id="selectedNote"
                            value={selectedRow ? selectedRow.note : "Select a note"}
                            readOnly
                            autoResize
                            className="w-full"
                            style={{ maxHeight: '400px', overflowY: 'auto' }} 
                        />
                    </div>
                </div>
                {/* Confirmation Dialog */}
                <Dialog
                    visible={showDeleteDialog}
                    style={{ width: '450px' }}
                    header="Confirm Deletion"
                    modal
                    footer={
                        <div>
                            <Button label="No" icon="pi pi-times" onClick={cancelDelete} className="p-button-text" />
                            <Button label="Yes" icon="pi pi-check" onClick={deleteNote} autoFocus />
                        </div>
                    }
                    onHide={cancelDelete}
                >
                    <p>Are you sure you want to delete this note?</p>
                </Dialog>
            </div>
        </div>
    );
}

export default NotesTable;