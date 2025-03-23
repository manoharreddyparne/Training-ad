import React, { useEffect, useState } from "react";
import api from "../services/api";

const TimetableList = () => {
  const [weeklySchedule, setWeeklySchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTimetable() {
      try {
        const response = await api.get("/timetable/");
        const allSchedules = response.data;

        if (!allSchedules || allSchedules.length === 0) {
          setError("No timetable found.");
          return;
        }
        const today = new Date().toLocaleString("en-US", { weekday: "long" });

        const filteredWeekly = allSchedules.filter((entry) => entry.title !== today);
        setWeeklySchedule(filteredWeekly);
      } catch (err) {
        setError("Error fetching timetable. Please try again.");
        console.error("Error fetching timetable:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTimetable();
  }, []);

  if (loading) return <p>Loading timetable...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Weekly Timetable</h2>
      {weeklySchedule.length === 0 ? (
        <p>No weekly schedule available.</p>
      ) : (
        weeklySchedule.map((entry, index) => (
          <div key={index} style={{ marginBottom: "10px", border: "1px solid #ccc", padding: "5px" }}>
            <h3>{entry.title}</h3>
            {entry.timeSlots.map((slot, i) => (
              <p key={i}>
                <strong>{slot.subject}</strong> - {slot.teacher} ({slot.room})
                <br />
                Time: {new Date(slot.startTime).toLocaleTimeString()} - {new Date(slot.endTime).toLocaleTimeString()}
              </p>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default TimetableList;
