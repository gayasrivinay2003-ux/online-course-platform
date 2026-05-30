const express = require("express");

const dotenv = require("dotenv");

const cors = require("cors");

const connectDB = require("./config/db");

dotenv.config();

connectDB();

const app = express();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

app.use(cors());

app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("Online Course Platform API Running");
});

const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);
const courseRoutes = require("./routes/courseRoutes");

app.use("/api/courses", courseRoutes);
const videoRoutes = require("./routes/videoRoutes");

app.use("/api/videos", videoRoutes);
const enrollmentRoutes = require("./routes/enrollmentRoutes");

app.use("/api/enrollment", enrollmentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});