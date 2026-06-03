const Enrollment = require("../models/Enrollment");
const Video = require("../models/Video");

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

    const enrollments = await Enrollment.find({ userId })
      .populate("courseId")
      .populate("userId")
      .lean();

    const enrollmentsWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        if (!enrollment.courseId) return enrollment;
        const totalVideos = await Video.countDocuments({ courseId: enrollment.courseId._id });
        const watchedCount = enrollment.watchedVideos ? enrollment.watchedVideos.length : 0;
        const progressPercent = totalVideos > 0 ? Math.round((watchedCount / totalVideos) * 100) : 0;
        return {
          ...enrollment,
          totalVideos,
          watchedCount,
          progressPercent
        };
      })
    );

    res.status(200).json(enrollmentsWithProgress);
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

// ➤ WATCH A VIDEO
const watchVideo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, videoId } = req.body;

    const enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found for this course" });
    }

    // Add videoId to watchedVideos if not already exists
    if (!enrollment.watchedVideos.includes(videoId)) {
      enrollment.watchedVideos.push(videoId);

      // Check if watched all videos to mark completed
      const totalCourseVideos = await Video.countDocuments({ courseId });
      if (enrollment.watchedVideos.length >= totalCourseVideos && totalCourseVideos > 0) {
        enrollment.status = "completed";
      }

      await enrollment.save();
    }

    res.status(200).json({
      message: "Video marked as watched",
      watchedVideos: enrollment.watchedVideos,
      status: enrollment.status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ➤ GET COURSE PROGRESS
const getProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    const enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    const totalVideos = await Video.countDocuments({ courseId });
    const watchedCount = enrollment.watchedVideos.length;
    const progressPercent = totalVideos > 0 ? Math.round((watchedCount / totalVideos) * 100) : 0;

    res.status(200).json({
      watchedVideos: enrollment.watchedVideos,
      totalVideos,
      watchedCount,
      progressPercent,
      status: enrollment.status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  enrollCourse,
  myCourses,
  unenrollCourse,
  watchVideo,
  getProgress
};