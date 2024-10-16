import "./index.css";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ButtonItem from "../../components/ButtonItem";
import { FaUser, FaBuilding, FaTasks } from "react-icons/fa";
import { MdOutlineLogout } from "react-icons/md";
import { BiSolidDashboard } from "react-icons/bi";
import { SiSimpleanalytics } from "react-icons/si";
import { GrSchedule } from "react-icons/gr";
import { FcLeave } from "react-icons/fc";

import Dashboard from "../../components/Dashboard";
import PerformanceAnalytics from "../../components/PerformanceAnalytics";
import Departments from "../../components/Departments";
import Profile from "../../components/Profile";
import Schedule from "../../components/Schedule";
import AdditionalTasks from "../../components/AdditionalTasks";
import FacultyHeader from "../../components/FacultyHeader";
import LeaveRequest from "../../components/LeaveRequest";

const Faculty = () => {
  const [user, setUser] = useState(null);
  const [sidebarSelected, setSidebarSelected] = useState("Additional Tasks");
  const [isRegistered, setIsRegistered] = useState(true); // Track registration status
  const [pic, setPic] = useState("");
  const jwt = Cookies.get("jwt_token");
  const navigate = useNavigate();

  const logout = () => {
    Cookies.remove("jwt_token");
    Cookies.remove("user");
    Cookies.remove("user_details");
    return navigate("/");
  };

  const clickSidebar = (name) => {
    setSidebarSelected(name);
  };

  const buttonItems = [
    {
      image: <FaTasks className="sidebar-logos" />,
      buttonName: "Additional Tasks",
    },

    {
      image: <SiSimpleanalytics className="sidebar-logos" />,
      buttonName: "Performance Analytics",
    },
    {
      image: <FaBuilding className="sidebar-logos" />,
      buttonName: "Departments",
    },
    {
      image: <FcLeave className="sidebar-logos" />,
      buttonName: "Leave Request",
    },
    {
      image: <FaUser className="sidebar-logos" />,
      buttonName: "Profile",
    },
  ];

  const fetchFacultyInfo = async (id) => {
    const response = await fetch(`http://localhost:3001/faculty-data/${id}`);
    if (response.ok) {
      const { data } = await response.json();
      if (data.is_registered === 0) {
        navigate("/complete-profile");
      } else {
        setIsRegistered(true);
      }
    }
  };

  useEffect(() => {
    if (jwt === undefined) {
      navigate("/faculty-login");
    } else {
      const userData = Cookies.get("user_details");
      if (userData) {
        const user = JSON.parse(userData);
        setUser(user);
        // Fetch registration status
        console.log(user);
        fetchFacultyInfo(user.faculty_id);
      }
    }

    const getProfilePic = async () => {
      const pokiri = Cookies.get("user_details");
      const uid = JSON.parse(pokiri);
      const details = {
        admin: false,
        id: uid.faculty_id,
      };
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(details),
      };

      const response = await fetch(
        "http://localhost:3001/get-profile-pic",
        options
      );
      if (response.ok) {
        const { pic } = await response.json();
        setPic(pic);
      }
    };

    getProfilePic();
  }, [jwt, navigate]);

  if (!isRegistered || jwt === undefined) {
    return null; // or a loading spinner
  }

  const renderOption = () => {
    switch (sidebarSelected) {
      case "Dashboard":
        return <Dashboard />;

      case "Schedule":
        return <Schedule />;

      case "Additional Tasks":
        return <AdditionalTasks />;

      case "Performance Analytics":
        return <PerformanceAnalytics />;

      case "Departments":
        return <Departments />;

      case "Leave Request":
        return <LeaveRequest />;

      case "Profile":
        return <Profile />;

      default:
        return null;
    }
  };

  return (
    <div className="admin-main-container">
      <div className="left-main-container">
        <div className="profile-pic-name-container">
          {user ? (
            <>
              <img
                src={`http://localhost:3001/uploads/${pic}`}
                alt="profile-pic"
                className="profile-pic-small"
              />
              <h1 className="profile-name">{user.name}</h1>
            </>
          ) : (
            <h1>Loading...</h1> // Handle the case where user data is still loading
          )}
        </div>
        <hr className="hr" />
        <ul className="left-main-container-components">
          {buttonItems.map((item) => (
            <ButtonItem
              item={item}
              key={item.buttonName}
              clickSidebar={clickSidebar}
              selected={sidebarSelected}
            />
          ))}
        </ul>
        <hr className="hr hr-last" />
        <div className="logout-button" onClick={logout}>
          <MdOutlineLogout className="sidebar-logos" />
          <p>Logout</p>
        </div>
      </div>
      <div className="right-main-container">
        <FacultyHeader />
        <hr style={{ width: "104.5%", border: "solid 1px, rgb(0,0,0,0.1)" }} />
        {renderOption()}
      </div>
    </div>
  );
};

export default Faculty;
