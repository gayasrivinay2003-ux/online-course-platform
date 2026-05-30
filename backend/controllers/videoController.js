const Video = require("../models/Video");
const Enrollment = require("../models/Enrollment");

// ➤ ADD VIDEO
const addVideo = async (req, res) => {
  try {
    const { title, description, videoUrl, courseId } = req.body;

    const video = await Video.create({
      title,
      description,
      videoUrl,
      courseId,
    });

    res.status(201).json({
      message: "Video Added Successfully",
      video,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ➤ GET ALL VIDEOS (ADMIN / DEBUG)
const getVideos = async (req, res) => {
  try {
    const videos = await Video.find().populate("courseId");

    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ➤ GET VIDEOS BY COURSE (PROTECTED)
const getVideosByCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    // check enrollment
    const enrolled = await Enrollment.findOne({
      userId,
      courseId,
    });

    if (!enrolled) {
      return res.status(403).json({
        message: "Please enroll first",
      });
    }

    // fetch videos
    const videos = await Video.find({ courseId });

    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  addVideo,
  getVideos,
  getVideosByCourse,
};