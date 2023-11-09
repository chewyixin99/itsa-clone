import React, { useState, useEffect } from "react";
import axios from "axios";
const BE_URL = `${import.meta.env.VITE_BACKEND_URL}:${import.meta.env.VITE_BACKEND_PORT}`


const UserManagement = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("user"))
        
        const token = data.accessToken || data.access_token
        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };
        axios.get(`${BE_URL}/user/getallusers`, config)
        .then((response) => {
            setUsers(response.data);
        })
        .catch((error) => {
            console.error("Error fetching users:", error);
        });
    }, []);

    return (
        <div>
        <h1>User Management</h1>
        <table>
            <thead>
            <tr>
                {users.length > 0 && Object.keys(users[0]).map((key) => (
                <th key={key}>{key}</th>
                ))}
            </tr>
            </thead>
            <tbody>
            {users.map((user, index) => (
                <tr key={index}>
                {Object.values(user).map((value, vIndex) => (
                    <td key={vIndex}>{value}</td>
                ))}
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    );
};

export default UserManagement;
