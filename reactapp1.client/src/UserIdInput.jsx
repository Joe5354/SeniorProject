import React, { useState } from "react";
import './UserIDInput.css'; // Assume the styles are in a separate CSS file
import jagSolo from './assets/JaguarSolo.png';
import USAH from './assets/USAH.png';
function UserIDInput({ setUserId }) {
    const [idInputValue, setIdInputValue] = useState("");

    const handleIdInputChange = (event) => {
        setIdInputValue(event.target.value);
    };

    const handleIdSubmit = (event) => {
        event.preventDefault();
        setUserId(idInputValue);
    };

    return (
        <div className="container">
            <div className="content">
                <div className="logo">
                    <img src={jagSolo} alt="PAR Dashboard Logo" className="logo-img" />
                </div>
                <div className="logo">
                    <img src={USAH} alt="PAR Dashboard Logo" className="logo-img" />
                </div>
                <h1 className="title">PAR DASHBOARD</h1>
                <form onSubmit={handleIdSubmit} className="input-form">
                    <input
                        type="text"
                        value={idInputValue}
                        onChange={handleIdInputChange}
                        placeholder="Enter Employee ID"
                        className="input-field"
                    />
                    <button type="submit" className="submit-button">Submit</button>
                </form>
            </div>
        </div>
    );
}

export default UserIDInput;
