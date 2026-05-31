import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyCourses.css";

function MyCourses() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  const fetchMyCourses = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/enrollment/my-courses",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.log(error);
      alert("Failed to load courses");
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);

  return (
    <div className="mycourses-container">
      <h1 className="mycourses-title">
        My Courses 🎓
      </h1>

      <div className="courses-row">
        {courses.length > 0 ? (
          courses.map((item) => (
            <div className="course-card" key={item._id}>

              <img
                src={item.courseId.thumbnail}
                alt={item.courseId.title}
                className="course-thumbnail"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/300x180?text=No+Image";
                }}
              />

              <h3>{item.courseId.title}</h3>

              <p>{item.courseId.description}</p>

              <button
                className="view-btn"
                onClick={() =>
                  navigate(`/videos/${item.courseId._id}`)
                }
              >
                View Videos
              </button>

            </div>
          ))
        ) : (
          <p>No courses enrolled yet.</p>
        )}
      </div>
    </div>
  );
}

export default MyCourses;