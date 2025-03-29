import React, { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./RequestChangeForm.css";

const RequestChangeForm = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: "",
    currentTimeSlot: "",
    requestedTimeSlot: "",
    reason: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/request-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: user.id,
          teacherName: user.name,
          ...formData,
        }),
      });

      if (response.ok) {
        alert("Request sent to admin.");
        navigate("/dashboard");
      } else {
        alert("Failed to send request.");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="request-change-container">
      <h2>Request Schedule Change</h2>
      <form onSubmit={handleSubmit} className="request-change-form">
        <label>
          Date:
          <input type="date" name="date" value={formData.date} onChange={handleChange} required />
        </label>
        
        <label>
          Current Time Slot:
          <input type="text" name="currentTimeSlot" value={formData.currentTimeSlot} onChange={handleChange} required />
        </label>

        <label>
          Requested Time Slot:
          <input type="text" name="requestedTimeSlot" value={formData.requestedTimeSlot} onChange={handleChange} required />
        </label>

        <label>
          Reason for Change:
          <textarea name="reason" value={formData.reason} onChange={handleChange} required />
        </label>

        <button type="submit">Submit Request</button>
      </form>
    </div>
  );
};

export default RequestChangeForm;
