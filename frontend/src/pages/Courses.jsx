import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Courses() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/courses"
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

  const handleEnroll = async (courseId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/enrollment/enroll",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            courseId,
          }),
        }
      );

      const data = await response.json();

      alert(data.message);
    } catch (error) {
      console.log(error);
      alert("Enrollment Failed");
    }
  };

  return (
    <div>
      <Navbar />

      <h1>All Courses</h1>

      <button
        onClick={() => navigate("/my-courses")}
        style={{
          marginBottom: "20px",
          padding: "10px",
        }}
      >
        My Courses
      </button>

      {courses.map((course) => (
        <div
          key={course._id}
          style={{
            border: "1px solid black",
            margin: "10px",
            padding: "10px",
          }}
        >
          <h3>{course.title}</h3>

          <p>{course.description}</p>

          <button
            onClick={() =>
              handleEnroll(course._id)
            }
          >
            Enroll
          </button>
        </div>
      ))}
    </div>
  );
}

export default Courses;