import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

function NotesTable() {
    const [notes, setNotes] = useState([]);
    const [editingRow, setEditingRow] = useState(null);
    const [editedNote, setEditedNote] = useState(null);

    useEffect(() => {
        fetch("https://localhost:7245/api/ParNote")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch notes");
                }
                return response.json();
            })
            .then((data) => setNotes(data))
            .catch((error) => console.error("Error fetching notes:", error));
    }, []); // Runs once on mount

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

    return (
        <div className="p-4">
            <h1>Note List</h1>
            <DataTable
                value={notes}
                paginator
                rows={5}
                responsiveLayout="scroll"
                dataKey="parItemId"
                filterDisplay="menu"
                style={{ maxWidth: "100%" }}  // Max width for responsiveness
                scrollable // Add scrolling
                scrollHeight="400px"
            >
                <Column field="noteId" header="Note ID" sortable filter filterPlaceholder="Search" />
                <Column field="parItemID" header="Par Item ID" sortable filter filterPlaceholder="Search" />
                <Column field="productId" header="Product ID" sortable filter filterPlaceholder="Search" />
                <Column field="note" header="Note" body={(rowData) => editableCell("note", rowData)} />
                <Column field="createdByUser" header="Created By" sortable filter filterPlaceholder="Search" />
                <Column field="dateCreated" header="Date Created" sortable filter filterPlaceholder="Search" />

                <Column
                    body={(rowData) => (
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
                    )}
                    style={{ width: "6rem" }}
                />
            </DataTable>
        </div>
    );
}

export default NotesTable;