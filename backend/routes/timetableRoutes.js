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
router.get("/admin/dashboard", authMiddleware(["admin"]), adminDashboard);
router.get("/teacher/dashboard", authMiddleware(["teacher"]), teacherDashboard);
router.get("/student/dashboard", authMiddleware(["student"]), studentDashboard);

router.get("/conflicts", authMiddleware(["admin", "teacher"]), checkConflicts);

router.get("/", getTimetables);

router.get("/:id", authMiddleware(["admin", "teacher", "student"]), getTimetableById);
router.post("/", authMiddleware(["admin", "teacher"]), createTimetable);
router.put("/:id", authMiddleware(["admin", "teacher"]), updateTimetable);
router.delete("/:id", authMiddleware(["admin"]), deleteTimetable);

module.exports = router;
