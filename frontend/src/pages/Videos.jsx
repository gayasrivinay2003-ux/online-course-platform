import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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
    <div>
      <h1>Course Videos</h1>

      {videos.map((video) => (
        <div
          key={video._id}
          style={{
            border: "1px solid black",
            margin: "10px",
            padding: "10px",
          }}
        >
          <h3>{video.title}</h3>

          <p>{video.description}</p>

          <a
            href={video.videoUrl}
            target="_blank"
            rel="noreferrer"
          >
            Watch Video
          </a>
        </div>
      ))}
    </div>
  );
}

export default Videos;