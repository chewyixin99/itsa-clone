import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateOTP } from "../lib/loginUtil";
import axios from "axios";

// To be shifted out
const BE_URL = `${import.meta.env.VITE_BACKEND_URL}`;

const OTPVerification = ({ login }) => {
  const navigate = useNavigate();
  const [input, setInput] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [email, setEmail] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const username = localStorage.getItem("username");

  useEffect(() => {
    // alert("OTP is 123456");
    setEmail(maskEmail(username));
  }, []);

  function maskEmail(email) {
    if (typeof email !== "string") {
      return "";
    }

    const parts = email.split("@");
    if (parts.length !== 2) {
      return "";
    }

    const [prefix, suffix] = parts;
    const newPrefix =
      "*".repeat(Math.max(0, prefix.length - 3)) + prefix.slice(-3);
    return newPrefix + "@" + suffix;
  }

  const handleInput = async (e) => {
    e.preventDefault();
    if (loading) {
      // do not do anything
    } else {
      setErrorMsg("");
      let tmpInput = JSON.parse(JSON.stringify(input));
      const idx = parseInt(e.target.id);
      const val = e.key;
      if (val === "Backspace") {
        if (idx !== 0) {
          document.getElementById(`${idx - 1}`).focus();
        }
        tmpInput[idx] = "";
      } else if (val === "ArrowLeft" && idx !== 0) {
        document.getElementById(`${idx - 1}`).focus();
      } else if (val === "ArrowRight" && idx !== input.length - 1) {
        document.getElementById(`${idx + 1}`).focus();
      } else if (
        // 48 (inc) - 57 (inc), 96 inc - 105 inc
        (e.keyCode >= 48 && e.keyCode <= 57) ||
        (e.keyCode >= 96 && e.keyCode <= 105)
      ) {
        tmpInput[idx] = val;
        if (idx !== tmpInput.length - 1) {
          document.getElementById(`${idx + 1}`).focus();
        }
      }
      if (idx === tmpInput.length - 1 && tmpInput[idx] !== "") {
        const otp = tmpInput.join("");
        try {
          setLoading(true);
          const response = await axios.post(`${BE_URL}/oauth/signinOtp`, {
            email: username,
            code: otp,
          });

          if (response.status === 200) {
            if (sessionStorage.getItem("page") === "changepw") {
              // submit changepw request
              const data = JSON.parse(localStorage.getItem("user"));
              const token = data.accessToken || data.access_token;
              const config = {
                headers: { Authorization: `Bearer ${token}` },
              };

              try {
                const pwData = JSON.parse(sessionStorage.getItem("pwObject"));
                const changePW = await axios.put(
                  `${BE_URL}/oauth/password`,
                  pwData,
                  config
                );

                changePW.status === 200
                  ? setSuccessMsg("Password updated successfully")
                  : setErrorMsg("Error, unable to update password");
                sessionStorage.clear();
                setTimeout(() => {
                  navigate("/user-profile");
                }, 1000);
              } catch (e) {
                if (e.response.status === 401) {
                  navigate("/login");
                }
                sessionStorage.clear()
                setErrorMsg("Error, unable update password ");
                setLoading(false);
                setTimeout(() => {
                  navigate("/user-profile");
                }, 2000);
              }
            } else {
              // login
              setLoading(false);
              localStorage.setItem("user", JSON.stringify(response.data));
              login();
              navigate("/user-profile", {
                replace: true,
              });
            }
          } else {
            setLoading(false);
            setErrorMsg("Invalid OTP");
          }
        } catch (error) {
          setErrorMsg("Invalid OTP, try again");
          setLoading(false);
        }
      }
      setInput(tmpInput);
    }
  };

  const onResendClick = (e) => {
    setInput(["", "", "", "", "", ""]);
    setLoading(true);
    // resend logic
    setTimeout(() => {
      setLoading(false);
      alert("OTP is 123456");
    }, 1000);
  };

  return (
    <div className="flex h-[90vh] my-auto mx-auto justify-center items-center bg-gray-50">
      <div className="border rounded-md min-w-[50vh] bg-white">
        <h2 className="p-5 bg-[#0f385c] rounded-t-md text-white">
          OTP Verification
        </h2>
        <hr />
        <div className="text-center mt-5">
          <div>Enter the OTP you received at</div>
          <div className="font-bold"> {email}</div>
        </div>
        <div className="text-center my-5">
          <input
            className="m-2 border h-10 w-10 text-center form-control rounded"
            type="text"
            value={input[0]}
            id={0}
            maxLength="1"
            onKeyDown={handleInput}
          />
          <input
            className="m-2 border h-10 w-10 text-center form-control rounded"
            type="text"
            value={input[1]}
            id={1}
            maxLength="1"
            onKeyDown={handleInput}
          />
          <input
            className="m-2 border h-10 w-10 text-center form-control rounded"
            type="text"
            value={input[2]}
            id={2}
            maxLength="1"
            onKeyDown={handleInput}
          />
          <input
            className="m-2 border h-10 w-10 text-center form-control rounded"
            type="text"
            value={input[3]}
            id={3}
            maxLength="1"
            onKeyDown={handleInput}
          />
          <input
            className="m-2 border h-10 w-10 text-center form-control rounded"
            type="text"
            value={input[4]}
            id={4}
            maxLength="1"
            onKeyDown={handleInput}
          />
          <input
            className="m-2 border h-10 w-10 text-center form-control rounded"
            type="text"
            value={input[5]}
            id={5}
            maxLength="1"
            onKeyDown={handleInput}
          />
        </div>
        <div className="text-center mb-5 text-red-500">{errorMsg}</div>
        <div className="text-center mb-5 text-green-500">{successMsg}</div>
        <div className="mb-5 text-center">
          <button
            className={`p-3 mx-2 ${
              loading ? "custom-button-loading" : "custom-button-primary"
            } text-white`}
            onClick={onResendClick}
          >
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
