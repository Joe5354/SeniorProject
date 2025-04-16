import React, { useState, useEffect } from "react";

function UserData({ userId }) {
    // State to store user data
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);

    // Fetch user data and roleId when userId changes
    useEffect(() => {
        if (!userId) return;

        // Reset error and data before new fetch
        setError(null);
        setUserData(null);

        async function fetchUserData() {
            try {
                const response = await fetch(`https://localhost:7245/api/user/${userId}`);
                if (!response.ok) {
                    throw new Error('User not found');
                }

                const data = await response.json();
                setUserData(data);
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('userRoleId', data.userRoleId);
            } catch (error) {
                setError(error.message);
            }
        }

        fetchUserData();
    }, [userId]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!userData) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>User Data</h1>
            <p>User ID: {userData.userId}</p>
            <p>Role ID: {userData.userRoleId}</p>
        </div>
    );
}

export default UserData;  // Export this properly as well