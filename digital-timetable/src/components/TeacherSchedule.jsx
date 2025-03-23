import React from "react";
import { useNavigate } from "react-router-dom";

const TeacherSchedule = ({ schedule }) => {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Your Schedule</h2>
      {schedule.length === 0 ? (
        <p>No schedule available.</p>
      ) : (
        <table border="1">
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
                <td>{classDetails.startTime} - {classDetails.endTime}</td>
                <td>
                  <button
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
