import { Route, Routes } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import SSOLogin from "./pages/SSOLogin";
import ResetPasswordEmail from "./pages/ResetPasswordEmail";
import ResetPassword from "./pages/ResetPassword";
import UserProfile from "./pages/UserProfile";
import OTPVerification from "./pages/OTPVerification";
import QRVerification from "./pages/QRVerification";
import QRVerificationSetup from "./pages/QRVerificationSetup"
import Register from "./pages/Register"
import Logout from "./pages/Logout";
import UserManagement from "./pages/UserManagement";

const App = () => {
  const initialIsLoggedIn = localStorage.getItem('user') ? true : false;
  const [isLoggedIn, setIsLoggedIn] = useState(initialIsLoggedIn);

  const login = () => {
    setIsLoggedIn(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
  };
  // if (localStorage.getItem("user")) {
  //   login()
  // }
  return (
    <>
      <Routes>
        <Route path="/" element={<Navbar isLoggedIn={isLoggedIn} />}>
          <Route element={<Login login={login} />} index />
          <Route element={<Home />} path="home" />
          <Route element={<Register />} path="register" />
          <Route element={<OTPVerification login={login} />} path="otp" />
          <Route element={<QRVerification login={login} />} path="qr" />
          <Route element={<QRVerificationSetup />} path="qr-setup" />
          <Route element={<Login login={login} />} path="login" />
          <Route element={<Logout logout={logout} />} path="logout" />
          <Route element={<SSOLogin login={login} />} path="sso-login" />
          <Route element={<ResetPasswordEmail />} path="reset-password-email" />
          <Route element={<ResetPassword />} path="reset-password" />
          <Route element={<UserProfile />} path="user-profile" />
          <Route element={<UserManagement />} path="user-management" />
        </Route>
      </Routes>
    </>
  );
};

export default App;
