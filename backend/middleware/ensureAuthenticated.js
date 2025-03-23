module.exports = (allowedRoles = []) => {
    return (req, res, next) => {
      // Check if a session exists and the user is authenticated
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized: No session provided" });
      }
      // If roles are specified, ensure the user has one of the allowed roles
      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden: Access denied" });
      }
      next();
    };
  };
  