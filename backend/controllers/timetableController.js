const Timetable = require("../models/Timetable");
const nodemailer = require("nodemailer");
const { addEventToCalendar } = require("../utils/googleCalendar");
const User = require("../models/User");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, 
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
transporter.verify((error, success) => {
  if (error) {
    console.error("Error verifying transporter:", error);
  } else {
    console.log("Server is ready to send emails");
  }
});
exports.adminDashboard = (req, res) => {
  res.json({ message: "Welcome to the Admin Dashboard", user: req.user });
};
exports.teacherDashboard = (req, res) => {
  res.json({ message: "Welcome to the Teacher Dashboard", user: req.user });
};
exports.studentDashboard = (req, res) => {
  res.json({ message: "Welcome to the Student Dashboard", user: req.user });
};
exports.getTimetables = async (req, res) => {
  try {
    const timetables = await Timetable.find();
    res.status(200).json(timetables);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.toString() });
  }
};
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

exports.createTimetable = async (req, res) => {
  try {
    let timetableDataArray = Array.isArray(req.body) ? req.body : [req.body];
    let results = [];
    
    for (const data of timetableDataArray) {
      const { title, date, section, timeSlots } = data;

      const parsedDate = new Date(date);
      // Combine date with the provided times to form valid ISO strings.
      const parsedTimeSlots = timeSlots.map(slot => ({
        ...slot,
        startTime: new Date(`${date}T${slot.startTime}`),
        endTime: new Date(`${date}T${slot.endTime}`)
      }));
      
      let timetable = await Timetable.findOne({
        title: title,
        date: parsedDate,
        section: section,
      });
      
      if (timetable) {
        timetable.timeSlots = parsedTimeSlots;
        timetable = await timetable.save();
        console.log("Existing timetable updated.");
      } else {
        timetable = new Timetable({
          title,
          date: parsedDate,
          section,
          timeSlots: parsedTimeSlots,
          createdBy: req.user.id,
        });
        await timetable.save();
        console.log("New timetable created.");
      }
  
      // [Rest of your event-adding and socket logic remains unchanged...]
      const eventResponses = [];
      if (req.user.role === "admin") {
        const students = await User.find({
          role: "student",
          section: section, 
          googleAccessToken: { $exists: true, $ne: null },
        });
        console.log("Found", students.length, "student(s) in section", section);
        for (const student of students) {
          for (let i = 0; i < parsedTimeSlots.length; i++) {
            try {
              const calendarEvent = await addEventToCalendar(student, timetable, i);
              eventResponses.push({
                student: student.email,
                timeSlotIndex: i,
                event: calendarEvent,
              });
            } catch (err) {
              console.error(
                `Failed to add event for ${student.email} (timeSlot ${i}):`,
                err
              );
              eventResponses.push({
                student: student.email,
                timeSlotIndex: i,
                error: err.toString(),
              });
            }
          }
        }
      } else {
        for (let i = 0; i < parsedTimeSlots.length; i++) {
          try {
            const calendarEvent = await addEventToCalendar(req.user, timetable, i);
            eventResponses.push({
              student: req.user.email,
              timeSlotIndex: i,
              event: calendarEvent,
            });
          } catch (err) {
            console.error(
              `Failed to add event for ${req.user.email} (timeSlot ${i}):`,
              err
            );
            eventResponses.push({
              student: req.user.email,
              timeSlotIndex: i,
              error: err.toString(),
            });
          }
        }
      }
      const io = req.app.get("socketio");
      io.emit("timetableUpdated", { action: "created", timetable });
  
      results.push({ timetable, calendarEvents: eventResponses });
    }
    
    res.status(201).json(results);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.toString() });
  }
};


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
    const io = req.app.get("socketio");
    io.emit("timetableUpdated", { action: "updated", timetable: updatedTimetable });
    res.status(200).json(updatedTimetable);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.toString() });
  }
};

exports.deleteTimetable = async (req, res) => {
  try {
    const deletedTimetable = await Timetable.findByIdAndDelete(req.params.id);
    if (!deletedTimetable) {
      return res.status(404).json({ message: "Timetable not found" });
    }
    const io = req.app.get("socketio");
    io.emit("timetableUpdated", { action: "deleted", timetable: deletedTimetable });
    res.status(200).json({ message: "Timetable deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.toString() });
  }
};

const isOverlap = (slot1, slot2) => {
  const start1 = new Date(slot1.startTime);
  const end1 = new Date(slot1.endTime);
  const start2 = new Date(slot2.startTime);
  const end2 = new Date(slot2.endTime);
  return start1 < end2 && start2 < end1;
};

exports.checkConflicts = async (req, res) => {
  try {
    const timetables = await Timetable.find();
    const conflicts = [];
    timetables.forEach((timetable) => {
      const slots = timetable.timeSlots;
      for (let i = 0; i < slots.length; i++) {
        for (let j = i + 1; j < slots.length; j++) {
          if (
            isOverlap(slots[i], slots[j]) &&
            (slots[i].room === slots[j].room || slots[i].teacher === slots[j].teacher)
          ) {
            conflicts.push({
              timetableId: timetable._id,
              title: timetable.title,
              conflictBetween: [slots[i], slots[j]],
            });
          }
        }
      }
    });
    if (conflicts.length > 0) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: "Timetable Conflict Alert",
        text: `Conflicts found in timetable(s): ${conflicts.map((c) => c.title).join(", ")}. Please review.`,
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
