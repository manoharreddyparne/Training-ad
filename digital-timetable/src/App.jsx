// src/App.jsx (or another component)
import React, { useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  useEffect(() => {
    socket.on("timetableUpdated", (data) => {
      console.log("Timetable updated:", data);
      // You can update state to show notifications, refresh timetable lists, etc.
    });

    // Clean up on unmount
    return () => {
      socket.off("timetableUpdated");
    };
  }, []);

  return (
    <div>
      <h1>Your App</h1>
      {/* Render your components */}
    </div>
  );
}

export default App;
