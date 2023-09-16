import { useState } from "react";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const onNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
  };
  const onConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };
  const onSubmitClick = (e) => {
    e.preventDefault();
    // todo: password validation to check both are the same values
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
          <div className="text-right">
            <button
              onClick={onSubmitClick}
              className={`custom-button p-3 mx-2 bg-[#0f385c] text-white`}
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
