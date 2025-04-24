import React, { useState, useEffect } from "react";

function UserData({ userId, onPermissionsFetched }) {
    const [userData, setUserData] = useState(null);
    const [userRolePermissions, setUserRolePermissions] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true); // Add loading state
    const [previousUserId, setPreviousUserId] = useState(null); // Track previous userId

    useEffect(() => {
        if (!userId || userId === previousUserId) return; // Skip fetch if userId is the same or null
        setLoading(true); // Start loading
        setError(null); // Reset error state before fetching data
        setUserData(null); // Reset userData before fetch
        setUserRolePermissions(null); // Reset role permissions before fetch

        async function fetchUserData() {
            try {
                // Fetch user data
                const userResponse = await fetch(`https://localhost:7245/api/user/${userId}`);
                if (!userResponse.ok) {
                    throw new Error("User not found");
                }
                const userData = await userResponse.json();

                // Check if user is active
                if (!userData.isActive) {
                    setError("User is not active.");
                    return; // Stop further execution if user is not active
                }

                setUserData(userData); // Store user data

                // Fetch role data based on user's roleId
                const roleResponse = await fetch(`https://localhost:7245/api/userrole/${userData.userRoleId}`);
                if (!roleResponse.ok) {
                    throw new Error("Role permissions not found");
                }
                const roleData = await roleResponse.json();
                console.log("Role data fetched:", roleData);
                setUserRolePermissions(roleData);

                // Pass both user data and role permissions data to App.jsx via callback
                if (onPermissionsFetched) {
                    onPermissionsFetched(roleData, userData); // Pass both roleData and userData
                }

                localStorage.setItem('userId', userData.userId);
                localStorage.setItem('userRoleId', userData.userRoleId);
                setPreviousUserId(userId); // Set previousUserId after fetching
            } catch (error) {
                setError(error.message);
                if (onPermissionsFetched) {
                    onPermissionsFetched(null, null); // signal error/reset
                }
            } finally {
                setLoading(false); // Set loading state to false after fetching
            }
        }

        fetchUserData(); // Call the function to fetch user data

    }, [userId, onPermissionsFetched, previousUserId]); // Add previousUserId to dependencies

    if (loading) {
        return <div>Loading...</div>; // Show loading while fetching
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!userData || !userRolePermissions) {
        return <div>No data available</div>; // Fallback when data is not available
    }

    return null;
}

export default UserData;
