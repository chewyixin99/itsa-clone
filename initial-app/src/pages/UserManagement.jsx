import React, { useState, useEffect } from "react";
import axios from "axios";
const BE_URL = `${import.meta.env.VITE_BACKEND_URL}:${import.meta.env.VITE_BACKEND_PORT}`;

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [editedUserIndex, setEditedUserIndex] = useState(-1); // Track the index of the user being edited
    const [editedUser, setEditedUser] = useState(null); // Store the user being edited
    const currentUser = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("user"));
        const token = data.accessToken || data.access_token;
        const config = {
            headers: { Authorization: `Bearer ${token}` },
        };
        axios
            .get(`${BE_URL}/user/getallusers`, config)
            .then((response) => {
                setUsers(response.data.slice(0, 50));
            })
            .catch((error) => {
                console.error("Error fetching users:", error);
            });
    }, []);

    const isAdmin = currentUser && currentUser.roles.includes("admin");

    const handleEditUser = (user, index) => {
        if (editedUserIndex === -1) {
            // Set the user to be edited
            setEditedUserIndex(index);
            setEditedUser({ ...user });
        }
    };

    const handleSaveUser = async () => {
        try {
            // Implement logic to save the edited user information to the database
            if (editedUser) {
                const data = JSON.parse(localStorage.getItem("user"));
                const token = data.accessToken || data.access_token;
                const config = {
                    headers: { Authorization: `Bearer ${token}` },
                };
                await axios.patch(`${BE_URL}/user/userinfo/`, editedUser, config);

                // Disable editing mode after saving
                setEditedUserIndex(-1);
                setEditedUser(null);
                window.location.reload();
            }
        } catch (error) {
            console.error("Error saving user:", error);
        }
    };

    const userKeys = users.length > 0 ? Object.keys(users[0]) : [];

    return (
        <div className="h-[100vh] p-3 bg-gray-50">
            <h1 className="pt-1 pb-6">User Management</h1>
            <table className="centered-table text-left min-w-[95vw] max-w-[95vw] w-[95vw]">
                <thead>
                    <tr>
                        {isAdmin && (
                            <>
                                {userKeys.map((key) => (
                                    <th className="p-3 bg-white border" key={key}>
                                        {key
                                            .replace(/_/g, " ") // Replace underscores with spaces
                                            .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1)) // Capitalize the first letter
                                            .replace("CreatedAt", "Created Date")
                                            .replace("UpdatedAt", "Updated Date")
                                        }
                                    </th>
                                ))}
                                <th className="p-3">Edit</th>
                            </>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <tr key={index}>
                            {isAdmin && (
                                <>
                                    {userKeys.map((key) => (
                                        <td key={key} className="bg-white p-3 border">
                                            {editedUserIndex === index ? (
                                                key === "id" || key === "sub" || key === "email" ? (
                                                    user[key]
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={editedUser[key]}
                                                        onChange={(e) =>
                                                            setEditedUser({
                                                                ...editedUser,
                                                                [key]: e.target.value,
                                                            })
                                                        }
                                                    />
                                                )
                                            ) : (
                                                user[key]
                                            )}
                                        </td>
                                    ))}
                                    <td>
                                        {editedUserIndex === index ? (
                                            <button
                                                className={`p-3 mx-2 my-2 custom-button-primary margin-2`}
                                                onClick={handleSaveUser}
                                            >
                                                Save
                                            </button>
                                        ) : (
                                            <button
                                                className={`p-3 mx-2 my-2 custom-button-secondary border margin-2`}
                                                onClick={() => handleEditUser(user, index)}
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagement;
