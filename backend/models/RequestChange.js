const mongoose = require("mongoose");

const RequestChangeSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  teacherName: { type: String, required: true },
  date: { type: String, required: true },
  currentTimeSlot: { type: String, required: true },
  requestedTimeSlot: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
}, { timestamps: true });

module.exports = mongoose.model("RequestChange", RequestChangeSchema);
