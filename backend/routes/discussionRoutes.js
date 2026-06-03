const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getCourseDiscussions,
  createThread,
  replyToThread
} = require("../controllers/discussionController");

// Get discussions for course
router.get("/course/:courseId", auth, getCourseDiscussions);

// Post a discussion question
router.post("/course/:courseId", auth, createThread);

// Reply to a thread
router.post("/:id/reply", auth, replyToThread);

module.exports = router;
