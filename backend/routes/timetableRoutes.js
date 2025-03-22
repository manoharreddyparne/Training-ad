const express = require("express");
const router = express.Router();
const { adminDashboard, teacherDashboard, studentDashboard } = require("../controllers/timetableController");
const authMiddleware = require("../middleware/authMiddleware");

// Admin
router.get("/admin/dashboard", authMiddleware(["admin"]), adminDashboard);

// Teacher 
router.get("/teacher/dashboard", authMiddleware(["teacher"]), teacherDashboard);

// Student 
router.get("/student/dashboard", authMiddleware(["student"]), studentDashboard);

module.exports = router;
