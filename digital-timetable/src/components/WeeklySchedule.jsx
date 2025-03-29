
import React, { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../contexts/AuthContext";

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const WeeklySchedule = () => {
  const { user } = useContext(AuthContext);
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await api.get("/timetable/");
        let entries = response.data;

        if (user.role === "student") {
          entries = entries.filter(entry => entry.section === user.section);
        } else if (user.role === "teacher") {
          entries = entries.filter(entry => 
            entry.timeSlots.some(slot => slot.teacher === user.name)
          );
        }

        const grouped = daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: [] }), {});

        entries.forEach(entry => {
          const dayName = daysOfWeek[new Date(entry.date).getDay()];
          grouped[dayName].push(entry);
        });

        setSchedule(grouped);
      } catch (err) {
        console.error("Error fetching schedule:", err);
        setError("Failed to load schedule. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchSchedule();
  }, [user]);

  if (loading) return <p>Loading schedule...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="weekly-schedule-container">
      <h2>Weekly Schedule</h2>
      <p>Your Section: {user.section || "Not set"}</p>
      <table className="weekly-schedule-table">
        <thead>
          <tr>
            <th>Day</th>
            <th>Schedule</th>
          </tr>
        </thead>
        <tbody>
          {daysOfWeek.map(day => (
            <tr key={day}>
              <td>{day}</td>
              <td>
                {schedule[day]?.length > 0 ? (
                  schedule[day].map(entry => (
                    <div key={entry._id} className="schedule-entry">
                      <strong>{entry.title}</strong> <br />
                      {user.role === "student" ? (
                        <>
                          Lecturer(s): {entry.timeSlots.map(slot => slot.teacher).join(", ")} <br />
                          Time(s): {entry.timeSlots.map(slot =>
                            `${new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                            ${new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                          ).join(" | ")}
                        </>
                      ) : (
                        <>
                          Section: {entry.section} <br />
                          Time(s): {entry.timeSlots.map(slot =>
                            `${new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                            ${new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                          ).join(" | ")}
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <span>No schedule available</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  
};

export default WeeklySchedule;
