import { useState } from "react";
import "./index.css";

const AddFaculty = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dept, setDept] = useState("CSE");
  const [res, setRes] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const userDetails = {
      name,
      email,
      department_name: dept,
    };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userDetails),
    };

    const response = await fetch("http://localhost:3001/add-faculty", options);
    const data = await response.json();
    if (response.ok) {
      setRes(data.msg);
      alert("Faculty Added");
    } else {
      setRes(data.err);
      alert("Error while Adding");
    }
  };

  return (
    <form className="crud-faculty-choice" onSubmit={submit}>
      <div className="choice">
        <label htmlFor="name" className="label">
          Name
        </label>
        <input
          type="text"
          className="input-choice"
          id="name"
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="choice">
        <label htmlFor="emial" className="label">
          Email
        </label>
        <input
          type="email"
          className="input-choice"
          id="emial"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="choice">
        <label htmlFor="dept" className="label">
          Department
        </label>
        <select
          id="dept"
          className="select-choice"
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
      <button type="submit">Add Faculty</button>
    </form>
  );
};

export default AddFaculty;
