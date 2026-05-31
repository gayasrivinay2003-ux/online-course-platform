import { useEffect, useState } from "react";
import "./Profile.css";

function Profile() {
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  // GET PROFILE
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5000/api/auth/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setUser(data);
    };

    fetchProfile();
  }, []);

  // FILE CHANGE
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  // UPLOAD PHOTO
  const uploadPhoto = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("profilePic", file);

    const token = localStorage.getItem("token");

    const res = await fetch(
      "http://localhost:5000/api/auth/upload-photo",
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await res.json();
    setUser(data);
    alert("Profile photo updated!");
  };

  if (!user) return <h2 style={{ color: "white" }}>Loading...</h2>;

  return (
    <div className="profile-container">

      <div className="profile-box">

        <img
          className="profile-img"
          src={
            preview ||
            user.profilePic ||
            "https://via.placeholder.com/150"
          }
          alt="profile"
        />

        <div className="profile-name">
          {user.name}
        </div>

        <div className="profile-email">
          {user.email}
        </div>

        <input
          className="profile-input"
          type="file"
          onChange={handleFileChange}
        />

        <button className="profile-btn" onClick={uploadPhoto}>
          Upload Photo
        </button>

      </div>

    </div>
  );
}

export default Profile;