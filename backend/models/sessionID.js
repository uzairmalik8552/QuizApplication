const mongoose = require("mongoose");

// Define the schema for sessions
const sessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      expires: 3600, // Optional: Automatically delete the session after 1 hour
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

// Create the model
const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;
