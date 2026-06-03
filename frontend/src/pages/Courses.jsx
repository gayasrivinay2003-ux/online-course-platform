import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { BASE_URL } from "../config";
import "./Courses.css";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState(["All"]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Fetch Courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}`);
      const data = await response.json();
      setCourses(data);
      setFilteredCourses(data);

      // Extract unique categories
      const allCats = ["All", ...new Set(data.map((c) => c.category))];
      setCategories(allCats);
    } catch (error) {
      console.log(error);
      alert("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Filter & Search Logic
  useEffect(() => {
    let result = courses;

    // Filter by Category
    if (selectedCategory !== "All") {
      result = result.filter((c) => c.category === selectedCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.instructor.toLowerCase().includes(q)
      );
    }

    setFilteredCourses(result);
  }, [searchQuery, selectedCategory, courses]);

  // Helper to render star rating
  const renderStars = (rating) => {
    const rounded = Math.round(rating);
    return (
      <div className="rating-stars">
        <span className="stars-gold">{"★".repeat(rounded)}</span>
        <span className="stars-grey">{"★".repeat(5 - rounded)}</span>
      </div>
    );
  };

  return (
    <div className="courses-page">
      <Navbar />

      <div className="courses-container">
        <div className="courses-header">
          <h1 className="page-title">📚 Explore Online Courses</h1>
          <p className="page-subtitle">
            Discover top-tier educational materials, watch expert guides, and take quizzes to test your proficiency.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="filter-bar">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search by title, instructor, description..."
              className="search-field"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="category-filters">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`filter-chip ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Listing */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
            <h3>Loading available courses...</h3>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="courses-grid">
            {filteredCourses.map((course) => (
              <div
                className="course-card"
                key={course._id}
                onClick={() => navigate(`/payment`, { state: { course } })} // Navigates to payment/enrollment screen
              >
                <div className="course-img-wrapper">
                  <span className="course-tag">{course.category}</span>
                  <img
                    src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500"}
                    alt={course.title}
                    className="course-img"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500";
                    }}
                  />
                </div>

                <div className="course-content">
                  <h3>{course.title}</h3>
                  <p className="course-desc">{course.description}</p>

                  <div className="course-meta">
                    <span>
                      Instructor: <strong>{course.instructor}</strong>
                    </span>
                  </div>

                  {/* Star rating */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {renderStars(course.avgRating || 0)}
                    <span className="rating-text">
                      ({course.avgRating || "0.0"} • {course.reviewCount || 0} reviews)
                    </span>
                  </div>

                  <div className="course-price-row">
                    <span className="course-price">₹{course.price}</span>
                    <button className="view-details-btn">View & Enroll ➔</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
            <h3>No courses match your criteria. Try adjustments!</h3>
          </div>
        )}
      </div>
    </div>
  );
}

export default Courses;