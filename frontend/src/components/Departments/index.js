import { useEffect, useState } from "react";
import "./index.css";

const Departments = () => {
  const [staffData, setStaffData] = useState([]);
  const [dept, setDept] = useState("ALL");

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/faculty/staff-profiles/${dept}`
        );
        if (response.ok) {
          const data = await response.json();

          setStaffData(data.profiles); // Set the fetched department-wise data
        }
      } catch (error) {
        console.error("Error fetching department-wise data:", error);
        fetchStaffData([]); // Fallback to empty array in case of error
      }
    };

    fetchStaffData();
  }, [dept]);

  return (
    <div className="staff-data">
      <h1>Faculty</h1>
      <div className="choice" style={{ marginTop: "20px" }}>
        <select
          id="dept"
          className="dept-select"
          onChange={(e) => setDept(e.target.value)}
        >
          <option value="ALL">ALL</option>
          <option value="CSE">CSE</option>
          <option value="ECE">ECE</option>
          <option value="EEE">EEE</option>
          <option value="CIVIL">CIVIL</option>
          <option value="MECH">MECH</option>
          <option value="CSM">CSM</option>
          <option value="CSD">CSD</option>
          <option value="CSC">CSC</option>
          <option value="AID">AID</option>
          <option value="AIM">AIM</option>
        </select>
      </div>
      {staffData.length === 0 ? (
        <div className="staff-not-found">
          <h1>No Data Found</h1>
        </div>
      ) : (
        <ul className="staff-profiles">
          {staffData.map((item) => (
            <li className="each-staff" key={item.email}>
              {item.profile_pic ? (
                <img
                  src={`http://localhost:3001/uploads/${item.profile_pic}`}
                  alt="profile-pic"
                  className="staff-pic"
                />
              ) : (
                <img
                  src="https://as1.ftcdn.net/v2/jpg/03/39/45/96/1000_F_339459697_XAFacNQmwnvJRqe1Fe9VOptPWMUxlZP8.jpg"
                  alt="default-profile-pic"
                  className="staff-pic"
                />
              )}

              <div className="staff-info-container">
                <h1>{item.name}</h1>
                <p>
                  <span style={{ fontWeight: "600" }}>Email: </span>
                  {item.email}
                </p>
                <p>
                  <span style={{ fontWeight: "600" }}>Department: </span>
                  {item.department_name}
                </p>
                <p>
                  <span style={{ fontWeight: "600" }}>Profile Updation: </span>
                  <span
                    style={{
                      color: item.is_registered ? "green" : "red",
                      fontWeight: "bold",
                    }}
                  >
                    {item.is_registered ? "Done" : "Not Done"}
                  </span>
                </p>
                <p>
                  <span style={{ fontWeight: "600", color: "black" }}>
                    Status:{" "}
                  </span>
                  <span
                    style={{
                      color: item.is_active ? "green" : "red",
                      fontWeight: "bold",
                    }}
                  >
                    {item.is_active ? "Active" : "In Active"}
                  </span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Departments;
