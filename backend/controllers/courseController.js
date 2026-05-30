const Course = require("../models/Course");


// ADD COURSE
const addCourse = async (req, res) => {

  try {

    const {
      title,
      description,
      category,
      instructor,
      price
    } = req.body;

    const course = await Course.create({
      title,
      description,
      category,
      instructor,
      price
    });

    res.status(201).json({
      message: "Course Added Successfully",
      course
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};


// GET ALL COURSES
const getCourses = async (req, res) => {

  try {

    const courses = await Course.find();

    res.status(200).json(courses);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};


// GET SINGLE COURSE
const getCourseById = async (req, res) => {

  try {

    const course = await Course.findById(
      req.params.id
    );

    if (!course) {

      return res.status(404).json({
        message: "Course Not Found"
      });
    }

    res.status(200).json(course);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};


// UPDATE COURSE
const updateCourse = async (req, res) => {

  try {

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true
      }
    );

    res.status(200).json({
      message: "Course Updated",
      updatedCourse
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};


// DELETE COURSE
const deleteCourse = async (req, res) => {

  try {

    await Course.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({
      message: "Course Deleted"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};


module.exports = {
  addCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse
};