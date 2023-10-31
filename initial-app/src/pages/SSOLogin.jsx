import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BE_URL = "http://127.0.0.1:3001";

const SSOLogin = () => {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Parse the Authorization Code from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        console.log("Authorization Code:", code);

        if (code) {
          // Create a post request to your backend endpoint for token exchange
          const response = await axios.post(`${BE_URL}/oauth/tokenExchange`, { code: code });

          if (response.status === 200) {
            const accessToken = response.data.access_token;
            console.log("Access Token:", accessToken);

            // Make a GET request to retrieve user information using the access token
            const userInfoResponse = await axios.post(`${BE_URL}/oauth/userinfo`, {accessToken: accessToken });

            if (userInfoResponse.status === 200) {
              const userInfo = userInfoResponse.data;
              console.log("User Information:", userInfo);
              navigate("/user-profile",{state:{userInfo}});
            }
          }
        }
      } catch (error) {
        setErrorMsg("Error fetching access token or user information: " + error.message);
      }
    };

    fetchData();
  }, [navigate]);

  return (
    <div>
      {errorMsg ? (
        <p>Error: {errorMsg}</p>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default SSOLogin;
