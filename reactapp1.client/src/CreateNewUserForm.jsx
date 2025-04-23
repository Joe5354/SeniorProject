import React, { useState, useRef, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

function CreateNewUserForm({ visible, onHide, onSuccess }) {
    const toastRef = useRef(null);

    const [formData, setFormData] = useState({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        employeeId: '',
        userRoleId: ''
    });

    const [roles, setRoles] = useState([]);

    useEffect(() => {
        if (visible) {
            // Reset form and load roles
            setFormData({
                username: '',
                firstName: '',
                lastName: '',
                email: '',
                employeeId: '',
                userRoleId: ''
            });
            fetchRoles();
        }
    }, [visible]);

    const fetchRoles = async () => {
        try {
            const res = await fetch("https://localhost:7245/api/UserRole");
            if (!res.ok) throw new Error("Failed to fetch roles");
            const data = await res.json();
            setRoles(data);
        } catch (err) {
            toastRef.current.show({
                severity: "error",
                summary: "Error",
                detail: err.message,
            });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        // Frontend validation
        const { username, firstName, lastName, email, employeeId, userRoleId } = formData;

        if (!username || !firstName || !lastName || !email || !employeeId || !userRoleId) {
            toastRef.current.show({
                severity: "error",
                summary: "Validation Error",
                detail: "All fields are required.",
            });
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            toastRef.current.show({
                severity: "error",
                summary: "Validation Error",
                detail: "Please enter a valid email address.",
            });
            return;
        }

        try {
            const response = await fetch('https://localhost:7245/api/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const text = await response.text().then(t => t.toLowerCase());

                if (text.includes("email")) {
                    throw new Error("Email already in database.");
                } else if (text.includes("username")) {
                    throw new Error("Username already in use.");
                } else if (text.includes("employeeId") || text.includes("employee id")) {
                    throw new Error("Employee ID already exists.");
                }

                throw new Error(`Failed to create user: ${text}`);
            }

            const result = await response.json();
            toastRef.current.show({
                severity: "success",
                summary: "Success",
                detail: "User created successfully!"
            });

            if (onSuccess) onSuccess(result);
            if (onHide) onHide();

        } catch (err) {
            toastRef.current.show({
                severity: "error",
                summary: "Error",
                detail: err.message
            });
        }
    };

    const renderFooter = () => (
        <div>
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={onHide} />
            <Button label="Create" icon="pi pi-check" className="p-button-success" onClick={handleSubmit} />
        </div>
    );

    return (
        <>
            <Toast ref={toastRef} />
            <Dialog
                header="Create New User"
                visible={visible}
                style={{ width: "500px" }}
                modal
                className="p-fluid"
                footer={renderFooter()}
                onHide={onHide}
            >
                <div className="p-field mb-3">
                    <label htmlFor="username" className="font-bold">Username*</label>
                    <InputText id="username" name="username" value={formData.username} onChange={handleChange} required />
                </div>

                <div className="p-field mb-3">
                    <label htmlFor="firstName" className="font-bold">First Name*</label>
                    <InputText id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
                </div>

                <div className="p-field mb-3">
                    <label htmlFor="lastName" className="font-bold">Last Name*</label>
                    <InputText id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
                </div>

                <div className="p-field mb-3">
                    <label htmlFor="email" className="font-bold">Email*</label>
                    <InputText id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                </div>

                <div className="p-field mb-3">
                    <label htmlFor="employeeId" className="font-bold">Employee ID*</label>
                    <InputText id="employeeId" name="employeeId" value={formData.employeeId} onChange={handleChange} required />
                </div>

                <div className="p-field mb-3">
                    <label htmlFor="userRoleId" className="font-bold">Role*</label>
                    <Dropdown
                        id="userRoleId"
                        name="userRoleId"
                        value={formData.userRoleId}
                        options={roles
                            .filter(role => role.userRoleId !== 1)
                            .map(role => ({ label: role.description, value: role.userRoleId }))
                        }
                        onChange={(e) => setFormData(prev => ({ ...prev, userRoleId: e.value }))}
                        placeholder="Select a Role"
                        required
                    />
                </div>
            </Dialog>
        </>
    );
}

export default CreateNewUserForm;
