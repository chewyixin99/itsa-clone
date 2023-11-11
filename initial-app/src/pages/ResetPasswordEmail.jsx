import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateEmail } from "../lib/loginUtil";
import axios from "axios";
const BE_URL = `${import.meta.env.VITE_BACKEND_URL}`;

const ResetPasswordEmail = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const onEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const onSubmitClick = async (e) => {
    // todo: send confirmation email with token to reset password
    e.preventDefault();
    const validEmail = validateEmail(email);
   
    if (validEmail) {
      try {
        const response = await axios.post(`${BE_URL}/oauth/forgetpassword`, {
          email: email,
        });
  
        if (response.status === 200) {
          setSuccessMsg("Reset password steps has been sent to your email");
          setTimeout(() => {
            setLoading(false);
            navigate("/login");
          }, 1500);
        }
      } catch (erorr){
        if (error.response.status === 401) {
          navigate("/login");
        }
      }
    } else {
      setErrorMsg("Please enter a valid email");
    }
  };

  return (
    <div className="flex h-[90vh] my-auto mx-auto justify-center items-center bg-gray-50">
      <div className="border rounded-md min-w-[50vh] bg-white">
        <h2 className="p-5 bg-[#0f385c] rounded-t-md text-white">
          Reset password
        </h2>
        <hr />
        <form className="mt-5 p-3">
          <div>Email</div>
          <input
            onChange={onEmailChange}
            value={email}
            type="text"
            className="custom-form-field"
            placeholder="email address"
          />
          <div className="max-w-[50vh] mb-3 custom-gray-text">
            An email will be sent out to you if an account exists under the
            address that you entered.
          </div>
          <div className="mb-5 text-center text-red-500">{errorMsg}</div>
          <div className="mb-5 text-center text-green-500">{successMsg}</div>
          <div className="text-right">
            <button
              onClick={onSubmitClick}
              disabled={loading}
              className={`p-3 mx-2 ${
                loading ? "custom-button-loading" : "custom-button-primary"
              } text-white`}
            >
              {loading ? "sending..." : "send email"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordEmail;
