const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

const authMiddleware = (roles = []) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
      }
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Fetch the full user from the DB so that req.user contains all fields (e.g. googleAccessToken)
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized: User not found" });
      }
      req.user = user;

      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json({ message: "Forbidden: Access denied" });
      }
      
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token", error: error.toString() });
    }
  };
};

module.exports = authMiddleware;
