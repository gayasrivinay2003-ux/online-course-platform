import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Videos.css";

function Videos() {
  const [videos, setVideos] = useState([]);
  const { courseId } = useParams();

  const fetchVideos = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/videos/course/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      setVideos(data);
    } catch (error) {
      console.log(error);
      alert("Failed to load videos");
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <div className="videos-page">

      <h1 className="page-title">🎬 Course Videos</h1>

      <div className="videos-grid">

        {videos.map((video, index) => (
          <div className="video-card" key={video._id}>

            {/* Thumbnail */}
            <img
              src={
                video.thumbnail ||
                "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d"
              }
              alt="video"
              className="video-thumb"
            />

            {/* Content */}
            <div className="video-content">

              <h3>{video.title}</h3>

              <p>{video.description}</p>

              <a
                href={video.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="watch-btn"
              >
                ▶ Watch Video
              </a>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}

export default Videos;