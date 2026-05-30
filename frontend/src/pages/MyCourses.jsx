import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
    <div>
      <h1>My Courses</h1>

      {courses.map((item) => (
        <div
          key={item._id}
          style={{
            border: "1px solid black",
            margin: "10px",
            padding: "10px",
          }}
        >
          <h3>{item.courseId.title}</h3>

          <p>{item.courseId.description}</p>

          <button
            onClick={() =>
              navigate(`/videos/${item.courseId._id}`)
            }
          >
            View Videos
          </button>
        </div>
      ))}
    </div>
  );
}

export default MyCourses;