const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware"); // This is our JWT middleware
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

// Dashboard endpoints (example: only admin can access admin dashboard)
router.get("/admin/dashboard", authMiddleware(["admin"]), adminDashboard);
router.get("/teacher/dashboard", authMiddleware(["teacher"]), teacherDashboard);
router.get("/student/dashboard", authMiddleware(["student"]), studentDashboard);

// Conflict endpoint (accessible to admin and teacher)
router.get("/conflicts", authMiddleware(["admin", "teacher"]), checkConflicts);

// Public endpoint to get all timetables (if desired)
router.get("/", getTimetables);

// Protected endpoints (using JWT)
router.get("/:id", authMiddleware(["admin", "teacher", "student"]), getTimetableById);
router.post("/", authMiddleware(["admin", "teacher"]), createTimetable);
router.put("/:id", authMiddleware(["admin", "teacher"]), updateTimetable);
router.delete("/:id", authMiddleware(["admin"]), deleteTimetable);

module.exports = router;
