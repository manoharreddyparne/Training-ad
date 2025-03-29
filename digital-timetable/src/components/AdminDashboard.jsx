import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [timetable, setTimetable] = useState({
    title: "",
    date: "",
    section: "",
    timeSlots: [
      { startTime: "", endTime: "", subject: "", teacher: "", room: "" }
    ]
  });
  const [message, setMessage] = useState("");
  const [timetables, setTimetables] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    console.log("Logged in user:", user);
    if (!user || user.role !== "admin") {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);
  useEffect(() => {
    if (user && user.role === "admin") {
      fetchTimetables();
    }
  }, [user]);

  const fetchTimetables = async () => {
    try {
      const res = await axios.get("/api/timetable/");
      console.log("Fetched timetables:", res.data);
      setTimetables(res.data);
    } catch (err) {
      console.error("Error fetching timetables:", err);
    }
  };

  const handleChange = (e) => {
    setTimetable({ ...timetable, [e.target.name]: e.target.value });
  };
  const handleTimeSlotChange = (index, e) => {
    const newSlots = [...timetable.timeSlots];
    newSlots[index][e.target.name] = e.target.value;
    setTimetable({ ...timetable, timeSlots: newSlots });
  };
  const addTimeSlot = () => {
    setTimetable({
      ...timetable,
      timeSlots: [
        ...timetable.timeSlots,
        { startTime: "", endTime: "", subject: "", teacher: "", room: "" }
      ]
    });
  };
  const removeTimeSlot = (index) => {
    const newSlots = timetable.timeSlots.filter((_, i) => i !== index);
    setTimetable({ ...timetable, timeSlots: newSlots });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (editing) {
        response = await axios.put(`/api/timetable/${editingId}`, timetable);
        setMessage("Timetable updated successfully!");
      } else {
        response = await axios.post("/api/timetable/", timetable);
        setMessage("Timetable created successfully!");
      }
      console.log("Response data:", response.data);

      setTimetable({
        title: "",
        date: "",
        section: "",
        timeSlots: [{ startTime: "", endTime: "", subject: "", teacher: "", room: "" }]
      });
      setEditing(false);
      setEditingId(null);
      fetchTimetables();
    } catch (err) {
      setMessage("Error creating/updating timetable.");
      console.error("Error:", err.response ? err.response.data : err.message);
    }
  };
  const handleEdit = (t) => {
    setEditing(true);
    setEditingId(t._id);
    setTimetable({
      title: t.title,
      date: t.date.split("T")[0],
      section: t.section,
      timeSlots: t.timeSlots.map(slot => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        subject: slot.subject,
        teacher: slot.teacher,
        room: slot.room
      }))
    });
  };
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/timetable/${id}`);
      setMessage("Timetable deleted successfully!");
      fetchTimetables();
    } catch (err) {
      setMessage("Error deleting timetable.");
      console.error("Error deleting:", err.response ? err.response.data : err.message);
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <h2>{editing ? "Update Timetable" : "Create Timetable"}</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit} className="timetable-form">
        <input
          type="text"
          name="title"
          placeholder="Timetable Title"
          value={timetable.title}
          onChange={handleChange}
          required
          className="form-input"
        />
        <input
          type="date"
          name="date"
          value={timetable.date}
          onChange={handleChange}
          required
          className="form-input"
        />
        <input
          type="text"
          name="section"
          placeholder="Section"
          value={timetable.section}
          onChange={handleChange}
          required
          className="form-input"
        />

        <h3>Time Slots</h3>
        {timetable.timeSlots.map((slot, index) => (
          <div key={index} className="time-slot">
            <input
              type="time"
              name="startTime"
              value={slot.startTime}
              onChange={e => handleTimeSlotChange(index, e)}
              required
              className="timeslot-input"
            />
            <input
              type="time"
              name="endTime"
              value={slot.endTime}
              onChange={e => handleTimeSlotChange(index, e)}
              required
              className="timeslot-input"
            />
            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={slot.subject}
              onChange={e => handleTimeSlotChange(index, e)}
              required
              className="timeslot-input"
            />
            <input
              type="text"
              name="teacher"
              placeholder="Teacher"
              value={slot.teacher}
              onChange={e => handleTimeSlotChange(index, e)}
              required
              className="timeslot-input"
            />
            <input
              type="text"
              name="room"
              placeholder="Room"
              value={slot.room}
              onChange={e => handleTimeSlotChange(index, e)}
              required
              className="timeslot-input"
            />
            {timetable.timeSlots.length > 1 && (
              <button
                type="button"
                onClick={() => removeTimeSlot(index)}
                className="btn-remove-timeslot"
                title="Remove Time Slot"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <div className="form-actions">
          <button
            type="button"
            onClick={addTimeSlot}
            className="btn-add-timeslot"
          >
            Add Time Slot
          </button>
          <button type="submit" className="btn-submit">
            {editing ? "Update Timetable" : "Create Timetable"}
          </button>
        </div>
      </form>

      <hr />

      <h2>Existing Timetables</h2>
      {timetables.length === 0 ? (
        <p>No timetables available.</p>
      ) : (
        <ul className="timetable-list">
          {timetables.map((t) => (
            <li key={t._id} className="timetable-item">
              <div className="timetable-info">
                <strong>{t.title}</strong> - {t.date.split("T")[0]} - {t.section}
              </div>
              <div className="timetable-actions">
                <button
                  onClick={() => handleEdit(t)}
                  className="btn-edit"
                  title="Edit Timetable"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(t._id)}
                  className="btn-delete"
                  title="Delete Timetable"
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminDashboard;
