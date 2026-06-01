import axios from "axios";

const API = axios.create({
  baseURL: "https://online-course-platform-wvrx.onrender.com/api",
});

export default API;