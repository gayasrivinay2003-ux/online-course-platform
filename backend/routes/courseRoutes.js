const express = require("express");

const router = express.Router();

const {
  addCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse
} = require("../controllers/courseController");


// ADD COURSE
router.post("/", addCourse);


// GET ALL COURSES
router.get("/", getCourses);


// GET SINGLE COURSE
router.get("/:id", getCourseById);


// UPDATE COURSE
router.put("/:id", updateCourse);


// DELETE COURSE
router.delete("/:id", deleteCourse);

module.exports = router;