const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  getQuestion,
  validateAnswers,
} = require("../controllers/mcqController");

// http://localhost:3000/mcq/questions?department=CSE&page=4&sessionId=test123
router.get("/questions", authMiddleware(["Student"]), getQuestion);

router.post("/validate", validateAnswers);
module.exports = router;
