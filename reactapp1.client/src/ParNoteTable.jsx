import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import CreateParNote from "./CreateParNote";
import { MultiSelect } from 'primereact/multiselect';
import { Checkbox } from 'primereact/checkbox';
function NotesTable({ userId }) {
    const [notes, setNotes] = useState([]);
    const [editingRow, setEditingRow] = useState(null);
    const [editedNote, setEditedNote] = useState(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [items, setItems] = useState([]);
    const [rules, setRules] = useState([]);
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);

    const [filteredNotes, setFilteredNotes] = useState([]);

    const [filters, setFilters] = useState({
        isActive: null, // null = no filter, = true/false means filter by isActive = true/false.
        selectedItems: null,
        selectedMakers: null,
        selectedRules:null
    }); 




    const getRule = (ruleId) => {
        const rule = rules.find(r => r.ruleId === ruleId);
        return rule ? `RuleID: (${rule.ruleId}) Active: ${rule.isActive ? 'Y' : 'N'}` : 'Rule not found';
    };

    useEffect(() => {
        let filteredData = [...notes];

        // Filter by isActive
        if (filters.isActive !== null) {
            filteredData = filteredData.filter(note => {
                const rule = rules.find(r => r.ruleId === note.ruleId);
                return rule && rule.isActive === filters.isActive;
            });
        }

        // Filter by selectedItems (parItemId)
        if (Array.isArray(filters.selectedItems) && filters.selectedItems.length > 0) {
            filteredData = filteredData.filter(note =>
                filters.selectedItems.includes(note.parItemId)
            );
        }

        // Filter by selectedMakers (createdByUser)
        if (Array.isArray(filters.selectedMakers) && filters.selectedMakers.length > 0) {
            filteredData = filteredData.filter(note =>
                filters.selectedMakers.includes(note.createdByUser)
            );
        }

        setFilteredNotes(filteredData);
    }, [filters, notes, rules]);

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

    

    

    const FilterSection = ({ filters, setFilters, clearFilters }) => {
        const handleActiveChange = (e) => {
            setFilters(prev => ({
                ...prev,
                isActive: e.checked ? true : false, // null means show all
            }));
        };

        return (
            <div className="flex flex-wrap items-center gap-4 mb-4">
                {/* Active Checkbox */}
                <div className="flex items-center gap-2">
                    <Checkbox
                        inputId="activeOnly"
                        checked={filters.isActive === true}
                        onChange={handleActiveChange}
                    />
                    <label htmlFor="activeOnly">Active</label>
                    <Button
                        icon="pi pi-times"
                        className="p-button-outlined p-button-danger p-button-sm"
                        onClick={clearActiveFilter}
                    />
                </div>

                {/* Product Filter */}
                <div className="flex items-center gap-2">
                    <MultiSelect
                        value={filters.selectedItems}
                        options={itemOptions}
                        onChange={(e) => {
                            const selectedItems = e.value.length > 0 ? e.value : null;
                            setFilters(prev => ({
                                ...prev,
                                selectedItems: selectedItems
                            }));
                        }}
                        placeholder="Filter by Product"
                        display="chip"
                        className="w-64"
                    />
                    <Button
                        icon="pi pi-times"
                        className="p-button-outlined p-button-danger p-button-sm"
                        onClick={clearItemFilter}
                    />
                </div>

                {/* Maker Filter */}
                <div className="flex items-center gap-2">
                    <MultiSelect
                        value={filters.selectedMakers}
                        options={noteMakers}
                        onChange={(e) => {
                            const selectedMakers = e.value.length > 0 ? e.value : null;
                            setFilters(prev => ({
                                ...prev,
                                selectedMakers: selectedMakers
                            }));
                        }}
                        placeholder="Filter by Maker"
                        display="chip"
                        className="w-64"
                    />
                    <Button
                        icon="pi pi-times"
                        className="p-button-outlined p-button-danger p-button-sm"
                        onClick={clearMakerFilter}
                    />
                </div>
                {/* Rule Filter */}
                <div className="flex items-center gap-2">
                    <MultiSelect
                        value={filters.selectedRules}
                        options={ruleOptions}
                        onChange={(e) => {
                            const selectedRules = e.value.length > 0 ? e.value : null;
                            setFilters(prev => ({
                                ...prev,
                                selectedRules: selectedRules
                            }));
                        }}
                        placeholder="Filter by Rules"
                        display="chip"
                        className="w-64"
                    />
                    <Button
                        icon="pi pi-times"
                        className="p-button-outlined p-button-danger p-button-sm"
                        onClick={clearRuleFilter}
                    />
                </div>
                {/* Clear All Filters */}
                <Button
                    label="Clear All"
                    icon="pi pi-filter-slash"
                    className="p-button-secondary p-button-sm"
                    onClick={clearFilters}
                />
            </div>
        );
    };

    return (
        <div className="p-4">
            <h1>Note List</h1>
            <FilterSection
                filters={filters}
                setFilters={setFilters}
                clearFilters={clearFilters}
            />
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
            <DataTable
                value={filteredNotes}
                paginator
                rows={5}
                responsiveLayout="scroll"
                dataKey="noteId"
                filterDisplay="menu"
                style={{ maxWidth: "100%" }}  // Max width for responsiveness
                scrollable // Add scrolling
                scrollHeight="400px"
            >
                <Column field="productId" header="Product Name" sortable body={(rowData) => getProductName(rowData.parItemId)} style={{ width: '250px' }} />
                <Column field="ruleId" header="Rule ID" sortable />
                <Column field="note" header="Note" body={(rowData) => editableCell("note", rowData)} />
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
                    style={{ width: "6rem" }}
                />
            </DataTable>
        </div>
    );
}

export default NotesTable;