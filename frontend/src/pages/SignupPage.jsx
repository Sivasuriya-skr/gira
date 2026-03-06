import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AuthPage.css";

const SignupPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("worker");
  const [otpCode, setOtpCode] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setOtpMessage("");
    if (!fullName.trim() || !email.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (!otpCode.trim() || !otpVerified) {
      setError("Please enter the OTP and verify it before signing up.");
      return;
    }
    setLoading(true);
    try {
      const response = await signup(fullName, email, password, role);
      if (response.ok) {
        const userRole = response.user.role;
        if (userRole === "worker") navigate("/worker-dashboard");
        else if (userRole === "provider") navigate("/provider-dashboard");
        else if (userRole === "manager") navigate("/manager-dashboard");
      } else {
        setError(response.message || "Signup failed");
      }
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = () => {
    setOtpMessage("OTP sent. Please check your inbox.");
    setOtpVerified(false);
  };

  const handleVerifyOtp = () => {
    if (!otpCode.trim()) {
      setOtpMessage("Enter the code you received to verify.");
      setOtpVerified(false);
      return;
    }
    // Placeholder front-end verification. Replace with backend call later.
    setOtpVerified(true);
    setOtpMessage("Code verified. You can complete signup.");
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
          <span>gira</span>
          <span className="auth-logo-dot" />
        </div>
        <div className="auth-nav-center">
          <Link className="auth-nav-link" to="/playoffs">Product</Link>
          <a className="auth-nav-link" href="#security">Security</a>
          <a className="auth-nav-link" href="#support">Support</a>
        </div>
        <div className="auth-nav-right">
          <Link className="auth-btn auth-btn-ghost" to="/login">Log In</Link>
          <Link className="auth-btn auth-btn-yellow" to="/signup">Get started</Link>
        </div>
      </nav>

      <div className="auth-main">
        <div className="auth-left">
          <div className="auth-form-wrap">
            <Link to="/" className="auth-logo" aria-label="gira home">
              <span>gira</span>
              <span className="auth-logo-dot" />
            </Link>
            <h1 className="auth-title">Create your account</h1>
            <p className="auth-subtitle">
              Set up access for managers, providers, and workers in minutes.
            </p>

            {error && <div className="auth-error">{error}</div>}

            <form className="auth-animate" onSubmit={handleSignup}>
              <div className="auth-field">
                <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                />
              </div>

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
                <button type="button" className="auth-inline-btn" onClick={handleSendOtp}>
                  Get OTP
                </button>
              </div>

              <div className="auth-otp-row">
                <div className="auth-otp-input">
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="Enter OTP code"
                    value={otpCode}
                    onChange={(e) => {
                      setOtpCode(e.target.value);
                      setOtpVerified(false);
                    }}
                  />
                </div>
                <div className="auth-otp-actions">
                  <button type="button" className="auth-btn auth-primary" onClick={handleVerifyOtp}>
                    Verify Code
                  </button>
                </div>
              </div>
              {otpMessage && <div className="auth-otp-message">{otpMessage}</div>}

              <div className="auth-role-group">
                {[
                  { key: "worker", label: "Worker" },
                  { key: "provider", label: "Provider" },
                  { key: "manager", label: "Manager" },
                ].map((option) => (
                  <button
                    type="button"
                    key={option.key}
                    className={`auth-role-option ${role === option.key ? "active" : ""}`}
                    onClick={() => setRole(option.key)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="auth-field">
                <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  className="auth-input"
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-eye"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3l18 18" />
                      <path d="M10.58 10.58A3 3 0 0 0 13.42 13.4" />
                      <path d="M9.88 5.1A9.46 9.46 0 0 1 12 5c5 0 9 4 9 7 0 1.15-.45 2.23-1.26 3.18M6.12 6.12A9.46 9.46 0 0 0 3 12c0 3 4 7 9 7 1.2 0 2.35-.22 3.4-.63" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="auth-field">
                <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  className="auth-input"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-eye"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3l18 18" />
                      <path d="M10.58 10.58A3 3 0 0 0 13.42 13.4" />
                      <path d="M9.88 5.1A9.46 9.46 0 0 1 12 5c5 0 9 4 9 7 0 1.15-.45 2.23-1.26 3.18M6.12 6.12A9.46 9.46 0 0 0 3 12c0 3 4 7 9 7 1.2 0 2.35-.22 3.4-.63" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="auth-helper-row">
                <span className="auth-link" style={{ color: "#6b7a99" }}>Password must be 6+ characters</span>
              </div>

              <button type="submit" className="auth-btn auth-primary" disabled={loading}>
                {loading ? "Creating..." : "Create Account"}
              </button>

              <button type="button" className="auth-btn auth-google" onClick={() => { }}>
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="google-icon"
                />
                Sign up with Google
              </button>
            </form>

            <div className="auth-divider">already using Gira?</div>

            <p className="auth-footer-link">
              Log in instead <Link to="/login">Back to login</Link>
            </p>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-right-inner">
            <div className="auth-badge">Full-stack ops</div>
            <h2 className="auth-right-title">
              Purpose-built for <span className="underline">teams</span>
            </h2>
            <p className="auth-right-sub">
              Spin up roles, route tickets automatically, and give providers the right context the
              moment they are assigned.
            </p>

            <div className="auth-cards">
              <div className="auth-card">
                <div className="auth-card-header">
                  <div className="auth-chip">
                    <span className="auth-chip-icon" style={{ background: "#1d63ff1a", color: "#1d63ff" }}>🎯</span>
                    <div>
                      <div className="auth-chip-label">Routing</div>
                      <div className="auth-chip-value">Skill-based</div>
                    </div>
                  </div>
                  <span className="auth-badge-pill auth-badge-green">Auto</span>
                </div>
                <div className="auth-progress"><span /></div>
                <div className="auth-typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>

              <div className="auth-card">
                <div className="auth-card-header">
                  <div className="auth-chip">
                    <span className="auth-chip-icon" style={{ background: "#ffce321a", color: "#ffce32" }}>📊</span>
                    <div>
                      <div className="auth-chip-label">Analytics</div>
                      <div className="auth-chip-value">SLA & CSAT</div>
                    </div>
                  </div>
                  <span className="auth-badge-pill auth-badge-yellow">Live</span>
                </div>
                <div className="auth-stats">
                  <div className="auth-stat">
                    <div className="auth-stat-number">98%</div>
                    <div className="auth-stat-label">SLA met</div>
                  </div>
                  <div className="auth-stat">
                    <div className="auth-stat-number">12k</div>
                    <div className="auth-stat-label">Tickets</div>
                  </div>
                  <div className="auth-stat">
                    <div className="auth-stat-number">45m</div>
                    <div className="auth-stat-label">Avg resolve</div>
                  </div>
                </div>
              </div>

              <div className="auth-card">
                <div className="auth-card-header">
                  <div className="auth-chip">
                    <span className="auth-chip-icon" style={{ background: "#ffffff22", color: "#fff" }}>🔒</span>
                    <div>
                      <div className="auth-chip-label">Security</div>
                      <div className="auth-chip-value">Audit-ready</div>
                    </div>
                  </div>
                  <span className="auth-badge-pill auth-badge-blue">SOC2</span>
                </div>
                <p className="auth-right-sub" style={{ color: "rgba(229,237,255,0.86)", marginTop: 10 }}>
                  Least-privilege access across managers, workers, and providers out of the box.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
