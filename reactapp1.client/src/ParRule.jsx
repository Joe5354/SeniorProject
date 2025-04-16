import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
function rulesList() { //make a .jsx file in /src labeled Items
    const [rules, setRules] = useState([]); //<-- create/set table to be displayed on the web page 

    useEffect(() => {//get the backend data (7245 is the port my backend is running on. this may be different for you.)
        fetch("https://localhost:7245/api/ParRule")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch items");
                }
                return response.json();
            })
            .then((data) => setRules(data))
            .catch((error) => console.error("Error fetching items:", error));
    }, []); // Runs once on mount

    return (//this is a javascript/ primereact datatable where we pass our fetched .json table "items". From here, refer to Primereact datatable documentation.
        <div className="p-6">
            <h1>Rules List</h1>
            <DataTable value={rules} paginator rows={5} responsiveLayout="scroll">
                <Column field="parItemId" header="Par Item ID" sortable />
                <Column field="parValue" header="Par Value" sortable />
                <Column field="createdByUser" header="Crated By" sortable />
                <Column field="dateCreated" header="Date Created" sortable />
                <Column field="isActive" header="Rule is Active?" sortable />
            </DataTable>
        </div>
    );
}

export default rulesList;//this allows us to call AllitemsList from App.jsx! as <AllitemsList />