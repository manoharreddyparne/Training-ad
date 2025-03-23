const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ["admin", "teacher", "student"], default: "student" },
  // For students:
  section: { type: String },
  // Optional for teachers (if needed):
  subjects: [{ type: String }],
  // Google OAuth fields:
  googleId: { type: String },
  googleAccessToken: { type: String },
  googleRefreshToken: { type: String }
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("User", UserSchema);
