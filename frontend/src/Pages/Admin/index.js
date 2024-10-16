import "./index.css";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ButtonItem from "../../components/ButtonItem";
import { FaUser, FaUsers, FaBuilding } from "react-icons/fa";

import { MdArtTrack, MdOutlineLogout } from "react-icons/md";
import { BiSolidDashboard } from "react-icons/bi";
import { IoMdFingerPrint } from "react-icons/io";
import { SiSimpleanalytics } from "react-icons/si";
import Dashboard from "../../components/Dashboard";
import AttendanceMarker from "../../components/AttendanceMarker";
import AttendanceTracker from "../../components/AttendanceTracker";
import ManageEmployees from "../../components/ManageEmployees";
import PerformanceAnalytics from "../../components/PerformanceAnalytics";
import Departments from "../../components/Departments";
import Profile from "../../components/Profile";

const Admin = () => {
  const [user, setUser] = useState(null);
  const [sidebarSelected, setSidebarSelected] = useState("Attendance Marker");
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
      image: <IoMdFingerPrint className="sidebar-logos" />,
      buttonName: "Attendance Marker",
    },
    {
      image: <MdArtTrack className="sidebar-logos" />,
      buttonName: "Attendance Tracker",
    },
    {
      image: <FaUsers className="sidebar-logos" />,
      buttonName: "Manage Employees",
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
      image: <FaUser className="sidebar-logos" />,
      buttonName: "Profile",
    },
  ];

  useEffect(() => {
    if (jwt === undefined) {
      navigate("/admin-login");
    } else {
      const userData = Cookies.get("user_details");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
  }, [jwt, navigate]);

  if (jwt === undefined) {
    return null; // Prevent rendering the Admin component
  }

  const renderOption = () => {
    switch (sidebarSelected) {
      case "Dashboard":
        return <Dashboard />;

      case "Attendance Marker":
        return <AttendanceMarker />;
      case "Attendance Tracker":
        return <AttendanceTracker />;

      case "Manage Employees":
        return <ManageEmployees />;

      case "Performance Analytics":
        return <PerformanceAnalytics />;

      case "Departments":
        return <Departments />;

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
                src={`http://localhost:3001/uploads/${user.profilePic}`}
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
      <div className="right-main-container">{renderOption()}</div>
    </div>
  );
};

export default Admin;
