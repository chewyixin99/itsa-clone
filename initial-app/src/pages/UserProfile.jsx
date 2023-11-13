import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserProfile = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState();
  const [userRoles, setUserRoles] = useState([]);
  const [isEditing, setIsEditing] = useState(false); // Edit mode state
  const [editedUserInfo, setEditedUserInfo] = useState({}); // Store edited user info
  const BE_URL = `${import.meta.env.VITE_BACKEND_URL}` 
  
  useEffect(() => {
    // alert("OTP is 123456");
    if (!localStorage.getItem("user")) {
      return navigate("/login");
    }
    getUserInfo();
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
        return navigate("/login");
      } catch (error) {
        if (error.response.status === 401) {
          return navigate("/login");
        }
        console.error("Error deleting account:", error);
        // Handle any error conditions here, e.g., show an error message to the user
      }
    }
  };

  const handleChangePassword = () => {
    navigate("/change-password");
  };

  const handleOTPVerificationMethod = () => {
    navigate("/otp-verification-method");
  }

  const handleAuthorizeUserManagement = () => {
    if (userRoles.includes("admin") || userRoles.includes("moderator")) {
      navigate("/user-management");
    }
  };

  const getUserInfo = async () => {
    const data = JSON.parse(localStorage.getItem("user"));
    const token = data.accessToken || data.access_token;
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    let userInfoResponse;
    try {
      if (localStorage.getItem("sso")) {
        userInfoResponse = await axios.get(`${BE_URL}/oauth/userinfo`, config);
      } else {
        userInfoResponse = await axios.get(`${BE_URL}/user/userinfo`, config);
      }
      if (userInfoResponse.status === 200) {
        setUserRoles(data.roles); // Set userRoles

        const respData = userInfoResponse.data;
        setUserInfo({ ...respData });
      }
      
    } catch (error) {
      if (error.response.status === 401) {
        return navigate("/login", {
          replace: true
        });
      }
    }
  };

  const capitalizeAndReplaceUnderscores = (key) => {
    return key
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1)); // Capitalize the first letter
  };
  const handleToggleEdit = () => {
    // Toggle edit mode
    if (!isEditing) {
      // Entering edit mode, populate editedUserInfo with current user info
      setEditedUserInfo({ ...userInfo });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveUserInfo = async () => {
    try {
      // Make a PATCH request to update user info
      const data = JSON.parse(localStorage.getItem("user"));
      const token = data.accessToken || data.access_token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json", // Set the content type to JSON
        },
      };
      const {email, family_name, given_name} = editedUserInfo;
      
      const updateUserInfo =  {
        email: email,
        first_name: given_name,
        last_name: family_name
      }
      
      // Send a PATCH request to update the user information
      const response = await axios.patch(`${BE_URL}/user/userinfo`, updateUserInfo, config);

      if (response.status === 200) {
        // Update the userInfo state with the edited user information
        setUserInfo({ ...editedUserInfo });
        setIsEditing(false);
        window.location.reload();
      }
    } catch (error) {
      if (error.response.status === 401) {
        return navigate("/login");
      }
      console.error("Error saving user info:", error);
      // Handle any error conditions here
    }
  };
  
  const handleCancelEdit = () => {
    // Exit edit mode
    setIsEditing(false);
  };
  return (
    <div className="h-[100vh] p-3 bg-gray-50">
      {userInfo ? (
        <div>
          <h1 className="pt-1 pb-6">User Profile</h1>
          <div className="max-w-[50vw] bg-white">
          {Object.entries(userInfo).map(([key, value]) => {
              // Check if the key is "sub" or "email"
              if (key === "sub" || key === "email" || key==="name") {
                return (
                  <div
                    className="flex items-center justify-between border-2"
                    key={key}
                  >
                    <div className="font-semibold min-w-[10vw] border-r-2 p-3">
                      { (key === "sub") ? "ID" : capitalizeAndReplaceUnderscores(key)}
                    </div>
                    <div className="min-w-[40vw] p-3">{value}</div>
                  </div>
                );
              }
              return (
                <div
                  className="flex items-center justify-between border-2"
                  key={key}
                >
                  <div className="font-semibold min-w-[10vw] border-r-2 p-3">
                    {capitalizeAndReplaceUnderscores(key)}
                  </div>
                  <div className="min-w-[40vw] p-3">
                    {isEditing ? (
                      <input
                        className={`w-full ${isEditing ? 'editableInput': ''}`}
                        type="text"
                        value={editedUserInfo[key]}
                        onChange={(e) =>
                          setEditedUserInfo({
                            ...editedUserInfo,
                            [key]: e.target.value,
                          })
                        }
                      />
                    ) : (
                      value
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="max-w-[50vw] flex justify-end items-center py-3">
            <button
                className={`p-3 mx-2 my-2 custom-button-primary`}
                onClick={handleOTPVerificationMethod}
              >
                OTP verification method
            </button>
            <button
                className={`p-3 mx-2 my-2 custom-button-primary`}
                onClick={handleChangePassword}
              >
                Change Password
            </button>
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
            {userRoles.includes("admin") ||
            userRoles.includes("moderator") ||
            userRoles.includes("user") ? (
              <div>
                {isEditing ? (
                  <button
                    className={`p-3 mx-2 my-2 custom-button-secondary`}
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                ) : null}
                <button
                  className={`p-3 mx-2 my-2 ${
                    isEditing
                      ? "custom-button-primary"
                      : "custom-button-secondary"
                  }`}
                  onClick={isEditing ? handleSaveUserInfo : handleToggleEdit}
                >
                  {isEditing ? "Save" : "Edit"}
                </button>
              </div>
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


