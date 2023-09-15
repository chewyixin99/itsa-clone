import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import SignUp from "./pages/SignUp";

const App = () => {
  return (
    <>
      <Navbar />
      <div className="p-3">
        <Routes>
          <Route element={<Home />} path="/"></Route>
          <Route element={<Login />} path="/login" />
          <Route element={<SignUp />} path="/sign-up" />
        </Routes>
      </div>
    </>
  );
};

export default App;
