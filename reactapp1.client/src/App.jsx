import { useEffect, useState, useRef } from 'react';
import './App.css';
import jagSolo from './assets/JaguarSolo.png';
import USAH from './assets/USAH.png';

// Custom Components
import AllItemsList from './Items';
import UsersList from './Users';
import RulesList from './ParRule';
import UserData from './UserData';
import UserIDInput from './UserIdInput';
import ReportPage from './ReportPage.jsx';
import NotesTable from './ParNoteTable.jsx';
import ParAlert from './ParAlert.jsx';
import { Toast } from 'primereact/toast';
// PrimeReact Components
import { Menubar } from 'primereact/menubar';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

// PrimeReact Styles
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

function App() {
    const [userId, setUserId] = useState(null); // User ID input
    const [selectedPage, setSelectedPage] = useState("items"); // Page selection
    const [roleData, setRoleData] = useState(null); // Permissions
    const [userDetails, setUserDetails] = useState(null); // User info

    const handlePermissionsFetched = (permissions, userData) => {
        setRoleData(permissions);
        setUserDetails(userData);
    };

    const handleLogout = () => {
        setUserId(null);
        setUserDetails(null);
        setRoleData(null);
        setSelectedPage("items");
        
    };


    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const toast = useRef(null);


    const fetchItems = async () => {
        setLoading(true);
        try {
            const response = await fetch("https://localhost:7245/api/IdealInventoryView");
            if (!response.ok) throw new Error('Failed to fetch items from IdealInventoryView');

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
                const response = await fetch(`/api/IdealInventoryView/${item.itemId}`, {
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

        // Show success message after processing all items
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







    function Header() {
        return (
            <header className="app-header">
                <img src={jagSolo} alt="Jaguar Logo" className="brand-logo" />
                <h2 className="header-title">PAR DASHBOARD</h2>
                <img src={USAH} alt="USA Health Header" className="header-image" />
            </header>
        );
    }









    const menuItems = [
        { label: "Inventory", icon: "pi pi-box", command: () => setSelectedPage("items") },
        { label: "Rules", icon: "pi pi-cog", command: () => setSelectedPage("rules") },
        ...(roleData?.editUser ? [{ label: "Users", icon: "pi pi-users", command: () => setSelectedPage("users") }] : []),
        { label: "Notes", icon: "pi pi-file-edit", command: () => setSelectedPage("notes") },
        { label: "Reports", icon: "pi pi-file", command: () => setSelectedPage("reports") },
        ...(roleData?.refresh ? [{ label: "Resfresh par_db", icon: "pi pi-refresh", command: () => fetchItems() }] : []),
        { label: "Logout", icon: "pi pi-sign-out", command: () => handleLogout() }
    ];


    





    return (
        <div className="app-wrapper">

            {/* Show login form until user logs in */}
            {!userDetails && (
                <>
                    <UserIDInput setUserId={setUserId} />
                    {userId && (
                        <UserData userId={userId} onPermissionsFetched={handlePermissionsFetched} />
                    )}
                </>
            )}

            {/* Once logged in, show full dashboard */}
            {userDetails && roleData && (
                <>
                    {roleData.seeAlerts === true && <ParAlert />}
                    <Header />
                    <Menubar
                        model={menuItems}
                        className="app-menubar stylish-menubar"
                        style={{ padding: '0 2rem' }}
                    />
                    <Toast ref={toast} />


                    <div style={{ marginTop: "2rem" }} className="card">
                        {/*Items*/ }
                        {selectedPage === "items" && <AllItemsList permissionData={roleData} />}

                        {/*Rules*/}
                        {selectedPage === "rules" && (
                            <RulesList
                                userData={userDetails}
                                createRule={roleData.createRule}
                                editRule={roleData.editRule}
                            />
                        )}

                        {/*Users*/}
                        {selectedPage === "users" && (
                            <div >
                                <UsersList editUser={roleData.editUser} createUser={ roleData.createUser} />
                                
                            </div>
                        )}

                        {/*Notes*/}
                        {selectedPage === "notes" && (
                            <NotesTable userId={userId} />
                        )}
                        {selectedPage === "reports" && <ReportPage />}
                    </div>
                </>
            )}
        </div>
    );
}

export default App;
