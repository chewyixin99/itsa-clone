import logo from "../assets/ascenda.png";
import { Outlet, Link } from "react-router-dom";
import { CgProfile } from "react-icons/cg";

const Navbar = () => {
  return (
    <>
      <div className="p-3 flex justify-between items-center border-b">
        {/* LHS */}
        <div>
          <Link className="flex items-center" to="/">
            <img className="" src={logo} height={"75px"} width={"75px"} />
            <span>Landing page</span>
          </Link>
        </div>
        {/* RHS */}
        <div className="flex items-center">
          <Link className="px-3 hover:underline" to={"/login"}>
            Login
          </Link>
          <div className="px-3">
            <Link to="/user-profile">
              <CgProfile className="w-[20px] h-[20px]" />
            </Link>
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
};

export default Navbar;
