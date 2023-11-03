import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BE_URL = "http://127.0.0.1:3001";

const SSOLogin = ({ login }) => {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Parse the Authorization Code from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");

        if (code) {
          // Create a post request to your backend endpoint for token exchange
          const response = await axios.post(`${BE_URL}/oauth/tokenExchange`, { code: code });

          if (response.status === 200) {
            // const accessToken = response.data.access_token;
            localStorage.setItem("user", JSON.stringify(response.data))
            localStorage.setItem("sso", true)
            login()
            navigate("/user-profile")
            // const config = {
            //   headers: { Authorization: `Bearer ${accessToken}` }
            // };
            // const userInfoResponse = await axios.get(`${BE_URL}/oauth/userinfo`, config);

            // if (userInfoResponse.status === 200) {
            //   const userInfo = userInfoResponse.data;
            //   navigate("/user-profile", { state: { userInfo } });
            // }
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
