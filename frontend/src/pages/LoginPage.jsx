import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AuthPage.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const response = await login(email, password);
      if (response.ok) {
        const userRole = response.user.role;
        if (userRole === "worker") navigate("/worker-dashboard");
        else if (userRole === "provider") navigate("/provider-dashboard");
        else if (userRole === "manager") navigate("/manager-dashboard");
      } else {
        setError(response.message || "Invalid credentials");
      }
    } catch (err) {
      setError(err.message || "Login failed");
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
          <span>gira</span>
          <span className="auth-logo-dot" />
        </div>
        <div className="auth-nav-center">
          <Link className="auth-nav-link" to="/playoffs">Product</Link>
          <a className="auth-nav-link" href="#security">Security</a>
          <a className="auth-nav-link" href="#support">Support</a>
        </div>
        <div className="auth-nav-right">
          <Link className="auth-btn auth-btn-ghost" to="/signup">Create account</Link>
          <Link className="auth-btn auth-btn-yellow" to="/login">Log In</Link>
        </div>
      </nav>

      <div className="auth-main">
        <div className="auth-left">
          <div className="auth-form-wrap">
            <Link to="/" className="auth-logo" aria-label="gira home">
              <span>gira</span>
              <span className="auth-logo-dot" />
            </Link>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">
              Sign in to orchestrate tickets, providers, and SLAs from one command center.
            </p>

            {error && <div className="auth-error">{error}</div>}

            <form className="auth-animate" onSubmit={handleLogin}>
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

              <div className="auth-field">
                <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  className="auth-input"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
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
                <label className="auth-checkbox">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <Link className="auth-link" to="/forgot-password">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" className="auth-btn auth-primary" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </button>

              <button type="button" className="auth-btn auth-google" onClick={() => { }}>
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="google-icon"
                />
                Continue with Google
              </button>
            </form>

            <div className="auth-divider">or continue with</div>

            <p className="auth-footer-link">
              New to Gira? <Link to="/signup">Create your free account</Link>
            </p>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-right-inner">
            <div className="auth-badge">Realtime Ops</div>
            <h2 className="auth-right-title">
              Resolve every ticket <span className="underline">faster</span>
            </h2>
            <p className="auth-right-sub">
              Live routing, SLA timers, and provider scorecards keep the whole support flywheel
              humming without spreadsheets.
            </p>

            <div className="auth-cards">
              <div className="auth-card">
                <div className="auth-card-header">
                  <div className="auth-chip">
                    <span className="auth-chip-icon" style={{ background: "#1d63ff1a", color: "#1d63ff" }}>?</span>
                    <div>
                      <div className="auth-chip-label">Queue</div>
                      <div className="auth-chip-value">Live tickets</div>
                    </div>
                  </div>
                  <span className="auth-badge-pill auth-badge-green">98% SLA</span>
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
                    <span className="auth-chip-icon" style={{ background: "#ffce321a", color: "#ffce32" }}>??</span>
                    <div>
                      <div className="auth-chip-label">Providers</div>
                      <div className="auth-chip-value">Smart routing</div>
                    </div>
                  </div>
                  <span className="auth-badge-pill auth-badge-yellow">Auto-assign</span>
                </div>
                <div className="auth-stats">
                  <div className="auth-stat">
                    <div className="auth-stat-number">12k</div>
                    <div className="auth-stat-label">Tickets</div>
                  </div>
                  <div className="auth-stat">
                    <div className="auth-stat-number">45m</div>
                    <div className="auth-stat-label">Avg. resolve</div>
                  </div>
                  <div className="auth-stat">
                    <div className="auth-stat-number">300</div>
                    <div className="auth-stat-label">Providers</div>
                  </div>
                </div>
              </div>

              <div className="auth-card">
                <div className="auth-card-header">
                  <div className="auth-chip">
                    <span className="auth-chip-icon" style={{ background: "#ffffff22", color: "#fff" }}>??</span>
                    <div>
                      <div className="auth-chip-label">Audit</div>
                      <div className="auth-chip-value">Full trace</div>
                    </div>
                  </div>
                  <span className="auth-badge-pill auth-badge-blue">ISO-ready</span>
                </div>
                <p className="auth-right-sub" style={{ color: "rgba(229,237,255,0.86)", marginTop: 10 }}>
                  Every status change, assignment, and note is logged automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
