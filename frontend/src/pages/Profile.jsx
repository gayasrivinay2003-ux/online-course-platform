import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";
import { BASE_URL } from "../config";
import "./Profile.css";

function Profile() {
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);

  // GET PROFILE
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await API.get("/auth/profile");
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // FILE CHANGE
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  // UPLOAD PHOTO
  const uploadPhoto = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      const res = await API.put("/auth/upload-photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setUser(res.data);
      alert("Profile photo updated!");
      setFile(null);
      setPreview("");
    } catch (err) {
      console.error("Upload error", err);
      alert("Failed to upload profile photo");
    }
  };

  const getProfilePic = (pic) => {
    if (!pic) return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";
    if (pic.startsWith("http")) return pic;
    // Prepend BASE_URL if relative path
    const cleanPic = pic.startsWith("/") ? pic.substring(1) : pic;
    return `${BASE_URL}/${cleanPic}`;
  };

  return (
    <div className="profile-page">
      <Navbar />

      <div className="profile-container">
        {loading ? (
          <h2 style={{ color: "var(--text-muted)" }}>Loading Profile...</h2>
        ) : user ? (
          <div className="profile-box glass-panel">
            <img
              className="profile-img"
              src={preview || getProfilePic(user.profilePic)}
              alt="profile"
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";
              }}
            />

            <h2 className="profile-name">{user.name}</h2>
            <p className="profile-email">{user.email}</p>

            <div
              style={{
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: "12px",
                background: "rgba(99, 102, 241, 0.15)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                color: "var(--primary)",
                fontSize: "0.8rem",
                fontWeight: 700,
                textTransform: "uppercase",
                marginBottom: "24px",
              }}
            >
              Role: {user.role || "student"}
            </div>

            <div className="form-group" style={{ marginTop: "10px" }}>
              <label className="form-label" style={{ textAlign: "center" }}>
                Update Profile Photo
              </label>
              <input
                className="profile-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            <button className="profile-btn btn btn-primary" onClick={uploadPhoto}>
              Upload Photo
            </button>
          </div>
        ) : (
          <h2 style={{ color: "var(--danger)" }}>Failed to load profile.</h2>
        )}
      </div>
    </div>
  );
}

export default Profile;