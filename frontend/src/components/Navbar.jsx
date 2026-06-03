import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");
  const userName = localStorage.getItem("name");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    alert("Logged out successfully");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div
      style={{
        padding: "16px 30px",
        background: "rgba(9, 13, 22, 0.7)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
        marginBottom: "20px",
      }}
    >
      {/* Brand Logo */}
      <div
        onClick={() => navigate("/home")}
        style={{
          fontSize: "1.25rem",
          fontWeight: 800,
          background: "linear-gradient(135deg, #fff, #6366f1)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        CoursePlatform 🎓
      </div>

      {/* Nav Links */}
      <div style={{ display: "flex", gap: "25px", alignItems: "center" }}>
        <Link
          to="/courses"
          style={{
            color: isActive("/courses") ? "#6366f1" : "#94a3b8",
            fontWeight: isActive("/courses") ? "600" : "500",
            transition: "all 0.2s",
            fontSize: "0.95rem",
          }}
        >
          All Courses
        </Link>

        <Link
          to="/my-courses"
          style={{
            color: isActive("/my-courses") ? "#6366f1" : "#94a3b8",
            fontWeight: isActive("/my-courses") ? "600" : "500",
            transition: "all 0.2s",
            fontSize: "0.95rem",
          }}
        >
          My Courses
        </Link>

        <Link
          to="/profile"
          style={{
            color: isActive("/profile") ? "#6366f1" : "#94a3b8",
            fontWeight: isActive("/profile") ? "600" : "500",
            transition: "all 0.2s",
            fontSize: "0.95rem",
          }}
        >
          Profile
        </Link>

        {role === "admin" && (
          <Link
            to="/admin"
            style={{
              color: isActive("/admin") ? "#f59e0b" : "#e0a96d",
              fontWeight: "600",
              transition: "all 0.2s",
              fontSize: "0.95rem",
              background: "rgba(245, 158, 11, 0.1)",
              padding: "4px 10px",
              borderRadius: "6px",
              border: "1px solid rgba(245, 158, 11, 0.2)",
            }}
          >
            Admin Panel ⚙️
          </Link>
        )}
      </div>

      {/* Profile & Logout */}
      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
        {userName && (
          <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
            Hi, <strong>{userName}</strong>
          </span>
        )}
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "8px",
            color: "#ef4444",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "0.85rem",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#ef4444";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
            e.currentTarget.style.color = "#ef4444";
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;