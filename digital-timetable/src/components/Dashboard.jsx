import React, { useContext, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import TimetableForm from "./TimetableForm";
import TimetableList from "./TimetableList";

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) return <p>Loading...</p>;
  if (!user) return null;


  return (
    <div style={{ padding: "20px" }}>
      <h1>Dashboard</h1>
      <p>
        Welcome, <strong>{user.name}</strong> ({user.role})
      </p>

      <hr />

      {user.role === "student" && (
        <>
          <h2>Your Schedule</h2>
          <TimetableList />
        </>
      )}

      {user.role === "teacher" && (
        <>
          <h2>Your Teaching Schedule</h2>
          <TimetableList />
          <Link to="/request-change">
            <button style={{ padding: "10px", marginTop: "10px", cursor: "pointer" }}>
              Request Schedule Change
            </button>
          </Link>
        </>
      )}

      {user.role === "admin" && (
        <>
          <h2>Create Timetable</h2>
          <TimetableForm />
          <h2>Existing Timetables</h2>
          <TimetableList />
        </>
      )}
    </div>
  );
};

export default Dashboard;
