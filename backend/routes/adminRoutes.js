const express = require("express");

const router = express.Router();

const {
  getDashboard,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getCourses,
  deleteCourse,
  getEnrollments
} = require("../controllers/adminController");

// DASHBOARD
router.get("/dashboard", getDashboard);

// USERS
router.get("/users", getUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// COURSES
router.get("/courses", getCourses);

const { addCourse, updateCourse } = require("../controllers/courseController");
router.post("/courses", addCourse);
router.put("/courses/:id", updateCourse);

router.delete("/courses/:id", deleteCourse);

// ENROLLMENTS
router.get("/enrollments", getEnrollments);

module.exports = router;