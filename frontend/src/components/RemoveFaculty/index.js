import { useEffect, useState } from "react";
import "./index.css";

const RemoveFaculty = () => {
  const [dept, setDept] = useState("CSE");
  const [names, setNames] = useState([]);
  const [name, setName] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    console.log(name);
    if (name === "") {
      alert("no name is selected");
      return;
    }
    const userDetails = {
      name,
    };

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userDetails),
    };

    const response = await fetch(
      "http://localhost:3001/remove-faculty",
      options
    );
    if (response.ok) {
      alert("Faculty removed");
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
      <button type="submit">Remove Faculty</button>
    </form>
  );
};

export default RemoveFaculty;
