import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import "./index.css";

const LeaveRequest = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveType, setLeaveType] = useState("Sick Leave");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const user_det = Cookies.get("user_details");
  const { id } = JSON.parse(user_det);

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/leave-requests/${id}`
        );
        if (response.ok) {
          const data = await response.json();
          setLeaveRequests(data.leaveRequests);
        } else {
          console.error("Failed to fetch leave requests.");
        }
      } catch (error) {
        console.error("Error fetching leave requests:", error);
      }
    };

    fetchLeaveRequests();
  }, [leaveRequests]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newRequest = {
      leaveType,
      startDate,
      endDate,
      reason,
    };

    try {
      const response = await fetch(
        `http://localhost:3001/faculty/leave-request/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newRequest),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLeaveRequests([...leaveRequests, data.request]);
        setMessage("Leave request submitted successfully.");
        resetForm();
      } else {
        setMessage("Failed to submit leave request.");
      }
    } catch (error) {
      console.error("Error submitting leave request:", error);
      setMessage("An unexpected error occurred.");
    }
  };

  const resetForm = () => {
    setLeaveType("Sick Leave");
    setStartDate("");
    setEndDate("");
    setReason("");
  };

  return (
    <div className="leave-request-container">
      <h1>Leave Request</h1>
      <div className="leave-request-row-container">
        <form onSubmit={handleSubmit} className="leave-request-form">
          <div className="choice">
            <label className="label">Leave Type:</label>
            <select
              value={leaveType}
              style={{ marginBottom: "10px" }}
              onChange={(e) => setLeaveType(e.target.value)}
              className="dept-select"
            >
              <option value="Sick Leave">Sick Leave</option>
              <option value="Casual Leave">Casual Leave</option>
              <option value="Earned Leave">Earned Leave</option>
            </select>
          </div>
          <div className="choice">
            <label className="label">Start Date:</label>
            <input
              type="date"
              value={startDate}
              className="login-input"
              style={{ width: "45%" }}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div className="choice">
            <label className="label">End Date:</label>
            <input
              type="date"
              value={endDate}
              className="login-input"
              style={{ width: "45%", marginBottom: "10px" }}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
          <div className="choice">
            <label className="label">Reason:</label>
            <textarea
              className="textarea-reason"
              rows={8}
              // cols={5}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>
          <button type="submit">Submit Request</button>
          {message && (
            <p style={{ marginTop: "10px", color: "green" }}>{message}</p>
          )}
        </form>
        <ul className="ul-leave-requests">
          <h2>Previous Leave Requests</h2>
          {leaveRequests.length > 0 ? (
            leaveRequests.map((request, index) => (
              <li key={index}>
                <p>
                  <span>Type: </span>
                  {request.leave_type}
                </p>
                <p>
                  <span>From: </span>
                  {new Date(request.start_date).toLocaleDateString()}
                </p>
                <p>
                  <span>To: </span>
                  {new Date(request.end_date).toLocaleDateString()}
                </p>
                <p>
                  <span>Reason: </span>
                  {request.reason}
                </p>
                <p>
                  <span>Status: </span>
                  {request.status}
                </p>
              </li>
            ))
          ) : (
            <p>No leave requests found.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default LeaveRequest;
