const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getProfile
} = require("../controllers/authController");

const authMiddleware = require("../middleware/auth");
const upload = require("../middleware/upload");
const User = require("../models/User");


// REGISTER
router.post("/register", registerUser);

// LOGIN
router.post("/login", loginUser);

// PROFILE
router.get("/profile", authMiddleware, getProfile);


// ✅ PROFILE PHOTO UPLOAD (ADD THIS)
router.put(
  "/upload-photo",
  authMiddleware,
  upload.single("profilePic"),
  async (req, res) => {
    try {
      const userId = req.user._id;

      const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: imageUrl },
        { new: true }
      ).select("-password");

      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);

module.exports = router;