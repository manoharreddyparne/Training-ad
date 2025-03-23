const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  adminDashboard,
  teacherDashboard,
  studentDashboard,
  getTimetables,
  getTimetableById,
  createTimetable,
  updateTimetable,
  deleteTimetable,
  checkConflicts
} = require("../controllers/timetableController");

// Role-based dashboards
router.get("/admin/dashboard", authMiddleware(["admin"]), adminDashboard);
router.get("/teacher/dashboard", authMiddleware(["teacher"]), teacherDashboard);
router.get("/student/dashboard", authMiddleware(["student"]), studentDashboard);

// Conflict check (for admin and teacher)
router.get("/conflicts", authMiddleware(["admin", "teacher"]), checkConflicts);

// Viewing timetables: all authenticated users can view
router.get("/", authMiddleware(["admin", "teacher", "student"]), getTimetables);
router.get("/:id", authMiddleware(["admin", "teacher", "student"]), getTimetableById);

// Only admin can create, update, and delete timetables
router.post("/", authMiddleware(["admin"]), createTimetable);
router.put("/:id", authMiddleware(["admin"]), updateTimetable);
router.delete("/:id", authMiddleware(["admin"]), deleteTimetable);

module.exports = router;
