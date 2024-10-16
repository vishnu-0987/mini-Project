import React, { useEffect, useState } from "react";
import "./index.css";

const FacultyHeader = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="faculty-header-main-container">
      <nav className="faculty-header-nav">
        <div className="clock">
          <span>Local Time : </span>
          <p> {formatTime(time)}</p>
        </div>
      </nav>
    </div>
  );
};

export default FacultyHeader;
