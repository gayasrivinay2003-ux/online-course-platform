import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../services/api";
import { BASE_URL } from "../config";
import "./QuizCompetition.css";

function QuizCompetition() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [leaderboard, setLeaderboard] = useState([]);
  const [coursesWithQuizzes, setCoursesWithQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Timed Quiz State
  const [quizActive, setQuizActive] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [activeCourse, setActiveCourse] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionIdx: optionIdx }
  const [timer, setTimer] = useState(15);
  const [quizResultData, setQuizResultData] = useState(null);

  const timerRef = useRef(null);

  // Fetch Leaderboard
  const fetchLeaderboard = async () => {
    try {
      const res = await API.get("/quizzes/leaderboard");
      setLeaderboard(res.data);
    } catch (err) {
      console.error("Error fetching leaderboard", err);
    }
  };

  // Fetch enrolled courses and check for quizzes
  const fetchCoursesAndQuizzes = async () => {
    try {
      const enrollmentsRes = await API.get("/enrollment/my-courses");
      const enrollments = enrollmentsRes.data || [];
      
      const quizPromises = enrollments.map(async (item) => {
        if (!item.courseId) return null;
        try {
          const quizRes = await API.get(`/quizzes/course/${item.courseId._id}`);
          return {
            course: item.courseId,
            quiz: quizRes.data,
            enrollment: item
          };
        } catch (e) {
          // No quiz for this course
          return null;
        }
      });

      const results = await Promise.all(quizPromises);
      setCoursesWithQuizzes(results.filter((r) => r !== null));
    } catch (err) {
      console.error("Error fetching courses with quizzes", err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchLeaderboard(), fetchCoursesAndQuizzes()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Timer logic
  useEffect(() => {
    if (!quizActive || !quiz) return;

    if (timer === 0) {
      handleNextOrSubmit();
      return;
    }

    timerRef.current = setTimeout(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timer, quizActive, quiz]);

  const startCompetitionQuiz = (courseData) => {
    setActiveCourse(courseData.course);
    setQuiz(courseData.quiz);
    setQuizActive(true);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setTimer(15);
    setQuizResultData(null);
  };

  const handleOptionSelect = (optionIdx) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIdx]: optionIdx,
    });
  };

  const handleNextOrSubmit = () => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (currentQuestionIdx < quiz.questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setTimer(15);
    } else {
      submitQuizResults();
    }
  };

  const submitQuizResults = async () => {
    if (!quiz) return;

    const answersArray = quiz.questions.map((_, idx) =>
      selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : -1
    );

    try {
      const res = await API.post("/quizzes/submit", {
        quizId: quiz._id,
        answers: answersArray,
      });
      setQuizResultData(res.data);
      setQuizActive(false);
      // Reload leaderboard to show updated scores
      fetchLeaderboard();
      fetchCoursesAndQuizzes();
    } catch (err) {
      console.error("Failed to submit competition results", err);
      alert("Failed to submit quiz results. Please try again.");
    }
  };

  const getProfilePic = (pic) => {
    if (!pic) return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";
    if (pic.startsWith("http")) return pic;
    const cleanPic = pic.startsWith("/") ? pic.substring(1) : pic;
    return `${BASE_URL}/${cleanPic}`;
  };

  return (
    <div className="quiz-competition-page">
      <Navbar />

      <div className="competition-container">
        
        {quizActive && quiz ? (
          /* TIMED QUIZ INTERFACE */
          <div className="timed-quiz-container glass-panel">
            <div className="quiz-battle-header">
              <div className="course-badge">COMPETITION ARENA</div>
              <h2>{quiz.title}</h2>
              <p className="course-subtitle">Course: {activeCourse?.title}</p>
            </div>

            {/* TIMER BAR */}
            <div className="timer-section">
              <div className="timer-header">
                <span>TIME REMAINING:</span>
                <span className={`timer-count ${timer <= 5 ? "timer-danger" : ""}`}>{timer}s</span>
              </div>
              <div className="timer-bar-track">
                <div
                  className={`timer-bar-fill ${timer <= 5 ? "bg-danger" : ""}`}
                  style={{ width: `${(timer / 15) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* QUESTION DISPLAY */}
            <div className="question-workspace">
              <div className="question-index-label">
                Question <strong>{currentQuestionIdx + 1}</strong> of {quiz.questions.length}
              </div>
              <h3 className="question-text">{quiz.questions[currentQuestionIdx].questionText}</h3>
              
              <div className="options-grid">
                {quiz.questions[currentQuestionIdx].options.map((option, idx) => (
                  <button
                    key={idx}
                    className={`option-card ${
                      selectedAnswers[currentQuestionIdx] === idx ? "selected" : ""
                    }`}
                    onClick={() => handleOptionSelect(idx)}
                  >
                    <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                    <span className="option-text-content">{option}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* NAVIGATION CONTROLS */}
            <div className="quiz-nav-footer">
              <div className="left-meta">
                * Timed questions advance automatically when timer ticks to zero
              </div>
              <button
                className="btn btn-primary next-question-btn"
                onClick={handleNextOrSubmit}
              >
                {currentQuestionIdx < quiz.questions.length - 1 ? "Next Question ➔" : "Submit Battle 🏁"}
              </button>
            </div>
          </div>
        ) : (
          /* STANDARD WORKSPACE PORTAL */
          <>
            <div className="arena-header glass-panel">
              <div className="header-info">
                <span className="live-pill">⚡ LIVE QUIZ COMPETITION</span>
                <h1>Compete & Lead the Board 🏆</h1>
                <p>
                  Challenge yourself with timed, fast-paced course assessments. Earn total score points to climb rankings and prove your skills to the community.
                </p>
              </div>
              <div className="header-icon">🛡️</div>
            </div>

            {/* TABS CONTROLLER */}
            <div className="arena-tabs">
              <button
                className={`tab-link-btn ${activeTab === "leaderboard" ? "active" : ""}`}
                onClick={() => setActiveTab("leaderboard")}
              >
                Global Rankings 🏆
              </button>
              <button
                className={`tab-link-btn ${activeTab === "competitions" ? "active" : ""}`}
                onClick={() => setActiveTab("competitions")}
              >
                Competition Arena ⚔️
              </button>
            </div>

            {loading ? (
              <div className="arena-loading">
                <div className="spinner"></div>
                <p>Loading Quiz Arena details...</p>
              </div>
            ) : (
              <>
                {/* 1. LEADERBOARD TAB */}
                {activeTab === "leaderboard" && (
                  <div className="leaderboard-workspace glass-panel">
                    <div className="workspace-header">
                      <h3>Global Student Standings</h3>
                      <p>Ranks are computed dynamically based on the sum of high scores across all courses.</p>
                    </div>

                    {leaderboard.length > 0 ? (
                      <div className="leaderboard-list">
                        {leaderboard.map((player, index) => {
                          const rank = index + 1;
                          let medal = "";
                          let rankClass = "normal-rank";
                          if (rank === 1) {
                            medal = "🥇";
                            rankClass = "gold-rank";
                          } else if (rank === 2) {
                            medal = "🥈";
                            rankClass = "silver-rank";
                          } else if (rank === 3) {
                            medal = "🥉";
                            rankClass = "bronze-rank";
                          }

                          return (
                            <div className={`leaderboard-item ${rankClass}`} key={player._id}>
                              <div className="rank-position">
                                {medal ? medal : rank}
                              </div>
                              <div className="player-avatar-container">
                                <img
                                  src={getProfilePic(player.profilePic)}
                                  alt={player.name}
                                  className="player-avatar"
                                  onError={(e) => {
                                    e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";
                                  }}
                                />
                              </div>
                              <div className="player-details">
                                <h4>{player.name}</h4>
                                <p>{player.email}</p>
                              </div>
                              <div className="player-stats">
                                <div className="stat-box">
                                  <strong>{player.quizzesPassed}</strong>
                                  <span>Passed</span>
                                </div>
                                <div className="stat-box">
                                  <strong>{player.quizzesAttempted}</strong>
                                  <span>Attempts</span>
                                </div>
                              </div>
                              <div className="player-points">
                                <strong>{player.totalPoints * 10}</strong>
                                <span>points</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="arena-empty-state">
                        <span>🏆</span>
                        <h3>No quiz scores recorded yet</h3>
                        <p>Be the first to finish a course quiz and lock in your ranking!</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. COMPETITIONS LIST TAB */}
                {activeTab === "competitions" && (
                  <div className="competitions-workspace">
                    
                    {quizResultData && (
                      <div
                        className="glass-panel quiz-result-alert"
                        style={{
                          background: quizResultData.passed
                            ? "rgba(16, 185, 129, 0.15)"
                            : "rgba(239, 68, 68, 0.15)",
                          borderColor: quizResultData.passed ? "var(--success)" : "var(--danger)",
                          padding: "24px",
                          borderRadius: "16px",
                          marginBottom: "24px",
                          textAlign: "center"
                        }}
                      >
                        <span style={{ fontSize: "2.5rem", display: "block" }}>
                          {quizResultData.passed ? "🏆" : "💥"}
                        </span>
                        <h3
                          style={{
                            color: quizResultData.passed ? "var(--success)" : "var(--danger)",
                            fontSize: "1.35rem",
                            fontWeight: 800,
                            marginTop: "10px"
                          }}
                        >
                          {quizResultData.message}
                        </h3>
                        <p style={{ color: "var(--text-muted)", marginTop: "8px", fontSize: "0.95rem" }}>
                          You answered <strong>{quizResultData.score}</strong> of{" "}
                          <strong>{quizResultData.totalQuestions}</strong> questions correctly (
                          {Math.round(quizResultData.percentage)}%).
                        </p>
                        <div style={{ marginTop: "12px", fontSize: "1.1rem", fontWeight: 700 }}>
                          Points Awarded: <span className="gradient-text">+{quizResultData.score * 10} points</span>
                        </div>
                        <button className="btn btn-secondary" style={{ marginTop: "20px" }} onClick={() => setQuizResultData(null)}>
                          Dismiss Results
                        </button>
                      </div>
                    )}

                    <div className="arena-grid">
                      {coursesWithQuizzes.length > 0 ? (
                        coursesWithQuizzes.map((item) => (
                          <div className="arena-card glass-panel" key={item.course._id}>
                            <div className="card-image-section">
                              <span className="category-badge">{item.course.category}</span>
                              <img
                                src={item.course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500"}
                                alt={item.course.title}
                                className="course-thumbnail"
                                onError={(e) => {
                                  e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500";
                                }}
                              />
                            </div>
                            <div className="card-content-section">
                              <h3>{item.course.title}</h3>
                              <p className="instructor-label">Instructor: {item.course.instructor}</p>
                              
                              <div className="quiz-meta-info">
                                <span>📋 {item.quiz.questions.length} Timed Questions</span>
                                <span>⚡ 15s per question</span>
                              </div>

                              <div className="card-action-row">
                                <button
                                  className="btn btn-primary launch-arena-btn"
                                  onClick={() => startCompetitionQuiz(item)}
                                >
                                  Enter Timed Battle ⚡
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="arena-empty-state glass-panel" style={{ gridColumn: "1 / -1" }}>
                          <span>🎒</span>
                          <h3>No active competitions available</h3>
                          <p>
                            You must enroll in courses that have assessment quizzes. Visit the course catalog to find active syllabus materials.
                          </p>
                          <button className="btn btn-primary" onClick={() => navigate("/courses")} style={{ marginTop: "16px" }}>
                            Browse Catalog
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default QuizCompetition;
