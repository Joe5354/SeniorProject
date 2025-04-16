import React, { useState } from "react";

function UserIDInput({ setUserId }) {
    // State to hold the value of the input
    const [idInputValue, setIdInputValue] = useState("");

    // Function to handle the change in input field
    const handleIdInputChange = (event) => {
        setIdInputValue(event.target.value);
    };

    // Function to handle form submission (when user inputs the ID)
    const handleIdSubmit = (event) => {
        event.preventDefault();
        setUserId(idInputValue);  // Set the userId in the parent component
    };

    return (
        <div>
            <h1>Enter User ID</h1>
            <form onSubmit={handleIdSubmit}>
                <label>
                    Your User Id:
                    <input
                        type="text"
                        value={idInputValue}
                        onChange={handleIdInputChange}
                        placeholder="User ID:"
                    />
                </label>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

export default UserIDInput;  // Make sure this is exported