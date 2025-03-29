const mongoose = require("mongoose");

const TimeSlotSchema = new mongoose.Schema({
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  subject: { type: String, required: true },
  teacher: { type: String, required: true },
  room: { type: String, required: true }
});

const TimetableSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  section: { type: String, required: true }, 
  timeSlots: [TimeSlotSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

module.exports = mongoose.model("Timetable", TimetableSchema);
