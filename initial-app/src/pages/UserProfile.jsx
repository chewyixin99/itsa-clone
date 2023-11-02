import React from "react";
import { useLocation } from "react-router-dom";

const UserProfile = () => {
  const location = useLocation();
  const userInfo = location.state && location.state.userInfo;

  return (
    <div style={{ display: "flex", justifyContent: "center", height: "100vh", padding: "50px" }}>
      {userInfo ? (
        <div>
          <h1>User Profile</h1>
          <table style={{ border: "2px solid black", padding: "30px", borderRadius: "10px" }}>
            <tbody>
              {Object.entries(userInfo).map(([key, value]) => (
                <tr key={key}>
                  <td>{key}:</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No user information available.</p>
      )}
    </div>
  );
};

export default UserProfile;
