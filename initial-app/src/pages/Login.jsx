import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiExternalLink } from "react-icons/fi";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onLoginClick = (e) => {
    e.preventDefault();
    console.log(
      `login clicked, username is ${username}, password is ${password}`
    );
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/", {
        replace: true,
      });
    }, 3000);
  };
  const onRegisterClick = (e) => {
    e.preventDefault();
    console.log(
      `register clicked, username is ${username}, password is ${password}`
    );
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/", {
        replace: true,
      });
    }, 3000);
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
          <div className="text-right">
            <button
              onClick={onLoginClick}
              className={`custom-button p-3 mx-2 ${
                loading ? "bg-gray-300" : "bg-[#0f385c]"
              } text-white`}
            >
              Log in
            </button>
            <button
              onClick={onRegisterClick}
              className={`custom-button p-3 mx-2 ${
                loading ? "bg-gray-300 text-white" : "bg-white text-black"
              }`}
            >
              Register
            </button>
          </div>
        </form>
        <div className="text-center mb-5">
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
