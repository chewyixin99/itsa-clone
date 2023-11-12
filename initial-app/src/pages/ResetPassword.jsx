import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  passwordWithLength,
  passwordWithNumber,
  passwordWithSymbol,
  passwordWithUppercaseAndLowercase,
} from "../lib/loginUtil";
import axios from "axios";
const BE_URL = `${import.meta.env.VITE_BACKEND_URL}`;

const ResetPassword = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const onNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
  };
  const onConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };
  const onEmailChange = (e) => {
    setEmail(e.target.value);
  };
  const onSubmitClick = async (e) => {
    e.preventDefault();
    let tmpErrorMsg = [];

    if (newPassword !== confirmPassword) {
      tmpErrorMsg.push("Passwords do not match");
    } else {
      if (!passwordWithUppercaseAndLowercase(newPassword)) {
        tmpErrorMsg.push(
          "Password requires at least one uppercase and lowercase letter"
        );
      }
      if (!passwordWithSymbol(newPassword)) {
        tmpErrorMsg.push("Password require at least 1 symbol from !@#$%^&*");
      }
      if (!passwordWithNumber(newPassword)) {
        tmpErrorMsg.push("Password requires at least 1 number");
      }
      if (!passwordWithLength(newPassword)) {
        tmpErrorMsg.push("Password should be at least 8 characters");
      }
    }
    if (tmpErrorMsg.length === 0) {
      setErrorMsg([])
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      try {
        const response = await axios.post(`${BE_URL}/oauth/resetpassword`, {
          email: email,
          token: token,
          newpassword: newPassword,
          confirmpassword: confirmPassword
        });
  
        console.log(response)
        if (response.status === 200){
          setSuccessMsg("Password resetted successfully")
          setTimeout(() => {
            return navigate("/login")
          }, 1500);
        }
      } catch (error) {
        if (error.response.status === 401) {
          return navigate("/login");
        }
        setLoading(false)
        setErrorMsg(["Password update failed, please try again"])
      }
    } else {
      setErrorMsg(tmpErrorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[90vh] my-auto mx-auto justify-center items-center bg-gray-50">
      <div className="border rounded-md min-w-[50vh] bg-white">
        <h2 className="p-5 bg-[#0f385c] rounded-t-md text-white">
          Reset password
        </h2>
        <hr />
        <form className="pt-5 p-3">
          <div>Email</div>
          <input
            onChange={onEmailChange}
            value={email}
            type="email"
            className="custom-form-field"
            placeholder="email"
          />
          <div>New password</div>
          <input
            onChange={onNewPasswordChange}
            value={newPassword}
            type="password"
            className="custom-form-field"
            placeholder="new password"
          />
          <div>Confirm password</div>
          <input
            onChange={onConfirmPasswordChange}
            value={confirmPassword}
            type="password"
            className="custom-form-field"
            placeholder="confirm password"
          />
          <div className="mb-5 text-center text-red-500">
            {errorMsg.map((r) => {
              return <div key={r}>{r}</div>;
            })}
          </div>
          <div className="mb-5 text-center text-green-500">{successMsg}</div>
          <div className="text-right">
            <button
              onClick={onSubmitClick}
              className={`p-3 mx-2 ${
                loading ? "custom-button-loading" : "custom-button-primary"
              }`}
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
