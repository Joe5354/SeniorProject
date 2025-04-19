//react imports
import { useEffect, useState } from 'react';
import './App.css';
//custom components
import AllItemsList from './Items';
import UsersList from './Users';
import RulesList from './ParRule';
import UserData from './UserData';
import UserIDInput from './UserIdInput';
import CreateNewUserForm from './CreateNewUserForm.jsx';
//primereact component imports
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Menubar } from 'primereact/menubar';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { FilterMatchMode } from "primereact/api";
//primereact resource imports
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
///App functionality
function App() {
    const [userId, setUserId] = useState(null); {/*who is using the app? (userId) */ }
    const [selectedPage, setSelectedPage] = useState("items"); {/* what is displayed on the page? (dependent on menuBar selection) */ }
    const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
    const [roleData, setRoleData] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const handlePermissionsFetched = (permissions, userData) => {
        setRoleData(permissions);
        setUserDetails(userData);
    };
    useEffect(() => {
        if (userDetails) {
            console.log("User details updated:", userDetails);
        }
    }, [userDetails]);

    const menuItems = [
        {
            label: "Inventory",
            icon: "pi pi-box",
            command: () => setSelectedPage("items")
        },
        {
            label: "Rules",
            icon: "pi pi-cog",
            command: () => setSelectedPage("rules")
        },
        {
            label: "Users",
            icon: "pi pi-users",
            command: () => setSelectedPage("users")
        },
        {
            label: "Notes",
            icon: "pi pi-file-edit",
            command: () => setSelectedPage("notes")
        }
    ];
    return (
        <div className="ParDashboard">
            <UserIDInput setUserId={setUserId} /> {/* display and use UserIdInput form */}
            <UserData userId={userId} onPermissionsFetched={handlePermissionsFetched} />
            <div>{userDetails && (
                <div>
                    <h2>User Details</h2>
                    <p>First Name: {userDetails.firstName}</p>
                    <p>Last Name: {userDetails.lastName}</p>
                    <p>Username: {userDetails.username}</p>
                    <p>Employee ID: {userDetails.employeeId}</p>
                </div>
            )}
            </div>
            {/*<div>{roleData ? (
                <ul>
                    {Object.keys(roleData).map((permission) => (
                        <li key={permission}>
                            {permission}: {roleData[permission] ? "Yes" : "No"}
                        </li>
                    ))}
                </ul>
            ) : (
                <div>No permissions available</div>
            )}
            </div>*/}
            <Menubar model={menuItems} />{/* Render the menubar */}
            <div style={{ marginTop: "2rem" }}>
                {selectedPage === "items" && <AllItemsList />}  {/* if selectedtable state == "items", then display my AllitemsList component defined in ./AllItemsList.jsx */}
                {selectedPage === "rules" && roleData && (
                    <RulesList
                        userData={userDetails}
                        createRule={roleData.createRule}
                        editRule={roleData.EditRule}
                    />
                )}  
                {selectedPage === "users" &&
                    <div>
                        <UsersList />
                        <Button
                            label="Create New User"
                            icon="pi pi-user-plus"
                            onClick={() => setShowCreateUserDialog(true)}
                            style={{ marginTop: '1rem' }}
                        />
                        <Dialog
                            header="Create New User"
                            visible={showCreateUserDialog}
                            style={{ width: '30vw' }}
                            onHide={() => setShowCreateUserDialog(false)}
                            modal
                        >
                            <CreateNewUserForm onClose={() => setShowCreateUserDialog(false)} />
                        </Dialog>
                    </div>}     {/*     ^^ ./Users.jsx  */}
                {selectedPage === "notes" }  {/* Pass userId to RulesList here too */}
            </div>

        </div>
    );
}
export default App;