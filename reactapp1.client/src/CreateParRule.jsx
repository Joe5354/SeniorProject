import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Checkbox } from "primereact/checkbox";
import { Toast } from "primereact/toast";

function CreateParRule({ visible, onHide, onSuccess, userData }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const toastRef = useRef(null);

    // Form state
    const [ruleName, setRuleName] = useState("");
    const [description, setDescription] = useState("");
    const [parValue, setParValue] = useState(0);
    const [parItemId, setParItemId] = useState(null);
    const [isActive, setIsActive] = useState(true);

    // Debugging state
    const [apiError, setApiError] = useState(null);

    // Fetch items when component mounts
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                console.log("Fetching data...");

                // Fetch items
                const itemsResponse = await fetch("https://localhost:7245/api/Item");
                if (!itemsResponse.ok) {
                    throw new Error("Failed to fetch items");
                }
                const itemsData = await itemsResponse.json();
                console.log("Items data fetched:", itemsData);

                setItems(itemsData);

                // Set default values
                if (itemsData.length > 0) {
                    setParItemId(itemsData[0].parItemId);
                }

                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setApiError("Failed to load data: " + error.message);
                setLoading(false);
            }
        };

        if (visible) {
            fetchData();
        }
    }, [visible, userData]);

    // Reset form when dialog is opened
    useEffect(() => {
        if (visible) {
            console.log("Dialog opened, resetting form");
            setRuleName("");
            setDescription("");
            setParValue(0);
            setParItemId(items.length > 0 ? items[0].parItemId : null);
            setIsActive(true);
            setApiError(null);
        }
    }, [visible, items]);

    // Format items for dropdown
    const itemOptions = items.map(item => ({
        label: `${item.productId || 'Unknown'} - ${item.serialNumber || "No Serial"} (ID: ${item.parItemId})`,
        value: item.parItemId
    }));

    // Handle form submission
    const handleSubmit = async () => {
        console.log("Save button clicked");

        try {
            // Validate form
            if (!ruleName.trim()) {
                console.log("Validation error: Rule name is required");
                toastRef.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Rule name is required"
                });
                return;
            }

            if (parValue < 0) {
                console.log("Validation error: PAR value must be 0 or greater");
                toastRef.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "PAR value must be 0 or greater"
                });
                return;
            }

            if (!parItemId) {
                console.log("Validation error: You must select an item");
                toastRef.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "You must select an item"
                });
                return;
            }

            if (!userData.userId) {
                console.log("Validation error: No user is logged in");
                toastRef.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Please log in before creating a rule"
                });
                return;
            }

            // Prepare rule data
            const ruleData = {
                ruleName: ruleName.trim(),
                description: description.trim() || null,
                parValue,
                parItemId,
                isActive,
                createdByUser: userData.userId, // Use the logged-in user's ID from App
                dateCreated: new Date().toISOString()
            };

            console.log("Sending request with data:", ruleData);

            // Send POST request to create rule
            const response = await fetch("https://localhost:7245/api/ParRule", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(ruleData)
            });

            console.log("Response status:", response.status);

            // Check if response is OK
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Server error:", errorText);
                throw new Error(`Failed to create rule: ${response.status} ${errorText}`);
            }

            // Parse response to get created rule
            const createdRule = await response.json();
            console.log("Rule created successfully:", createdRule);

            // Show success message
            toastRef.current.show({
                severity: "success",
                summary: "Success",
                detail: "Rule created successfully"
            });

            // Call onSuccess callback with the new rule
            if (onSuccess) {
                console.log("Calling onSuccess callback");
                onSuccess(createdRule);
            }

            // Close dialog
            if (onHide) {
                console.log("Calling onHide callback");
                onHide();
            }
        } catch (error) {
            console.error("Error creating rule:", error);
            setApiError(error.message);
            toastRef.current.show({
                severity: "error",
                summary: "Error",
                detail: error.message,
                life: 5000
            });
        }
    };

    // Dialog footer buttons
    const renderFooter = () => {
        return (
            <div>
                <Button
                    label="Cancel"
                    icon="pi pi-times"
                    className="p-button-text"
                    onClick={onHide}
                />
                <Button
                    label="Save"
                    icon="pi pi-check"
                    className="p-button-primary"
                    onClick={handleSubmit}
                    disabled={loading || !userData.userId}
                />
            </div>
        );
    };

    return (
        <>
            <Toast ref={toastRef} />
            <Dialog
                header="Create New PAR Rule"
                visible={visible}
                style={{ width: "450px" }}
                modal
                className="p-fluid"
                footer={renderFooter()}
                onHide={onHide}
            >
                {loading ? (
                    <div className="p-d-flex p-jc-center">
                        <i className="pi pi-spin pi-spinner" style={{ fontSize: "2rem" }}></i>
                    </div>
                ) : (
                    <>
                        {apiError && (
                            <div className="p-message p-message-error mb-3">
                                <div className="p-message-text">{apiError}</div>
                            </div>
                        )}

                        {!userData.userId && (
                            <div className="mb-3 p-message p-message-warn">
                                <div className="p-message-text">
                                    Please log in to create a PAR rule
                                </div>
                            </div>
                        )}

                        {userData && (
                            <div className="mb-3 p-message p-message-info">
                                <div className="p-message-text">
                                    Creating rule as: {userData.firstName} {userData.lastName}
                                </div>
                            </div>
                        )}

                        <div className="p-field mb-3">
                                <label htmlFor="ruleName" className="font-bold label-top-space">Rule Name*</label>
                            <InputText
                                id="ruleName"
                                value={ruleName}
                                onChange={(e) => setRuleName(e.target.value)}
                                required
                                className="w-full mt-1"
                                disabled={!userData.userId}
                            />
                        </div>

                        <div className="p-field mb-3">
                            <label htmlFor="item" className="font-bold">Item*</label>
                            <Dropdown
                                id="item"
                                value={parItemId}
                                options={itemOptions}
                                onChange={(e) => setParItemId(e.value)}
                                placeholder="Select an Item"
                                required
                                className="w-full mt-1"
                                disabled={!userData.userId}
                            />
                        </div>

                        <div className="p-field mb-3">
                            <label htmlFor="parValue" className="font-bold">PAR Value*</label>
                            <InputNumber
                                id="parValue"
                                value={parValue}
                                onValueChange={(e) => setParValue(e.value)}
                                min={0}
                                showButtons
                                className="w-full mt-1"
                                disabled={!userData.userId}
                            />
                        </div>

                        <div className="p-field mb-3">
                            <label htmlFor="description" className="font-bold">Description</label>
                            <InputTextarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full mt-1"
                                    disabled={!userData.userId}
                            />
                        </div>

                        <div className="p-field-checkbox mt-3">
                            <Checkbox
                                inputId="isActive"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.checked)}
                                    disabled={!userData.userId}
                            />
                            <label htmlFor="isActive" className="ml-2">Active</label>
                        </div>
                    </>
                )}
            </Dialog>
        </>
    );
}

export default CreateParRule;