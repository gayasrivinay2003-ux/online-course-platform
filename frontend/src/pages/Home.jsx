import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">

      {/* TOP NAVBAR */}
      <div className="top-nav">

        <div className="logo">
          CoursePlatform 🎓
        </div>

        <div className="nav-right">

          {/* ADMIN DASHBOARD */}
          {localStorage.getItem("role") === "admin" && (
            <button
              className="admin-btn"
              onClick={() => navigate("/admin")}
            >
              Admin Dashboard
            </button>
          )}

          {/* PROFILE */}
          <div
            className="profile-icon"
            onClick={() => navigate("/profile")}
          >
            👤
          </div>

        </div>

      </div>

      {/* CENTER CONTENT */}
      <div className="home-box">

        <h1 className="home-title">
          Online Course Platform 🎓
        </h1>

        <p className="home-subtitle">
          Learn anytime, anywhere. Upgrade your skills with modern courses.
        </p>

        <div className="button-container">

          <button
            className="home-btn courses-btn"
            onClick={() => navigate("/courses")}
          >
            View Courses
          </button>

          <button
            className="home-btn mycourses-btn"
            onClick={() => navigate("/my-courses")}
          >
            My Courses
          </button>

        </div>

      </div>

    </div>
  );
}

export default Home;