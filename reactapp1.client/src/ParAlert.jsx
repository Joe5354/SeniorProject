// src/ParAlert.jsx
import React, { useState, useEffect,useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
export default function ParAlert() {
    console.log("ParAlert mounted");
    const [items, setItems] = useState([]);
    const [rules, setRules] = useState([]);
    const [products, setProducts] = useState([]);
    const [belowPar, setBelowPar] = useState([]);
    const [showBanner, setShowBanner] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const toast = useRef(null);
    const [checkboxState, setCheckboxState] = useState({});

    const fetchData = async () => {
        try {
            const [itemsRes, rulesRes, productsRes] = await Promise.all([
                fetch("https://localhost:7245/api/item"),
                fetch("https://localhost:7245/api/parRule"),
                fetch("https://localhost:7245/api/Product")
            ]);
            if (!itemsRes.ok || !rulesRes.ok || !productsRes.ok) {
                throw new Error("Failed to fetch data");
            }

            const [itemsData, rulesData, productsData] = await Promise.all([
                itemsRes.json(),
                rulesRes.json(),
                productsRes.json()
            ]);

            setItems(itemsData);
            setRules(rulesData);
            setProducts(productsData);

            const productIdsBelowPar = new Set();

            itemsData.forEach(item => {
                const rule = rulesData.find(r =>
                    r.parItemId === item.parItemId &&
                    r.isActive &&
                    r.parSeenStatus !== "belowAndIgnored" &&
                    r.orderStatus !== "ordered"
                );
                if (rule && item.totalCount <= rule.parValue) {
                    productIdsBelowPar.add(item.productId);
                }
            });

            const filtered = itemsData.filter(item =>
                productIdsBelowPar.has(item.productId)
            );

            const uniqueFiltered = filtered.filter(
                (item, index, self) =>
                    index === self.findIndex(i => i.productId === item.productId)
            );
            console.log("Setting belowPar with:", JSON.stringify(uniqueFiltered, null, 2));  // Ensure we log the value before setting state
            setBelowPar(uniqueFiltered);
            console.log("BELOOOWowPar after set:", JSON.stringify(belowPar, null, 2));
            if (uniqueFiltered.length > 0) {
                setShowBanner(true);
            }
        } catch (err) {
            console.error(err);
        }
    };
    useEffect(() => {
        const runFetch = async () => {
            try {
                console.log("ParAlert useEffect started");

                const [itemsRes, rulesRes, productsRes] = await Promise.all([
                    fetch("https://localhost:7245/api/item"),
                    fetch("https://localhost:7245/api/parRule"),
                    fetch("https://localhost:7245/api/Product")
                ]);

                if (!itemsRes.ok || !rulesRes.ok || !productsRes.ok) {
                    throw new Error("One or more fetch responses were not OK");
                }

                const [itemsData, rulesData, productsData] = await Promise.all([
                    itemsRes.json(),
                    rulesRes.json(),
                    productsRes.json()
                ]);

                console.log("Fetched data:", {
                    itemsDataLength: itemsData.length,
                    rulesDataLength: rulesData.length,
                    productsDataLength: productsData.length,
                });

                setItems(itemsData);
                setRules(rulesData);
                setProducts(productsData);

                const productIdsBelowPar = new Set();

                itemsData.forEach(item => {
                    const rule = rulesData.find(r =>
                        r.parItemId === item.parItemId &&
                        r.isActive &&
                        r.parSeenStatus !== "belowAndIgnored" &&
                        r.orderStatus !== "ordered"
                    );

                    if (rule && item.totalCount <= rule.parValue) {
                        productIdsBelowPar.add(item.productId);
                    }
                });

                const filtered = itemsData.filter(item =>
                    productIdsBelowPar.has(item.productId)
                );

                const uniqueFiltered = filtered.filter(
                    (item, index, self) =>
                        index === self.findIndex(i => i.productId === item.productId)
                );

                console.log("Setting belowPar with:", uniqueFiltered);
                setBelowPar(uniqueFiltered);

                if (uniqueFiltered.length > 0) {
                    console.log("Items below PAR detected, showing banner");
                    setShowBanner(true);
                } else {
                    console.log("No items below PAR");
                }
            } catch (err) {
                console.error("Error in ParAlert useEffect:", err);
            }
        };

        runFetch();
    }, []);


    useEffect(() => {
            console.log("Below Par updated:", JSON.stringify(belowPar, null, 2));    
    }, [belowPar]);

    // Helper to get product name from parItemId
    const getProductName = (parItemId) => {
        const item = items.find(i => i.parItemId === parItemId);
        const product = item && products.find(p => p.productId === item.productId);
        return product ? product.name : `Item ${parItemId}`;
    };


    const handleCheckboxChange = (parItemId, type, checked) => {
        setCheckboxState(prevState => ({
            ...prevState,
            [parItemId]: {
                ...prevState[parItemId],
                [type]: checked
            }
        }));
    };

    const handleDialogClose = async () => {
        const updatedRules = [...rules];

        try {
            for (const item of belowPar) {
                const rule = updatedRules.find(r => r.parItemId === item.parItemId && r.isActive);
                if (rule) {
                    const { ignored, ordered } = checkboxState[item.parItemId] || {};

                    let shouldUpdate = false;

                    if (ignored) {
                        rule.parSeenStatus = "belowAndIgnored";
                        shouldUpdate = true;
                    }

                    if (ordered) {
                        rule.orderStatus = "ordered";
                        shouldUpdate = true;
                    }

                    if (shouldUpdate) {
                        const res = await fetch(`https://localhost:7245/api/ParRule/${rule.ruleId}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(rule)
                        });

                        if (!res.ok) {
                            throw new Error(`Failed to update rule ID ${rule.ruleId}, status: ${res.status}`);
                        }

                        // Check if the response has a body
                        const rawResponse = await res.text(); // Get the raw response as text

                        if (rawResponse) {
                            // If it's not JSON, handle it accordingly
                            console.log("Raw response:", rawResponse);
                        } else {
                            console.log("Empty response body received");
                        }
                    }
                }
            }

            fetchData();
            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Rules updated successfully',
                life: 3000
            });

            setRules(updatedRules);
        } catch (err) {
            console.error("Error updating rules:", err);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to update rules: ' + err.message,
                life: 3000
            });
        }

        setShowDialog(false);
    };







    // If nothing below par or banner dismissed, render nothing
    if (!showBanner || belowPar.length === 0) {
        return null;
    }

    return (
        <>
            {/* Banner */}
            <div className="par-alert-banner">
                <i className="pi pi-exclamation-triangle alert-icon" />
                <div className="alert-message">
                    ⚠️ {belowPar.length} item{belowPar.length > 1 ? 's' : ''} at or below PAR level
                </div>
                <Button
                    label="View Details"
                    icon="pi pi-eye"
                    className="alert-details-btn p-button-text"
                    onClick={() => setShowDialog(true)}
                />
                <Button
                    icon="pi pi-times"
                    className="alert-close-btn p-button-text"
                    onClick={() => setShowBanner(false)}
                    aria-label="Close"
                />
            </div>

            {/* Details Dialog */}
            <Dialog
                header="Items at or Below PAR"
                visible={showDialog}
                style={{ width: '40vw' }}
                modal
                onHide={() => setShowDialog(false)}
            >
                <ul>
                    {belowPar.map((item, idx) => {
                        const rule = rules.find(r => r.parItemId === item.parItemId && r.isActive);
                        const parItemId = item.parItemId;
                        const checkedState = checkboxState[parItemId] || {};
                        return (
                            <li key={idx}>
                                {getProductName(item.parItemId)} — Total Count: {item.totalCount}
                                {rule && `— PAR Value: ${rule.parValue}`}
                                <div className="checkbox-row" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    
                                        <Checkbox
                                            inputId={`ignored-${parItemId}`}
                                            checked={checkedState.ignored || false}
                                        onChange={(e) => handleCheckboxChange(parItemId, 'ignored', e.checked)}
                                        />
                                    <label htmlFor={`ignored-${parItemId}`} className="ml-2">Ignored</label>
                                    
                                        <Checkbox
                                        inputId={`ordered-${parItemId}`}
                                            checked={checkedState.ordered || false}
                                        onChange={(e) => handleCheckboxChange(parItemId, 'ordered', e.checked)}
                                        />
                                    <label htmlFor={`ordered-${parItemId}`} className="ml-2">Ordered</label>
                                    
                                </div>
                            </li>
                        );
                    })}
                </ul>
                <Button label="Update Rules" icon="pi pi-check" onClick={handleDialogClose} />
            </Dialog>
        </>
    );
}