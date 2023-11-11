import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const OTPVerificationMethod = () => {
  const navigate = useNavigate();
  const [otpMethod, setOtpMethod] = useState("");
  const [gAuth, setGAuth] = useState(true);
  const [success, setSuccess] = useState(false);
  const BE_URL = `${import.meta.env.VITE_BACKEND_URL}`

  useEffect(() => {
    if (!localStorage.getItem("user")) {
      navigate("/login");
    }

    const data = JSON.parse(localStorage.getItem("user"));
    const token = data.accessToken || data.access_token;
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    checkGauth(config);
    getUserAuthType(config);
  }, []);

  const checkGauth = async (config) => {
    try{
      const gauthStatus = await axios.get(`${BE_URL}/oauth/checkgauth`, config);
    
      if (gauthStatus.status === 200) {
        !gauthStatus.data.gauth ? setGAuth(false) : setGAuth(true);
      }
    } catch (error) {
      if (error.response.status === 401) {
        navigate("/login");
      }
    }
    
  };

  const getUserAuthType = async (config) => {
    try {
      const authTypeData = await axios.get(
        `${BE_URL}/oauth/userauthtype`,
        config
      );
  
      if (authTypeData.status === 200) {
        authTypeData.data.auth === "email" || authTypeData.data.auth === "none"
          ? setOtpMethod("email")
          : setOtpMethod("googleAuth");
      }
    } catch (error){
      if (error.response.status === 401) {
        navigate("/login");
      }
    }
  };

  const handleChange = (event) => {
    setOtpMethod(event.target.value);
  };

  const handleSubmit = async (event) => {
    const data = JSON.parse(localStorage.getItem("user"));
    const token = data.accessToken || data.access_token;
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    try {
      const updateAuth = await axios.put(
        `${BE_URL}/oauth/authmethod`,
        { auth: otpMethod },
        config
      );
  
      if (updateAuth.status === 200) {
        setSuccess(true)
        setTimeout(() => {
          navigate("/user-profile")
        }, 1000);
        
      }
    } catch (error){
      if (error.response.status === 401) {
        navigate("/login");
      } 
    } 
  };

  return (
    <div className="flex h-[90vh] my-auto mx-auto justify-center items-center bg-gray-50">
      <div className="border rounded-md min-w-[50vh] bg-white">
        <h2 className="p-5 bg-[#0f385c] rounded-t-md text-white">
          Change OTP Method
        </h2>
        <hr />
        <div className="text-center my-5">
          <form>
            <div className="text-left">
              <div>
                <label>
                  <input
                    className={`p-3 mx-2 my-2`}
                    type="radio"
                    value="email"
                    checked={otpMethod === "email"}
                    onChange={handleChange}
                  />
                  Email
                </label>
              </div>
              <div>
                <label>
                  {!gAuth ? (
                    <input
                      className={`p-3 mx-2 my-2`}
                      type="radio"
                      disabled
                      value="googleAuth"
                    />
                  ) : (
                    <input
                      className={`p-3 mx-2 my-2`}
                      type="radio"
                      value="googleAuth"
                      checked={otpMethod === "googleAuth"}
                      onChange={handleChange}
                    />
                  )}
                  Google Authenticator
                  {!gAuth ? (
                    <Link className="custom-basic-link" to="/qr-setup">
                      {" "}
                      Set up now
                    </Link>
                  ) : (
                    ""
                  )}
                </label>
              </div>
            </div>
            <button
              className={`p-3 mx-2 my-2 custom-button-primary`}
              type="button"
              onClick={handleSubmit}
            >
              Save Changes
            </button>
          </form>
          { 
            (success) ? <p >Saved Successfully</p> : ""
          }
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationMethod;
