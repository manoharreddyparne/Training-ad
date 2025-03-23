// src/components/TodaysTimetable.jsx
import React, { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../contexts/AuthContext";

const TodaysTimetable = () => {
  const { user } = useContext(AuthContext);
  const [currentClass, setCurrentClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTodaysTimetable() {
      try {
        // Fetch the weekly timetable
        const response = await api.get("/timetable/");
        let entries = response.data;
        const now = new Date();
        const todayDay = now.getDay(); // 0 (Sunday) to 6 (Saturday)

        // Filter timetable based on user role
        if (user.role === "student") {
          entries = entries.filter(entry => entry.section === user.section);
        } else if (user.role === "teacher") {
          entries = entries.filter(entry =>
            entry.timeSlots.some(slot => slot.teacher === user.name)
          );
        }

        // Find today's entries
        const todaysEntries = entries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate.getDay() === todayDay;
        });

        // Find the current class happening
        let ongoingClass = null;
        todaysEntries.forEach(entry => {
          entry.timeSlots.forEach(slot => {
            const startTime = new Date(slot.startTime);
            const endTime = new Date(slot.endTime);

            if (now >= startTime && now <= endTime) {
              ongoingClass = {
                subject: slot.subject,
                teacher: slot.teacher,
                startTime: startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                endTime: endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              };
            }
          });
        });

        setCurrentClass(ongoingClass);
      } catch (err) {
        console.error("Error fetching today's timetable:", err);
        setError("Error fetching today's timetable. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchTodaysTimetable();
    }
  }, [user]);

  if (loading) return <p>Loading today's timetable...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Today's Timetable</h2>
      <p>
        <strong>Your Section:</strong> {user.section ? user.section : "Not set"}
      </p>
      {currentClass ? (
        <p>
          <strong>Ongoing Class:</strong> {currentClass.subject} by {currentClass.teacher} ({currentClass.startTime} - {currentClass.endTime})
        </p>
      ) : (
        <p>No classes scheduled for now.</p>
      )}
    </div>
  );
};

export default TodaysTimetable;
