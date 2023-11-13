import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


const Logout = ({ logout }) => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("sso");
    logout();
    return navigate("/login");
  }, []);
}

export default Logout;
