import "./index.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const AdminRegistration = () => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("HOD");
  const [dept, setDept] = useState("CSE");
  const [checkbox, setCheck] = useState(false);
  const [errCheckbox, setErrCheckbox] = useState(false);
  const [errEmail, setErrEmail] = useState(false);
  const [errPass, setErrPass] = useState(false);
  const [errName, setErrName] = useState(false);
  const [errUsername, setErrUsername] = useState(false);
  const [profilePic, setProfilePic] = useState(null);

  const [errMsg, setErrMsg] = useState("");

  const isCookie = Cookies.get("jwt_token");
  const navigate = useNavigate();

  useEffect(() => {
    if (isCookie !== undefined) {
      const user = Cookies.get("user");
      navigate(`/${user}`);
    }
  }, [isCookie, navigate]);

  const checkBoxChange = () => {
    setCheck((prev) => !prev);
  };

  const handleSuccess = (jwt) => {
    navigate("/admin-login", { replace: true });
  };

  const handleFailure = (err) => {
    setErrMsg(err);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePic(file);
  };

  const submitForm = async (e) => {
    e.preventDefault();

    if (!checkbox) {
      setErrCheckbox(true);
      return;
    }

    if (!errEmail && !errPass && !errName && !errUsername && checkbox) {
      setErrCheckbox(false);

      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", pass);
      formData.append("name", name);
      formData.append("username", username);
      formData.append("role", role);
      formData.append("dept", dept);
      if (profilePic) {
        formData.append("profilePic", profilePic);
      }

      const options = {
        method: "POST",
        body: formData,
      };

      try {
        const response = await fetch(
          "http://localhost:3001/adminregister",
          options
        );
        const data = await response.json();
        if (response.ok) {
          const { jwt } = data;
          handleSuccess(jwt);
        } else {
          const { err } = data;
          handleFailure(err);
        }
      } catch (error) {
        console.log(error.message);
      }
    }
  };

  return (
    <div className="home-page">
      <div className="login-page-container login-page-container1">
        <h1 style={{ textAlign: "center" }}>Admin Registration</h1>
        <form
          className="login-container login-container1"
          onSubmit={submitForm}
        >
          <div className="row-input">
            <div className="input-label input1">
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                type="email"
                className="login-input login-input1"
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                onBlur={(e) => {
                  setErrEmail(e.target.value === "");
                }}
              />
              {errEmail && (
                <p style={{ color: "red", fontSize: "11px", marginTop: "3px" }}>
                  *Required
                </p>
              )}
            </div>
            <div className="input-label input-label1">
              <label htmlFor="pass" className="label">
                Password
              </label>
              <input
                type="password"
                className="login-input login-input1"
                id="pass"
                onChange={(e) => setPass(e.target.value)}
                onBlur={(e) => {
                  setErrPass(e.target.value === "");
                }}
              />
              {errPass && (
                <p style={{ color: "red", fontSize: "11px", marginTop: "3px" }}>
                  *Required
                </p>
              )}
            </div>
            <div className="input-label input1">
              <label htmlFor="name" className="label">
                Name
              </label>
              <input
                type="text"
                className="login-input login-input1"
                id="name"
                onChange={(e) => setName(e.target.value)}
                onBlur={(e) => {
                  setErrName(e.target.value === "");
                }}
              />
              {errName && (
                <p style={{ color: "red", fontSize: "11px", marginTop: "3px" }}>
                  *Required
                </p>
              )}
            </div>
            <div className="input-label input-label1">
              <label htmlFor="username" className="label">
                Username
              </label>
              <input
                type="text"
                className="login-input login-input1"
                id="username"
                onChange={(e) => setUsername(e.target.value)}
                onBlur={(e) => {
                  setErrUsername(e.target.value === "");
                }}
              />
              {errUsername && (
                <p style={{ color: "red", fontSize: "11px", marginTop: "3px" }}>
                  *Required
                </p>
              )}
            </div>
            <div className="input-label login-input2">
              <label htmlFor="role" className="label">
                Role
              </label>
              <select
                id="role"
                className="login-input"
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="HOD">Head of the Depatment</option>
                <option value="ASS HOD">Ass. Head of the Department</option>
              </select>
            </div>
            <div className="input-label login-input2">
              <label htmlFor="dept" className="label">
                Department
              </label>
              <select
                id="dept"
                className="login-input"
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
            <div className="pic-container">
              <label
                htmlFor="pic"
                className="label"
                style={{ marginRight: "10px" }}
              >
                Profile Pic
              </label>
              <input type="file" id="pic" onChange={handleFileChange} />
            </div>
          </div>
          <div className="button-cont">
            <button type="submit">Sign Up</button>
          </div>

          <div className="checkbox1">
            <input type="checkbox" id="checkbox" onChange={checkBoxChange} />
            <label htmlFor="checkbox">Agree with Terms & Conditions</label>
          </div>
          {errCheckbox && (
            <p
              style={{
                color: "red",
                fontSize: "11px",
                marginTop: "-15px",
                marginBottom: "10px",
              }}
            >
              *Required
            </p>
          )}
          {errMsg !== "" && !errCheckbox && (
            <p
              style={{
                color: "red",
                fontSize: "12px",
                marginTop: "-15px",
                marginBottom: "10px",
              }}
            >
              *{errMsg}
            </p>
          )}
          <p className="signup-para">
            Already Registered?{" "}
            <a href="/admin-login" className="signup-class">
              Login Now
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default AdminRegistration;
