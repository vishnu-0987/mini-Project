import { Link } from "react-router-dom";
import "./index.css";

const HomeLoginContainer = () => (
  <div className="home-login-container">
    <h1>Login As</h1>
    <div className="buttons-container">
      <Link to="/admin-login">
        <button type="button" className="link-button">
          Admin
        </button>
      </Link>
      <Link to="/faculty-login">
        <button type="button" className="link-button">
          Faculty
        </button>
      </Link>
    </div>
  </div>
);

export default HomeLoginContainer;
