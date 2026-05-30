const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  getProfile
} = require("../controllers/authController");

const authMiddleware = require("../middleware/auth");


// REGISTER
router.post(
  "/register",
  registerUser
);


// LOGIN
router.post(
  "/login",
  loginUser
);


// PROFILE
router.get(
  "/profile",
  authMiddleware,
  getProfile
);

module.exports = router;