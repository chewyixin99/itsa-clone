import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiExternalLink } from "react-icons/fi";
import {
  validateLoginPassword,
  validateLoginUsername,
  validateRegisterPassword,
  validateRegisterUsername,
} from "../lib/loginUtil";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onLoginClick = (e) => {
    e.preventDefault();
    const validUser = validateLoginUsername(username);
    const validPassword = validateLoginPassword(username, password);
    if (validUser && validPassword) {
      setLoading(true);
      setErrorMsg("");
      setTimeout(() => {
        setLoading(false);
        navigate("/otp", {
          replace: true,
        });
      }, 1000);
    } else {
      if (!validUser) {
        setErrorMsg("Username does not exist (user: admin, pw: admin)");
      } else {
        setErrorMsg(
          "Username or password is incorrect (user: admin, pw: admin)"
        );
      }
    }
  };

  const onRegisterClick = (e) => {
    e.preventDefault();
    const validUser = validateRegisterUsername(username);
    const validPassword = validateRegisterPassword(password);
    if (validUser && validPassword) {
      setLoading(true);
      setErrorMsg("");
      setTimeout(() => {
        setLoading(false);
        navigate("/login", {
          replace: true,
        });
        setUsername("");
        setPassword("");
        alert("Registration success");
      }, 1000);
    } else {
      if (!validUser) {
        setErrorMsg("Username taken");
      } else {
        setErrorMsg(
          "Password must have at least 1 special character, uppercase and lowercase characters, and 1 number"
        );
      }
    }
  };
  const onUsernameChange = (e) => {
    setUsername(e.target.value);
  };
  const onPasswordChange = (e) => {
    setPassword(e.target.value);
  };
  return (
    <div className="flex h-[90vh] my-auto mx-auto justify-center items-center bg-gray-50">
      <div className="border rounded-md min-w-[50vh] bg-white">
        <h2 className="p-5 bg-[#0f385c] rounded-t-md text-white">Login</h2>
        <hr />
        <form className="pt-5 p-3">
          <div>Username</div>
          <input
            onChange={onUsernameChange}
            value={username}
            type="text"
            className="custom-form-field"
            placeholder="username"
          />
          <div>Password</div>
          <input
            onChange={onPasswordChange}
            value={password}
            type="password"
            className="custom-form-field"
            placeholder="password"
          />
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
          <Link
            to="/sso-login"
            className="flex justify-center items-center custom-basic-link"
          >
            <span>Login with SSO</span>
            <FiExternalLink className="mx-1 w-[15px]" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
