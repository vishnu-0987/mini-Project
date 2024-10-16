import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import "./index.css";

const AdditionalTasks = () => {
  const [additonalTasks, setAdditonalTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [isStarted, setIsStarted] = useState(false);
  const userdet = Cookies.get("user_details");
  const { id } = JSON.parse(userdet);

  const fetchAdditionalTasks = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/faculty/all-additional-tasks/${id}`
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setAdditonalTasks(data.requests);
      }
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      setAdditonalTasks([]);
    }
  };

  const fetchCompletedTasks = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/faculty/all-completed-tasks/${id}`
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setCompletedTasks(data.requests);
      }
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      setCompletedTasks([]);
    }
  };

  useEffect(() => {
    fetchAdditionalTasks();
    fetchCompletedTasks();
  }, []);

  const approve = async (id) => {
    const response = await fetch(
      `http://localhost:3001/additional-request/approve/${id}`
    );
    console.log(response);
    fetchAdditionalTasks();
    fetchCompletedTasks();
    setIsStarted(true);
  };
  const reject = async (id) => {
    const response = await fetch(
      `http://localhost:3001/additional-request/reject/${id}`
    );
    console.log(response);
    fetchAdditionalTasks();
  };

  const submitTask = async (id) => {
    const response = await fetch(
      `http://localhost:3001/additional-request/submit/${id}`
    );
    console.log(response);
    fetchAdditionalTasks();
    fetchCompletedTasks();
  };

  return (
    <div className="additional-tasks-faculty-container">
      <h1>Additional Tasks</h1>
      <div className="previous-and-current-tasks-container">
        <div className="add-tasks-container">
          {additonalTasks.length > 0 ? (
            additonalTasks.map((request, index) => (
              <div key={index} className="add-request">
                <p>
                  <span>Assignment Title : </span>
                  {request.assignment_heading}
                </p>
                <p>
                  <span>Assignment Description : </span>
                  {request.assignment_description}
                </p>
                <p>
                  <span>Assigned Date : </span>
                  {request.assigned_at}
                </p>
                <p>
                  <span>Perk Points : </span>
                  {request.perk_points}
                </p>
                <p>
                  <span>Status : </span>
                  {request.status}
                </p>
                {!isStarted ? (
                  <div className="button-request-container">
                    <button
                      type="button"
                      style={{ backgroundColor: "green", color: "white" }}
                      onClick={() => approve(request.id)}
                    >
                      Start Doing
                    </button>

                    <button
                      type="button"
                      style={{ backgroundColor: "red" }}
                      onClick={() => reject(request.id)}
                    >
                      Ignore
                    </button>
                  </div>
                ) : (
                  <div className="button-request-container">
                    <button
                      type="button"
                      style={{ backgroundColor: "blue" }}
                      onClick={() => submitTask(request.id)}
                    >
                      Submit and Hand over Physical Documents
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No Tasks Assigned.</p>
          )}
        </div>
        <div className="previous-faculty-tasks-container">
          <h1>Previous Completed Tasks</h1>
          {completedTasks.length > 0 ? (
            completedTasks.map((request, index) => (
              <div
                className={
                  request.status === "Submitted"
                    ? "previous-add-request previous-add-request-orange"
                    : "previous-add-request"
                }
              >
                <p>
                  <span>Assignment Title : </span>
                  {request.assignment_heading}
                </p>
                <p>
                  <span>Status : </span>
                  {request.status === "Submitted"
                    ? "Verification in Progress"
                    : request.status === "Completed"
                    ? "Completed"
                    : request.status}
                </p>
                {}

                <p>
                  <span>
                    {request.status === "Completed"
                      ? "Perk Points Achieved "
                      : "Perk Points "}
                    :{" "}
                  </span>
                  {request.perk_points}
                </p>
              </div>
            ))
          ) : (
            <p>No Tasks Completed Yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdditionalTasks;
