import React from "react";
import { useLocation } from "react-router-dom";

const UserProfile = () => {
  const location = useLocation();
  const userInfo = location.state && location.state.userInfo;

  return (
    <div style={{ display: "flex", justifyContent: "center",height: "100vh",padding: "50px"}}>
      {userInfo ? (
        <div>
          <h1>User Profile</h1>
          <table style={{ border: "2px solid black", padding: "30px", borderRadius: "10px" }}>
            <tr>
              <td>Sub:</td>
              <td>{userInfo.sub}</td>
            </tr>
            <tr>
              <td>Email:</td>
              <td>{userInfo.email}</td>
            </tr>
            <tr>
              <td>Given Name:</td>
              <td>{userInfo.given_name}</td>
            </tr>
            <tr>
              <td>Family Name:</td>
              <td>{userInfo.family_name}</td>
            </tr>
            <tr>
              <td>Name:</td>
              <td>{userInfo.name}</td>
            </tr>
            <tr>
              <td>Birthdate:</td>
              <td>{userInfo.birthdate}</td>
            </tr>
            <tr>
              <td>Gender:</td>
              <td>{userInfo.gender}</td>
            </tr>
            <tr>
              <td>Phone Number:</td>
              <td>{userInfo.phone_number}</td>
            </tr>
          </table>
        </div>
      ) : (
        <p>No user information available.</p>
      )}
    </div>
  );
};

export default UserProfile;
