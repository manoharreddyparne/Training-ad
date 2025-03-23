import React, { useContext, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import TimetableForm from "./TimetableForm";
import TimetableList from "./TimetableList";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user, loading, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) return <p>Loading...</p>;
  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>
        Welcome, <strong>{user.name}</strong> ({user.role})
      </p>
      <button onClick={handleLogout} style={{ padding: "8px 16px", cursor: "pointer", marginBottom: "10px" }}>
        Logout
      </button>
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
        </>
      )}
    </div>
  );
};

export default Dashboard;
