import { useEffect, useState } from 'react';
import './App.css';

// Custom Components
import AllItemsList from './Items';
import UsersList from './Users';
import RulesList from './ParRule';
import UserData from './UserData';
import UserIDInput from './UserIdInput';
import CreateNewUserForm from './CreateNewUserForm.jsx';
import NotesTable from './ParNoteTable.jsx';
import ParAlert from './ParAlert.jsx';

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
    const [showCreateUserDialog, setShowCreateUserDialog] = useState(false); // Dialog state
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

    useEffect(() => {
        if (userDetails) {
            console.log("User details updated:", userDetails);
        }
        /*
        List < VwItemInventory > invItems = await idealContext.VwItemInventories.ToListAsync();
        foreach(var idealItem in invItems)
        {
            await Idealcontroller.PushItem(idealItem.ItemId, idealItem);
        }*/

    }, [userDetails]);

    const menuItems = [
        { label: "Inventory", icon: "pi pi-box", command: () => setSelectedPage("items") },
        { label: "Rules", icon: "pi pi-cog", command: () => setSelectedPage("rules") },
        ...(roleData?.editUser ? [{ label: "Users", icon: "pi pi-users", command: () => setSelectedPage("users") }] : []),
        { label: "Notes", icon: "pi pi-file-edit", command: () => setSelectedPage("notes") }
    ];



    return (
        <div className="ParDashboard">

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
                    {roleData.editRule === true && <ParAlert />}
                    <div style={{ marginBottom: "1rem" }}>
                        <h2>Welcome, {userDetails.firstName} {userDetails.lastName}</h2>
                        <p>Employee ID: {userDetails.employeeId}</p>
                        <Button label="Logout" icon="pi pi-sign-out" onClick={handleLogout} className="p-button-danger" />
                    </div>


                    <Menubar model={menuItems} />



                    <div style={{ marginTop: "2rem" }}>
                        {/*Items*/ }
                        {selectedPage === "items" && <AllItemsList permissionData={roleData} />}

                        {/*Rules*/}
                        {selectedPage === "rules" && (
                            <RulesList
                                userData={userDetails}
                                createRule={roleData.createRule}
                                editRule={roleData.EditRule}
                            />
                        )}

                        {/*Users*/}
                        {selectedPage === "users" && (
                            <div>
                                <UsersList />
                                <Button
                                    label="Create New User"
                                    icon="pi pi-user-plus"
                                    onClick={() => setShowCreateUserDialog(true)}
                                    style={{ marginTop: '1rem' }}
                                />
                                <CreateNewUserForm
                                    visible={showCreateUserDialog}
                                    onHide={() => setShowCreateUserDialog(false)}
                                    onSuccess={(newUser) => {
                                        console.log("New user created:", newUser);
                                        // Refresh users list or show toast
                                    }}
                                />
                            </div>
                        )}

                        {/*Notes*/}
                        {selectedPage === "notes" && (
                            <NotesTable/>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default App;
