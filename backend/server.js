require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("./config/passport");
const connectDB = require("./config/db");
const http = require("http");
const socketIo = require("socket.io");
const cookieParser = require("cookie-parser"); // Added cookie-parser

connectDB();

const app = express();
const server = http.createServer(app);
const requestChangeRoutes = require("./routes/requestChangeRoutes");
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(express.json());
app.use(cookieParser()); // Use cookie-parser middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

app.set("socketio", io);

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/timetable", require("./routes/timetableRoutes"));
app.use("/api", requestChangeRoutes);

app.get("/dashboard", (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    res.send(`
      <h1>Dashboard</h1>
      <p>User: ${req.user.name}</p>
      <p>Email: ${req.user.email}</p>
    `);
  } else {
    res.send(`
      <h1>Dashboard</h1>
      <p>No user information available.</p>
    `);
  }
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
