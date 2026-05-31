import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Courses.css";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  const navigate = useNavigate();

  // Fetch Courses
  const fetchCourses = async () => {
    try {
      const response = await fetch(
        "https://online-course-platform-wvrx.onrender.com"
      );

      const data = await response.json();

      setCourses(data);
    } catch (error) {
      console.log(error);
      alert("Failed to load courses");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Enroll Button
  const handleEnroll = (course) => {
    setLoadingId(course._id);

    setTimeout(() => {
      navigate("/payment", {
        state: { course },
      });

      setLoadingId(null);
    }, 500);
  };

  return (
    <div className="courses-page">
      <Navbar />

      <h1 className="page-title">
        📚 All Courses
      </h1>

      <div className="courses-grid">
        {courses.map((course) => (
          <div
            className="course-card"
            key={course._id}
          >
            {/* Course Image */}
            <img
              src={
                course.thumbnail ||
                "https://via.placeholder.com/400x250"
              }
              alt={course.title}
              className="course-img"
            />

            <div className="course-content">
              <h3>{course.title}</h3>

              <p>{course.description}</p>

              <p>
                <strong>Category:</strong>{" "}
                {course.category}
              </p>

              <p>
                <strong>Instructor:</strong>{" "}
                {course.instructor}
              </p>

              <p>
                <strong>Price:</strong> ₹
                {course.price}
              </p>

              <button
                className="enroll-btn"
                disabled={loadingId === course._id}
                onClick={() =>
                  handleEnroll(course)
                }
              >
                {loadingId === course._id
                  ? "Processing..."
                  : "Enroll / Buy 💳"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Courses;