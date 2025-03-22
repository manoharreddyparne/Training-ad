const express = require("express");
const { register, login } = require("../controllers/authController");
const passport = require("passport");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/google", passport.authenticate("google"));
router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
      res.redirect("/dashboard");
    }
  );
  router.get("/logout", (req, res) => {
    req.logout(() => {
      res.redirect("/");
    });
  });
module.exports = router;
