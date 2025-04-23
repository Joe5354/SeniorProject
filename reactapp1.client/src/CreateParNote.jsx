import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";

function CreateParNote({ visible, onHide, onSuccess, userId }) {
    const [noteText, setNoteText] = useState("");
    const [parItemId, setParItemId] = useState(null);
    const [ruleId, setRuleId] = useState(null);
    const [items, setItems] = useState([]);
    const [rules, setRules] = useState([]);
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState(null);
    const [products, setProducts] = useState([]);
    const toastRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [itemsRes, rulesRes, userRes] = await Promise.all([
                    fetch("https://localhost:7245/api/Item"),
                    fetch("https://localhost:7245/api/ParRule"),
                    userId ? fetch(`https://localhost:7245/api/User/${userId}`) : Promise.resolve({ ok: false })
                ]);

                if (!itemsRes.ok || !rulesRes.ok) throw new Error("Failed to load dropdown data");

                const itemsData = await itemsRes.json();
                const rulesData = await rulesRes.json();
                setItems(itemsData);
                setRules(rulesData);

                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUserInfo(userData);
                }

                if (itemsData.length > 0) setParItemId(itemsData[0].parItemId);
                setLoading(false);
            } catch (error) {
                setApiError(error.message);
                setLoading(false);
            }
            fetch("https://localhost:7245/api/Product")
                .then((res) => res.json())
                .then((data) => setProducts(data))
                .catch((error) => console.error("Error fetching notes:", error));
        };

        if (visible) fetchData();
    }, [visible, userId]);

    useEffect(() => {
        if (visible) {
            setNoteText("");
            setParItemId(items.length > 0 ? items[0].parItemId : null);
            setRuleId(null);
            setApiError(null);
        }
    }, [visible, items]);
    const getProductName = (parItemId) => {
        const item = items.find(i => i.parItemId === parItemId);
        if (item) {
            const product = products.find(p => p.productId === item.productId);
            return product ? product.name : "No Product Name";
        }
        return "No Product Name";
    };
    const itemOptions = items.map(item => ({
        label: `${getProductName(item.parItemId)}`,
        value: item.parItemId
    }));

    const filteredRules = parItemId != null
        ? rules.filter(rule => rule.parItemId === parItemId)
        : rules;

    const ruleOptions = filteredRules.map(rule => ({
        label: `RuleID: (${rule.ruleId}) Active: ${rule.isActive ? 'Y' : 'N'}`,
        value: rule.ruleId
    }));

    const handleSubmit = async () => {
        if (!noteText.trim()) {
            toastRef.current.show({ severity: "error", summary: "Error", detail: "Note text is required" });
            return;
        }

        if (!parItemId) {
            toastRef.current.show({ severity: "error", summary: "Error", detail: "Item must be selected" });
            return;
        }

        if (!userId) {
            toastRef.current.show({ severity: "error", summary: "Error", detail: "Please log in first" });
            return;
        }

        const noteData = {
            note: noteText.trim(),
            parItemId,
            ruleId,
            createdByUser: userId,
            dateCreated: new Date().toISOString()
        };

        try {
            const res = await fetch("https://localhost:7245/api/ParNote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(noteData)
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText);
            }

            const createdNote = await res.json();
            toastRef.current.show({ severity: "success", summary: "Success", detail: "Note created!" });
            onSuccess?.(createdNote);
            onHide?.();
        } catch (error) {
            toastRef.current.show({ severity: "error", summary: "Error", detail: error.message });
        }
    };

    const renderFooter = () => (
        <div>
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={onHide} />
            <Button label="Save" icon="pi pi-check" className="p-button-primary" onClick={handleSubmit} />
        </div>
    );

    return (
        <>
            <Toast ref={toastRef} />
            <Dialog
                header="Create New PAR Note"
                visible={visible}
                style={{ width: "500px" }}
                modal
                footer={renderFooter()}
                onHide={onHide}
                className="p-fluid"
            >
                {loading ? (
                    <div className="p-d-flex p-jc-center">
                        <i className="pi pi-spin pi-spinner" style={{ fontSize: "2rem" }}></i>
                    </div>
                ) : (
                    <>
                        {apiError && <p className="p-error">{apiError}</p>}
                        {userInfo && (
                            <div className="p-message p-message-info">
                                Creating note as: {userInfo.firstName} {userInfo.lastName}
                            </div>
                        )}
                        <div className="p-field mb-3">
                            <label htmlFor="noteText" className="font-bold">Note*</label>
                            <InputTextarea
                                id="noteText"
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                rows={4}
                                required
                                className="w-full"
                            />
                        </div>
                        <div className="p-field mb-3">
                            <label htmlFor="item" className="font-bold">PAR Item*</label>
                            <Dropdown
                                id="item"
                                value={parItemId}
                                options={itemOptions}
                                onChange={(e) => setParItemId(e.value)}
                                placeholder="Select Item"
                                className="w-full"
                            />
                        </div>
                        <div className="p-field mb-3">
                            <label htmlFor="ruleId" className="font-bold">Related Rule (optional)</label>
                            <Dropdown
                                id="ruleId"
                                value={ruleId}
                                options={ruleOptions}
                                onChange={(e) => setRuleId(e.value)}
                                placeholder="Select Rule (optional)"
                                className="w-full"
                                showClear
                            />
                        </div>
                    </>
                )}
            </Dialog>
        </>
    );
}

export default CreateParNote;
