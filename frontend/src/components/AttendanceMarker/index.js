import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import "./index.css";

const AttendanceMarker = () => {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [facultyInfo, setFacultyInfo] = useState(null);
  const [showWebcam, setShowWebcam] = useState(true);
  const [attendance, setAttendance] = useState("");
  const [names, setNames] = useState([]);
  const [name, setName] = useState("");
  const [dept, setDept] = useState("CSE");
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
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
  }, [dept]);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setShowWebcam(false);
  };

  const retake = () => {
    setCapturedImage(null);
    setShowWebcam(true);
    setFacultyInfo(null); // Clear faculty info when retaking
  };

  const handleSubmit = async () => {
    if (!capturedImage) {
      alert("Please capture an image.");
      return;
    }

    // Clear faculty info before submitting
    setFacultyInfo(null);
    setErrMsg(""); // Clear error message

    try {
      // Convert the image URL to a file object
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], "image.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("image", file);
      formData.append("dept", dept);
      formData.append("name", name);

      const options = {
        method: "POST",

        body: formData,
      };

      const result = await fetch(
        "http://localhost:3001/api/recognize",
        options
      );
      console.log(result);
      if (result.ok) {
        const { matchedFaculty, attendance } = await result.json();
        setAttendance(attendance);
        setFacultyInfo(matchedFaculty);
      } else {
        const { message } = await result.json();
        setErrMsg(message);
      }
    } catch (error) {
      console.error("Error recognizing face:", error);
      alert("An unexpected error occurred.");
    }
  };

  return (
    <div className="attendance-marker-main-container">
      <h1>Attendance Marker</h1>
      <div className="att-marker-container">
        <div className="left-att-marker-container">
          <div className="prompt-asking">
            <div className="choice">
              <select
                className="dept-selects"
                onChange={(e) => setDept(e.target.value)}
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
            </div>
            <div className="choice">
              <select
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
          </div>
          {showWebcam ? (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={440}
              height={400}
            />
          ) : (
            capturedImage && (
              <img
                src={capturedImage}
                alt="Captured"
                style={{
                  width: 420,
                  height: 380,
                  objectFit: "cover",
                  marginTop: "20px",
                }}
              />
            )
          )}
          <div className="button-container">
            <button onClick={showWebcam ? capture : retake}>
              {showWebcam ? "Capture Photo" : "Retake Photo"}
            </button>
            {capturedImage && <button onClick={handleSubmit}>Submit</button>}
          </div>
        </div>

        {facultyInfo ? (
          <div className="right-att-marker-info-container">
            <h3>Faculty Info</h3>
            <p>
              <span style={{ fontWeight: "600" }}>Name : </span>
              {facultyInfo.name}
            </p>
            <p>
              <span style={{ fontWeight: "600" }}>Department : </span>
              {facultyInfo.department_name}
            </p>
            <p>
              <span style={{ fontWeight: "600" }}>Email : </span>
              {facultyInfo.email}
            </p>
            <p>
              <span style={{ fontWeight: "600" }}>Bio : </span>
              {facultyInfo.bio}
            </p>
            <p>
              <span style={{ fontWeight: "600" }}>Status : </span>
              {facultyInfo.is_active ? "Active" : "In Active"}
            </p>
            <p>
              <span style={{ fontWeight: "600" }}>Attendance : </span>
              {attendance}
            </p>
          </div>
        ) : (
          <h2 style={{ margin: "20px" }}>{errMsg}</h2>
        )}
      </div>
    </div>
  );
};

export default AttendanceMarker;
