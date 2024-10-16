import "./index.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const FacultyLogin = () => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [checkbox, setCheck] = useState(false);
  const [errCheckbox, setErrCheckbox] = useState(false);
  const [errEmail, setErrEmail] = useState(false);
  const [errPass, setErrPass] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const isCookie = Cookies.get("jwt_token");
  const navigate = useNavigate();

  useEffect(() => {
    if (isCookie !== undefined) {
      const user = Cookies.get("user");

      navigate(`/${user}`, { replace: true });
    }
  }, [isCookie, navigate]);

  const checkBoxChange = () => {
    setCheck((prev) => !prev);
  };

  const handleSuccess = (jwt, user) => {
    Cookies.set("jwt_token", jwt, { expires: 30 });
    Cookies.set("user", "faculty", { expires: 30 });
    Cookies.set("user_details", JSON.stringify(user), { expires: 30 });
    navigate("/faculty", { replace: true });
  };

  const handleFailure = (err) => {
    setErrMsg(err);
  };

  const submitForm = async (e) => {
    e.preventDefault();

    if (!checkbox) {
      setErrCheckbox(true);
      return;
    }
    setErrCheckbox(false);

    if (!errEmail && !errPass) {
      const userDetails = {
        email,
        password: pass,
      };

      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userDetails),
      };

      try {
        const response = await fetch(
          "http://localhost:3001/facultylogin",
          options
        );
        const data = await response.json();
        if (response.ok) {
          const { jwt, user } = data;
          handleSuccess(jwt, user);
        } else {
          const { errMsg } = data;
          handleFailure(errMsg);
        }
      } catch (error) {
        handleFailure("Something went wrong. Please try again later.");
      }
    }
  };

  return (
    <div className="home-page">
      <div className="login-page-container">
        <h1>Faculty Login</h1>
        <form className="login-container" onSubmit={submitForm}>
          <div className="input-label">
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              type="email"
              className="login-input"
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
          <div className="input-label">
            <label htmlFor="pass" className="label">
              Password
            </label>
            <input
              type="password"
              className="login-input"
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
          <button type="submit">Log in</button>
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
        </form>
      </div>
    </div>
  );
};

export default FacultyLogin;
