import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserProfile = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState();
  const [userRoles, setUserRoles] = useState([]);
  const BE_URL = `${import.meta.env.VITE_BACKEND_URL}:${
    import.meta.env.VITE_BACKEND_PORT
  }`;
  useEffect(() => {
    // alert("OTP is 123456");
    if (!localStorage.getItem("user")) {
      navigate("/login");
    }
    const data = JSON.parse(localStorage.getItem("user"));
    setUserRoles(data.roles); // Set userRoles
    const token = data.accessToken || data.access_token;
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    getUserInfo(config);
  }, []);

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account?")) {
      try {
        const data = JSON.parse(localStorage.getItem("user"));
        const config = {
          headers: { Authorization: `Bearer ${data.accessToken}` },
        };

        // Make a DELETE request to your server to delete the user account
        await axios.delete(`${BE_URL}/oauth/deleteaccount`, config);

        // Clear user-related data from localStorage
        localStorage.removeItem("user");
        localStorage.removeItem("sso");

        // Redirect the user to the login page after successful deletion
        navigate("/login");
      } catch (error) {
        console.error("Error deleting account:", error);
        // Handle any error conditions here, e.g., show an error message to the user
      }
    }
  };

  const handleAuthorizeUserManagement = () => {
    if (userRoles.includes("admin") || userRoles.includes("moderator")) {
      navigate("/user-management");
    }
  };

  const getUserInfo = async (config) => {
    let userInfoResponse;
    if (localStorage.getItem("sso")) {
      userInfoResponse = await axios.get(`${BE_URL}/oauth/userinfo`, config);
    } else {
      userInfoResponse = await axios.get(`${BE_URL}/user/userinfo`, config);
    }
    if (userInfoResponse.status === 200) {
      const respData = userInfoResponse.data;
      setUserInfo({ ...respData });
    }
  };
  return (
    <div className="h-[100vh] p-3 bg-gray-50">
      {userInfo ? (
        <div>
          <h1 className="pt-1 pb-6">User Profile</h1>
          <div className="max-w-[50vw] bg-white">
            {Object.entries(userInfo).map(([key, value]) => {
              return (
                <div
                  className="flex items-center justify-between border-2"
                  key={key}
                >
                  <div className="font-semibold min-w-[10vw] border-r-2 p-3">
                    {key}
                  </div>
                  <div className="min-w-[40vw] p-3">{value}</div>
                </div>
              );
            })}
          </div>
          <div className="max-w-[50vw] flex justify-end items-center py-3">
            {!localStorage.getItem("sso") && (
              <button
                className={`p-3 mx-2 my-2 custom-button-secondary`}
                onClick={handleDeleteAccount}
              >
                Delete Account
              </button>
            )}
            {userRoles.includes("admin") || userRoles.includes("moderator") ? (
              <button
                className={`p-3 mx-2 my-2 custom-button-primary`}
                onClick={handleAuthorizeUserManagement}
              >
                User Management
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <p>No user information available.</p>
      )}
    </div>
  );
};

export default UserProfile;
