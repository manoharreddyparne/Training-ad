import React, { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [timetable, setTimetable] = useState({ subject: "", teacher: "", time: "" });
  const [message, setMessage] = useState("");

  if (!user || user.role !== "admin") {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const handleChange = (e) => {
    setTimetable({ ...timetable, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/timetable", timetable); // Removed 'response'
      setMessage("Timetable created successfully!");
      setTimetable({ subject: "", teacher: "", time: "" });
    } catch {
      setMessage("Error creating timetable."); // Removed 'error' variable
    }
  };
  

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <h2>Create Timetable</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="subject"
          placeholder="Subject"
          value={timetable.subject}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="teacher"
          placeholder="Teacher"
          value={timetable.teacher}
          onChange={handleChange}
          required
        />
        <input
          type="time"
          name="time"
          value={timetable.time}
          onChange={handleChange}
          required
        />
        <button type="submit">Create Timetable</button>
      </form>
    </div>
  );
};

export default AdminDashboard;
