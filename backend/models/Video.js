const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    description: {
      type: String,
      required: true
    },

    videoUrl: {
      type: String,
      required: true
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Video",
  videoSchema
);