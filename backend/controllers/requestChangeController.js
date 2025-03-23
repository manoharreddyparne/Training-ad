const RequestChange = require("../models/RequestChange");

exports.submitRequest = async (req, res) => {
  try {
    const { teacherId, teacherName, date, currentTimeSlot, requestedTimeSlot, reason } = req.body;

    const newRequest = new RequestChange({
      teacherId,
      teacherName,
      date,
      currentTimeSlot,
      requestedTimeSlot,
      reason,
    });

    await newRequest.save();
    res.status(201).json({ message: "Request sent to admin", request: newRequest });
  } catch (error) {
    console.error("Error submitting request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await RequestChange.find().sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getTeacherRequests = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const requests = await RequestChange.find({ teacherId }).sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching teacher requests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
