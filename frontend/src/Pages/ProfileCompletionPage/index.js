import React, { useState, useCallback, useRef } from "react";
import "./index.css";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Webcam from "react-webcam";

const ProfileCompletionPage = () => {
  const [bio, setBio] = useState("");
  const [goals, setGoals] = useState("");
  const [date, setDate] = useState("");
  const [pass, setPass] = useState("");
  const [capturedImage, setCapturedImage] = useState(null);
  const [showWebcam, setShowWebcam] = useState(true);
  const navigate = useNavigate();
  const webcamRef = useRef(null);

  const WIDTH = 300; // Define the width
  const HEIGHT = 300; // Define the height

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setShowWebcam(false);
  }, [webcamRef]);

  const retake = () => {
    setCapturedImage(null);
    setShowWebcam(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    const userdetails = Cookies.get("user_details");
    const parsedUserDetails = JSON.parse(userdetails);
    const { faculty_id } = parsedUserDetails;

    if (!capturedImage) {
      alert("Please capture your profile picture.");
      return;
    }

    // Convert the image URL to a file object
    try {
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], "profilePic.jpg", { type: "image/jpeg" });

      console.log("File Object:", file);

      const formData = new FormData();
      formData.append("bio", bio);
      formData.append("pass", pass);
      formData.append("goals", goals);
      formData.append("start_date", date);
      formData.append("profilePic", file);
      formData.append("faculty_id", faculty_id);

      const options = {
        method: "POST",
        body: formData,
      };

      const resp = await fetch(
        "http://localhost:3001/profile-completion",
        options
      );

      if (resp.ok) {
        const { pic } = await resp.json();
        Cookies.set("pic", pic);
        navigate("/faculty");
      } else {
        const error = await resp.text();
        alert(`Error occurred: ${error}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("An unexpected error occurred.");
    }
  };

  return (
    <div className="completion-main-container">
      <form
        className="profile-completion-page"
        onSubmit={submit}
        encType="multipart/form-data"
      >
        <h1>Fill Your Profile Details</h1>
        <div className="two-piece">
          <div className="choice">
            <label htmlFor="bio" className="label">
              Bio
            </label>
            <textarea
              rows={1}
              cols={35}
              className="input-field"
              id="bio"
              required
              onChange={(e) => setBio(e.target.value)}
            ></textarea>
          </div>
          <div className="choice">
            <label htmlFor="password" className="label">
              Change Password
            </label>
            <input
              type="password"
              className="input-field"
              id="password"
              required
              onChange={(e) => setPass(e.target.value)}
            />
          </div>
        </div>
        <div className="two-piece">
          <div className="choice">
            <label htmlFor="goals" className="label">
              Goals
            </label>
            <input
              type="text"
              className="input-field"
              id="goals"
              required
              onChange={(e) => setGoals(e.target.value)}
            />
          </div>
          <div className="choice">
            <label htmlFor="date" className="label">
              Start Date
            </label>
            <input
              type="date"
              className="input-field"
              id="date"
              required
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
        <div className="choice">
          <label htmlFor="pic" className="label label-1">
            Profile Pic
          </label>
          {showWebcam ? (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={WIDTH}
              height={HEIGHT}
            />
          ) : (
            capturedImage && (
              <img
                src={capturedImage}
                alt="Captured"
                style={{
                  width: WIDTH,
                  height: HEIGHT,
                  objectFit: "cover",
                  marginTop: "36px",
                  marginBottom: "30px",
                }}
              />
            )
          )}
          <button
            type="button"
            onClick={showWebcam ? capture : retake}
            className="capture-button"
          >
            {showWebcam ? "Capture Photo" : "Retake Photo"}
          </button>
        </div>
        <button type="submit" className="submit-completion">
          Submit
        </button>
      </form>
    </div>
  );
};

export default ProfileCompletionPage;
