const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  addVideo,
  getVideos,
  getVideoById,
  getVideosByCourse,
  updateVideo,
  deleteVideo,
} = require("../controllers/videoController");

// CREATE
router.post("/", addVideo);

// READ ALL
router.get("/", getVideos);

// READ BY COURSE
router.get("/course/:courseId", auth, getVideosByCourse);

// READ ONE
router.get("/:id", getVideoById);

// UPDATE
router.put("/:id", updateVideo);

// DELETE
router.delete("/:id", deleteVideo);

module.exports = router;