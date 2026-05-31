import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  const course = location.state?.course;

  const [loading, setLoading] = useState(false);

  const handlePayment = () => {
    setLoading(true);

    setTimeout(() => {
      alert("Payment Successful 🎉");

      navigate("/my-courses");
    }, 2000);
  };

  if (!course) {
    return <h2>No course selected</h2>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>Payment Page 💳</h1>

        <h2>{course.title}</h2>

        <p>{course.description}</p>

        <p>
          <strong>Category:</strong> {course.category}
        </p>

        <p>
          <strong>Instructor:</strong> {course.instructor}
        </p>

        <h3>Price: ₹{course.price}</h3>

        <button
          onClick={handlePayment}
          style={styles.btn}
          disabled={loading}
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f172a",
    color: "white",
  },

  card: {
    padding: "30px",
    background: "rgba(255,255,255,0.08)",
    borderRadius: "12px",
    textAlign: "center",
    width: "400px",
  },

  btn: {
    marginTop: "20px",
    padding: "12px 25px",
    background: "#00c6ff",
    border: "none",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
  },
};

export default Payment;