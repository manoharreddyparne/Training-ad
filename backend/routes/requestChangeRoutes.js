const express = require("express");
const { submitRequest, getAllRequests, getTeacherRequests } = require("../controllers/requestChangeController");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// Submit a schedule change request (Teacher Only)
router.post("/request-change", authMiddleware, submitRequest);

// Get all requests (Admin Only - will implement later)
router.get("/requests", authMiddleware, getAllRequests);

// Get teacher's own requests
router.get("/requests/:teacherId", authMiddleware, getTeacherRequests);

module.exports = router;
