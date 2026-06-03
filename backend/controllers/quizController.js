const Quiz = require("../models/Quiz");
const QuizResult = require("../models/QuizResult");
const Enrollment = require("../models/Enrollment");

// Create or update quiz for a course
const addQuiz = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const { courseId, title, questions } = req.body;

    let quiz = await Quiz.findOne({ courseId });

    if (quiz) {
      quiz.title = title;
      quiz.questions = questions;
      await quiz.save();
      return res.status(200).json({ message: "Quiz updated successfully", quiz });
    }

    quiz = await Quiz.create({
      courseId,
      title,
      questions
    });

    res.status(201).json({ message: "Quiz created successfully", quiz });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get quiz for a course
const getQuizByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const quiz = await Quiz.findOne({ courseId });

    if (!quiz) {
      return res.status(404).json({ message: "No quiz found for this course" });
    }

    res.status(200).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit quiz answers and grade them
const submitQuiz = async (req, res) => {
  try {
    const userId = req.user.id;
    const { quizId, answers } = req.body; // answers: [selectedOptionIndex, ...] matching questions index

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    let correctCount = 0;
    const detailedAnswers = quiz.questions.map((question, index) => {
      const selectedIndex = answers[index];
      const isCorrect = selectedIndex === question.correctOptionIndex;
      if (isCorrect) {
        correctCount++;
      }
      return {
        questionIndex: index,
        selectedOptionIndex: selectedIndex,
        isCorrect
      };
    });

    const totalQuestions = quiz.questions.length;
    const percentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    const passed = percentage >= 50; // Pass mark is 50%

    const quizResult = await QuizResult.create({
      userId,
      quizId,
      score: correctCount,
      totalQuestions,
      passed,
      answers: detailedAnswers
    });

    // Check if the user is enrolled and if progress is 100%. If passed and progress 100%, update status to "completed"
    const enrollment = await Enrollment.findOne({ userId, courseId: quiz.courseId });
    if (enrollment && passed) {
      // We check if all videos are watched on client side or update status here when they pass
      // If we mark it completed, they get the certificate.
    }

    res.status(200).json({
      message: passed ? "Congratulations! You passed the quiz." : "You did not pass. Please try again.",
      score: correctCount,
      totalQuestions,
      percentage,
      passed,
      resultId: quizResult._id,
      answers: detailedAnswers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get past results for a course quiz
const getUserQuizResults = async (req, res) => {
  try {
    const userId = req.user.id;
    const { quizId } = req.params;

    const results = await QuizResult.find({ userId, quizId }).sort({ createdAt: -1 });
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addQuiz,
  getQuizByCourse,
  submitQuiz,
  getUserQuizResults
};
