const express = require("express");
const router = express.Router();

const {
  getAptitudeQuestions,
  getMCQs,
} = require("../controllers/mcqController");

const MCQ = require("../models/mcq");

// Route to get MCQs
router.get("/mcqs", getMCQs);

router.get("/aptitude-questions", getAptitudeQuestions);

router.get("/questions",);
module.exports = router;
