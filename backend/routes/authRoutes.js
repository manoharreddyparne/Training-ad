// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const passport = require("passport");

router.post("/register", register);
router.post("/login", login);
router.get("/google", passport.authenticate("google"));
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Redirect to the React frontend dashboard
    res.redirect("http://localhost:5173/dashboard");
  }
);


// Updated logout route:
router.get("/logout", (req, res, next) => {
  req.logout(function(err) {
    if (err) return next(err);
    // Destroy the session and clear the cookie
    req.session.destroy((err) => {
      if (err) return next(err);
      res.clearCookie('connect.sid');
      // Send a JSON response indicating logout success
      res.json({ message: "Logged out successfully" });
    });
  });
});

// Profile endpoint:
router.get("/profile", (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ message: "Not logged in" });
  }
});

module.exports = router;
