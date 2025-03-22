require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("./config/passport");
const connectDB = require("./config/db");
const http = require("http");
const socketIo = require("socket.io");

connectDB();

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000", // if using a frontend on port 3000
  credentials: true
}));

app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set secure: true in production with HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/timetable", require("./routes/timetableRoutes"));

// Temporary Dashboard Route
app.get("/dashboard", (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    res.send(`<h1>Dashboard</h1><p>User: ${req.user.name}</p><p>Email: ${req.user.email}</p>`);
  } else {
    res.send("<h1>Dashboard</h1><p>No user information available.</p>");
  }
});

// Socket.io Setup
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
io.on("connection", (socket) => {
  console.log("New client connected", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});
app.set("socketio", io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
