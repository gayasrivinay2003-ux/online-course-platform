const User = require("../models/User");
const Course = require("../models/Course");
const Video = require("../models/Video");
const Enrollment = require("../models/Enrollment");
const bcrypt = require("bcryptjs");

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

// CREATE USER
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "student"
    });

    res.status(201).json({
      message: "User Created Successfully",
      user
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// UPDATE USER
const updateUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await user.save();

    res.status(200).json({
      message: "User Updated Successfully",
      user: updatedUser
    });
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
  createUser,
  updateUser,
  deleteUser,
  getCourses,
  deleteCourse,
  getEnrollments
};