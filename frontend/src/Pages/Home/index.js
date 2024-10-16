import "./index.css";
import HomeLoginContainer from "../../components/HomeLoginContainer";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Home = () => {
  const isCookie = Cookies.get("jwt_token");
  const navigate = useNavigate();
  console.log(isCookie);

  useEffect(() => {
    if (isCookie !== undefined) {
      const user = Cookies.get("user");
      navigate(`/${user}`);
    }
  }, [isCookie, navigate]);

  return (
    <div className="home-page">
      <HomeLoginContainer />
    </div>
  );
};

export default Home;
