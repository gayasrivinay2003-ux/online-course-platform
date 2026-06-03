const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
  enrollCourse,
  myCourses,
  unenrollCourse,
  watchVideo,
  getProgress
} = require("../controllers/enrollmentController");

// ➤ ENROLL
router.post("/enroll", auth, enrollCourse);

// ➤ MY COURSES
router.get("/my-courses", auth, myCourses);

// ➤ UNENROLL
router.delete("/unenroll", auth, unenrollCourse);

// ➤ WATCH A VIDEO
router.post("/watch-video", auth, watchVideo);

// ➤ GET COURSE PROGRESS
router.get("/progress/:courseId", auth, getProgress);

module.exports = router;