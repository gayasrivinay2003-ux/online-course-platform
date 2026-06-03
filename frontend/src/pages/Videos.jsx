import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../services/api";
import "./Videos.css";

function Videos() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // Core Data State
  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [progress, setProgress] = useState({
    watchedVideos: [],
    totalVideos: 0,
    watchedCount: 0,
    progressPercent: 0,
    status: "enrolled",
  });

  // UI Tabs & Loading State
  const [activeTab, setActiveTab] = useState("curriculum");
  const [loading, setLoading] = useState(true);

  // Discussions State
  const [discussions, setDiscussions] = useState([]);
  const [newDiscussionMsg, setNewDiscussionMsg] = useState("");
  const [replyInputs, setReplyInputs] = useState({}); // { threadId: "reply msg" }

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");

  // Quiz State
  const [quiz, setQuiz] = useState(null);
  const [pastAttempts, setPastAttempts] = useState([]);
  const [quizActive, setQuizActive] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionIdx: optionIdx }
  const [quizFinishedData, setQuizFinishedData] = useState(null);

  // Fetch Course & Syllabus
  const fetchCourseData = async () => {
    try {
      const courseRes = await API.get(`/courses/${courseId}`);
      setCourse(courseRes.data);
    } catch (err) {
      console.error("Error fetching course", err);
    }
  };

  const fetchVideos = async () => {
    try {
      const res = await API.get(`/videos/course/${courseId}`);
      setVideos(res.data);
      if (res.data.length > 0) {
        setActiveVideo(res.data[0]);
      }
    } catch (error) {
      console.log(error);
      alert("Failed to load course syllabus");
    }
  };

  const fetchProgress = async () => {
    try {
      const res = await API.get(`/enrollment/progress/${courseId}`);
      setProgress(res.data);
    } catch (err) {
      console.error("Error fetching progress", err);
    }
  };

  // Discussions API
  const fetchDiscussions = async () => {
    try {
      const res = await API.get(`/discussions/course/${courseId}`);
      setDiscussions(res.data);
    } catch (err) {
      console.error("Error fetching discussions", err);
    }
  };

  const handlePostDiscussion = async () => {
    if (!newDiscussionMsg.trim()) return;
    try {
      const res = await API.post(`/discussions/course/${courseId}`, {
        message: newDiscussionMsg,
      });
      setNewDiscussionMsg("");
      fetchDiscussions();
    } catch (err) {
      alert("Failed to post message");
    }
  };

  const handlePostReply = async (threadId) => {
    const replyMsg = replyInputs[threadId];
    if (!replyMsg || !replyMsg.trim()) return;

    try {
      await API.post(`/discussions/${threadId}/reply`, {
        message: replyMsg,
      });
      setReplyInputs({ ...replyInputs, [threadId]: "" });
      fetchDiscussions();
    } catch (err) {
      alert("Failed to post reply");
    }
  };

  // Reviews API
  const fetchReviews = async () => {
    try {
      const res = await API.get(`/reviews/course/${courseId}`);
      setReviews(res.data);
    } catch (err) {
      console.error("Error fetching reviews", err);
    }
  };

  const handlePostReview = async () => {
    if (!userComment.trim()) return;
    try {
      await API.post(`/reviews/course/${courseId}`, {
        rating: userRating,
        comment: userComment,
      });
      setUserComment("");
      fetchReviews();
      fetchCourseData(); // update rating average on dashboard
      alert("Review submitted successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to post review");
    }
  };

  // Quiz API & Actions
  const fetchQuizData = async () => {
    try {
      const res = await API.get(`/quizzes/course/${courseId}`);
      setQuiz(res.data);
      fetchPastAttempts(res.data._id);
    } catch (err) {
      console.log("No quiz available for this course yet.");
      setQuiz(null);
    }
  };

  const fetchPastAttempts = async (quizId) => {
    try {
      const res = await API.get(`/quizzes/results/${quizId}`);
      setPastAttempts(res.data);
    } catch (err) {
      console.error("Error fetching past attempts", err);
    }
  };

  const startQuiz = () => {
    setQuizActive(true);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setQuizFinishedData(null);
  };

  const handleOptionSelect = (optionIdx) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIdx]: optionIdx,
    });
  };

  const submitQuizAnswers = async () => {
    if (!quiz) return;
    
    // Validate all answered
    const unansweredCount = quiz.questions.length - Object.keys(selectedAnswers).length;
    if (unansweredCount > 0) {
      if (!window.confirm(`You have left ${unansweredCount} questions unanswered. Submit anyway?`)) {
        return;
      }
    }

    const answersArray = quiz.questions.map((_, idx) => 
      selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : -1
    );

    try {
      const res = await API.post("/quizzes/submit", {
        quizId: quiz._id,
        answers: answersArray,
      });
      setQuizFinishedData(res.data);
      setQuizActive(false);
      fetchPastAttempts(quiz._id);
      fetchProgress(); // Re-fetch progress to see if certificate status changed
    } catch (err) {
      alert("Failed to submit quiz");
    }
  };

  // Watched State Triggers
  const handleMarkAsWatched = async (videoId, checked) => {
    try {
      await API.post("/enrollment/watch-video", {
        courseId,
        videoId,
      });
      fetchProgress();
    } catch (err) {
      console.error("Error tracking video progress", err);
    }
  };

  // Initial Load
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await fetchCourseData();
      await fetchVideos();
      await fetchProgress();
      await fetchDiscussions();
      await fetchReviews();
      await fetchQuizData();
      setLoading(false);
    };
    loadAll();
  }, [courseId]);

  // Video embed url mapper
  const getEmbedUrl = (url) => {
    if (!url) return "";
    if (url.includes("youtube.com/watch")) {
      const videoId = new URL(url).searchParams.get("v");
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1].split("?")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    return url;
  };

  const isYoutube = (url) => {
    if (!url) return false;
    return url.includes("youtube.com") || url.includes("youtu.be");
  };

  const handlePlayVideo = async (video) => {
    setActiveVideo(video);
    // Mark as watched immediately when clicking to watch
    if (!progress.watchedVideos.includes(video._id)) {
      await handleMarkAsWatched(video._id, true);
    }
  };

  // Certificate Qualifications
  const hasPassedQuiz = pastAttempts.some((a) => a.passed === true);
  const quizRequired = quiz !== null;
  const progressQualified = progress.progressPercent >= 100;
  const eligibleForCertificate = progressQualified && (!quizRequired || hasPassedQuiz);

  const handlePrintCertificate = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-dark)" }}>
        <Navbar />
        <div style={{ textAlign: "center", padding: "100px", color: "var(--text-muted)" }}>
          <h2>Preparing your Course Study Center...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="study-center-page">
      <Navbar />

      <div className="study-center-layout">
        {/* LEFT COLUMN: MAIN SCREEN */}
        <div>
          {/* Active Video Player */}
          <div className="video-player-container">
            {activeVideo ? (
              isYoutube(activeVideo.videoUrl) ? (
                <iframe
                  className="video-element"
                  src={getEmbedUrl(activeVideo.videoUrl)}
                  title={activeVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <video
                  className="video-element"
                  src={activeVideo.videoUrl}
                  controls
                  autoPlay
                  onEnded={() => handleMarkAsWatched(activeVideo._id, true)}
                ></video>
              )
            ) : (
              <div className="video-placeholder">
                <span>🎬</span>
                <h3>Welcome to the Course!</h3>
                <p>Select a video from the syllabus list on the right to start studying.</p>
              </div>
            )}
          </div>

          {activeVideo && (
            <div style={{ marginBottom: "30px" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>{activeVideo.title}</h2>
              <p style={{ color: "var(--text-muted)", marginTop: "6px", fontSize: "0.95rem" }}>
                {activeVideo.description}
              </p>
            </div>
          )}

          {/* Tab Selection */}
          <div className="tabs-header">
            <button
              className={`tab-btn ${activeTab === "curriculum" ? "active" : ""}`}
              onClick={() => setActiveTab("curriculum")}
            >
              Curriculum Overview
            </button>
            <button
              className={`tab-btn ${activeTab === "quiz" ? "active" : ""}`}
              onClick={() => setActiveTab("quiz")}
            >
              Quizzes & Exams {quizRequired && "📝"}
            </button>
            <button
              className={`tab-btn ${activeTab === "discussions" ? "active" : ""}`}
              onClick={() => setActiveTab("discussions")}
            >
              Q&A Discussion Board
            </button>
            <button
              className={`tab-btn ${activeTab === "reviews" ? "active" : ""}`}
              onClick={() => setActiveTab("reviews")}
            >
              Reviews & Feedback
            </button>
            <button
              className={`tab-btn ${activeTab === "certificate" ? "active" : ""}`}
              onClick={() => setActiveTab("certificate")}
            >
              Completion Certificate 🎓
            </button>
          </div>

          {/* Tab Workspaces */}
          <div className="tab-content-panel">
            {/* 1. CURRICULUM OVERVIEW */}
            {activeTab === "curriculum" && (
              <div>
                <h3 style={{ fontSize: "1.25rem", marginBottom: "15px" }}>About this Course</h3>
                <p style={{ color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "20px" }}>
                  {course?.description}
                </p>

                <div
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    padding: "16px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                    Instructor: <strong style={{ color: "white" }}>{course?.instructor}</strong>
                  </p>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "6px" }}>
                    Category: <strong style={{ color: "white" }}>{course?.category}</strong>
                  </p>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "6px" }}>
                    Syllabus Outline: <strong style={{ color: "white" }}>{videos.length} Lectures</strong>
                  </p>
                </div>
              </div>
            )}

            {/* 2. QUIZ WORKSPACE */}
            {activeTab === "quiz" && (
              <div>
                {!quiz ? (
                  <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <span style={{ fontSize: "2.5rem" }}>📭</span>
                    <h3 style={{ marginTop: "10px" }}>No quiz available for this course.</h3>
                    <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
                      Watch all lecture videos to unlock your completion credentials.
                    </p>
                  </div>
                ) : quizActive ? (
                  /* Live taking screen */
                  <div className="quiz-question-screen">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.85rem",
                        color: "var(--text-muted)",
                        marginBottom: "10px",
                      }}
                    >
                      <span>
                        Question {currentQuestionIdx + 1} of {quiz.questions.length}
                      </span>
                      <span>Progress: {Math.round(((currentQuestionIdx + 1) / quiz.questions.length) * 100)}%</span>
                    </div>

                    <div className="quiz-progress-bar-track">
                      <div
                        className="quiz-progress-bar-fill"
                        style={{
                          width: `${((currentQuestionIdx + 1) / quiz.questions.length) * 100}%`,
                        }}
                      ></div>
                    </div>

                    <h4 className="quiz-question-text">
                      {quiz.questions[currentQuestionIdx].questionText}
                    </h4>

                    <div className="quiz-options-list">
                      {quiz.questions[currentQuestionIdx].options.map((option, idx) => (
                        <button
                          key={idx}
                          className={`quiz-option-button ${
                            selectedAnswers[currentQuestionIdx] === idx ? "selected" : ""
                          }`}
                          onClick={() => handleOptionSelect(idx)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <button
                        className="btn btn-secondary"
                        disabled={currentQuestionIdx === 0}
                        onClick={() => setCurrentQuestionIdx(currentQuestionIdx - 1)}
                      >
                        Previous
                      </button>

                      {currentQuestionIdx < quiz.questions.length - 1 ? (
                        <button
                          className="btn btn-primary"
                          disabled={selectedAnswers[currentQuestionIdx] === undefined}
                          onClick={() => setCurrentQuestionIdx(currentQuestionIdx + 1)}
                        >
                          Next Question
                        </button>
                      ) : (
                        <button
                          className="btn btn-accent"
                          onClick={submitQuizAnswers}
                        >
                          Submit Quiz ➔
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Quiz welcome and history screen */
                  <div className="quiz-welcome-screen">
                    <h3 style={{ fontSize: "1.5rem", marginBottom: "10px" }}>{quiz.title}</h3>
                    <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>
                      To qualify for your certificate of completion, you must score a passing grade of at least
                      <strong> 50%</strong>. You can retake the quiz as many times as necessary.
                    </p>

                    {quizFinishedData && (
                      <div
                        className="glass-panel"
                        style={{
                          background: quizFinishedData.passed
                            ? "rgba(16, 185, 129, 0.1)"
                            : "rgba(239, 68, 68, 0.1)",
                          borderColor: quizFinishedData.passed ? "var(--success)" : "var(--danger)",
                          padding: "20px",
                          borderRadius: "12px",
                          marginBottom: "30px",
                          textAlign: "left",
                        }}
                      >
                        <h4
                          style={{
                            color: quizFinishedData.passed ? "var(--success)" : "var(--danger)",
                            fontSize: "1.1rem",
                            fontWeight: 700,
                          }}
                        >
                          {quizFinishedData.message}
                        </h4>
                        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "6px" }}>
                          Score: <strong>{quizFinishedData.score}</strong> out of{" "}
                          <strong>{quizFinishedData.totalQuestions}</strong> (
                          {Math.round(quizFinishedData.percentage)}%)
                        </p>
                      </div>
                    )}

                    <button className="btn btn-primary" onClick={startQuiz}>
                      {pastAttempts.length > 0 ? "Retake Course Quiz ➔" : "Begin Course Quiz ➔"}
                    </button>

                    {/* Attempt records */}
                    {pastAttempts.length > 0 && (
                      <div style={{ marginTop: "40px", textAlign: "left" }}>
                        <h4 style={{ fontSize: "1rem", marginBottom: "12px", fontWeight: 700 }}>
                          Your Attempt History:
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {pastAttempts.map((attempt) => (
                            <div
                              key={attempt._id}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                background: "rgba(255,255,255,0.02)",
                                padding: "12px 16px",
                                borderRadius: "8px",
                                border: "1px solid rgba(255,255,255,0.05)",
                                fontSize: "0.85rem",
                              }}
                            >
                              <span>
                                {new Date(attempt.createdAt).toLocaleDateString()}{" "}
                                {new Date(attempt.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              <span>
                                Score: {attempt.score}/{attempt.totalQuestions}
                              </span>
                              <span
                                style={{
                                  color: attempt.passed ? "var(--success)" : "var(--danger)",
                                  fontWeight: 700,
                                }}
                              >
                                {attempt.passed ? "PASSED" : "FAILED"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 3. DISCUSSIONS WORKSPACE */}
            {activeTab === "discussions" && (
              <div>
                <h3 style={{ fontSize: "1.25rem", marginBottom: "15px" }}>Course Q&A Discussion</h3>

                {/* Input form */}
                <div className="discussion-input-section">
                  <textarea
                    placeholder="Ask a question or post a discussion topic..."
                    value={newDiscussionMsg}
                    onChange={(e) => setNewDiscussionMsg(e.target.value)}
                  />
                  <button className="btn btn-primary" onClick={handlePostDiscussion}>
                    Post Thread
                  </button>
                </div>

                {/* Threads */}
                {discussions.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {discussions.map((thread) => (
                      <div className="discussion-thread" key={thread._id}>
                        <div className="thread-header">
                          <div className="user-avatar">
                            {thread.userId?.name ? thread.userId.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <span className="thread-author">{thread.userId?.name || "Student"}</span>
                          </div>
                          <span className="thread-date">
                            {new Date(thread.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="thread-message">{thread.message}</p>

                        {/* Replies */}
                        <div className="thread-replies-list">
                          {thread.replies?.map((reply) => (
                            <div className="reply-item" key={reply._id}>
                              <div className="reply-header">
                                <span className="reply-author">
                                  {reply.userId?.name || "User"}
                                </span>
                                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginLeft: "auto" }}>
                                  {new Date(reply.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="reply-message">{reply.message}</p>
                            </div>
                          ))}
                        </div>

                        {/* Reply textbox */}
                        <div className="reply-input-box">
                          <input
                            type="text"
                            placeholder="Add a reply..."
                            value={replyInputs[thread._id] || ""}
                            onChange={(e) =>
                              setReplyInputs({ ...replyInputs, [thread._id]: e.target.value })
                            }
                          />
                          <button
                            className="reply-submit-btn"
                            onClick={() => handlePostReply(thread._id)}
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)" }}>
                    <p>No discussion threads started. Be the first to start a conversation!</p>
                  </div>
                )}
              </div>
            )}

            {/* 4. REVIEWS WORKSPACE */}
            {activeTab === "reviews" && (
              <div className="reviews-tab-layout">
                {/* Form to submit review */}
                <div className="add-review-section">
                  <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "8px" }}>
                    Add Your Star Rating & Review
                  </h4>

                  <div className="interactive-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`star-input ${userRating >= star ? "active" : ""}`}
                        onClick={() => setUserRating(star)}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  <textarea
                    placeholder="Tell other students what you think of this course..."
                    className="review-textarea"
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                  />

                  <button className="btn btn-primary" onClick={handlePostReview}>
                    Submit Feedback
                  </button>
                </div>

                {/* Reviews List */}
                <div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "16px" }}>
                    Student Feedback Checklist ({reviews.length} reviews)
                  </h4>
                  {reviews.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                      {reviews.map((rev) => (
                        <div
                          key={rev._id}
                          style={{
                            background: "rgba(255,255,255,0.01)",
                            border: "1px solid rgba(255,255,255,0.03)",
                            borderRadius: "10px",
                            padding: "16px",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <strong style={{ fontSize: "0.9rem" }}>{rev.userId?.name || "Student"}</strong>
                            <span style={{ color: "#f59e0b", fontSize: "0.85rem" }}>
                              {"★".repeat(rev.rating)}
                              {"★".repeat(5 - rev.rating)}
                            </span>
                          </div>
                          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "8px", lineHeight: 1.5 }}>
                            {rev.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", padding: "10px" }}>
                      <p>No reviews yet. Be the first to review this course!</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. COMPLETION CERTIFICATE */}
            {activeTab === "certificate" && (
              <div className="certificate-tab-container">
                {eligibleForCertificate ? (
                  <div>
                    <h3 style={{ fontSize: "1.5rem", color: "var(--success)", marginBottom: "8px" }}>
                      Congratulations! You've Completed the Course! 🎉
                    </h3>
                    <p style={{ color: "var(--text-muted)", marginBottom: "30px", maxWidth: "550px" }}>
                      You have watched 100% of the lectures and satisfied the curriculum requirements. 
                      You can print or download your verified credential below.
                    </p>

                    {/* Luxurious Paper Certificate Card */}
                    <div className="certificate-preview-box" id="printable-certificate">
                      <div className="cert-title">Certificate of Completion</div>
                      <div className="cert-subtitle">This document officially certifies that</div>
                      <div className="cert-name">{localStorage.getItem("name") || "Graduate Student"}</div>
                      <div className="cert-subtitle">has successfully fulfilled all curriculum requirements for</div>
                      <div className="cert-course">"{course?.title}"</div>
                      <div className="cert-subtitle" style={{ marginTop: "6px" }}>
                        instructed by {course?.instructor}
                      </div>

                      <div className="cert-footer">
                        <div>
                          <p style={{ fontWeight: "bold" }}>Verified Credential</p>
                          <p>CoursePlatform Online</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontWeight: "bold" }}>Date of Issuance</p>
                          <p>{new Date().toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="cert-id">
                        Certificate Verification Code: ID-{courseId.substring(0, 8)}-
                        {Math.floor(100000 + Math.random() * 900000)}
                      </div>
                    </div>

                    <button className="btn btn-primary" onClick={handlePrintCertificate}>
                      Print / Save Certificate 🖨️
                    </button>
                  </div>
                ) : (
                  <div style={{ maxWidth: "500px", margin: "0 auto", padding: "20px 0" }}>
                    <span style={{ fontSize: "3rem", display: "block", marginBottom: "15px" }}>🔒</span>
                    <h3 style={{ fontSize: "1.25rem", marginBottom: "10px" }}>Certificate Locked</h3>
                    <p style={{ color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "20px" }}>
                      To unlock your verified certificate of completion, you must complete the following items:
                    </p>

                    <div
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        padding: "16px",
                        borderRadius: "10px",
                        border: "1px solid rgba(255,255,255,0.05)",
                        textAlign: "left",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ color: progressQualified ? "var(--success)" : "var(--danger)" }}>
                          {progressQualified ? "✓" : "✗"}
                        </span>
                        <span style={{ color: progressQualified ? "white" : "var(--text-muted)" }}>
                          Watch all course lectures (Current: {progress.progressPercent}%)
                        </span>
                      </div>

                      {quizRequired && (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ color: hasPassedQuiz ? "var(--success)" : "var(--danger)" }}>
                            {hasPassedQuiz ? "✓" : "✗"}
                          </span>
                          <span style={{ color: hasPassedQuiz ? "white" : "var(--text-muted)" }}>
                            Pass the course quiz with at least 50% score
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: VIDEO CHECKLIST PLAYLIST */}
        <div className="playlist-panel">
          <div className="playlist-header">
            <h3>Syllabus Lectures</h3>
            <div className="playlist-progress-info">
              {progress.watchedCount} of {videos.length} videos completed ({progress.progressPercent}%)
            </div>
          </div>

          <div className="playlist-items">
            {videos.length > 0 ? (
              videos.map((vid, idx) => {
                const isWatched = progress.watchedVideos.includes(vid._id);
                const isActive = activeVideo && activeVideo._id === vid._id;

                return (
                  <div
                    key={vid._id}
                    className={`playlist-item ${isActive ? "active" : ""}`}
                    onClick={() => handlePlayVideo(vid)}
                  >
                    <div className="watched-checkbox-wrapper">
                      <input
                        type="checkbox"
                        className="watched-checkbox"
                        checked={isWatched}
                        onClick={(e) => e.stopPropagation()} // Prevent playing video on checkbox toggle
                        onChange={(e) => handleMarkAsWatched(vid._id, e.target.checked)}
                      />
                    </div>

                    <div className="playlist-item-details">
                      <div className="playlist-item-title">
                        {idx + 1}. {vid.title}
                      </div>
                      <div className="playlist-item-duration">Lecture Video</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
                No lectures loaded.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Videos;