import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserProfile = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState()
  const BE_URL = "http://127.0.0.1:3001";
  useEffect(() => {
    // alert("OTP is 123456"); 
    if (!localStorage.getItem("user")) {
      navigate("/login")
    }
    const data = JSON.parse(localStorage.getItem("user"))
    const token = data.accessToken || data.access_token
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    getUserInfo(config)
  }, [])

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account?')) {
      try {
        const data = JSON.parse(localStorage.getItem('user'));
        const config = {
          headers: { Authorization: `Bearer ${data.accessToken}` },
        };

        // Make a DELETE request to your server to delete the user account
        await axios.delete(`${BE_URL}/oauth/deleteaccount`, config);

        // Clear user-related data from localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('sso');

        // Redirect the user to the login page after successful deletion
        navigate('/login');
      } catch (error) {
        console.error('Error deleting account:', error);
        // Handle any error conditions here, e.g., show an error message to the user
      }
    }
  };

  const getUserInfo = async (config) => {
    let userInfoResponse;
    if (localStorage.getItem("sso")) {
      userInfoResponse = await axios.get(`${BE_URL}/oauth/userinfo`, config)
    }
    else {
      userInfoResponse = await axios.get(`${BE_URL}/user/userinfo`, config)
    }
    if (userInfoResponse.status === 200) {
      const respData = userInfoResponse.data
      setUserInfo({ ...respData });
    }
  }
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
          {!localStorage.getItem("sso") &&
            <button className={`p-3 mx-2 my-2 custom-button-primary margin-2`} onClick={handleDeleteAccount}>Delete Account</button>
          }
        </div>
      ) : (
        <p>No user information available.</p>
      )} 
    </div>
  );
};

export default UserProfile;
