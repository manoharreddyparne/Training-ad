const jwt = require("jsonwebtoken");
const User = require("../models/User"); 
require("dotenv").config();

const authMiddleware = (roles) => {
    return async (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            if (!token) {
                return res.status(401).json({ message: "Unauthorized: No token provided" });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;

            if (!roles.includes(req.user.role)) {
                return res.status(403).json({ message: "Forbidden: Access denied" });
            }

            next();
        } catch (error) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }
    };
};

module.exports = authMiddleware;
