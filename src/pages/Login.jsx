import { useState } from "react";

const classes = {
  formField: "border p-3 rounded-md w-full my-3",
  button: "border p-3 m-3 rounded-lg uppercase",
};

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const onLoginClick = (e) => {
    e.preventDefault();
    console.log(`login clicked, username is ${username}, password is ${password}`);
  };
  const onRegisterClick = (e) => {
    e.preventDefault();
    console.log(`register clicked, username is ${username}, password is ${password}`);
  };
  const onUsernameChange = (e) => {
    setUsername(e.target.value);
  };
  const onPasswordChange = (e) => {
    setPassword(e.target.value);
  };
  return (
    <div className="flex h-[90vh] my-auto mx-auto justify-center items-center">
      <div className="border rounded-md min-w-[50vh]">
        <h2 className="p-5 bg-[#0f385c] rounded-t-md text-white">Login</h2>
        <hr />
        <form className="p-5">
          <div>Username</div>
          <input
            onChange={onUsernameChange}
            value={username}
            type="text"
            className={classes.formField}
            placeholder="username"
          />
          <div>Password</div>
          <input
            onChange={onPasswordChange}
            value={password}
            type="password"
            className={classes.formField}
            placeholder="password"
          />
          <div className="text-right">
            <button onClick={onLoginClick} className={`${classes.button} bg-blue-500 text-white`}>
              Log in
            </button>
            <button onClick={onRegisterClick} className={`${classes.button}`}>
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
