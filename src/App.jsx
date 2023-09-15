import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";

const App = () => {
  return (
    <>
      <Navbar />
      <div className="p-3">
        <Routes>
          <Route element={<Home />} path="/"></Route>
          <Route element={<Login />} path="/login" />
        </Routes>
      </div>
    </>
  );
};

export default App;
