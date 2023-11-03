import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  validateBirthday,
  validateRegisterPassword,
} from "../lib/loginUtil";
import axios from 'axios';

// To be shifted out
const BE_URL = "http://127.0.0.1:3001"

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onLoginClick = async (e) => {
    e.preventDefault()
    navigate("/login", {
      replace: true,
    });
  };

  const onRegisterClick = async (e) => {
    e.preventDefault();

    const validPassword = validateRegisterPassword(password);
    const validBirthday = validateBirthday(birthDate);
    if (username && validPassword && validBirthday && firstName && lastName) {
      try {
        setLoading(true);
        setErrorMsg("");
        const response = await axios.post(`${BE_URL}/oauth/signup`, { email: username, password: password, first_name: firstName, last_name: lastName, birthdate: birthDate })
        if (response.status === 200) {
          setLoading(false);
          navigate("/login", {
            replace: true,
          });
          setUsername("");
          setPassword("");
          alert("Registration success");
        } else {
          setLoading(false);
          setErrorMsg("Username taken");
        }
      } catch (error) {
        setLoading(false);
        setErrorMsg(error.response.data.message);
      }
    }
    else {
      if (!validBirthday && !validPassword) {
        setErrorMsg("Password must have at least 1 special character, uppercase and lowercase characters, and 1 number \nEnter birthday in the following format YYYY-MM-DD E.g.(1975-10-20)")
      }
      else if (!validPassword)
      setErrorMsg(
        "Password must have at least 1 special character, uppercase and lowercase characters, and 1 number"
      );
      else if (!validBirthday)
        setErrorMsg("Enter birthday in the following format YYYY-MM-DD E.g.(1975-10-20)");
    }
  }
  const onUsernameChange = (e) => {
    setUsername(e.target.value);
  };
  const onPasswordChange = (e) => {
    setPassword(e.target.value);
  };
  const onFirstNameChange = (e) => {
    setFirstName(e.target.value);
  };
  const onLastNameChange = (e) => {
    setLastName(e.target.value);
  };
  // const onGenderChange = (e) => {
  //   setUsername(e.target.value);
  // };
  const onBirthDateChange = (e) => {
    setBirthDate(e.target.value);
  };
  return (
    <div className="flex h-[90vh] my-auto mx-auto justify-center items-center bg-gray-50">
      <div className="border rounded-md min-w-[50vh] bg-white">
        <h2 className="p-5 bg-[#0f385c] rounded-t-md text-white">Register</h2>
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
          <div>First Name</div>
          <input
            onChange={onFirstNameChange}
            value={firstName}
            type="text"
            className="custom-form-field"
            placeholder="first name"
          />
          <div>Last Name</div>
          <input
            onChange={onLastNameChange}
            value={lastName}
            type="text"
            className="custom-form-field"
            placeholder="last name"
          />
          <div>Birth Date (YYYY-MM-DD)</div>
          <input
            onChange={onBirthDateChange}
            value={birthDate}
            type="text"
            className="custom-form-field"
            placeholder="1975-10-10"
          />
          <div className="text-red-500 mb-5">
            {errorMsg.split('\n').map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
          <div className="text-right">
            <button
              onClick={onRegisterClick}
              className={`p-3 mx-2 ${loading ? "custom-button-loading" : "custom-button-primary"
                }`}
            >
              Register
            </button>
            <button
              onClick={onLoginClick}
              className={`p-3 mx-2 ${loading ? "custom-button-loading" : "custom-button-secondary"
                }`}
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
