import logo from "../assets/ascenda.png";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="p-3 flex justify-between items-center border-b">
      <div>
        <Link className="flex items-center" to="/">
          <img className="" src={logo} height={"75px"} width={"75px"} />
          <span>Landing page</span>
        </Link>
      </div>
      <div>
        <Link className="px-3 hover:underline" to={"/login"}>
          Login
        </Link>
        <Link className="px-3 hover:underline" to={"/sign-up"}>
          Sign up
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
