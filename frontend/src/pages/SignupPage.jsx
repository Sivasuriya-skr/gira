import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AuthPage.css";

const API_BASE = "";

const generateCompanyId = () =>
  `GIRA-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
// Broadly accept uppercase letters/numbers/hyphen, 3-40 chars. Backend still validates.
const companyIdPattern = /^[A-Z0-9-]{3,40}$/;

const passwordChecks = (pwd) => ([
  { label: "At least 6 characters", pass: pwd.length >= 6 },
  { label: "Contains uppercase letter", pass: /[A-Z]/.test(pwd) },
  { label: "Contains number", pass: /\d/.test(pwd) },
]);

const planOptions = [
  { key: "startup", price: "$99", label: "Startup", agents: "Up to 5 agents", tickets: "1,000 tickets/mo" },
  { key: "pro", price: "$499", label: "Professional", agents: "Up to 20 agents", tickets: "10,000 tickets/mo" },
];

const paymentMethods = ["Stripe", "Razorpay", "PayPal"];

const SignupPage = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [plan, setPlan] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [companyIdError, setCompanyIdError] = useState("");
  const [companyIdCopied, setCompanyIdCopied] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [joinCompanyId, setJoinCompanyId] = useState("");
  const [companyVerified, setCompanyVerified] = useState(false);
  const [companyVerifying, setCompanyVerifying] = useState(false);
  const [companyMessage, setCompanyMessage] = useState("");

  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleCompanyIdChange = (value) => {
    const sanitized = value.toUpperCase().replace(/\s+/g, "");
    setCompanyId(sanitized);
    setCompanyIdError("");
    setCompanyIdCopied(false);
  };

  // Manager flow has 6 steps (role, personal, plan, payment, password, company)
  // All other roles only have 3 steps (role, personal, password)
  const totalSteps = useMemo(() => (role === "manager" ? 6 : 3), [role]);

  const progressItems = Array.from({ length: totalSteps }, (_, i) => i + 1);

  const pwChecks = passwordChecks(password);
  const pwAllValid = pwChecks.every((c) => c.pass);
  const pwMatch = password && confirmPassword && password === confirmPassword;

  const goNext = () => setStep((s) => Math.min(s + 1, totalSteps));
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleSendOtp = async () => {
    if (!email.trim() || !email.includes("@")) {
      setOtpMessage("Enter a valid email first.");
      setOtpError(true);
      return;
    }
    setOtpSending(true);
    setOtpMessage("");
    setOtpError(false);
    setOtpVerified(false);
    try {
      const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpMessage("OTP sent! Check your inbox.");
        setOtpError(false);
      } else {
        setOtpMessage(data.message || "Failed to send OTP.");
        setOtpError(true);
      }
    } catch {
      setOtpMessage("Network error. Try again.");
      setOtpError(true);
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) {
      setOtpMessage("Enter the code you received.");
      setOtpError(true);
      return;
    }
    setOtpVerifying(true);
    setOtpMessage("");
    setOtpError(false);
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, otp: otpCode.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpVerified(true);
        setOtpMessage("Email verified!");
      } else {
        setOtpVerified(false);
        setOtpMessage(data.message || "Invalid code.");
        setOtpError(true);
      }
    } catch {
      setOtpMessage("Network error. Try again.");
      setOtpError(true);
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleVerifyCompany = async () => {
    const id = joinCompanyId.trim().toUpperCase();
    setJoinCompanyId(id);
    setCompanyMessage("");
    setCompanyVerified(false);
    if (!id) {
      setCompanyMessage("Enter your company ID.");
      return;
    }
    setCompanyVerifying(true);
    try {
      const res = await fetch(`${API_BASE}/api/companies/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ companyId: id }),
      });
      const data = await res.json();
      if (data.success) {
        setCompanyVerified(true);
        setCompanyMessage("Company ID verified.");
      } else {
        setCompanyVerified(false);
        setCompanyMessage(data.message || "Invalid company ID.");
      }
    } catch {
      setCompanyMessage("Could not verify company ID. Try again.");
    } finally {
      setCompanyVerifying(false);
    }
  };

  const handleSubmit = async () => {
    setError("");
    setCompanyIdError("");
    const isManager = role === "manager";
    const needsCompany = role === "worker" || role === "provider";
    const normalizedJoinId = joinCompanyId.trim().toUpperCase();
    const normalizedCompanyId = isManager ? companyId.trim().toUpperCase() : normalizedJoinId;

    if (isManager) {
      if (!companyName.trim()) {
        setError("Enter a company name.");
        return;
      }
      if (!normalizedCompanyId) {
        setCompanyIdError("Enter a company ID.");
        return;
      }
      // allow any reasonable ID; backend will enforce final rules
    }

    if (!fullName.trim() || !email.trim() || !otpVerified || !pwAllValid || !pwMatch || (needsCompany && !companyVerified)) {
      setError("Please complete all required fields.");
      return;
    }
    setLoading(true);
    try {
      const response = await signup(
        fullName,
        email,
        password,
        role || "worker",
        needsCompany ? normalizedJoinId : normalizedCompanyId || null,
        isManager ? companyName.trim() : null
      );
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

  const renderStepper = () => (
    <div className="stepper">
      <span className="stepper-text">Step {step} of {totalSteps}</span>
      <div className="stepper-dots">
        {progressItems.map((i) => (
          <span key={i} className={`dot ${i === step ? "active" : i < step ? "done" : ""}`} />
        ))}
      </div>
    </div>
  );

  const renderNavigation = ({ nextEnabled, showNext = true, nextLabel = "Next", showBack = true, onNext }) => (
    <div className="nav-actions">
      {showBack ? (
        <button type="button" className="nav-btn ghost" onClick={goBack}>
          ← Back
        </button>
      ) : <span />}
      {showNext && (
        <button
          type="button"
          className="nav-btn primary"
          disabled={!nextEnabled}
          onClick={onNext || goNext}
        >
          {nextLabel}
        </button>
      )}
    </div>
  );

  const stepRole = (
    <>
      {renderStepper()}
      <h1 className="auth-title">Create your account</h1>
      <p className="auth-subtitle">Set up access for managers, providers, and workers in minutes.</p>
      <span className="role-label" style={{ marginTop: 8 }}>Select your role</span>
      <div className="role-cards">
        {[
          { key: "worker", title: "Worker", desc: "Resolve tickets and collaborate." },
          { key: "provider", title: "Provider", desc: "Own queues and SLAs." },
          { key: "manager", title: "Manager", desc: "Set policies and metrics." },
        ].map((r) => (
          <button
            key={r.key}
            type="button"
            className={`role-card ${role === r.key ? "active" : ""}`}
            onClick={() => setRole(r.key)}
          >
            <div className="role-icon">👤</div>
            <div className="role-title">{r.title}</div>
            <div className="role-desc">{r.desc}</div>
          </button>
        ))}
      </div>
      {renderNavigation({ nextEnabled: !!role })}
    </>
  );

  const stepPersonal = (
    <>
      {renderStepper()}
      <h1 className="auth-title">Create your account</h1>
      <label className="auth-label" htmlFor="name">Full name</label>
      <div className="auth-field">
        <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <input id="name" className="auth-input" placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>

      <label className="auth-label" htmlFor="email">Email</label>
      <div className="auth-field">
        <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M2 6l10 7 10-7" />
        </svg>
        <input id="email" className="auth-input" placeholder="work@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button type="button" className="auth-inline-btn" onClick={handleSendOtp} disabled={otpSending}>
          {otpSending ? "Sending..." : "Get OTP"}
        </button>
      </div>

      <label className="auth-label" htmlFor="otp">OTP verification</label>
      <div className="auth-otp-row">
        <div className="auth-otp-input">
          <div className="auth-field otp-field">
            <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              id="otp"
              className="auth-input"
              placeholder="Enter OTP code"
              value={otpCode}
              maxLength={6}
              onChange={(e) => {
                setOtpCode(e.target.value);
                setOtpVerified(false);
              }}
            />
          </div>
        </div>
        <div className="auth-otp-actions">
          <button
            type="button"
            className="auth-btn auth-primary"
            onClick={handleVerifyOtp}
            disabled={otpVerifying || otpVerified}
          >
            {otpVerifying ? "Verifying..." : otpVerified ? "✓ Verified" : "Verify Code"}
          </button>
        </div>
      </div>
      {otpMessage && (
        <div className={`auth-otp-message ${otpError ? "auth-otp-error" : "auth-otp-success"}`}>
          {otpMessage}
        </div>
      )}

      {(role === "worker" || role === "provider") && (
        <>
          <label className="auth-label" htmlFor="company-id">Company ID</label>
          <div className="auth-field">
            <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
              <path d="M3 21V7a2 2 0 0 1 2-2h4v16" />
              <path d="M13 21V3h4a2 2 0 0 1 2 2v16" />
            </svg>
            <input
              id="company-id"
              className="auth-input"
              placeholder="e.g., GIRA-ABCD-1234"
              value={joinCompanyId}
              onChange={(e) => { setJoinCompanyId(e.target.value.toUpperCase()); setCompanyVerified(false); setCompanyMessage(""); }}
            />
            <button
              type="button"
              className="auth-inline-btn"
              onClick={handleVerifyCompany}
              disabled={companyVerifying}
            >
              {companyVerifying ? "Checking..." : companyVerified ? "Verified" : "Verify"}
            </button>
          </div>
          {companyMessage && (
            <div className={`auth-otp-message ${companyVerified ? "auth-otp-success" : "auth-otp-error"}`}>
              {companyMessage}
            </div>
          )}
        </>
      )}

      {renderNavigation({
        nextEnabled: !!fullName && otpVerified && (!(role === "worker" || role === "provider") || companyVerified),
      })}
    </>
  );

  const stepPlan = (
    <>
      {renderStepper()}
      <h1 className="auth-title">Choose your plan</h1>
      <p className="auth-subtitle">Select a plan and subscribe to get started.</p>
      <div className="plan-grid">
        {planOptions.map((p) => (
          <button
            key={p.key}
            type="button"
            className={`plan-card ${plan === p.key ? "active" : ""}`}
            onClick={() => setPlan(p.key)}
          >
            <div className="plan-price">{p.price}<span>/mo</span></div>
            <div className="plan-name">{p.label}</div>
            <div className="plan-meta">{p.agents}</div>
            <div className="plan-meta">{p.tickets}</div>
            <div className="plan-select">Select</div>
          </button>
        ))}
        <div className="plan-card enterprise">
          <div className="plan-name">Enterprise</div>
          <div className="plan-meta">Custom pricing for unlimited scale.</div>
          <button className="nav-btn primary" style={{ width: "100%" }} type="button">Contact Sales</button>
        </div>
      </div>
      {renderNavigation({ nextEnabled: !!plan })}
    </>
  );

  const stepPayment = (
    <>
      {renderStepper()}
      <h1 className="auth-title">Complete payment</h1>
      <p className="auth-subtitle">Confirm your plan subscription.</p>
      <div className="summary-box">
        <div className="summary-row"><span>Plan</span><strong>{plan === "pro" ? "Professional" : "Startup"}</strong></div>
        <div className="summary-row"><span>Billing</span><strong>Monthly</strong></div>
      </div>
      <div className="auth-label">Select payment method</div>
      <div className="pay-methods">
        {paymentMethods.map((m) => (
          <button
            key={m}
            type="button"
            className={`pay-btn ${paymentMethod === m ? "active" : ""}`}
            onClick={() => setPaymentMethod(m)}
          >
            {m}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="nav-btn primary"
        style={{ width: "100%", marginTop: 14 }}
        disabled={!paymentMethod}
        onClick={goNext}
      >
        Pay {plan === "pro" ? "$499" : "$99"} Now
      </button>
      {renderNavigation({ nextEnabled: false, showNext: false })}
    </>
  );

  const stepPassword = (
    <>
      {renderStepper()}
      <h1 className="auth-title">Create password</h1>
      <label className="auth-label" htmlFor="pw">Create password</label>
      <div className="auth-field">
        <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <input
          id="pw"
          type={showPassword ? "text" : "password"}
          className="auth-input"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          className="auth-eye"
          aria-label="Toggle password"
          onClick={() => setShowPassword((v) => !v)}
        >
          👁
        </button>
      </div>

      <label className="auth-label" htmlFor="pw2">Confirm password</label>
      <div className="auth-field">
        <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <input
          id="pw2"
          type={showPassword ? "text" : "password"}
          className="auth-input"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      <div className="pw-req">
        <div className="pw-req-title">Password requirements</div>
        {pwChecks.map((req) => (
          <div key={req.label} className={`pw-req-item ${req.pass ? "pass" : ""}`}>
            <span className="pw-req-dot" /> {req.label}
          </div>
        ))}
        {confirmPassword && (
          <div className={`pw-req-item ${pwMatch ? "pass" : ""}`}>
            <span className="pw-req-dot" /> {pwMatch ? "Passwords match" : "Passwords do not match"}
          </div>
        )}
      </div>

      {renderNavigation({
        nextEnabled: pwAllValid && pwMatch,
        nextLabel: role === "manager" ? "Next" : (loading ? "Creating..." : "Create Account"),
        onNext: role === "manager" ? goNext : handleSubmit,
      })}
    </>
  );

  const stepCompany = (
    <>
      {renderStepper()}
      <h1 className="auth-title">Create company workspace</h1>
      <label className="auth-label" htmlFor="company">Company name</label>
      <div className="auth-field">
        <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
          <path d="M3 21V7a2 2 0 0 1 2-2h4v16" />
          <path d="M13 21V3h4a2 2 0 0 1 2 2v16" />
        </svg>
        <input
          id="company"
          className="auth-input"
          placeholder="e.g., TechStart Inc"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
      </div>

      <div className="summary-box">
        <div className="auth-label" style={{ marginBottom: 8 }}>Choose a Company ID</div>
        <div className="auth-field" style={{ gap: 8 }}>
          <input
            className="auth-input"
            placeholder="GIRA-AB12-1234"
            value={companyId}
            onChange={(e) => handleCompanyIdChange(e.target.value)}
            onBlur={(e) => handleCompanyIdChange(e.target.value)}
          />
          <button
            type="button"
            className="nav-btn ghost"
            onClick={() => {
              const generated = generateCompanyId();
              setCompanyId(generated);
              setCompanyIdError("");
            }}
          >
            Generate
          </button>
          <button
            type="button"
            className="nav-btn ghost"
            onClick={() => {
              if (!companyId) return;
              navigator.clipboard.writeText(companyId);
              setCompanyIdCopied(true);
              setTimeout(() => setCompanyIdCopied(false), 1500);
            }}
            disabled={!companyId}
          >
            {companyIdCopied ? "✓ Copied" : "Copy"}
          </button>
        </div>
        {companyIdError && <div className="auth-error" style={{ marginTop: 8 }}>{companyIdError}</div>}
        <p className="auth-subtitle" style={{ fontSize: 12, margin: "8px 0 0" }}>
          Share this ID with your team so they can join your workspace.
        </p>
      </div>

      {renderNavigation({
        nextEnabled: companyName.trim().length >= 3 && companyId.trim().length > 0,
        nextLabel: loading ? "Creating..." : "Create Account",
        onNext: handleSubmit,
      })}
      {error && <div className="auth-error" style={{ marginTop: 10 }}>{error}</div>}
    </>
  );

  const steps = [
    stepRole,
    stepPersonal,
    ...(role === "manager" ? [stepPlan, stepPayment] : []),
    stepPassword,
    ...(role === "manager" ? [stepCompany] : []),
  ];

  return (
    <div className="auth-root auth-signup">
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
          <div className="auth-form-wrap" style={{ maxHeight: "90vh", overflow: "hidden" }}>
            {steps[step - 1]}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
