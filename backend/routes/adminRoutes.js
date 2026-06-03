const express = require("express");

const router = express.Router();

const {
  getDashboard,
  getUsers,
  deleteUser,
  getCourses,
  deleteCourse,
  getEnrollments
} = require("../controllers/adminController");

// DASHBOARD
router.get("/dashboard", getDashboard);

// USERS
router.get("/users", getUsers);

router.delete("/users/:id", deleteUser);

// COURSES
router.get("/courses", getCourses);

const { addCourse } = require("../controllers/courseController");
router.post("/courses", addCourse);

router.delete("/courses/:id", deleteCourse);

// ENROLLMENTS
router.get("/enrollments", getEnrollments);

module.exports = router;