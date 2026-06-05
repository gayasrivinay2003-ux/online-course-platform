import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("stats");
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalVideos: 0,
    totalEnrollments: 0,
  });

  // Course Form State
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    category: "",
    instructor: "",
    price: "",
    thumbnail: "",
  });
  const [editingCourse, setEditingCourse] = useState(null);

  // Video Form State
  const [videoForm, setVideoForm] = useState({
    courseId: "",
    title: "",
    description: "",
    videoUrl: "",
  });
  const [editingVideo, setEditingVideo] = useState(null);

  // Video list state
  const [allVideos, setAllVideos] = useState([]);

  // User States
  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [editingUser, setEditingUser] = useState(null);

  // Quiz Builder State
  const [selectedQuizCourseId, setSelectedQuizCourseId] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [quizQuestions, setQuizQuestions] = useState([
    {
      questionText: "",
      options: ["", "", "", ""],
      correctOptionIndex: 0,
    },
  ]);

  // Load Initial Metrics
  const loadDashboardData = async () => {
    try {
      const statsRes = await API.get("/admin/dashboard");
      setStats(statsRes.data);

      const coursesRes = await API.get("/admin/courses");
      setCourses(coursesRes.data);
      if (coursesRes.data.length > 0) {
        setVideoForm((prev) => ({ ...prev, courseId: coursesRes.data[0]._id }));
        setSelectedQuizCourseId(coursesRes.data[0]._id);
      }

      const videosRes = await API.get("/videos");
      setAllVideos(videosRes.data || []);

      const usersRes = await API.get("/admin/users");
      setUsers(usersRes.data || []);
    } catch (err) {
      console.error("Dashboard load failed", err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Course Submission
  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.title || !courseForm.instructor || !courseForm.price) {
      alert("Please fill in course title, instructor, and price.");
      return;
    }

    try {
      const courseData = {
        title: courseForm.title,
        description: courseForm.description,
        category: courseForm.category || "General",
        instructor: courseForm.instructor,
        price: Number(courseForm.price),
        thumbnail: courseForm.thumbnail,
      };

      if (editingCourse) {
        await API.put(`/admin/courses/${editingCourse._id}`, courseData);
        alert("Course updated successfully! 🎉");
        setEditingCourse(null);
      } else {
        await API.post("/admin/courses", courseData);
        alert("Course added successfully! 🎉");
      }

      setCourseForm({
        title: "",
        description: "",
        category: "",
        instructor: "",
        price: "",
        thumbnail: "",
      });
      loadDashboardData();
    } catch (err) {
      alert(editingCourse ? "Failed to update course" : "Failed to add course");
    }
  };

  // Delete Course
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course and all associated lectures?")) {
      return;
    }

    try {
      await API.delete(`/admin/courses/${courseId}`);
      alert("Course deleted successfully!");
      loadDashboardData();
    } catch (err) {
      alert("Failed to delete course");
    }
  };

  // Video Submission
  const handleAddVideo = async (e) => {
    e.preventDefault();
    if (!videoForm.courseId || !videoForm.title || !videoForm.videoUrl) {
      alert("Please select a course and provide a video title and URL.");
      return;
    }

    try {
      const videoData = {
        courseId: videoForm.courseId,
        title: videoForm.title,
        description: videoForm.description,
        videoUrl: videoForm.videoUrl,
      };

      if (editingVideo) {
        await API.put(`/videos/${editingVideo._id}`, videoData);
        alert("Lecture video updated successfully! 🎬");
        setEditingVideo(null);
      } else {
        await API.post("/videos", videoData);
        alert("Lecture video uploaded successfully! 🎬");
      }

      setVideoForm({
        ...videoForm,
        title: "",
        description: "",
        videoUrl: "",
      });
      loadDashboardData();
    } catch (err) {
      alert(editingVideo ? "Failed to update video" : "Failed to upload video");
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm("Are you sure you want to delete this lecture video?")) {
      return;
    }

    try {
      await API.delete(`/videos/${videoId}`);
      alert("Lecture video deleted successfully!");
      loadDashboardData();
    } catch (err) {
      alert("Failed to delete video");
    }
  };


  // Quiz Builder Operations
  const handleAddQuestion = () => {
    setQuizQuestions([
      ...quizQuestions,
      {
        questionText: "",
        options: ["", "", "", ""],
        correctOptionIndex: 0,
      },
    ]);
  };

  const handleRemoveQuestion = (idx) => {
    const nextQuestions = quizQuestions.filter((_, qIdx) => qIdx !== idx);
    setQuizQuestions(nextQuestions);
  };

  const handleQuestionTextChange = (idx, text) => {
    const nextQuestions = [...quizQuestions];
    nextQuestions[idx].questionText = text;
    setQuizQuestions(nextQuestions);
  };

  const handleOptionTextChange = (qIdx, optIdx, text) => {
    const nextQuestions = [...quizQuestions];
    nextQuestions[qIdx].options[optIdx] = text;
    setQuizQuestions(nextQuestions);
  };

  const handleCorrectIndexChange = (qIdx, indexValue) => {
    const nextQuestions = [...quizQuestions];
    nextQuestions[qIdx].correctOptionIndex = Number(indexValue);
    setQuizQuestions(nextQuestions);
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    if (!selectedQuizCourseId || !quizTitle) {
      alert("Please select a course and enter a quiz title.");
      return;
    }

    // Validate questions
    for (let i = 0; i < quizQuestions.length; i++) {
      const q = quizQuestions[i];
      if (!q.questionText.trim()) {
        alert(`Question #${i + 1} text is empty.`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          alert(`Option #${j + 1} for Question #${i + 1} is empty.`);
          return;
        }
      }
    }

    try {
      await API.post("/quizzes", {
        courseId: selectedQuizCourseId,
        title: quizTitle,
        questions: quizQuestions,
      });

      alert("Quiz saved and activated successfully! 📝");
      setQuizTitle("");
      setQuizQuestions([
        {
          questionText: "",
          options: ["", "", "", ""],
          correctOptionIndex: 0,
        },
      ]);
    } catch (err) {
      alert("Failed to save quiz");
    }
  };

  // User CRUD Operations
  const handleEditUserClick = (user) => {
    setEditingUser(user);
    setUserForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "student",
    });
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email || (!editingUser && !userForm.password)) {
      alert("Please fill in name, email, and password.");
      return;
    }

    try {
      const userData = {
        name: userForm.name,
        email: userForm.email,
        role: userForm.role,
      };
      if (userForm.password) {
        userData.password = userForm.password;
      }

      if (editingUser) {
        await API.put(`/admin/users/${editingUser._id}`, userData);
        alert("User updated successfully! 👤");
        setEditingUser(null);
      } else {
        await API.post("/admin/users", userData);
        alert("User created successfully! 👤");
      }

      setUserForm({
        name: "",
        email: "",
        password: "",
        role: "student",
      });
      loadDashboardData();
    } catch (err) {
      const errMsg = err.response?.data?.message || "";
      alert(editingUser ? `Failed to update user: ${errMsg}` : `Failed to create user: ${errMsg}`);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await API.delete(`/admin/users/${userId}`);
      alert("User deleted successfully!");
      loadDashboardData();
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  // Course Edit Handlers
  const handleEditCourseClick = (course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title || "",
      description: course.description || "",
      category: course.category || "",
      instructor: course.instructor || "",
      price: course.price || "",
      thumbnail: course.thumbnail || "",
    });
  };

  // Video Edit Handlers
  const handleEditVideoClick = (video) => {
    setEditingVideo(video);
    setVideoForm({
      courseId: video.courseId?._id || video.courseId || "",
      title: video.title || "",
      description: video.description || "",
      videoUrl: video.videoUrl || "",
    });
  };

  return (
    <div className="admin-page">
      <Navbar />

      <div className="admin-container">
        <h1 className="page-title">⚙️ Administrator Command Panel</h1>
        <p className="page-subtitle">
          Manage courses, publish syllabus lecture videos, and design interactive multiple choice quizzes for graduates.
        </p>

        {/* Tab Selection */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === "stats" ? "active" : ""}`}
            onClick={() => setActiveTab("stats")}
          >
            Analytics & Metrics
          </button>
          <button
            className={`admin-tab ${activeTab === "courses" ? "active" : ""}`}
            onClick={() => setActiveTab("courses")}
          >
            Course Manager
          </button>
          <button
            className={`admin-tab ${activeTab === "videos" ? "active" : ""}`}
            onClick={() => setActiveTab("videos")}
          >
            Lecture Publisher
          </button>
          <button
            className={`admin-tab ${activeTab === "quiz" ? "active" : ""}`}
            onClick={() => setActiveTab("quiz")}
          >
            Quiz Creator
          </button>
          <button
            className={`admin-tab ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            User Manager
          </button>
        </div>

        {/* Tab Panels */}
        {activeTab === "stats" && (
          <div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-num">{stats.totalUsers}</div>
                <div className="stat-label">Total Registered Users</div>
              </div>
              <div className="stat-card">
                <div className="stat-num">{stats.totalCourses}</div>
                <div className="stat-label">Published Courses</div>
              </div>
              <div className="stat-card">
                <div className="stat-num">{stats.totalVideos}</div>
                <div className="stat-label">Published Videos</div>
              </div>
              <div className="stat-card">
                <div className="stat-num">{stats.totalEnrollments}</div>
                <div className="stat-label">Student Enrollments</div>
              </div>
            </div>

            <div className="admin-section">
              <h3 className="admin-section-title">Overview Notes</h3>
              <p style={{ color: "var(--text-muted)", lineHeight: "1.6" }}>
                Use the navigation tabs above to manage content. Creating courses will register item listings in the student Catalog. Publishing videos registers them directly into the course playlists. Making a quiz integrates assessments for completion qualifications.
              </p>
            </div>
          </div>
        )}

        {/* Course Manager Workspace */}
        {activeTab === "courses" && (
          <div>
            <div className="admin-section">
              <h3 className="admin-section-title">
                {editingCourse ? `Edit Course: ${editingCourse.title}` : "Create a New Course"}
              </h3>
              <form className="admin-form" onSubmit={handleAddCourse}>
                <div className="admin-form-row">
                  <div className="form-group">
                    <label className="form-label">Course Title *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Learn React 19"
                      value={courseForm.title}
                      onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Web Development"
                      value={courseForm.category}
                      onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="form-group">
                    <label className="form-label">Instructor Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Prof. Johnson"
                      value={courseForm.instructor}
                      onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (₹) *</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="e.g. 499"
                      value={courseForm.price}
                      onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Thumbnail Image Link</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://images.unsplash.com/photo..."
                    value={courseForm.thumbnail}
                    onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Course Syllabus Description</label>
                  <textarea
                    rows="3"
                    className="form-input"
                    style={{ resize: "vertical", height: "auto" }}
                    placeholder="Provide a description of the course contents..."
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  />
                </div>

                <div>
                  <button type="submit" className="btn btn-primary" style={{ width: "200px" }}>
                    {editingCourse ? "Update Course" : "Publish Course"}
                  </button>
                  {editingCourse && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ marginLeft: "10px", width: "150px" }}
                      onClick={() => {
                        setEditingCourse(null);
                        setCourseForm({
                          title: "",
                          description: "",
                          category: "",
                          instructor: "",
                          price: "",
                          thumbnail: "",
                        });
                      }}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="admin-section">
              <h3 className="admin-section-title">Published Catalog ({courses.length} courses)</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {courses.map((course) => (
                  <div key={course._id} className="admin-list-item glass-panel" style={{ marginBottom: "10px" }}>
                    <div>
                      <strong style={{ fontSize: "1rem" }}>{course.title}</strong>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginLeft: "12px" }}>
                        Instructor: {course.instructor} • Category: {course.category}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                        onClick={() => handleEditCourseClick(course)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-action-btn"
                        onClick={() => handleDeleteCourse(course._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Video Publisher Workspace */}
        {activeTab === "videos" && (() => {
          const courseVideos = allVideos.filter(
            (vid) =>
              vid.courseId &&
              (vid.courseId._id === videoForm.courseId || vid.courseId === videoForm.courseId)
          );
          return (
            <div>
              <div className="admin-section">
                <h3 className="admin-section-title">
                  {editingVideo ? `Edit Lecture Video: ${editingVideo.title}` : "Publish Lecture Video"}
                </h3>
                <form className="admin-form" onSubmit={handleAddVideo}>
                  <div className="form-group">
                    <label className="form-label">Select Target Course *</label>
                    <select
                      className="admin-select"
                      value={videoForm.courseId}
                      onChange={(e) => setVideoForm({ ...videoForm, courseId: e.target.value })}
                    >
                      {courses.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Video Title *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Introduction to State Management"
                      value={videoForm.title}
                      onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Video Source Link * (YouTube watch links or generic MP4s supported)</label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={videoForm.videoUrl}
                      onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Lecture Description</label>
                    <textarea
                      rows="3"
                      className="form-input"
                      style={{ resize: "vertical", height: "auto" }}
                      placeholder="Details of topics covered in this video..."
                      value={videoForm.description}
                      onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                    />
                  </div>

                  <div>
                    <button type="submit" className="btn btn-primary" style={{ width: "200px" }}>
                      {editingVideo ? "Update Video" : "Publish Video"}
                    </button>
                    {editingVideo && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ marginLeft: "10px", width: "150px" }}
                        onClick={() => {
                          setEditingVideo(null);
                          setVideoForm({
                            courseId: courses.length > 0 ? courses[0]._id : "",
                            title: "",
                            description: "",
                            videoUrl: "",
                          });
                        }}
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="admin-section">
                <h3 className="admin-section-title">Current Syllabus Outline ({courseVideos.length} Videos)</h3>
                {courseVideos.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {courseVideos.map((vid) => (
                      <div key={vid._id} className="admin-list-item glass-panel" style={{ borderRadius: "10px" }}>
                        <div style={{ flexGrow: 1, paddingRight: "20px" }}>
                          <strong style={{ fontSize: "1rem", color: "var(--text-main)" }}>{vid.title}</strong>
                          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                            Source: <a href={vid.videoUrl} target="_blank" rel="noreferrer" style={{ color: "var(--primary)" }}>{vid.videoUrl}</a>
                          </p>
                          {vid.description && (
                            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                              {vid.description}
                            </p>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                            onClick={() => handleEditVideoClick(vid)}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-action-btn"
                            onClick={() => handleDeleteVideo(vid._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                    No syllabus videos published for this course yet.
                  </p>
                )}
              </div>
            </div>
          );
        })()}

        {/* Quiz Creator Workspace */}
        {activeTab === "quiz" && (
          <div className="admin-section">
            <h3 className="admin-section-title">Design Course Assessment Quiz</h3>
            <form className="admin-form" onSubmit={handleQuizSubmit}>
              <div className="form-group">
                <label className="form-label">Select Target Course *</label>
                <select
                  className="admin-select"
                  value={selectedQuizCourseId}
                  onChange={(e) => setSelectedQuizCourseId(e.target.value)}
                >
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Quiz Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Final Certification Examination"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                />
              </div>

              <div style={{ marginTop: "24px", marginBottom: "24px" }}>
                <h4 style={{ fontSize: "1.1rem", marginBottom: "16px" }}>Questions List</h4>

                {quizQuestions.map((q, qIdx) => (
                  <div className="quiz-builder-question" key={qIdx}>
                    {quizQuestions.length > 1 && (
                      <button
                        type="button"
                        className="quiz-builder-remove-btn"
                        onClick={() => handleRemoveQuestion(qIdx)}
                      >
                        Remove Question
                      </button>
                    )}

                    <div className="form-group">
                      <label className="form-label">Question #{qIdx + 1} Text</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. What hooks is used for side effects in React?"
                        value={q.questionText}
                        onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                      />
                    </div>

                    <div className="admin-form-row">
                      <div className="form-group">
                        <label className="form-label">Option A (Index 0)</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Option A"
                          value={q.options[0]}
                          onChange={(e) => handleOptionTextChange(qIdx, 0, e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Option B (Index 1)</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Option B"
                          value={q.options[1]}
                          onChange={(e) => handleOptionTextChange(qIdx, 1, e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="admin-form-row">
                      <div className="form-group">
                        <label className="form-label">Option C (Index 2)</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Option C"
                          value={q.options[2]}
                          onChange={(e) => handleOptionTextChange(qIdx, 2, e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Option D (Index 3)</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Option D"
                          value={q.options[3]}
                          onChange={(e) => handleOptionTextChange(qIdx, 3, e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ maxWidth: "300px" }}>
                      <label className="form-label">Declare Correct Option Index</label>
                      <select
                        className="admin-select"
                        value={q.correctOptionIndex}
                        onChange={(e) => handleCorrectIndexChange(qIdx, e.target.value)}
                      >
                        <option value={0}>Option A (Index 0)</option>
                        <option value={1}>Option B (Index 1)</option>
                        <option value={2}>Option C (Index 2)</option>
                        <option value={3}>Option D (Index 3)</option>
                      </select>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleAddQuestion}
                  style={{ marginTop: "10px" }}
                >
                  + Add Question Item
                </button>
              </div>

              <button type="submit" className="btn btn-accent" style={{ width: "200px" }}>
                Save & Activate Quiz ➔
              </button>
            </form>
          </div>
        )}

        {/* User Manager Workspace */}
        {activeTab === "users" && (
          <div>
            <div className="admin-section">
              <h3 className="admin-section-title">
                {editingUser ? `Edit User: ${editingUser.name}` : "Create a New User"}
              </h3>
              <form className="admin-form" onSubmit={handleUserSubmit}>
                <div className="admin-form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. John Doe"
                      value={userForm.name}
                      onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="e.g. john@example.com"
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Password {editingUser ? "(Leave blank to keep current)" : "*"}
                    </label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder={editingUser ? "••••••••" : "Password"}
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">System Role *</label>
                    <select
                      className="admin-select"
                      value={userForm.role}
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    >
                      <option value="student">Student</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>

                <div>
                  <button type="submit" className="btn btn-primary" style={{ width: "200px" }}>
                    {editingUser ? "Update User" : "Create User"}
                  </button>
                  {editingUser && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ marginLeft: "10px", width: "150px" }}
                      onClick={() => {
                        setEditingUser(null);
                        setUserForm({
                          name: "",
                          email: "",
                          password: "",
                          role: "student",
                        });
                      }}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="admin-section">
              <h3 className="admin-section-title">Registered Users ({users.length} users)</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {users.map((user) => (
                  <div key={user._id} className="admin-list-item glass-panel" style={{ marginBottom: "10px" }}>
                    <div>
                      <strong style={{ fontSize: "1rem" }}>{user.name}</strong>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginLeft: "12px" }}>
                        Email: {user.email} • Role: 
                        <span 
                          style={{ 
                            marginLeft: "6px",
                            padding: "2px 8px", 
                            borderRadius: "4px", 
                            fontSize: "0.75rem",
                            fontWeight: "bold",
                            backgroundColor: user.role === "admin" ? "rgba(6, 182, 212, 0.2)" : "rgba(255, 255, 255, 0.05)",
                            color: user.role === "admin" ? "var(--accent)" : "var(--text-muted)"
                          }}
                        >
                          {user.role}
                        </span>
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                        onClick={() => handleEditUserClick(user)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-action-btn"
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;