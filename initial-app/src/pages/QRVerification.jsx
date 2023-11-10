import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// To be shifted out
const BE_URL = `${import.meta.env.VITE_BACKEND_URL}:${
  import.meta.env.VITE_BACKEND_PORT
}`;

const QRVerification = ({ login }) => {
  const navigate = useNavigate();
  const [enteredCode, setEnteredCode] = useState(""); // State for user-entered code
  const [isVerified, setIsVerified] = useState(false); // State for verification status
  const [errorMsg, setErrorMsg] = useState("");
  let username = localStorage.getItem("username");

  // Function to handle code submission
  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    // Check if the entered code matches the QR code data
    if (enteredCode) {
      try {
        console.log(sessionStorage.getItem("page"));
        if (!username) {
          const data = JSON.parse(localStorage.getItem("user"));
          username = data.email;
        }

        const response = await axios.post(`${BE_URL}/oauth/validateqr`, {
          email: username,
          code: enteredCode,
        });

        if (response.status !== 200) {
          console.log(response);
          // More general error to prevent people from hacking?
          setErrorMsg("Invalid OTP. Please try again");
          return;
        }

        console.log(sessionStorage.getItem("page"));
        if (sessionStorage.getItem("page") === "changepw") {
          console.log("hei");
          const data = JSON.parse(localStorage.getItem("user"));
          const token = data.accessToken || data.access_token;
          const config = {
            headers: { Authorization: `Bearer ${token}` },
          };

          const pwData = JSON.parse(sessionStorage.getItem("pwObject"));
          const changePW = await axios.put(
            `${BE_URL}/oauth/password`,
            pwData,
            config
          );
          changePW.status === 200
            ? setIsVerified(true)
            : setErrorMsg("Error, unable to update password");
          sessionStorage.clear();
          setTimeout(() => {
            navigate("/user-profile", {
              replace: true,
            });
          }, 1500);
        } else {
          localStorage.setItem("user", JSON.stringify(response.data));
          localStorage.removeItem("username");
          login();
          navigate("/user-profile", {
            replace: true,
          });
        }

        sessionStorage.removeItem("page");
      } catch (error) {
        setErrorMsg("Invalid OTP, try again");
      }
    }
  };

  return (
    <div className="flex h-[90vh] my-auto mx-auto justify-center items-center bg-gray-50">
      <div className="border rounded-md min-w-[50vh] bg-white">
        <h2 className="p-5 bg-[#0f385c] rounded-t-md text-white">
          Authenticator Code Verification
        </h2>
        <hr />
        <div className="text-center my-5">
          <p>Enter the code from Google Authenticator:</p>
          <input
            className="m-2 border h-10 w-32 text-center form-control rounded"
            type="text"
            value={enteredCode}
            onChange={(e) => setEnteredCode(e.target.value)}
          />
        </div>
        <div className="text-center mb-5">
          <button
            className="p-3 mx-2 custom-button-primary text-white"
            onClick={handleCodeSubmit}
          >
            Submit Code
          </button>
        </div>
        {isVerified && (
          <div className="text-center text-green-500">
            Code is verified. You can proceed.
          </div>
        )}
        {!isVerified && isVerified !== "" && (
          <div className="text-center text-red-500">{errorMsg}</div>
        )}
      </div>
    </div>
  );
};

export default QRVerification;
