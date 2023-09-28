import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      Should not see this page before logging in (not implemented yet). Click{" "}
      <Link className="custom-basic-link" to="/login">
        here
      </Link>{" "}
      or navbar link to login.
    </div>
  );
};

export default Home;
