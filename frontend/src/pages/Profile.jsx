import { useEffect, useState } from "react";

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

  // HANDLE FILE SELECT
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  // UPLOAD PHOTO
  const uploadPhoto = async () => {
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

  if (!user) return <h2>Loading...</h2>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>My Profile</h1>

      {/* PROFILE IMAGE */}
      <img
        src={
          preview ||
          user.profilePic ||
          "https://via.placeholder.com/150"
        }
        alt="profile"
        width="150"
        height="150"
        style={{ borderRadius: "50%" }}
      />

      <h3>Name: {user.name}</h3>
      <h3>Email: {user.email}</h3>

      {/* FILE INPUT */}
      <input type="file" onChange={handleFileChange} />

      <br /><br />

      <button onClick={uploadPhoto}>
        Upload Photo
      </button>
    </div>
  );
}

export default Profile;