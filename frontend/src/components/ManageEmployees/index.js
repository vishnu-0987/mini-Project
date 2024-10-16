import React, { useEffect, useState } from "react";
import useCountUp from "../useCountUp";
import "./index.css";
import AddFaculty from "../AddFaculty";
import RemoveFaculty from "../RemoveFaculty";
import ModifyFaculty from "../ModifyFaculty";

const ManageEmployees = () => {
  const [totalStaff, setTotalStaff] = useState(0);
  const [activeStaff, setActiveStaff] = useState(0);
  const [deptData, setDeptData] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [previousTasks, setPreviousTasks] = useState([]);
  const [crud, setCrud] = useState("add faculty");
  const [dept, setDept] = useState("CSE");
  const [names, setNames] = useState([]);
  const [name, setName] = useState("");
  const [assignmentHeading, setAssignmentHeading] = useState(""); // New state for assignment heading
  const [assignmentDescription, setAssignmentDescription] = useState(""); // New state for assignment description
  const [perkPoints, setPerkPoints] = useState("");

  const fetchLeaveRequests = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/faculty/all-leave-requests"
      );
      if (response.ok) {
        const data = await response.json();
        setLeaveRequests(data.requests);
      }
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      setLeaveRequests([]);
    }
  };

  const fetchPreviousTasks = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/faculty/previous-tasks"
      );
      if (response.ok) {
        const data = await response.json();
        setPreviousTasks(data.requests);
      }
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      setPreviousTasks([]);
    }
  };

  useEffect(() => {
    const fetchTotalEmployees = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/faculty/total-employees"
        );
        if (response.ok) {
          const tot = await response.json();
          setTotalStaff(tot.tot);
        }
      } catch (error) {
        console.error("Error fetching total employees:", error);
        setTotalStaff(0);
      }
    };

    const fetchActiveEmployees = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/faculty/active-employees"
        );
        if (response.ok) {
          const tot = await response.json();
          setActiveStaff(tot.tot);
        }
      } catch (error) {
        console.error("Error fetching active employees:", error);
        setActiveStaff(0);
      }
    };

    const fetchDeptData = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/faculty/department-wise-count"
        );
        if (response.ok) {
          const data = await response.json();
          setDeptData(data.dept);
        }
      } catch (error) {
        console.error("Error fetching department-wise data:", error);
        setDeptData([]);
      }
    };

    const fetchNames = async () => {
      console.log(dept);
      const response = await fetch(
        `http://localhost:3001/faculty/names/${dept}`
      );
      if (response.ok) {
        const data = await response.json();
        setNames(data.resp);

        // Set the initial name to the first name in the fetched list
        if (data.resp.length > 0) {
          setName(data.resp[0].name);
        }
      } else {
        console.log(response);
      }
    };

    fetchNames();
    fetchTotalEmployees();
    fetchActiveEmployees();
    fetchDeptData();
    fetchLeaveRequests();
    fetchPreviousTasks();
  }, [dept]);

  const fetchCrudChoice = () => {
    switch (crud) {
      case "add faculty":
        return <AddFaculty />;
      case "remove faculty":
        return <RemoveFaculty />;
      case "modify faculty":
        return <ModifyFaculty />;
      default:
        return null;
    }
  };

  const approve = async (id) => {
    // console.log("clicked");
    const response = await fetch(
      `http://localhost:3001/leave-request/approve/${id}`
    );
    console.log(response);
    fetchLeaveRequests();
  };
  const reject = async (id) => {
    const response = await fetch(
      `http://localhost:3001/leave-request/reject/${id}`
    );
    console.log(response);
    fetchLeaveRequests();
  };

  const assignTask = async () => {
    const details = {
      name,
      assignmentHeading,
      assignmentDescription,
      perkPoints,
    };

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(details),
    };

    const response = await fetch(
      "http://localhost:3001/faculty/assign-tasks",
      options
    );
    if (response.ok) {
      fetchPreviousTasks();
    } else {
      alert("Problem");
    }
  };

  const review = async (id, facultyId, points) => {
    const response = await fetch(
      `http://localhost:3001/review/${id}/${facultyId}/${points}`
    );
    console.log(response);
    fetchPreviousTasks();
  };

  const countedActiveStaff = useCountUp(activeStaff, 1000);
  const countedTotalStaff = useCountUp(totalStaff, 1000);

  return (
    <div className="manage-employee-main-container">
      <h1>Manage Employees</h1>
      <div className="quick-stats">
        <div className="stats-drud-container">
          <div className="two-stats">
            <div className="stats-container cl1">
              <h3>Total No of Staff</h3>
              <h1>{countedTotalStaff}</h1>
            </div>
            <div className="stats-container cl2">
              <h3>No of Active Staff</h3>
              <h1>{countedActiveStaff}</h1>
            </div>
          </div>
          <div className="crud-container">
            <select
              className="select-crud"
              value={crud}
              onChange={(e) => setCrud(e.target.value)}
            >
              <option value="add faculty">Add Faculty</option>
              <option value="remove faculty">Remove Faculty</option>
              <option value="modify faculty">Modify Faculty</option>
            </select>
            {fetchCrudChoice()}
          </div>
        </div>
        <div className="dept-count-container cl3">
          <h3>Department Wise Count of Staff</h3>
          <table className="dept-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Number of Staff</th>
              </tr>
            </thead>
            <tbody>
              {deptData.length > 0 ? (
                deptData.map((dept, index) => (
                  <tr key={index}>
                    <td>{dept.dept_name}</td>
                    <td>{dept.faculty_count}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="leave-requests-container">
        <h3>Leave Requests</h3>
        <div className="leave-request-handling-container">
          {leaveRequests.length > 0 ? (
            leaveRequests.map((request, index) => (
              <div key={index} className="leave-request">
                <p>
                  <span>Name : </span>
                  {request.name}
                </p>
                <p>
                  <span>Type : </span>
                  {request.leave_type}
                </p>
                <p>
                  <span>From : </span>
                  {request.start_date}
                </p>
                <p>
                  <span>To : </span>
                  {request.end_date}
                </p>
                <p>
                  <span>Reason : </span>
                  {request.reason}
                </p>
                <p>
                  <span>Status : </span>
                  {request.status}
                </p>
                <div className="button-request-container">
                  <button
                    type="button"
                    style={{ backgroundColor: "green", color: "white" }}
                    onClick={() => approve(request.id)}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    style={{ backgroundColor: "red" }}
                    onClick={() => reject(request.id)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No leave requests available.</p>
          )}
        </div>
      </div>
      <div className="tasks-previous-container">
        <div className="additional-tasks-container">
          <h2>Assign Additional Tasks</h2>
          <div className="task-form">
            {/* Select department */}
            <div className="select-dept-name">
              <select
                id="dept"
                className="dept-select"
                style={{ marginRight: "13px" }}
                onChange={(e) => setDept(e.target.value)} // Change onClick to onChange
                value={dept} // Ensure the select reflects the current department state
              >
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
              <select
                id="name"
                className="dept-select"
                onChange={(e) => setName(e.target.value)}
                value={name} // Reflect the current name in the select box
              >
                {names.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignment heading */}
            <div className="choice">
              <label className="label">Assignment Heading</label>
              <input
                type="text"
                value={assignmentHeading}
                className="login-input"
                style={{ width: "250px" }}
                onChange={(e) => setAssignmentHeading(e.target.value)}
                placeholder="Enter Assignment Heading"
              />
            </div>

            {/* Assignment description */}
            <div className="choice">
              <label className="label">Assignment Description</label>
              <textarea
                rows={8}
                cols={10}
                className="login-input"
                style={{ width: "450px" }}
                value={assignmentDescription}
                onChange={(e) => setAssignmentDescription(e.target.value)}
                placeholder="Enter Assignment Description"
              ></textarea>
            </div>

            {/* Perk points input */}
            <div className="choice">
              <label className="label">Perk Points</label>
              <input
                type="number"
                value={perkPoints}
                className="login-input"
                style={{ width: "160px", marginBottom: "10px" }}
                onChange={(e) => setPerkPoints(e.target.value)}
                placeholder="Enter Perk Points"
              />
            </div>

            {/* Submit button */}
            <button onClick={assignTask}>Assign Task</button>
          </div>
        </div>
        <div className="previous-tasks">
          <h2>Verify Assignment Completion</h2>
          {previousTasks.length > 0 ? (
            previousTasks.map((request, index) => (
              <div
                key={index}
                className="leave-request"
                style={{ width: "100%" }}
              >
                <p>
                  <span>Name : </span>
                  {request.name}
                </p>
                <p>
                  <span>Assinment Title : </span>
                  {request.assignment_heading}
                </p>
                <p>
                  <span>Assignment Description : </span>
                  {request.assignment_description}
                </p>
                <p>
                  <span>Perk Points : </span>
                  {request.perk_points}
                </p>

                <p>
                  <span>Status : </span>
                  {request.status}
                </p>
                {request.status === "Submitted" && (
                  <button
                    type="button"
                    onClick={() =>
                      review(
                        request.id,
                        request.faculty_id,
                        request.perk_points
                      )
                    }
                  >
                    Review and Allocate Perks
                  </button>
                )}
              </div>
            ))
          ) : (
            <p>No leave requests available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageEmployees;
