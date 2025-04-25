import React, { useState } from 'react';
import { Button } from 'primereact/button';

function CreateNoteForm({ onClose }) {
    const [formData, setFormData] = useState({
        Note: ''
    });

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        setErrorMessage('');

        try {
            const response = await fetch('https://localhost:7245/api/parNote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to create note');
            }

            setSuccessMessage('Notecreated successfully!');
            setFormData({
                note:''
            });
        } catch (err) {
            setErrorMessage(err.message);
        }
    };

    return (
        <div>
            <h2>Create New Note</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    ParItemID:                    
                </label><br />
                <label>
                    RuleID:
                </label><br />
                <label>
                    ParValue:                    
                </label><br />
                <label>
                    Note:
                    <input name="parNote" value={formData.parNoteId} onChange={handleChange} required />
                </label><br />
                <label>
                    You are:
                </label><br />
                <div className="p-dialog-footer" style={{ marginTop: '1rem' }}>
                    <Button
                        label="Cancel"
                        icon="pi pi-times"
                        className="p-button-secondary"
                        onClick={onClose}
                        type="button"
                    />
                    <Button
                        label="Create"
                        icon="pi pi-check"
                        className="p-button-success"
                        type="submit"
                    />
                </div>
            </form>
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </div>
    );
}

export default CreateNoteForm;