import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";

const AdminDashboard = () => {

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalVideos: 0,
    totalEnrollments: 0
  });

  useEffect(() => {

    fetch("http://localhost:5000/api/admin/dashboard")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.log(err));

  }, []);

  return (
    <div style={{ padding: "30px" }}>

      <h1>Admin Dashboard</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
          marginTop: "20px"
        }}
      >

        <div className="card">
          <h2>{stats.totalUsers}</h2>
          <p>Total Users</p>
        </div>

        <div className="card">
          <h2>{stats.totalCourses}</h2>
          <p>Total Courses</p>
        </div>

        <div className="card">
          <h2>{stats.totalVideos}</h2>
          <p>Total Videos</p>
        </div>

        <div className="card">
          <h2>{stats.totalEnrollments}</h2>
          <p>Total Enrollments</p>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;