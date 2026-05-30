const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  enrollCourse,
  myCourses,
  unenrollCourse,
} = require("../controllers/enrollmentController");

console.log("auth =", typeof auth);
console.log("enrollCourse =", typeof enrollCourse);
console.log("myCourses =", typeof myCourses);
console.log("unenrollCourse =", typeof unenrollCourse);

// ➤ ENROLL
router.post("/enroll", auth, enrollCourse);

// ➤ MY COURSES
router.get("/my-courses", auth, myCourses);

// ➤ UNENROLL
router.delete("/unenroll", auth, unenrollCourse);

module.exports = router;