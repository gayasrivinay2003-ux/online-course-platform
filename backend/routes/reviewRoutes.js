const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { addReview, getCourseReviews } = require("../controllers/reviewController");

// Get reviews for a course
router.get("/course/:courseId", getCourseReviews);

// Add/update review for a course
router.post("/course/:courseId", auth, addReview);

module.exports = router;
