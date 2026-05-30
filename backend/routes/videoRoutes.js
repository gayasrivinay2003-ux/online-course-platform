const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  addVideo,
  getVideos,
  getVideosByCourse,
} = require("../controllers/videoController");


// ➤ ADD VIDEO
router.post("/", addVideo);


// ➤ GET ALL VIDEOS
router.get("/", getVideos);


// ➤ GET VIDEOS BY COURSE (PROTECTED)
router.get("/course/:courseId", auth, getVideosByCourse);

module.exports = router;