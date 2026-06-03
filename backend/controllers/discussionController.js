const Discussion = require("../models/Discussion");

// Get discussion threads for a course
const getCourseDiscussions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const discussions = await Discussion.find({ courseId })
      .populate("userId", "name profilePic")
      .populate("replies.userId", "name profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json(discussions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Start a discussion thread
const createThread = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const discussion = await Discussion.create({
      courseId,
      userId,
      message
    });

    const populated = await Discussion.findById(discussion._id)
      .populate("userId", "name profilePic");

    res.status(201).json({ message: "Discussion thread created", discussion: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reply to a thread
const replyToThread = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // discussion ID
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "Reply message cannot be empty" });
    }

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return res.status(404).json({ message: "Discussion thread not found" });
    }

    discussion.replies.push({
      userId,
      message
    });

    await discussion.save();

    const updated = await Discussion.findById(id)
      .populate("userId", "name profilePic")
      .populate("replies.userId", "name profilePic");

    res.status(200).json({ message: "Reply added successfully", discussion: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCourseDiscussions,
  createThread,
  replyToThread
};
