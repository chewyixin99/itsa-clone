import React, { useState, useEffect } from "react";
import axios from "axios";
const BE_URL = `${import.meta.env.VITE_BACKEND_URL}:${
  import.meta.env.VITE_BACKEND_PORT
}`;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(false); // Track editing state
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

  const handleEditUser = (user) => {
    // Set the user to be edited
    setEditedUser({ ...user });
    // Enable editing mode
    setIsEditing(true);
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
        // await axios.put(`${BE_URL}/user/updateuser/${editedUser.id}`, editedUser, config);
        // Disable editing mode after saving
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const userKeys = users.length > 0 ? Object.keys(users[0]) : [];

  return (
    <div className="h-[100vh] p-3 bg-gray-50">
      <h1 className="pt-1 pb-6">User Management</h1>
      <table className="centered-table text-left">
        <thead>
          <tr>
            {isAdmin && (
              <>
                {userKeys.map((key) => (
                  <th className="p-3 min-w-[15vw] max-w-[15vw] bg-white border" key={key}>{key}</th>
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
                    <td key={key} className="bg-white p-3 min-w-[15vw] max-w-[15vw] border">
                      {isEditing && editedUser && editedUser.id === user.id ? (
                        <input
                        className="w-[13vw]"
                          type="text"
                          value={editedUser[key]}
                          onChange={(e) =>
                            setEditedUser({
                              ...editedUser,
                              [key]: e.target.value,
                            })
                          }
                        />
                      ) : (
                        user[key]
                      )}
                    </td>
                  ))}
                  <td>
                    {isEditing && editedUser && editedUser.id === user.id ? (
                      <button
                        className={`p-3 mx-2 my-2 custom-button-primary margin-2`}
                        onClick={handleSaveUser}
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        className={`p-3 mx-2 my-2 custom-button-primary margin-2`}
                        onClick={() => handleEditUser(user)}
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
