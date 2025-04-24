import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

const RefreshAll = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const toast = useRef(null);

    // Fetch all items from IdealInventoryViewController
    const fetchItems = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/IdealInventoryViewController');
            if (!response.ok) throw new Error('Failed to fetch items from IdealInventoryViewController');

            const data = await response.json();
            await pushItems(data);
        } catch (error) {
            console.error('Error fetching items:', error);
            if (toast.current) {
                toast.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message,
                    life: 3000,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    // Push each item to the PushItem endpoint
    const pushItems = async (items) => {
        for (let item of items) {
            try {
                const response = await fetch(`/api/IdealInventoryViewController/${item.ItemId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(item), // Sending updated item data
                });

                if (!response.ok) {
                    throw new Error(`Failed to push item with ID: ${item.ItemId}`);
                }
                console.log(`Item ${item.ItemId} updated successfully`);
            } catch (error) {
                console.error(`Error pushing item ${item.ItemId}:`, error);
                if (toast.current) {
                    toast.current.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: `Failed to push item ${item.ItemId}: ${error.message}`,
                        life: 3000,
                    });
                }
            }
        }
        setMessage('All items processed.');
        if (toast.current) {
            toast.current.show({
                severity: 'success',
                summary: 'Success',
                detail: 'All items have been processed successfully!',
                life: 3000,
            });
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <Toast ref={toast} />
            <h1>Refreshing All Items</h1>
            <Button
                label="Refresh All Items"
                icon="pi pi-refresh"
                onClick={fetchItems}
                loading={loading}
                disabled={loading}
                className="p-button-primary"
            />
            {message && <p>{message}</p>}
        </div>
    );
};

export default RefreshAll;
