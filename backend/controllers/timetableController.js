const Timetable = require("../models/Timetable");
const nodemailer = require("nodemailer");
const { addEventToCalendar } = require("../utils/googleCalendar");

// Set up nodemailer transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,        // secure port
  secure: true,     // use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS  // ensure no spaces in the app password
  }
});

// Verify transporter
transporter.verify((error, success) => {
  if (error) {
    console.error("Error verifying transporter:", error);
  } else {
    console.log("Server is ready to send emails");
  }
});

// Dashboard Endpoints
exports.adminDashboard = (req, res) => {
  res.json({ 
    message: "Welcome to the Admin Dashboard",
    user: req.user
  });
};

exports.teacherDashboard = (req, res) => {
  res.json({ 
    message: "Welcome to the Teacher Dashboard",
    user: req.user
  });
};

exports.studentDashboard = (req, res) => {
  res.json({ 
    message: "Welcome to the Student Dashboard",
    user: req.user
  });
};

// Get all timetables
exports.getTimetables = async (req, res) => {
  try {
    const timetables = await Timetable.find();
    res.status(200).json(timetables);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.toString() });
  }
};

// Get a single timetable by ID
exports.getTimetableById = async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id);
    if (!timetable) {
      return res.status(404).json({ message: "Timetable not found" });
    }
    res.status(200).json(timetable);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.toString() });
  }
};

// Create a new timetable and add an event to the user's Google Calendar
exports.createTimetable = async (req, res) => {
  try {
    const { title, date, timeSlots } = req.body;
    const newTimetable = new Timetable({
      title,
      date,
      timeSlots,
      createdBy: req.user.id,
    });
    await newTimetable.save();

    // After saving, update the user's Google Calendar using their stored tokens.
    try {
      const calendarEvent = await addEventToCalendar(req.user, newTimetable);
      console.log("Calendar event created:", calendarEvent);
    } catch (calendarError) {
      console.error("Failed to add event to Google Calendar:", calendarError);
    }

    // Emit a real-time update using Socket.io
    const io = req.app.get("socketio");
    io.emit("timetableUpdated", { action: "created", timetable: newTimetable });

    res.status(201).json(newTimetable);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.toString() });
  }
};

// Update a timetable by ID
exports.updateTimetable = async (req, res) => {
  try {
    const updatedTimetable = await Timetable.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedTimetable) {
      return res.status(404).json({ message: "Timetable not found" });
    }
    // Optionally, update the calendar event here (if needed)

    // Emit a real-time update using Socket.io
    const io = req.app.get("socketio");
    io.emit("timetableUpdated", { action: "updated", timetable: updatedTimetable });

    res.status(200).json(updatedTimetable);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.toString() });
  }
};

// Delete a timetable by ID
exports.deleteTimetable = async (req, res) => {
  try {
    const deletedTimetable = await Timetable.findByIdAndDelete(req.params.id);
    if (!deletedTimetable) {
      return res.status(404).json({ message: "Timetable not found" });
    }
    // Optionally, remove calendar event (if you store event IDs)

    // Emit a real-time update using Socket.io
    const io = req.app.get("socketio");
    io.emit("timetableUpdated", { action: "deleted", timetable: deletedTimetable });

    res.status(200).json({ message: "Timetable deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.toString() });
  }
};

// Helper function to check time slot overlap
const isOverlap = (slot1, slot2) => {
  const start1 = new Date(slot1.startTime);
  const end1 = new Date(slot1.endTime);
  const start2 = new Date(slot2.startTime);
  const end2 = new Date(slot2.endTime);
  return start1 < end2 && start2 < end1;
};

// Check for timetable conflicts and send an email notification if found
exports.checkConflicts = async (req, res) => {
  try {
    const timetables = await Timetable.find();
    const conflicts = [];

    timetables.forEach((timetable) => {
      const slots = timetable.timeSlots;
      for (let i = 0; i < slots.length; i++) {
        for (let j = i + 1; j < slots.length; j++) {
          if (isOverlap(slots[i], slots[j])) {
            // Only flag a conflict if the room or teacher is the same
            if (slots[i].room === slots[j].room || slots[i].teacher === slots[j].teacher) {
              conflicts.push({
                timetableId: timetable._id,
                title: timetable.title,
                conflictBetween: [slots[i], slots[j]]
              });
            }
          }
        }
      }
    });

    if (conflicts.length > 0) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: 'Timetable Conflict Alert',
        text: `Conflicts found in timetable(s): ${conflicts.map(c => c.title).join(", ")}. Please review.`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
        } else {
          console.log("Email sent:", info.response);
        }
      });

      res.status(200).json({ message: "Conflicts found and notifications sent", conflicts });
    } else {
      res.status(200).json({ message: "No conflicts found" });
    }
  } catch (error) {
    console.error("Error in checkConflicts:", error);
    res.status(500).json({ message: "Server error", error: error.toString() });
  }
};
