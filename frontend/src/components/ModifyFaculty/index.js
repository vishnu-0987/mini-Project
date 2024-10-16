import { useEffect, useState } from "react";
import "./index.css";

const ModifyFaculty = () => {
  const [dept, setDept] = useState("CSE");
  const [names, setNames] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    console.log(name);
    if (name === "") {
      alert("no name is selected");
      return;
    }
    const userDetails = {
      name,
      email,
    };

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userDetails),
    };

    const response = await fetch(
      "http://localhost:3001/modify-faculty",
      options
    );
    if (response.ok) {
      alert("Email Changed");
    } else {
      alert("Error");
    }
  };

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

  return (
    <form className="crud-faculty-choice" onSubmit={submit}>
      <div className="choice">
        <label htmlFor="dept" className="label">
          Department
        </label>
        <select
          id="dept"
          className="select-choice"
          onChange={(e) => setDept(e.target.value)} // Change onClick to onChange
          value={dept} // Ensure the select reflects the current department state
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
        <label htmlFor="name" className="label">
          Name
        </label>
        <select
          id="name"
          className="select-choice"
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
      <div className="choice">
        <label htmlFor="emial" className="label">
          Change Email
        </label>
        <input
          type="text"
          className="input-choice"
          id="emial"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <button type="submit">Modify Details</button>
    </form>
  );
};

export default ModifyFaculty;
