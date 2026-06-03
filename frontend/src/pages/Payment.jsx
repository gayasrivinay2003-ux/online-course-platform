import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../services/api";

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const course = location.state?.course;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePayment = async () => {
    if (!course) return;

    setLoading(true);
    try {
      // Create actual enrollment record in MongoDB
      const res = await API.post("/enrollment/enroll", {
        courseId: course._id,
      });

      setSuccess(true);
      setTimeout(() => {
        alert("Payment Successful & Enrolled! 🎉");
        navigate("/my-courses");
      }, 1500);
    } catch (error) {
      console.error("Enrollment error:", error);
      alert(
        error?.response?.data?.message ||
          "Enrollment failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!course) {
    return (
      <div style={{ textAlign: "center", padding: "100px", color: "white" }}>
        <Navbar />
        <h2>No course selected for payment.</h2>
        <button
          className="btn btn-primary"
          style={{ marginTop: "20px" }}
          onClick={() => navigate("/courses")}
        >
          Browse Courses
        </button>
      </div>
    );
  }

  const roundedRating = Math.round(course.avgRating || 0);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-dark)" }}>
      <Navbar />

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px 20px",
        }}
      >
        <div
          className="glass-panel"
          style={{
            padding: "40px",
            maxWidth: "600px",
            width: "100%",
            textAlign: "center",
            boxShadow: "var(--glass-shadow)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {success && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(9, 13, 22, 0.95)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 10,
                color: "var(--success)",
              }}
            >
              <span style={{ fontSize: "5rem", marginBottom: "15px" }}>🎉</span>
              <h2 style={{ fontWeight: 800 }}>Payment Approved</h2>
              <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
                Setting up your syllabus checklist...
              </p>
            </div>
          )}

          <h3
            style={{
              textTransform: "uppercase",
              fontSize: "0.8rem",
              fontWeight: 800,
              color: "var(--accent)",
              letterSpacing: "2px",
              marginBottom: "15px",
            }}
          >
            Course Enrollment Checkout 💳
          </h3>

          <img
            src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500"}
            alt={course.title}
            style={{
              width: "100%",
              height: "220px",
              objectFit: "cover",
              borderRadius: "12px",
              marginBottom: "24px",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          />

          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              marginBottom: "12px",
              lineHeight: 1.2,
            }}
          >
            {course.title}
          </h1>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "8px",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <span style={{ color: "#f59e0b" }}>
              {"★".repeat(roundedRating)}
              {"★".repeat(5 - roundedRating)}
            </span>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              ({course.avgRating || "0.0"} Rating)
            </span>
          </div>

          <p
            style={{
              color: "var(--text-muted)",
              lineHeight: 1.6,
              fontSize: "0.95rem",
              marginBottom: "28px",
            }}
          >
            {course.description}
          </p>

          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: "12px",
              padding: "20px",
              textAlign: "left",
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <span style={{ color: "var(--text-muted)" }}>Instructor:</span>
              <span style={{ fontWeight: 600 }}>{course.instructor}</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <span style={{ color: "var(--text-muted)" }}>Category:</span>
              <span style={{ fontWeight: 600 }}>{course.category}</span>
            </div>

            <hr
              style={{
                border: "none",
                height: "1px",
                backgroundColor: "rgba(255,255,255,0.08)",
                margin: "15px 0",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <span
                style={{
                  color: "var(--text-main)",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                }}
              >
                Amount Due:
              </span>
              <span
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 800,
                  color: "var(--accent)",
                }}
              >
                ₹{course.price}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "15px" }}>
            <button
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={() => navigate("/courses")}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              className="btn btn-primary"
              style={{ flex: 2 }}
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? "Authorizing Payment..." : "Complete Checkout ➔"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;