import React, { useState, useEffect } from "react";
import axios from "axios";
const BE_URL = `${import.meta.env.VITE_BACKEND_URL}:${
  import.meta.env.VITE_BACKEND_PORT
}`;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const onEditClick = () => {
    setIsEditing(!isEditing);
  };

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("user"));

    const token = data.accessToken || data.access_token;
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    axios
      .get(`${BE_URL}/user/getallusers`, config)
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, []);

  return (
    <div className="h-[100vh] p-3 bg-gray-50">
      <h1 className="pt-1 pb-6">User Management</h1>
      <table className="bg-white">
        <thead>
          <tr>
            {users.length > 0 &&
              Object.keys(users[0]).map((key) => {
                return (
                  <th className="p-3 font-semibold border" key={key}>
                    <div>{key}</div>
                  </th>
                );
              })}
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={index}>
              {Object.values(user).map((value, vIndex) => (
                <td className="p-3 border" key={vIndex}>
                  <div>{value}</div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
