import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Logged out successfully");
    navigate("/");
  };

  return (
    <div
      style={{
        padding: "15px",
        borderBottom: "1px solid black",
        marginBottom: "20px",
        display: "flex",
        gap: "15px",
        alignItems: "center",
      }}
    >
      <Link to="/courses">Courses</Link>

      <Link to="/my-courses">My Courses</Link>

      <Link to="/profile">Profile</Link>

      <button
        onClick={handleLogout}
        style={{
          marginLeft: "auto",
          padding: "5px 10px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default Navbar;