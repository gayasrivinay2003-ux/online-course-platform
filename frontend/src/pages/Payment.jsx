import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../services/api";
import "./Payment.css";

// Dynamic simulated QR Code component for UPI payment
function SimulatedQRCode() {
  // Generate random tiny squares for QR content simulation
  const grid = [];
  const size = 17; // 17x17 grid (excluding anchors)
  
  // Deterministic-looking random matrix
  for (let r = 0; r < size; r++) {
    const row = [];
    for (let c = 0; c < size; c++) {
      // Create random-looking patterns but keep center somewhat open for logo
      const isCenter = r > 6 && r < 10 && c > 6 && c < 10;
      row.push(isCenter ? false : (Math.sin(r * 2.3 + c * 3.7) > -0.2));
    }
    grid.push(row);
  }

  return (
    <svg width="180" height="180" viewBox="0 0 180 180" style={{ background: "#ffffff", padding: "10px", borderRadius: "8px" }}>
      {/* Top Left Anchor */}
      <rect x="0" y="0" width="45" height="45" fill="#090d16" rx="4" />
      <rect x="6" y="6" width="33" height="33" fill="#ffffff" rx="2" />
      <rect x="12" y="12" width="21" height="21" fill="#6366f1" rx="1" />

      {/* Top Right Anchor */}
      <rect x="135" y="0" width="45" height="45" fill="#090d16" rx="4" />
      <rect x="141" y="6" width="33" height="33" fill="#ffffff" rx="2" />
      <rect x="147" y="12" width="21" height="21" fill="#6366f1" rx="1" />

      {/* Bottom Left Anchor */}
      <rect x="0" y="135" width="45" height="45" fill="#090d16" rx="4" />
      <rect x="6" y="141" width="33" height="33" fill="#ffffff" rx="2" />
      <rect x="12" y="147" width="21" height="21" fill="#6366f1" rx="1" />

      {/* Simulated QR Blocks */}
      <g transform="translate(45, 0)">
        {grid.map((row, rIdx) => 
          row.map((val, cIdx) => {
            // Draw block only if true and not overlapping with anchor spaces
            const x = cIdx * 5.3;
            const y = rIdx * 5.3;
            
            // Skip areas where anchors are situated
            const isTopRight = rIdx < 9 && cIdx > 9;
            const isBottomLeft = rIdx > 9 && cIdx < 9;
            const isTopLeft = rIdx < 9 && cIdx < 9;
            
            if (val && !isTopRight && !isBottomLeft && !isTopLeft) {
              return (
                <rect 
                  key={`${rIdx}-${cIdx}`} 
                  x={x} 
                  y={y} 
                  width="4.8" 
                  height="4.8" 
                  fill={rIdx % 2 === 0 ? "#1e1b4b" : "#0f172a"} 
                  rx="1"
                />
              );
            }
            return null;
          })
        )}
      </g>
      
      {/* Center Cap Logo */}
      <rect x="72" y="72" width="36" height="36" rx="6" fill="#6366f1" />
      {/* Graduation Cap Icon */}
      <path 
        d="M 90 77 L 80 82 L 90 87 L 100 82 Z" 
        fill="#ffffff" 
      />
      <path 
        d="M 83 83.5 L 83 88 C 83 90, 97 90, 97 88 L 97 83.5" 
        fill="none" 
        stroke="#ffffff" 
        strokeWidth="1.5" 
        strokeLinecap="round"
      />
      <line 
        x1="94" y1="84.5" x2="94" y2="92" 
        stroke="#fef08a" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
      />
      <circle cx="94" cy="92" r="1.5" fill="#fef08a" />
    </svg>
  );
}

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const course = location.state?.course;

  // Loading, success & step statuses
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [success, setSuccess] = useState(false);
  const [receiptDetails, setReceiptDetails] = useState(null);

  // Promo Code States
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");

  // Tabs for payment method
  const [activeTab, setActiveTab] = useState("upi"); // upi, netbanking, card

  // UPI states
  const [upiMethod, setUpiMethod] = useState("vpa"); // vpa or qr
  const [upiId, setUpiId] = useState("");
  const [upiError, setUpiError] = useState("");
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes

  // Netbanking states
  const [selectedBank, setSelectedBank] = useState("");
  const [netbankingError, setNetbankingError] = useState("");

  // Card states
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardFlipped, setCardFlipped] = useState(false);
  const [cardError, setCardError] = useState("");

  // Available coupons info
  const availableCoupons = [
    { code: "SAVE10", discount: 10, desc: "10% OFF on any course" },
    { code: "FREE50", discount: 50, desc: "50% OFF Limited Time Offer" },
    { code: "SUPERLEARNER", discount: 100, desc: "100% OFF for Free Access" },
  ];

  // QR timer countdown
  useEffect(() => {
    let timer;
    if (activeTab === "upi" && upiMethod === "qr" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeTab, upiMethod, timeLeft]);

  // Format QR timer string
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Promo Code logic
  const handleApplyPromo = (codeToApply = null) => {
    const code = (codeToApply || promoCode).trim().toUpperCase();
    if (!code) {
      setPromoError("Please enter a code");
      setPromoSuccess("");
      return;
    }

    const coupon = availableCoupons.find((c) => c.code === code);
    if (coupon) {
      setAppliedPromo(coupon);
      setPromoSuccess(`Coupon "${coupon.code}" applied successfully!`);
      setPromoError("");
      if (!codeToApply) setPromoCode("");
    } else {
      setPromoError("Invalid promotional coupon code");
      setPromoSuccess("");
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoSuccess("");
    setPromoError("");
  };

  // Calculate prices
  const basePrice = course ? course.price : 0;
  const discountAmount = appliedPromo ? Math.round((basePrice * appliedPromo.discount) / 100) : 0;
  const taxableAmount = Math.max(0, basePrice - discountAmount);
  // GST calculated at 18% unless course is free
  const gstAmount = taxableAmount > 0 ? Math.round(taxableAmount * 0.18) : 0;
  const finalPrice = taxableAmount > 0 ? taxableAmount + gstAmount : 0;

  // Handle card inputs formatters
  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
    setCardNumber(formatted);
  };

  const handleCardExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, "").substring(0, 4);
    if (value.length > 2) {
      value = value.substring(0, 2) + "/" + value.substring(2);
    }
    setCardExpiry(value);
  };

  // Handle Payment simulation
  const triggerSimulation = async (paymentDetailsSummary) => {
    setLoading(true);
    setLoadingStep(1);

    // Step 1: Secure connection
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoadingStep(2);

    // Step 2: Verification
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoadingStep(3);

    // Step 3: Transaction processing
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoadingStep(4);

    // Step 4: Finalizing enrollment
    try {
      await API.post("/enrollment/enroll", {
        courseId: course._id,
      });

      // Generate a mock transaction receipt details
      const transactionId = "TXN" + Math.floor(1000000000 + Math.random() * 9000000000);
      setReceiptDetails({
        txnId: transactionId,
        date: new Date().toLocaleString(),
        method: paymentDetailsSummary,
        amount: finalPrice,
      });

      setLoadingStep(5);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSuccess(true);
    } catch (error) {
      console.error("Enrollment error:", error);
      alert(
        error?.response?.data?.message ||
          "Checkout enrollment failed. Please try again."
      );
      setLoading(false);
    }
  };

  const handlePayUPI = () => {
    if (upiMethod === "vpa") {
      const upiRegex = /^[\w.-]+@[\w.-]+$/;
      if (!upiId || !upiRegex.test(upiId)) {
        setUpiError("Please enter a valid UPI ID (e.g. username@bank)");
        return;
      }
      setUpiError("");
      triggerSimulation(`UPI ID (${upiId})`);
    } else {
      if (timeLeft <= 0) {
        setUpiError("QR code has expired. Please refresh.");
        return;
      }
      setUpiError("");
      triggerSimulation("UPI (QR Code Scan)");
    }
  };

  const handlePayNetbanking = () => {
    if (!selectedBank) {
      setNetbankingError("Please select a bank to proceed");
      return;
    }
    setNetbankingError("");
    const bankLabel = 
      selectedBank === "HDFC" ? "HDFC Bank" :
      selectedBank === "SBI" ? "State Bank of India" :
      selectedBank === "ICICI" ? "ICICI Bank" :
      selectedBank === "AXIS" ? "Axis Bank" :
      selectedBank === "KOTAK" ? "Kotak Mahindra Bank" : selectedBank;

    triggerSimulation(`Netbanking (${bankLabel})`);
  };

  const handlePayCard = () => {
    if (cardNumber.length < 19) {
      setCardError("Please enter a valid 16-digit card number");
      return;
    }
    if (!cardHolder.trim()) {
      setCardError("Please enter the cardholder's name");
      return;
    }
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!cardExpiry || !expiryRegex.test(cardExpiry)) {
      setCardError("Please enter a valid expiry date (MM/YY)");
      return;
    }
    if (cardCvv.length < 3) {
      setCardError("Please enter a valid 3 or 4 digit CVV");
      return;
    }
    setCardError("");
    
    // Obfuscate card number for receipt
    const hiddenCard = `Card ending in ${cardNumber.slice(-4)}`;
    triggerSimulation(hiddenCard);
  };

  if (!course) {
    return (
      <div style={{ textAlign: "center", padding: "100px", color: "white" }}>
        <Navbar />
        <h2>No course selected for payment.</h2>
        <button
          className="btn btn-primary"
          style={{ marginTop: "20px" }}
          onClick={() => navigate("/courses")}
        >
          Browse Courses
        </button>
      </div>
    );
  }

  const popularBanks = [
    { id: "SBI", label: "SBI" },
    { id: "HDFC", label: "HDFC" },
    { id: "ICICI", label: "ICICI" },
    { id: "AXIS", label: "AXIS" },
    { id: "KOTAK", label: "KOTAK" },
  ];

  const otherBanks = [
    "Bank of Baroda",
    "Punjab National Bank",
    "Union Bank of India",
    "Canara Bank",
    "IndusInd Bank",
    "Yes Bank",
    "Federal Bank",
    "IDFC First Bank",
    "Indian Bank",
    "UCO Bank",
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-dark)", position: "relative" }}>
      <Navbar />

      {/* SECURE LOADING SCREEN OVERLAY */}
      {loading && !success && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(9, 13, 22, 0.95)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 100,
            color: "var(--text-main)",
            padding: "20px",
          }}
        >
          <div style={{ position: "relative", marginBottom: "30px" }}>
            <div className="payment-card-overlay-glow payment-card-overlay-glow-1"></div>
            <div className="payment-card-overlay-glow payment-card-overlay-glow-2"></div>
            <svg 
              className="animate-spin" 
              width="64" 
              height="64" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="var(--accent)" 
              strokeWidth="2.5" 
              strokeLinecap="round"
              style={{ zIndex: 2, position: "relative" }}
            >
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.05)" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
          </div>
          
          <h2 style={{ fontWeight: 800, fontSize: "1.75rem", marginBottom: "15px", textAlign: "center" }}>
            Authorizing Secure Transaction
          </h2>
          
          <div style={{ maxWidth: "400px", width: "100%", textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "10px 0", opacity: loadingStep >= 1 ? 1 : 0.3, transition: "opacity 0.3s" }}>
              <span style={{ color: loadingStep >= 1 ? "var(--success)" : "var(--text-muted)", fontSize: "1.2rem" }}>
                {loadingStep > 1 ? "✓" : "●"}
              </span>
              <span style={{ fontWeight: loadingStep === 1 ? 600 : 400 }}>Establishing secure 256-bit connection...</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "10px 0", opacity: loadingStep >= 2 ? 1 : 0.3, transition: "opacity 0.3s" }}>
              <span style={{ color: loadingStep >= 2 ? "var(--success)" : "var(--text-muted)", fontSize: "1.2rem" }}>
                {loadingStep > 2 ? "✓" : "●"}
              </span>
              <span style={{ fontWeight: loadingStep === 2 ? 600 : 400 }}>Contacting payment provider portal...</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "10px 0", opacity: loadingStep >= 3 ? 1 : 0.3, transition: "opacity 0.3s" }}>
              <span style={{ color: loadingStep >= 3 ? "var(--success)" : "var(--text-muted)", fontSize: "1.2rem" }}>
                {loadingStep > 3 ? "✓" : "●"}
              </span>
              <span style={{ fontWeight: loadingStep === 3 ? 600 : 400 }}>Processing debit instructions...</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "10px 0", opacity: loadingStep >= 4 ? 1 : 0.3, transition: "opacity 0.3s" }}>
              <span style={{ color: loadingStep >= 4 ? "var(--success)" : "var(--text-muted)", fontSize: "1.2rem" }}>
                {loadingStep > 4 ? "✓" : "●"}
              </span>
              <span style={{ fontWeight: loadingStep === 4 ? 600 : 400 }}>Finalizing course enrollment...</span>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS RECEIPT OVERLAY */}
      {success && receiptDetails && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(9, 13, 22, 0.97)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 101,
            padding: "20px",
          }}
        >
          <div
            className="glass-panel"
            style={{
              padding: "40px",
              maxWidth: "520px",
              width: "100%",
              textAlign: "center",
              boxShadow: "var(--glass-shadow)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div className="checkmark-circle">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>

            <h2 style={{ fontWeight: 800, fontSize: "1.85rem", color: "var(--text-main)" }}>Enrollment Complete!</h2>
            <p style={{ color: "var(--text-muted)", marginTop: "6px" }}>
              Your payment transaction was authorized successfully.
            </p>

            {/* Receipt Breakdown Card */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--border-color)",
                borderRadius: "12px",
                padding: "20px",
                textAlign: "left",
                margin: "24px 0",
              }}
            >
              <h4 style={{ textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "1px", color: "var(--accent)", marginBottom: "12px" }}>
                Transaction Receipt
              </h4>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Course:</span>
                <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{course.title}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Method:</span>
                <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{receiptDetails.method}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Date & Time:</span>
                <span style={{ fontWeight: 500, color: "var(--text-main)" }}>{receiptDetails.date}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Transaction ID:</span>
                <span style={{ fontFamily: "monospace", color: "var(--text-main)" }}>{receiptDetails.txnId}</span>
              </div>

              <hr style={{ border: "none", height: "1px", backgroundColor: "rgba(255,255,255,0.08)", margin: "12px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: 700 }}>Total Paid:</span>
                <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--success)" }}>₹{receiptDetails.amount}</span>
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: "100%", padding: "14px" }}
              onClick={() => navigate("/my-courses")}
            >
              Access My Courses ➔
            </button>
          </div>
        </div>
      )}

      {/* CORE PAYMENT CONTAINER */}
      <div className="payment-container">
        <div style={{ marginBottom: "28px" }}>
          <h1 className="page-title">Checkout Portal</h1>
          <p style={{ color: "var(--text-muted)" }}>Redeem coupon codes and select your preferred secure payment method.</p>
        </div>

        <div className="checkout-grid">
          {/* LEFT COLUMN: ORDER SUMMARY */}
          <div className="glass-panel" style={{ padding: "28px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>🛒</span> Order Summary
            </h3>

            {/* Course mini-profile */}
            <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
              <img
                src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500"}
                alt={course.title}
                style={{
                  width: "100px",
                  height: "70px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              />
              <div>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 700, lineHeight: 1.3, marginBottom: "4px" }}>{course.title}</h4>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>By {course.instructor}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                  <span style={{ color: "#f59e0b", fontSize: "0.8rem" }}>★</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{course.avgRating || "0.0"}</span>
                </div>
              </div>
            </div>

            {/* Promo Code box */}
            <div className="promo-box">
              <span className="form-label" style={{ marginBottom: "2px" }}>Have a coupon code?</span>
              <div className="promo-input-group">
                <input
                  type="text"
                  className="form-input"
                  style={{ padding: "8px 12px", fontSize: "0.85rem" }}
                  placeholder="e.g. SAVE10"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: "8px 15px", fontSize: "0.85rem" }}
                  onClick={() => handleApplyPromo()}
                >
                  Apply
                </button>
              </div>

              {/* Suggestions */}
              <div className="promo-badge-container">
                {availableCoupons.map((c) => (
                  <span 
                    key={c.code} 
                    className="promo-badge"
                    onClick={() => handleApplyPromo(c.code)}
                    title={c.desc}
                  >
                    🏷️ {c.code}
                  </span>
                ))}
              </div>

              {promoError && <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "8px" }}>✕ {promoError}</p>}
              {promoSuccess && <p style={{ color: "var(--success)", fontSize: "0.8rem", marginTop: "8px" }}>✓ {promoSuccess}</p>}
            </div>

            {/* Receipt Summary details */}
            <div
              style={{
                background: "rgba(255,255,255,0.01)",
                borderRadius: "10px",
                padding: "20px 0 0 0",
                marginTop: "24px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Original Price</span>
                <span>₹{basePrice}</span>
              </div>

              {appliedPromo && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "0.9rem", color: "var(--success)" }}>
                  <span>Discount ({appliedPromo.discount}%)</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-muted)" }}>GST (18%)</span>
                <span>₹{gstAmount}</span>
              </div>

              <hr style={{ border: "none", height: "1px", backgroundColor: "rgba(255,255,255,0.08)", margin: "16px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: 700, fontSize: "1rem" }}>Total Amount Due:</span>
                <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--accent)" }}>₹{finalPrice}</span>
              </div>
            </div>

            {/* Applied coupon badge */}
            {appliedPromo && (
              <div 
                style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  background: "rgba(16, 185, 129, 0.05)",
                  border: "1px solid rgba(16, 185, 129, 0.15)",
                  borderRadius: "8px", 
                  padding: "8px 12px", 
                  marginTop: "16px" 
                }}
              >
                <span style={{ fontSize: "0.8rem", color: "var(--success)", fontWeight: 600 }}>
                  Applied: {appliedPromo.code} ({appliedPromo.discount}% OFF)
                </span>
                <button 
                  onClick={handleRemovePromo} 
                  style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "1.1rem" }}
                  title="Remove coupon"
                >
                  &times;
                </button>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: PAYMENT METHODS */}
          <div className="glass-panel" style={{ padding: "28px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>🔒</span> Secure Payment Methods
            </h3>

            {/* Tabs selection */}
            <div className="payment-tabs-header">
              <button
                className={`payment-tab-btn ${activeTab === "upi" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("upi");
                  setCardError("");
                  setNetbankingError("");
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>📱</span>
                <span>UPI Pay</span>
              </button>
              <button
                className={`payment-tab-btn ${activeTab === "netbanking" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("netbanking");
                  setCardError("");
                  setUpiError("");
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>🏦</span>
                <span>Net Banking</span>
              </button>
              <button
                className={`payment-tab-btn ${activeTab === "card" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("card");
                  setUpiError("");
                  setNetbankingError("");
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>💳</span>
                <span>Cards</span>
              </button>
            </div>

            {/* UPI SUB-PANEL */}
            {activeTab === "upi" && (
              <div>
                {/* Mode selector */}
                <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                  <button
                    className="btn"
                    style={{
                      flex: 1,
                      fontSize: "0.85rem",
                      padding: "8px",
                      background: upiMethod === "vpa" ? "rgba(99, 102, 241, 0.15)" : "rgba(255,255,255,0.02)",
                      border: "1px solid",
                      borderColor: upiMethod === "vpa" ? "var(--primary)" : "var(--border-color)",
                      color: upiMethod === "vpa" ? "var(--text-main)" : "var(--text-muted)",
                    }}
                    onClick={() => setUpiMethod("vpa")}
                  >
                    UPI ID / VPA
                  </button>
                  <button
                    className="btn"
                    style={{
                      flex: 1,
                      fontSize: "0.85rem",
                      padding: "8px",
                      background: upiMethod === "qr" ? "rgba(99, 102, 241, 0.15)" : "rgba(255,255,255,0.02)",
                      border: "1px solid",
                      borderColor: upiMethod === "qr" ? "var(--primary)" : "var(--border-color)",
                      color: upiMethod === "qr" ? "var(--text-main)" : "var(--text-muted)",
                    }}
                    onClick={() => {
                      setUpiMethod("qr");
                      setTimeLeft(180); // reset timer
                    }}
                  >
                    Scan QR Code
                  </button>
                </div>

                {upiMethod === "vpa" ? (
                  <div className="form-group">
                    <label className="form-label">Enter UPI ID</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. mobileNumber@upi, username@okicici"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "6px" }}>
                      Verify request will be sent to your UPI device app.
                    </p>
                  </div>
                ) : (
                  <div className="qr-container">
                    <div className="qr-box-wrapper">
                      <SimulatedQRCode />
                    </div>

                    <div className="qr-timer">
                      <span>⏱️ Expiring in:</span>
                      <span className={timeLeft < 30 ? "timer-expired" : ""}>{formatTime(timeLeft)}</span>
                    </div>

                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "12px", textAlign: "center" }}>
                      Scan QR code using Google Pay, PhonePe, BHIM, or Paytm app.
                    </p>

                    {timeLeft > 0 && (
                      <button
                        className="btn btn-secondary"
                        style={{ marginTop: "15px", fontSize: "0.8rem", padding: "6px 12px" }}
                        onClick={() => triggerSimulation("UPI (QR Code Scan)")}
                      >
                        ⚡ Simulate Scan Success
                      </button>
                    )}
                  </div>
                )}

                {upiError && (
                  <p style={{ color: "var(--danger)", fontSize: "0.85rem", margin: "10px 0" }}>
                    ✕ {upiError}
                  </p>
                )}

                {/* Submit button (only for VPA, since QR handles it internally or via simulation button) */}
                {upiMethod === "vpa" && (
                  <button
                    className="btn btn-primary"
                    style={{ width: "100%", padding: "12px", marginTop: "10px" }}
                    onClick={handlePayUPI}
                  >
                    Verify & Pay ₹{finalPrice} ➔
                  </button>
                )}
              </div>
            )}

            {/* NETBANKING SUB-PANEL */}
            {activeTab === "netbanking" && (
              <div>
                <label className="form-label" style={{ marginBottom: "12px" }}>Popular Banks</label>
                <div className="bank-grid">
                  {popularBanks.map((bank) => (
                    <button
                      key={bank.id}
                      className={`bank-option-btn ${selectedBank === bank.id ? "selected" : ""}`}
                      onClick={() => {
                        setSelectedBank(bank.id);
                        setNetbankingError("");
                      }}
                    >
                      <div className="bank-logo-placeholder">{bank.label[0]}</div>
                      <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>{bank.label}</span>
                    </button>
                  ))}
                </div>

                <div className="form-group">
                  <label className="form-label">Or Select Other Bank</label>
                  <select
                    className="form-input"
                    value={otherBanks.includes(selectedBank) ? selectedBank : ""}
                    onChange={(e) => {
                      setSelectedBank(e.target.value);
                      setNetbankingError("");
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <option value="" disabled>-- Choose bank --</option>
                    {otherBanks.map((bank) => (
                      <option key={bank} value={bank}>{bank}</option>
                    ))}
                  </select>
                </div>

                {netbankingError && (
                  <p style={{ color: "var(--danger)", fontSize: "0.85rem", margin: "10px 0" }}>
                    ✕ {netbankingError}
                  </p>
                )}

                <button
                  className="btn btn-primary"
                  style={{ width: "100%", padding: "12px", marginTop: "10px" }}
                  onClick={handlePayNetbanking}
                >
                  Pay via Secure Bank Portal ₹{finalPrice} ➔
                </button>
              </div>
            )}

            {/* CARDS SUB-PANEL */}
            {activeTab === "card" && (
              <div>
                {/* 3D Glassmorphism Live Preview Card */}
                <div className="card-mockup-wrapper">
                  <div className={`credit-card-preview ${cardFlipped ? "flipped" : ""}`}>
                    {/* Front Face */}
                    <div className="card-face">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div className="card-chip"></div>
                        <div className="card-logo">VISA</div>
                      </div>
                      
                      <div className="card-number-display">
                        {cardNumber || "•••• •••• •••• ••••"}
                      </div>
                      
                      <div className="card-bottom-row">
                        <div>
                          <div className="card-label">Card Holder</div>
                          <div className="card-value">{cardHolder || "YOUR FULL NAME"}</div>
                        </div>
                        <div>
                          <div className="card-label">Expires</div>
                          <div className="card-value">{cardExpiry || "MM/YY"}</div>
                        </div>
                      </div>
                    </div>

                    {/* Back Face */}
                    <div className="card-face card-face-back">
                      <div className="card-black-bar"></div>
                      <div className="card-ccv-bar">
                        <div className="card-label" style={{ color: "#fff", marginRight: "4px" }}>CVV</div>
                        <div className="card-ccv-stripe">
                          <span className="card-ccv-value">{cardCvv || "•••"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form fields */}
                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="4111 2222 3333 4444"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    onFocus={() => setCardFlipped(false)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Cardholder Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. John Doe"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                    onFocus={() => setCardFlipped(false)}
                  />
                </div>

                <div style={{ display: "flex", gap: "15px" }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Expiry Date</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={handleCardExpiryChange}
                      onFocus={() => setCardFlipped(false)}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">CVV</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="e.g. 123"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                      onFocus={() => setCardFlipped(true)}
                      onBlur={() => setCardFlipped(false)}
                    />
                  </div>
                </div>

                {cardError && (
                  <p style={{ color: "var(--danger)", fontSize: "0.85rem", margin: "10px 0" }}>
                    ✕ {cardError}
                  </p>
                )}

                <button
                  className="btn btn-primary"
                  style={{ width: "100%", padding: "12px", marginTop: "10px" }}
                  onClick={handlePayCard}
                >
                  Authorize Payment ₹{finalPrice} ➔
                </button>
              </div>
            )}

            {/* Cancel Button */}
            <button
              className="btn btn-secondary"
              style={{ width: "100%", padding: "12px", marginTop: "12px" }}
              onClick={() => navigate("/courses")}
            >
              Cancel & Return to Courses
            </button>

            {/* Security Trust Badges */}
            <div className="trust-badges">
              <div className="trust-badge-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>256-Bit SSL Encryption</span>
              </div>
              <div className="trust-badge-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>PCI-DSS Secured</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;