import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        "https://online-course-platform-wvrx.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("Registered successfully");
        navigate("/");
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Registration failed");
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">

        <h1 className="register-title">Register</h1>

        <form onSubmit={handleRegister}>

          <input
            className="register-input"
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="register-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="register-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="register-btn" type="submit">
            Register
          </button>

        </form>

        <p className="register-text">
          Already have an account?{" "}
          <Link className="register-link" to="/">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Register;