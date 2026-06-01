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

// ➤ GET ALL VIDEOS
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

// ➤ GET VIDEO BY ID
const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate("courseId");

    if (!video) {
      return res.status(404).json({
        message: "Video not found",
      });
    }

    res.status(200).json(video);
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

    const enrolled = await Enrollment.findOne({
      userId,
      courseId,
    });

    if (!enrolled) {
      return res.status(403).json({
        message: "Please enroll first",
      });
    }

    const videos = await Video.find({ courseId });

    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ➤ UPDATE VIDEO
const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, videoUrl, courseId } = req.body;

    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({
        message: "Video not found",
      });
    }

    video.title = title || video.title;
    video.description = description || video.description;
    video.videoUrl = videoUrl || video.videoUrl;
    video.courseId = courseId || video.courseId;

    const updatedVideo = await video.save();

    res.status(200).json({
      message: "Video updated successfully",
      video: updatedVideo,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ➤ DELETE VIDEO
const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({
        message: "Video not found",
      });
    }

    await Video.findByIdAndDelete(id);

    res.status(200).json({
      message: "Video deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  addVideo,
  getVideos,
  getVideoById,
  getVideosByCourse,
  updateVideo,
  deleteVideo,
};