import React, { useState } from 'react';
import { Button } from 'primereact/button';

function CreateNewUserForm({ onClose }) {
    const [formData, setFormData] = useState({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        employeeId: '',
        userRoleId: ''
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
            const response = await fetch('https://localhost:7245/api/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to create user');
            }

            setSuccessMessage('User created successfully!');
            setFormData({
                username: '',
                firstName: '',
                lastName: '',
                email: '',
                employeeId: '',
                userRoleId: ''
            });
        } catch (err) {
            setErrorMessage(err.message);
        }
    };

    return (
        <div>
            <h2>Create New User</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Username:
                    <input name="username" value={formData.username} onChange={handleChange} required />
                </label><br />
                <label>
                    First Name:
                    <input name="firstName" value={formData.firstName} onChange={handleChange} required />
                </label><br />
                <label>
                    Last Name:
                    <input name="lastName" value={formData.lastName} onChange={handleChange} required />
                </label><br />
                <label>
                    Email:
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </label><br />
                <label>
                    Employee ID:
                    <input name="employeeId" value={formData.employeeId} onChange={handleChange} required />
                </label><br />
                <label>
                    Role ID:
                    <input type="number" name="userRoleId" value={formData.userRoleId} onChange={handleChange} required />
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

export default CreateNewUserForm;