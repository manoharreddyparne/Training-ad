const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

const authMiddleware = (roles = []) => {
  return async (req, res, next) => {
    try {
      if (req.user) {
        console.log("Session User:", req.user);
        if (roles.length > 0 && !roles.includes(req.user.role)) {
          return res.status(403).json({ message: "Forbidden: Access denied" });
        }
        return next();
      }

      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({ message: "Unauthorized: User not found" });
      }
      
      req.user = user;
      console.log("Authenticated User:", req.user);

      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json({ message: "Forbidden: Access denied" });
      }

      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error);
      return res.status(401).json({ message: "Invalid or expired token", error: error.message });
    }
  };
};

module.exports = authMiddleware;
