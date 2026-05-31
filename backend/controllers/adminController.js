const User = require("../models/User");
const Course = require("../models/Course");
const Video = require("../models/Video");
const Enrollment = require("../models/Enrollment");

// DASHBOARD
const getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalVideos = await Video.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();

    res.status(200).json({
      totalUsers,
      totalCourses,
      totalVideos,
      totalEnrollments
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// GET ALL USERS
const getUsers = async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// DELETE USER
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "User Deleted Successfully"
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

// DELETE COURSE
const deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Course Deleted Successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// GET ALL ENROLLMENTS
const getEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate("userId")
      .populate("courseId");

    res.status(200).json(enrollments);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  getDashboard,
  getUsers,
  deleteUser,
  getCourses,
  deleteCourse,
  getEnrollments
};