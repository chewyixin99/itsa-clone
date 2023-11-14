import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiExternalLink } from "react-icons/fi";
import axios from 'axios';

// To be shifted out
const BE_URL = `${import.meta.env.VITE_BACKEND_URL}`
let counter = 0
const Login = ({ login }) => {
  useEffect(() => {
    // alert("OTP is 123456");
    sessionStorage.clear()
    if (localStorage.getItem("user") && counter === 0) {
      counter += 1
      navigate("/user-profile")
    } else if (counter > 0){
      localStorage.clear()
    }
  }, []);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);

  const onLoginClick = async (e) => {
    e.preventDefault();
    if (!isCheckboxChecked) {
      setErrorMsg("Permission is required to fetch your personal information");
      return;
    }

    // Call BE API
    if (username && password) {
      try{
        setLoading(true);
        setErrorMsg("");
        const response = await axios.post(`${BE_URL}/oauth/signin`, { email: username, password: password })

        if (response.status !== 200){
          setLoading(false);
          // More general error to prevent people from hacking? 
          setErrorMsg("Invalid username/password");
          return
        }
        
        localStorage.setItem("username", username)

        if(response.data.type === 1) {
          // OTP via email
          setLoading(false);
          navigate("/otp", {
            replace: true,
          });
        } else if (response.data.type === 2) {
          // OTP via authenticator app
          setLoading(false);
          navigate("/qr", {
            replace: true,
          });
        } else {
          localStorage.setItem("user", JSON.stringify(response.data))
          login()
          navigate("/user-profile")
        }
      } catch (error){
        setLoading(false);
        setErrorMsg("Invalid username/password");
      }
    }
  };

  const onCheckboxChange = (e) => {
    setIsCheckboxChecked(e.target.checked);
  };
  
  const onRegisterClick = async (e) => {
    e.preventDefault();

    navigate("/register", {
      replace: true,
    });
  };

  const onUsernameChange = (e) => {
    setUsername(e.target.value);
  };
  const onPasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const onBankSSOLoginClick = (e) => {
    e.preventDefault();
    const clientId = import.meta.env.SSO_CLIENTID; 
    const redirectUri = import.meta.env.SSO_REDIRECT;
    // const redirectUri = window.location.origin + "/sso-login";

    // Replace with the actual URL of the bank's OAuth 2.0 authorization endpoint
    const ssoUrl = `https://smurnauth-production.fly.dev/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid+profile`;

    window.location.href = ssoUrl;
  }

  return (
    <div className="flex h-[90vh] my-auto mx-auto justify-center items-center bg-gray-50">
      <div className="border rounded-md min-w-[50vh] bg-white">
        <h2 className="p-5 bg-[#0f385c] rounded-t-md text-white">Login</h2>
        <hr />
        <form className="pt-5 p-3">
          <div>Email</div>
          <input
            onChange={onUsernameChange}
            value={username}
            type="text"
            className="custom-form-field"
            placeholder="email"
          />
          <div>Password</div>
          <input
            onChange={onPasswordChange}
            value={password}
            type="password"
            className="custom-form-field"
            placeholder="password"
          />
          <div className="flex items-center mb-3">
          <input
            id="bank-data-permission-checkbox"
            type="checkbox"
            checked={isCheckboxChecked}
            onChange={onCheckboxChange}
            className="mr-2"
          />
          <label htmlFor="bank-data-permission-checkbox" className="custom-darkgray-text">
            Allow this app fetch my personal information
          </label>
        </div>
          <div className="custom-gray-text mb-3">
            Forgot your password? Click{" "}
            <Link className="custom-basic-link" to="/reset-password-email">
              here
            </Link>
          </div>
          <div className="text-red-500 mb-5">{errorMsg}</div>
          <div className="text-right">
            <button
              onClick={onLoginClick}
              className={`p-3 mx-2 ${
                loading ? "custom-button-loading" : "custom-button-primary"
              }`}
            >
              Log in
            </button>
            <button
              onClick={onRegisterClick}
              className={`p-3 mx-2 ${
                loading ? "custom-button-loading" : "custom-button-secondary"
              }`}
            >
              Register
            </button>
          </div>
        </form>
        <div className="flex justify-center mb-5">
          {/* 
          <Link to="/sso-login" className="flex justify-center items-center custom-basic-link">
            <span>Login with SSO</span>
            <FiExternalLink className="mx-1 w-[15px]" />
          </Link> */}
          <button onClick = {onBankSSOLoginClick} className="flex justify-center items-center custom-basic-link" >
            Login with SSO
            <FiExternalLink className="mx-1 w-[15px]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
