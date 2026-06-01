const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const dns = require("dns");

const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// Fix DNS issues on some hosting providers
dns.setServers(["8.8.8.8", "1.1.1.1"]);

// CORS Configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173", // React/Vite local
      "https://online-course-platform-beta.vercel.app", // Replace with your live frontend URL
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use(express.json());

// Static Uploads
app.use("/uploads", express.static("uploads"));

// Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const courseRoutes = require("./routes/courseRoutes");
app.use("/", courseRoutes);

const videoRoutes = require("./routes/videoRoutes");
app.use("/api/videos", videoRoutes);

const enrollmentRoutes = require("./routes/enrollmentRoutes");
app.use("/api/enrollment", enrollmentRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

// Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Online Course Platform Backend Running Successfully",
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});