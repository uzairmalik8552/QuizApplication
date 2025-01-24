const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["Admin", "Student"],
    default: "Student",
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  registerNo: {
    type: String,
    trim: true,
    validate: {
      validator: function (value) {
        return this.role === "Admin" || !!value; // Required only for students
      },
      message: "Register number is required for students.",
    },
  },
  department: {
    type: String,
    trim: true,
    validate: {
      validator: function (value) {
        return this.role === "Admin" || !!value; // Required only for students
      },
      message: "Department is required for students.",
    },
  },
  score: {
    type: Number,
    default: null, // Allows null value by default
    validate: {
      validator: function (value) {
        // Score can be null or a valid number for students
        return this.role === "Admin" || value === null || value >= 0;
      },
      message: "Score must be a non-negative number for students or null.",
    },
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;

