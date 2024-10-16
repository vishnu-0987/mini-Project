import { Route, Routes, BrowserRouter } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./Pages/Home";

import "./App.css";
import AdminLogin from "./components/AdminLogin";
import FacultyLogin from "./components/FacultyLogin";
import Faculty from "./Pages/Faculty";
import Admin from "./Pages/Admin";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRegistration from "./components/AdminRegistration";
import ProfileCompletionPage from "./Pages/ProfileCompletionPage";

const App = () => {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // Check if splash screen has already been shown in this session
    const splashShown = sessionStorage.getItem("splashShown");

    if (!splashShown) {
      setShowSplash(true);
      // Set a timeout to hide the splash screen after 3 seconds (3000 ms)
      const timer = setTimeout(() => {
        setShowSplash(false);
        // Set the flag in session storage
        sessionStorage.setItem("splashShown", "true");
      }, 3000);

      // Clean up the timer when the component unmounts
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div>
      {showSplash ? (
        // Splash screen with your college logo
        <div className="splash-screen">
          <img
            src="https://media.licdn.com/dms/image/C560BAQEEf96n13OC1A/company-logo_200_200/0/1658502158446?e=2147483647&v=beta&t=ptxNDgoPnwFqldAS9nv-qGi4rrO66XerQGYTkkr-Pd0"
            alt="College Logo"
            className="animated-logo"
          />
        </div>
      ) : (
        // Your main app content goes here
        <BrowserRouter>
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route exact path="/admin-login" element={<AdminLogin />} />
            <Route
              exact
              path="/admin-register"
              element={<AdminRegistration />}
            />
            <Route
              exact
              path="/complete-profile"
              element={<ProfileCompletionPage />}
            />
            <Route exact path="/faculty-login" element={<FacultyLogin />} />
            <Route exact path="/faculty" element={<Faculty />} />
            <Route exact path="/admin" element={<Admin />} />
          </Routes>
        </BrowserRouter>
      )}
    </div>
  );
};

export default App;
