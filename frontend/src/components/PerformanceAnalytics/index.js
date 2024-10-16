import React, { useState, useEffect } from "react";
import "./index.css";
import { Line, Bar, Pie, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  PieController,
  RadarController,
  CategoryScale,
  LinearScale,
  PointElement,
  ArcElement,
  RadialLinearScale,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  PieController,
  RadarController,
  CategoryScale,
  LinearScale,
  PointElement,
  ArcElement,
  RadialLinearScale
);

const PerformanceAnalytics = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [perksData, setPerksData] = useState([]);
  const [attendanceDistribution, setAttendanceDistribution] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch attendance data
        const attendanceResponse = await fetch(
          "http://localhost:3001/api/attendance"
        );
        if (!attendanceResponse.ok)
          throw new Error("Error fetching attendance data");
        const attendanceResult = await attendanceResponse.json();
        setAttendanceData(attendanceResult);

        // Fetch attendance distribution data
        const distributionResponse = await fetch(
          "http://localhost:3001/api/attendance-distribution"
        );
        if (!distributionResponse.ok)
          throw new Error("Error fetching attendance distribution data");
        const distributionResult = await distributionResponse.json();
        console.log(distributionResult);
        setAttendanceDistribution(distributionResult);

        // Fetch perks data
        const perksResponse = await fetch(
          "http://localhost:3001/all-perks-points"
        );
        if (!perksResponse.ok) throw new Error("Error fetching perks data");
        const perksResult = await perksResponse.json();
        setPerksData(perksResult);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Process data for charts
  const attendanceChartData = {
    labels: attendanceData.map((item) => item.name),
    datasets: [
      {
        label: "Total Attendance",
        data: attendanceData.map((item) => item.total_attendance),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const attendanceDistributionData = {
    labels: ["Present", "Half Day", "Absent"], // Static labels based on the status
    datasets: [
      {
        label: "Attendance Distribution",
        data: [
          attendanceDistribution.Present || 0, // Fetch the count for Present
          attendanceDistribution["Half Day"] || 0, // Fetch the count for Half Day
          attendanceDistribution.Absent || 0, // Fetch the count for Absent
        ],
        backgroundColor: [
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(255, 159, 64, 0.2)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const perksChartData = {
    labels: perksData.map((item) => item.name),
    datasets: [
      {
        label: "Total Perks",
        data: perksData.map((item) => item.total_perks),
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  const calculateIncrement = (totalPerks) => {
    if (totalPerks >= 5 && totalPerks < 25) {
      return "2%";
    } else if (totalPerks >= 25 && totalPerks < 50) {
      return "5%";
    } else if (totalPerks >= 50) {
      return "8%";
    } else {
      return "0%";
    }
  };

  return (
    <div className="analytics-container">
      <h1 className="analytics-title">Performance Analytics</h1>

      {/* Attendance Metrics */}
      <section className="attendance-section">
        <div className="attendance-chart-container">
          <h3 className="chart-title">Total Attendance</h3>
          <Bar data={attendanceChartData} options={{ responsive: true }} />
        </div>
        <div className="attendance-chart-container">
          <h3 className="chart-title">Attendance Distribution</h3>
          <Pie
            data={attendanceDistributionData}
            options={{ responsive: true }}
          />
        </div>
      </section>

      {/* Faculty Perks */}
      <section className="perks-section">
        <div className="perks-chart-container">
          <h3 className="chart-title">Total Perks</h3>
          <Bar data={perksChartData} options={{ responsive: true }} />
        </div>

        <div className="perks-table-container">
          <h3 className="table-title">Perks Table</h3>
          <table className="perks-table">
            <thead>
              <tr>
                <th>Faculty Name</th>
                <th>Total Perks</th>
              </tr>
            </thead>
            <tbody>
              {perksData.map((perk) => (
                <tr key={perk.faculty_id}>
                  <td>{perk.name}</td>
                  <td>{perk.total_perks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="salary-increment-section">
        <h3 className="table-title">Annual Salary Increment (%)</h3>
        <table className="perks-table">
          <thead>
            <tr>
              <th>Faculty Name</th>
              <th>Total Perks</th>
              <th>Salary Increment</th>
            </tr>
          </thead>
          <tbody>
            {perksData.map((perk) => (
              <tr key={perk.faculty_id}>
                <td>{perk.name}</td>
                <td>{perk.total_perks}</td>
                <td>{calculateIncrement(perk.total_perks)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default PerformanceAnalytics;
