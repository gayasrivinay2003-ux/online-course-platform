const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  addQuiz,
  getQuizByCourse,
  submitQuiz,
  getUserQuizResults,
  getLeaderboard
} = require("../controllers/quizController");

// Create / update quiz (admin check inside controller)
router.post("/", auth, addQuiz);

// Get Global Leaderboard rankings
router.get("/leaderboard", auth, getLeaderboard);

// Get quiz by course ID
router.get("/course/:courseId", auth, getQuizByCourse);

// Submit quiz answers
router.post("/submit", auth, submitQuiz);

// Get user attempts for a quiz
router.get("/results/:quizId", auth, getUserQuizResults);

module.exports = router;
