const Course = require("../models/Course");
const Review = require("../models/Review");


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

    const courses = await Course.find().lean();
    const coursesWithRatings = await Promise.all(
      courses.map(async (course) => {
        const reviews = await Review.find({ courseId: course._id });
        const reviewCount = reviews.length;
        const avgRating = reviewCount > 0 
          ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
          : 0;
        return {
          ...course,
          avgRating,
          reviewCount
        };
      })
    );

    res.status(200).json(coursesWithRatings);

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
    ).lean();

    if (!course) {

      return res.status(404).json({
        message: "Course Not Found"
      });
    }

    const reviews = await Review.find({ courseId: course._id });
    const reviewCount = reviews.length;
    const avgRating = reviewCount > 0 
      ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
      : 0;

    res.status(200).json({
      ...course,
      avgRating,
      reviewCount
    });

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