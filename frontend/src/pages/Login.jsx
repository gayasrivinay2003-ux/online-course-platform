import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      // save token and user info
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user?.role || "student");
      localStorage.setItem("name", res.data.user?.name || "");

      alert("Login Success");

      // go to home page
      navigate("/home");
    } catch (error) {
      alert(error?.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Login</h2>

        <input
          className="login-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="login-btn" onClick={handleLogin}>
          Login
        </button>

        <p className="login-text">
          Don't have an account?{" "}
          <Link className="login-link" to="/register">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;