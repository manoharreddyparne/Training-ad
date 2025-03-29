import React from "react";
import { useNavigate } from "react-router-dom";
import "./TeacherSchedule.css";

const TeacherSchedule = ({ schedule }) => {
  const navigate = useNavigate();

  return (
    <div className="teacher-schedule-container">
      <h2>Your Schedule</h2>
      {schedule.length === 0 ? (
        <p>No schedule available.</p>
      ) : (
        <table className="teacher-schedule-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Date</th>
              <th>Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((classDetails, index) => (
              <tr key={index}>
                <td>{classDetails.subject}</td>
                <td>{classDetails.date}</td>
                <td>
                  {classDetails.startTime} - {classDetails.endTime}
                </td>
                <td>
                  <button
                    className="teacher-schedule-button"
                    onClick={() =>
                      navigate("/request-change", { state: { classDetails } })
                    }
                  >
                    Request Change
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TeacherSchedule;
