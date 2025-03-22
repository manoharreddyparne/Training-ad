
exports.adminDashboard = (req, res) => {
    res.json({ 
        message: "Welcome to the Admin Dashboard",
        user: req.user
    });
};


exports.teacherDashboard = (req, res) => {
    res.json({ 
        message: "Welcome to the Teacher Dashboard",
        user: req.user
    });
};


exports.studentDashboard = (req, res) => {
    res.json({ 
        message: "Welcome to the Student Dashboard",
        user: req.user
    });
};
