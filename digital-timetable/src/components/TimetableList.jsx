import React, { useEffect, useState } from "react";
import api from "../services/api";
import "./TimetableList.css";

const TimetableList = ({ filterOutToday = true }) => {
  const [weeklySchedule, setWeeklySchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTimetable() {
      try {
        const response = await api.get("/timetable/");
        const allSchedules = response.data;
        console.log("All schedules:", allSchedules);
        if (!allSchedules || allSchedules.length === 0) {
          setError("No timetable found.");
          return;
        }
        let filteredWeekly = allSchedules;
        if (filterOutToday) {
          const today = new Date().toLocaleString("en-US", { weekday: "long" });
          filteredWeekly = allSchedules.filter((entry) => entry.title !== today);
        }
        setWeeklySchedule(filteredWeekly);
      } catch (err) {
        setError("Error fetching timetable. Please try again.");
        console.error("Error fetching timetable:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTimetable();
  }, [filterOutToday]);

  if (loading) return <p>Loading timetable...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="timetable-list-container">
      <h2>Timetable List</h2>
      {weeklySchedule.length === 0 ? (
        <p>No timetable available.</p>
      ) : (
        weeklySchedule.map((entry, index) => (
          <div key={index} className="timetable-entry">
            <h3>{entry.title}</h3>
            {entry.timeSlots.map((slot, i) => (
              <p key={i}>
                <strong>{slot.subject}</strong> - {slot.teacher} ({slot.room})
                <br />
                Time: {slot.startTime} - {slot.endTime}
              </p>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default TimetableList;
