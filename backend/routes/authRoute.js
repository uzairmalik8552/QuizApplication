const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Session = require("../models/sessionID");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const crypto = require("crypto");

router.post("/student", async (req, res) => {
  const { email, password, registerNo } = req.body;
  console.log(email, password, registerNo);
  try {
    const user = await User.findOne({ email, role: "Student", registerNo });
    console.log(user);
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    const Id = crypto.randomBytes(16).toString("hex");
    const sessionId = crypto.createHash("sha256").update(Id).digest("hex");
    const name = user.name;
    const role = user.role;
    const department = user.department;
    console.log(department);
    res.json({ name, role, token, sessionId, department });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Session validation route
router.post(
  "/validate-session",
  authMiddleware(["Student"]),
  async (req, res) => {
    try {
      const { sessionId } = req.body;

      // Check if session exists in the Sessions collection
      const session = await Session.findOne({ sessionId });

      if (!session) {
        return res.status(401).json({ msg: "Invalid or expired session" });
      }

      // If you want additional validation, you can add checks here
      // For example, checking session age or adding extra security measures

      // Return success if session is valid
      res.json({
        msg: "Session validated successfully",
        // You can add additional user info if needed
        // For example:
        // userId: req.user.id,
        // role: req.user.role
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: "Server error during session validation" });
    }
  }
);
module.exports = router;
