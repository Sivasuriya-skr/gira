import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api";
import "./AuthPage.css";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    setLoading(true);
    try {
      const response = await authAPI.forgotPassword(email);
      if (response.success) {
        setMessage(response.message || "A reset link has been sent to your email.");
        setEmail("");
      } else {
        setError(response.message || "Failed to send reset link.");
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-noise" />
      <div className="auth-blobs">
        <span className="auth-blob b1" />
        <span className="auth-blob b2" />
        <span className="auth-blob b3" />
        <span className="auth-blob b4" />
      </div>

      <nav className="auth-nav">
        <div className="auth-nav-left">
          <span className="logo-font">gira</span>
          <span className="auth-logo-dot" />

        </div>
        <div className="auth-nav-center">
          <Link className="auth-nav-link" to="/features">Product</Link>
          <a className="auth-nav-link" href="#security">Security</a>
          <a className="auth-nav-link" href="#support">Support</a>
        </div>
        <div className="auth-nav-right">
          <Link className="auth-btn auth-btn-ghost" to="/login">Log in</Link>
        </div>
      </nav>

      <div className="auth-main">
        <div className="auth-left">
          <div className="auth-form-wrap">
            <Link to="/" className="auth-logo" aria-label="gira home">
              <span className="logo-font">gira</span>
              <span className="auth-logo-dot" />
            </Link>

            <h1 className="auth-title">Reset Password</h1>
            <p className="auth-subtitle">
              Enter the email associated with your account and we'll send you a link to reset your password.
            </p>

            {error && <div className="auth-error">{error}</div>}
            {message && <div style={{ color: "#22C55E", background: "rgba(34, 197, 94, 0.1)", padding: "12px", borderRadius: "8px", fontSize: "14px", marginBottom: "20px", border: "1px solid rgba(34, 197, 94, 0.2)" }}>{message}</div>}

            <form className="auth-animate" onSubmit={handleForgotPassword}>
              <div className="auth-field">
                <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M2 6l10 7 10-7" />
                </svg>
                <input
                  type="email"
                  className="auth-input"
                  placeholder="work@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <button type="submit" className="auth-btn auth-primary" disabled={loading} style={{ marginTop: "20px" }}>
                {loading ? "Sending link..." : "Send Reset Link"}
              </button>
            </form>

            <div className="auth-divider"></div>

            <p className="auth-footer-link">
              Remember your password? <Link to="/login">Back to Login</Link>
            </p>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-right-inner">
            <div className="auth-badge">Secure Access</div>
            <h2 className="auth-right-title">
              Your security is our <span className="underline">priority</span>
            </h2>
            <p className="auth-right-sub">
              We use secure Magic Links for password resets. For your protection, reset links expire after 10 minutes and can only be used once.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
