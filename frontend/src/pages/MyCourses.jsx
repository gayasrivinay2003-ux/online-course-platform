import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../services/api";
import "./MyCourses.css";

function MyCourses() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const res = await API.get("/enrollment/my-courses");
      setEnrollments(res.data);
    } catch (error) {
      console.log(error);
      alert("Failed to load your enrolled courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);

  return (
    <div className="mycourses-page">
      <Navbar />

      <div className="mycourses-container">
        <h1 className="mycourses-title">My Learning Portal 🎓</h1>
        <p className="mycourses-subtitle">
          Track your curriculum progress, take quizzes to test your understanding, and download completion credentials.
        </p>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
            <h3>Loading enrolled courses...</h3>
          </div>
        ) : enrollments.length > 0 ? (
          <div className="mycourses-grid">
            {enrollments.map((item) => {
              if (!item.courseId) return null;
              const course = item.courseId;
              const isCompleted = item.status === "completed" || item.progressPercent >= 100;

              return (
                <div className="mycourse-card" key={item._id}>
                  <div className="mycourse-img-wrapper">
                    <span
                      className={`mycourse-badge ${
                        isCompleted ? "badge-completed" : "badge-enrolled"
                      }`}
                    >
                      {isCompleted ? "Completed 🎉" : "In Progress ✍️"}
                    </span>
                    <img
                      src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500"}
                      alt={course.title}
                      className="mycourse-img"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500";
                      }}
                    />
                  </div>

                  <div className="mycourse-content">
                    <h3>{course.title}</h3>
                    <p className="mycourse-desc">{course.description}</p>

                    {/* Progress tracking */}
                    <div className="progress-section">
                      <div className="progress-header">
                        <span>Course Completion:</span>
                        <span className="progress-pct">{item.progressPercent}%</span>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{ width: `${item.progressPercent}%` }}
                        ></div>
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                          marginTop: "6px",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>
                          {item.watchedCount || 0} of {item.totalVideos || 0} videos watched
                        </span>
                      </div>
                    </div>

                    <button
                      className="study-btn"
                      onClick={() => navigate(`/videos/${course._id}`)}
                    >
                      {isCompleted ? "Review Content" : "Continue Studying ➔"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className="glass-panel"
            style={{
              textAlign: "center",
              padding: "60px 40px",
              maxWidth: "500px",
              margin: "40px auto 0",
            }}
          >
            <span style={{ fontSize: "3rem", display: "block", marginBottom: "15px" }}>📚</span>
            <h3>No courses enrolled yet</h3>
            <p style={{ color: "var(--text-muted)", margin: "10px 0 24px" }}>
              Explore our wide variety of courses and start your learning journey today.
            </p>
            <button className="btn btn-primary" onClick={() => navigate("/courses")}>
              Explore Courses
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyCourses;