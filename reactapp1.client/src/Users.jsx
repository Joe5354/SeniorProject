import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
function UsersList() { //make a .jsx file in /src labeled Items
    const [users, setUsers] = useState([]); //<-- create/set table to be displayed on the web page 

    useEffect(() => {//get the backend data (7245 is the port my backend is running on. this may be different for you.)
        fetch("https://localhost:7245/api/user")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch items");
                }
                return response.json();
            })
            .then((data) => setUsers(data))
            .catch((error) => console.error("Error fetching items:", error));
    }, []); // Runs once on mount

    return (//this is a javascript/ primereact datatable where we pass our fetched .json table "items". From here, refer to Primereact datatable documentation.
        <div className="p-5">
            <h1>User List</h1>
            <DataTable value={users} paginator rows={5} responsiveLayout="scroll">
                <Column field="userId" header="User" sortable />
                <Column field="username" header="Username" sortable />
                <Column field="email" header="Email" sortable />
                <Column field="employeeId" header="Employee ID" sortable />
                <Column field="isActive" header="Account is Active?" sortable />
            </DataTable>
        </div>
    );
}

export default UsersList;//this allows us to call AllitemsList from App.jsx! as <AllitemsList />