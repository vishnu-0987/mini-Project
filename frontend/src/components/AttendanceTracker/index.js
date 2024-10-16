import React, { useState } from "react";
import "./index.css";

const AttendanceTracker = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAttendance = async () => {
    if (!selectedDate) return;

    // Validate the selected date
    const today = new Date().toISOString().split("T")[0];
    if (selectedDate > today) {
      setError("Cannot fetch attendance for future dates.");
      setAttendanceData([]);
      return;
    }

    setError("");
    setLoading(true);
    try {
      const [year, month, day] = selectedDate.split("-");
      const response = await fetch(
        `http://localhost:3001/api/attendance/${year}/${month}/${day}`
      );
      const data = await response.json();
      console.log(data);
      setAttendanceData(data);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setError("Error fetching attendance data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchAttendance();
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Absent":
        return "status-absent";
      case "Half Day":
        return "status-half-day";
      case "Present":
        return "status-full-day";
      default:
        return "";
    }
  };

  return (
    <div className="attendance-tracker-container">
      <h1 className="attendance-tracker-title">Faculty Attendance Tracker</h1>
      <form onSubmit={handleSubmit} className="attendance-tracker-form">
        <label className="date-label">
          Select Date:
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="date-input"
            required
          />
        </label>
        <button type="submit" className="submit-button">
          Fetch Attendance
        </button>
      </form>
      {error && <p className="error-text">{error}</p>}
      {loading ? (
        <p className="loading-text">Loading attendance data...</p>
      ) : (
        <div className="attendance-table-wrapper">
          {attendanceData.length > 0 ? (
            <table className="attendance-table">
              <thead>
                <tr>
                  <th className="table-header">Faculty ID</th>
                  <th className="table-header">Faculty Name</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((record) => (
                  <tr key={record.faculty_id} className="table-row">
                    <td className="table-cell">{record.faculty_id}</td>
                    <td className="table-cell">{record.faculty_name}</td>
                    <td
                      className={`table-cell ${getStatusClass(record.status)}`}
                    >
                      {record.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-records-text">
              No attendance records found for the selected date.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceTracker;
