import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import SSOLogin from "./pages/SSOLogin";
import ResetPasswordEmail from "./pages/ResetPasswordEmail";
import ResetPassword from "./pages/ResetPassword";
import UserProfile from "./pages/UserProfile";
const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navbar />}>
          <Route element={<Home />} index />
          <Route element={<Login />} path="login" />
          <Route element={<SSOLogin />} path="sso-login" />
          <Route element={<ResetPasswordEmail />} path="reset-password-email" />
          <Route element={<ResetPassword />} path="reset-password" />
          <Route element={<UserProfile />} path="user-profile" />
        </Route>
      </Routes>
    </>
  );
};

export default App;
