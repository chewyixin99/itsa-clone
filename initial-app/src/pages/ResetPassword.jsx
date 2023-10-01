import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  passwordWithLength,
  passwordWithNumber,
  passwordWithSymbol,
  passwordWithUppercaseAndLowercase,
} from "../lib/loginUtil";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState([]);
  const [loading, setLoading] = useState(false);

  const onNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
  };
  const onConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };
  const onSubmitClick = (e) => {
    e.preventDefault();
    let tmpErrorMsg = [];
    // todo: password validation to check both are the same values
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
      // success
      setLoading(true);
      setTimeout(() => {
        alert("Password reset");
        setLoading(false);
        navigate("/login", {
          replace: true,
        });
      }, 1000);
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
