import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../services/api";
import { BASE_URL } from "../config";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch user profile
        const profileRes = await API.get("/auth/profile");
        setUser(profileRes.data);
        if (profileRes.data.name) {
          localStorage.setItem("name", profileRes.data.name);
        }
        if (profileRes.data.role) {
          localStorage.setItem("role", profileRes.data.role);
        }

        // 2. Fetch user enrolled courses (enrollments)
        const enrollmentsRes = await API.get("/enrollment/my-courses");
        const userEnrollments = enrollmentsRes.data || [];
        setEnrollments(userEnrollments);

        // 3. Fetch all courses to calculate recommended courses
        const coursesResponse = await fetch(`${BASE_URL}`);
        const allCourses = await coursesResponse.json();

        // Recommended courses = courses the user is not yet enrolled in
        const enrolledCourseIds = new Set(
          userEnrollments
            .filter((e) => e.courseId)
            .map((e) => e.courseId._id)
        );

        const recommended = allCourses.filter(
          (course) => !enrolledCourseIds.has(course._id)
        );
        setRecommendedCourses(recommended.slice(0, 3)); // show top 3 recommended
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getProfilePic = (pic) => {
    if (!pic) return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";
    if (pic.startsWith("http")) return pic;
    const cleanPic = pic.startsWith("/") ? pic.substring(1) : pic;
    return `${BASE_URL}/${cleanPic}`;
  };

  const renderStars = (rating) => {
    const rounded = Math.round(rating);
    return (
      <div className="rating-stars">
        <span className="stars-gold">{"★".repeat(rounded)}</span>
        <span className="stars-grey">{"★".repeat(5 - rounded)}</span>
      </div>
    );
  };

  // Metrics
  const enrolledCount = enrollments.length;
  const completedCourses = enrollments.filter(
    (e) => e.status === "completed" || (e.progressPercent && e.progressPercent >= 100)
  );
  const completedCount = completedCourses.length;
  const inProgressCount = enrolledCount - completedCount;

  const avgProgress = enrolledCount > 0
    ? Math.round(enrollments.reduce((acc, curr) => acc + (curr.progressPercent || 0), 0) / enrolledCount)
    : 0;

  // Courses in progress (active learning)
  const inProgressEnrollments = enrollments.filter(
    (e) => e.status !== "completed" && (!e.progressPercent || e.progressPercent < 100)
  );

  return (
    <div className="home-dashboard-page">
      <Navbar />

      <div className="dashboard-container">
        
        {loading ? (
          <div className="dashboard-loading">
            <div className="spinner"></div>
            <p>Loading your dashboard details...</p>
          </div>
        ) : (
          <>
            {/* WELCOME BANNER */}
            <div className="welcome-banner glass-panel">
              <div className="welcome-banner-content">
                <span className="badge-user-role">{user?.role || "Student"}</span>
                <h1>
                  Welcome back, <span className="gradient-text">{user?.name || "Learner"}</span>! 🚀
                </h1>
                <p>
                  Ready to level up your expertise today? Keep studying to unlock achievements and earn certifications.
                </p>
              </div>
              <div className="welcome-banner-avatar-container">
                <img
                  src={getProfilePic(user?.profilePic)}
                  alt="profile"
                  className="welcome-avatar"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";
                  }}
                />
              </div>
            </div>

            {/* METRICS GRID */}
            <div className="metrics-grid">
              <div className="metric-card glass-panel">
                <div className="metric-icon bg-blue">📚</div>
                <div className="metric-info">
                  <h3>{enrolledCount}</h3>
                  <p>Enrolled Courses</p>
                </div>
              </div>

              <div className="metric-card glass-panel">
                <div className="metric-icon bg-yellow">✍️</div>
                <div className="metric-info">
                  <h3>{inProgressCount}</h3>
                  <p>In Progress</p>
                </div>
              </div>

              <div className="metric-card glass-panel">
                <div className="metric-icon bg-green">🏆</div>
                <div className="metric-info">
                  <h3>{completedCount}</h3>
                  <p>Completed</p>
                </div>
              </div>

              <div className="metric-card glass-panel">
                <div className="metric-icon bg-purple">📊</div>
                <div className="metric-info">
                  <h3>{avgProgress}%</h3>
                  <p>Average Progress</p>
                </div>
              </div>
            </div>

            {/* TWO-COLUMN GRID */}
            <div className="dashboard-layout">
              {/* LEFT COLUMN: ACTIVE COURSES & RECOMMENDATIONS */}
              <div className="dashboard-main">
                
                {/* ACTIVE LEARNING */}
                <div className="dashboard-section glass-panel">
                  <div className="section-header">
                    <h2>Continue Learning ✍️</h2>
                    <button className="btn-link" onClick={() => navigate("/my-courses")}>
                      View All My Courses ➔
                    </button>
                  </div>

                  {inProgressEnrollments.length > 0 ? (
                    <div className="active-courses-list">
                      {inProgressEnrollments.map((item) => {
                        if (!item.courseId) return null;
                        const course = item.courseId;
                        return (
                          <div className="active-course-item" key={item._id}>
                            <img
                              src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500"}
                              alt={course.title}
                              className="active-course-thumb"
                              onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500";
                              }}
                            />
                            <div className="active-course-details">
                              <h3>{course.title}</h3>
                              <p className="instructor">By {course.instructor}</p>
                              
                              <div className="dashboard-progress-container">
                                <div className="progress-bar-track">
                                  <div
                                    className="progress-bar-fill"
                                    style={{ width: `${item.progressPercent || 0}%` }}
                                  ></div>
                                </div>
                                <span className="progress-percentage">{item.progressPercent || 0}%</span>
                              </div>
                              <span className="video-stats">
                                {item.watchedCount || 0} of {item.totalVideos || 0} videos watched
                              </span>
                            </div>
                            <button
                              className="btn btn-primary resume-btn"
                              onClick={() => navigate(`/videos/${course._id}`)}
                            >
                              Resume ➔
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <span className="empty-icon">🎒</span>
                      <h3>No courses currently in progress</h3>
                      <p>Pick up where you left off, or enroll in a brand new course below.</p>
                      <button className="btn btn-primary" onClick={() => navigate("/courses")}>
                        Explore Available Courses
                      </button>
                    </div>
                  )}
                </div>

                {/* RECOMMENDED COURSES */}
                <div className="dashboard-section glass-panel">
                  <div className="section-header">
                    <h2>Recommended For You 💡</h2>
                    <button className="btn-link" onClick={() => navigate("/courses")}>
                      All Courses ➔
                    </button>
                  </div>

                  {recommendedCourses.length > 0 ? (
                    <div className="recommended-courses-grid">
                      {recommendedCourses.map((course) => (
                        <div
                          className="recommended-card"
                          key={course._id}
                          onClick={() => navigate("/payment", { state: { course } })}
                        >
                          <div className="recommended-img-wrapper">
                            <span className="recommended-tag">{course.category}</span>
                            <img
                              src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500"}
                              alt={course.title}
                              className="recommended-img"
                              onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500";
                              }}
                            />
                          </div>
                          <div className="recommended-content">
                            <h3>{course.title}</h3>
                            <p className="recommended-desc">{course.description}</p>
                            
                            <div className="recommended-meta">
                              {renderStars(course.avgRating || 0)}
                              <span className="rating-text">
                                ({course.avgRating?.toFixed(1) || "0.0"} • {course.reviewCount || 0} reviews)
                              </span>
                            </div>

                            <div className="recommended-price-row">
                              <span className="price">₹{course.price}</span>
                              <span className="action-arrow">Enroll ➔</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <span className="empty-icon">🎉</span>
                      <h3>You are enrolled in all available courses!</h3>
                      <p>Stay tuned for new additions to the platform catalog.</p>
                    </div>
                  )}
                </div>

              </div>

              {/* RIGHT COLUMN: QUICK NAV & SIDE INFO */}
              <div className="dashboard-sidebar">
                
                {/* QUICK ACTIONS */}
                <div className="sidebar-widget glass-panel">
                  <h3>Quick Navigation 🚀</h3>
                  <div className="quick-actions-list">
                    <button className="sidebar-action-btn" onClick={() => navigate("/courses")}>
                      <span className="action-icon">📚</span>
                      <div className="action-label">
                        <h4>All Courses</h4>
                        <p>Browse course catalog</p>
                      </div>
                    </button>
                    
                    <button className="sidebar-action-btn" onClick={() => navigate("/my-courses")}>
                      <span className="action-icon">🎓</span>
                      <div className="action-label">
                        <h4>My Learning Portal</h4>
                        <p>Track full curriculum</p>
                      </div>
                    </button>
                    
                    <button className="sidebar-action-btn" onClick={() => navigate("/profile")}>
                      <span className="action-icon">👤</span>
                      <div className="action-label">
                        <h4>My Profile</h4>
                        <p>Update photo and info</p>
                      </div>
                    </button>

                    {user?.role === "admin" && (
                      <button className="sidebar-action-btn admin-sidebar-btn" onClick={() => navigate("/admin")}>
                        <span className="action-icon">⚙️</span>
                        <div className="action-label">
                          <h4>Admin Dashboard</h4>
                          <p>Manage courses & users</p>
                        </div>
                      </button>
                    )}
                  </div>
                </div>

                {/* MOTIVATION / TIP OF THE DAY */}
                <div className="sidebar-widget glass-panel motivation-widget">
                  <h3>Study Tip of the Day 💡</h3>
                  <div className="motivation-quote">
                    <blockquote>
                      "Learning never exhausts the mind. Consistent study of 20 minutes a day builds stronger long-term retention than cramming."
                    </blockquote>
                    <p className="quote-author">— Leonardo da Vinci</p>
                  </div>
                  <div className="study-streak-indicator">
                    <span className="fire-icon">🔥</span>
                    <div>
                      <strong>Keep the momentum going!</strong>
                      <p>Complete a video to keep your streak active.</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Home;