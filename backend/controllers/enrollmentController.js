const Enrollment = require("../models/Enrollment");

// ➤ ENROLL IN COURSE
const enrollCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;

    const existingEnrollment =
      await Enrollment.findOne({
        userId,
        courseId,
      });

    if (existingEnrollment) {
      return res.status(400).json({
        message: "Already enrolled in this course",
      });
    }

    const enrollment = new Enrollment({
      userId,
      courseId,
    });

    await enrollment.save();

    res.status(201).json({
      message: "Enrolled successfully",
      enrollment,
    });
  } catch (error) {
    console.log("Enrollment Error:", error);

    res.status(500).json({
      message: "Enrollment failed",
      error: error.message,
    });
  }
};

// ➤ GET MY ENROLLED COURSES
const myCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    const courses = await Enrollment.find({ userId })
      .populate("courseId")
      .populate("userId");

    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching enrolled courses",
      error: error.message,
    });
  }
};

// ➤ UNENROLL COURSE
const unenrollCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;

    await Enrollment.findOneAndDelete({
      userId,
      courseId,
    });

    res.status(200).json({
      message: "Unenrolled successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Unenroll failed",
      error: error.message,
    });
  }
};

module.exports = {
  enrollCourse,
  myCourses,
  unenrollCourse,
};