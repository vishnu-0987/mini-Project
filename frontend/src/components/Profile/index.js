import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import "./index.css";

const Profile = () => {
  const [userInfo, setUserInfo] = useState([]);
  const [isAdmin, setIsAdmin] = useState("");
  useEffect(() => {
    const getProfileInfo = async () => {
      const userData = Cookies.get("user_details");
      const mode = Cookies.get("user");
      const uid = JSON.parse(userData);
      const { id } = uid;
      setIsAdmin(mode);
      const userDetails = {
        admin: mode === "admin",
        id,
      };
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userDetails),
      };
      const response = await fetch(
        "http://localhost:3001/get-profile-details",
        options
      );
      if (response.ok) {
        const { data } = await response.json();
        console.log(data);
        setUserInfo(data);
      }
    };

    getProfileInfo();
  }, []);

  const AdminProfile = () => (
    <div className="profile-main-container">
      <div className="left-profile-container">
        <img
          src={`http://localhost:3001/uploads/${userInfo.profilePic}`}
          alt="profile-pic"
        />
        <h2>{userInfo.name}</h2>
        <p>{userInfo.email}</p>
        <p>{userInfo.department}</p>
      </div>
      <div className="right-profile-container">
        <table className="profile-table">
          <tbody>
            <tr>
              <td>
                <strong>Name</strong>
              </td>
              <td>:</td>
              <td>{userInfo.name}</td>
            </tr>
            <tr>
              <td>
                <strong>Email</strong>
              </td>
              <td>:</td>
              <td>{userInfo.email}</td>
            </tr>
            <tr>
              <td>
                <strong>Role</strong>
              </td>
              <td>:</td>
              <td>{userInfo.role}</td>
            </tr>
            <tr>
              <td>
                <strong>Department</strong>
              </td>
              <td>:</td>
              <td>{userInfo.department}</td>
            </tr>
            <tr>
              <td>
                <strong>Username</strong>
              </td>
              <td>:</td>
              <td>{userInfo.username}</td>
            </tr>
            <tr>
              <td>
                <strong>Email Verification</strong>
              </td>
              <td>:</td>
              <td style={{ color: "green" }}>Completed</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
  const FacultyProfile = () => (
    <div className="profile-main-container">
      <div className="left-profile-container">
        <img
          src={`http://localhost:3001/uploads/${userInfo.profile_pic}`}
          alt="profile-pic"
        />
        <h2>{userInfo.name}</h2>
        <p>{userInfo.email}</p>
        <p>{userInfo.department}</p>
      </div>
      <div className="right-profile-container">
        <table className="profile-tables">
          <tbody>
            <tr>
              <td>
                <strong>Name</strong>
              </td>
              <td>:</td>
              <td>{userInfo.name}</td>
            </tr>
            <tr>
              <td>
                <strong>Email</strong>
              </td>
              <td>:</td>
              <td>{userInfo.email}</td>
            </tr>

            <tr>
              <td>
                <strong>Department</strong>
              </td>
              <td>:</td>
              <td>{userInfo.department_name}</td>
            </tr>
            <tr>
              <td>
                <strong>Status</strong>
              </td>
              <td>:</td>
              <td style={{ color: userInfo.is_active ? "green" : "red" }}>
                {userInfo.is_active ? "Active" : "Inactive"}
              </td>
            </tr>

            <tr>
              <td>
                <strong>Start Date</strong>
              </td>
              <td>:</td>
              <td>
                {new Date(userInfo.start_date).toLocaleDateString("en-GB")}
              </td>
            </tr>
            <tr>
              <td>
                <strong>Bio</strong>
              </td>
              <td>:</td>
              <td>{userInfo.bio}</td>
            </tr>
            <tr>
              <td>
                <strong>Goals</strong>
              </td>
              <td>:</td>
              <td>{userInfo.goals}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProfile = () => {
    switch (isAdmin) {
      case "admin":
        return <AdminProfile />;

      case "faculty":
        return <FacultyProfile />;

      default:
        return null;
    }
  };

  return (
    <div className="profile-bg-container">
      <h1>Profile</h1>

      {renderProfile()}
    </div>
  );
};

export default Profile;
