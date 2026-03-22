import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { authAPI } from "../services/api";
import "./AuthPage.css";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token.");
    }
  }, [token]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Reset link expired or invalid.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.resetPassword(token, password);
      // Wait a moment then redirect to login with success message so they can see the confirmation
      setSuccess("Password updated successfully.");
      setTimeout(() => {
          navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to reset password.");
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

            <h1 className="auth-title">Create New Password</h1>
            <p className="auth-subtitle">
              Your new password must be securely hashed and at least 6 characters long.
            </p>

            {error && <div className="auth-error">{error}</div>}
            {success && <div style={{ color: "#22C55E", background: "rgba(34, 197, 94, 0.1)", padding: "12px", borderRadius: "8px", fontSize: "14px", marginBottom: "20px", border: "1px solid rgba(34, 197, 94, 0.2)" }}>{success} Redirecting to login...</div>}

            <form className="auth-animate" onSubmit={handleResetPassword}>
              <div className="auth-field">
                <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  className="auth-input"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!!success}
                />
                <button
                  type="button"
                  className="auth-eye"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3l18 18" /><path d="M10.58 10.58A3 3 0 0 0 13.42 13.4" /><path d="M9.88 5.1A9.46 9.46 0 0 1 12 5c5 0 9 4 9 7 0 1.15-.45 2.23-1.26 3.18M6.12 6.12A9.46 9.46 0 0 0 3 12c0 3 4 7 9 7 1.2 0 2.35-.22 3.4-.63" /></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" /><circle cx="12" cy="12" r="3" /></svg>
                  )}
                </button>
              </div>

              <div className="auth-field">
                <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
                  <path d="M9 12l2 2 4-4" />
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  className="auth-input"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={!!success}
                />
              </div>

              <button type="submit" className="auth-btn auth-primary" disabled={loading || !!success || !token} style={{ marginTop: "20px" }}>
                {loading ? "Updating..." : "Reset Password"}
              </button>
            </form>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-right-inner">
            <div className="auth-badge">Single Use</div>
            <h2 className="auth-right-title">
              Your link expires after <span className="underline">use</span>
            </h2>
            <p className="auth-right-sub">
              For security reasons, your reset token is cryptographically secure and can only be used once. If your link expires (10 minutes), request a new one.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
