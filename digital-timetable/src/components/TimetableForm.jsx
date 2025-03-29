import React, { useState } from 'react';
import api from '../services/api';
import "./TimetableForm.css";

const TimetableForm = () => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [section, setSection] = useState('');
  const [timeSlots, setTimeSlots] = useState([
    { startTime: '', endTime: '', subject: '', teacher: '', room: '' }
  ]);
  const [message, setMessage] = useState('');

  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, { startTime: '', endTime: '', subject: '', teacher: '', room: '' }]);
  };

  const handleTimeSlotChange = (index, field, value) => {
    const newTimeSlots = [...timeSlots];
    newTimeSlots[index][field] = value;
    setTimeSlots(newTimeSlots);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title,
      date,
      section,
      timeSlots,
    };
    console.log("Submitting payload:", payload);
    try {
      const response = await api.post('/timetable/', payload);
      setMessage("Timetable created/updated successfully!");
      console.log("Response data:", response.data);
    } catch (err) {
      setMessage("Error creating timetable.");
      console.error("Error details:", err.response ? err.response.data : err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="timetable-form">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      />
      <input 
        type="date" 
        placeholder="Date" 
        value={date} 
        onChange={e => setDate(e.target.value)} 
        required 
      />
      <input
        type="text"
        placeholder="Section"
        value={section}
        onChange={e => setSection(e.target.value)}
        required
      />
      <h3>Time Slots:</h3>
      {timeSlots.map((slot, index) => (
        <div key={index} className="timeslot">
          <input
            type="time"
            placeholder="Start Time"
            value={slot.startTime}
            onChange={e => handleTimeSlotChange(index, 'startTime', e.target.value)}
            required
          />
          <input
            type="time"
            placeholder="End Time"
            value={slot.endTime}
            onChange={e => handleTimeSlotChange(index, 'endTime', e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Subject"
            value={slot.subject}
            onChange={e => handleTimeSlotChange(index, 'subject', e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Teacher"
            value={slot.teacher}
            onChange={e => handleTimeSlotChange(index, 'teacher', e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Room"
            value={slot.room}
            onChange={e => handleTimeSlotChange(index, 'room', e.target.value)}
            required
          />
        </div>
      ))}
      <button type="button" onClick={addTimeSlot}>Add Time Slot</button>
      <button type="submit">Submit Timetable</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default TimetableForm;
