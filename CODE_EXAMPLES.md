# Code Examples & Implementation Details

## Key Implementation Details

### 1. Form State Management (LoginPage.jsx)

```jsx
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);
const [showPassword, setShowPassword] = useState(false);
```

### 2. Form Validation (LoginPage.jsx)

```jsx
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
    // Navigation based on role
  } catch (err) {
    setError(err.message || "Login failed");
  } finally {
    setLoading(false);
  }
};
```

### 3. SVG Illustration Example (LoginPage.jsx)

```jsx
<svg viewBox="0 0 500 600" className="login-illustration">
  <defs>
    <linearGradient id="skyGradientLogin" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style={{ stopColor: "#E8F5FF", stopOpacity: 1 }} />
      <stop offset="100%" style={{ stopColor: "#FFF0F8", stopOpacity: 1 }} />
    </linearGradient>
  </defs>

  {/* Background */}
  <rect width="500" height="600" fill="url(#skyGradientLogin)" />

  {/* Buildings */}
  <g id="building1">
    <rect
      x="80"
      y="320"
      width="80"
      height="140"
      fill="url(#buildingGradient)"
      rx="5"
    />
    <rect x="95" y="340" width="12" height="12" fill="#FFE082" />
    {/* More windows... */}
  </g>
</svg>
```

### 4. Input Field with Icon (SignupPage.jsx)

```jsx
<div className="form-group">
  <div className="input-wrapper">
    <svg className="input-icon" viewBox="0 0 24 24">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 6l10 7 10-7" />
    </svg>
    <input
      type="email"
      placeholder="E-mail"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="form-input"
    />
  </div>
</div>
```

### 5. Show/Hide Password Toggle (LoginPage.jsx)

```jsx
<div className="input-wrapper">
  <svg className="input-icon">
    {/* Lock icon */}
  </svg>
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="form-input"
  />
</div>

<label className="checkbox-label">
  <input
    type="checkbox"
    checked={showPassword}
    onChange={(e) => setShowPassword(e.target.checked)}
  />
  Show Password
</label>
```

### 6. Form Submission & Error Display (SignupPage.jsx)

```jsx
<form onSubmit={handleSignup} className="signup-form">
  {error && <div className="error-message">{error}</div>}

  {/* Form fields */}

  <button type="submit" className="signup-btn" disabled={loading}>
    {loading ? "Creating Account..." : "Sign Up"}
  </button>
</form>
```

### 7. CSS - Input Field Focus State (SignupPage.css & LoginPage.css)

```css
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  border: 2px solid #e8e8f0;
  border-radius: 10px;
  padding: 12px 14px;
  transition: all 0.3s ease;
  background: #f9f9ff;
}

.input-wrapper:focus-within {
  border-color: #ff6b9d;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(255, 107, 157, 0.1);
}
```

### 8. CSS - Button Styling (SignupPage.css)

```css
.signup-btn {
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fb3 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 157, 0.3);
}

.signup-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 157, 0.4);
}

.signup-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
```

### 9. CSS - Responsive Design (LoginPage.css)

```css
@media (max-width: 768px) {
  .login-page {
    flex-direction: column;
  }

  .login-left {
    flex: 0.5;
    min-height: 250px;
  }

  .login-right {
    flex: 0.5;
  }

  .login-illustration {
    max-width: 300px;
  }
}

@media (max-width: 600px) {
  .login-page {
    flex-direction: column;
  }

  .login-left {
    display: none;
  }

  .login-right {
    flex: 1;
    padding: 1.5rem 1rem;
  }
}
```

### 10. CSS - Animation (SignupPage.css)

```css
.signup-illustration {
  width: 100%;
  max-width: 450px;
  height: auto;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}
```

## SVG Illustration Structure

### Login Page - Buildings Theme

```jsx
// Main elements:
<svg viewBox="0 0 500 600">
  {/* Gradients */}
  <defs>
    <linearGradient id="skyGradientLogin">...</linearGradient>
    <linearGradient id="buildingGradient">...</linearGradient>
  </defs>

  {/* Sky background */}
  <rect width="500" height="600" fill="url(#skyGradientLogin)" />

  {/* Decorative circles */}
  <circle cx="90" cy="80" r="50" fill="#FFD6E8" />

  {/* Building 1 with windows */}
  <g id="building1">
    <rect
      x="80"
      y="320"
      width="80"
      height="140"
      fill="url(#buildingGradient)"
    />
    <rect x="95" y="340" width="12" height="12" fill="#FFE082" />
    {/* More windows */}
  </g>

  {/* Building 2 with windows */}
  <g id="building2">{/* Similar structure */}</g>

  {/* Clipboard element */}
  <g id="clipboard">
    <rect x="380" y="280" width="50" height="70" fill="#FFD6E8" />
    <line x1="390" y1="300" x2="420" y2="300" stroke="#FF6B9D" />
  </g>

  {/* Lock icon */}
  <g id="lock">
    <rect x="120" y="200" width="30" height="35" fill="#5DADE2" />
    <path d="M 125 200 L 125 185..." />
  </g>
</svg>
```

### Signup Page - Workspace Theme

```jsx
// Main elements:
<svg viewBox="0 0 500 600">
  {/* Gradients */}
  <defs>
    <linearGradient id="skyGradient">...</linearGradient>
    <linearGradient id="deskGradient">...</linearGradient>
  </defs>

  {/* Sky background */}
  <rect width="500" height="600" fill="url(#skyGradient)" />

  {/* Decorative elements */}
  <circle cx="80" cy="80" r="40" fill="#FFD6E8" />

  {/* Desk */}
  <rect x="100" y="380" width="300" height="40" fill="url(#deskGradient)" />
  <rect x="80" y="420" width="30" height="120" fill="#A8E6CF" />

  {/* Monitor */}
  <rect x="150" y="200" width="200" height="140" fill="#7FD8BE" />
  <rect x="160" y="210" width="180" height="110" fill="#E0F7FA" />

  {/* Keyboard */}
  <rect x="170" y="360" width="100" height="15" fill="#F0C4FF" />
  <rect x="175" y="363" width="8" height="9" fill="#E0A8F0" />

  {/* Speaker */}
  <rect x="90" y="260" width="35" height="50" fill="#FFB3D9" />

  {/* Coffee cup */}
  <rect x="420" y="300" width="40" height="50" fill="#D4A574" />
</svg>
```

## Error Handling Pattern

```jsx
// Set initial state
const [error, setError] = useState("");

// Clear before processing
setError("");

// Validate input
if (!email.trim() || !password) {
  setError("Please fill in all fields");
  return;
}

// Handle API errors
try {
  const response = await login(email, password);
  // Success handling
} catch (err) {
  setError(err.message || "Login failed");
} finally {
  setLoading(false);
}

// Display error
{
  error && <div className="error-message">{error}</div>;
}
```

## Navigation Pattern

```jsx
// After successful login/signup
const navigate = useNavigate();

// Navigate based on role
if (response.role === "worker") {
  navigate("/worker-dashboard");
} else if (response.role === "provider") {
  navigate("/provider-dashboard");
} else if (response.role === "manager") {
  navigate("/manager-dashboard");
}
```

## Component Structure

### LoginPage.jsx Structure

```
LoginPage
├── login-page (main container)
│   ├── login-left (illustration panel)
│   │   └── login-illustration (SVG)
│   └── login-right (form panel)
│       └── login-form-container
│           ├── login-title
│           ├── login-subtitle
│           ├── error-message (conditional)
│           ├── login-form
│           │   ├── form-group (email)
│           │   ├── form-group (password)
│           │   ├── checkbox-label
│           │   └── login-btn
│           └── signup-link
```

### SignupPage.jsx Structure

```
SignupPage
├── signup-page (main container)
│   ├── signup-left (illustration panel)
│   │   └── signup-illustration (SVG)
│   └── signup-right (form panel)
│       └── signup-form-container
│           ├── signup-title
│           ├── signup-subtitle
│           ├── error-message (conditional)
│           ├── signup-form
│           │   ├── form-group (name)
│           │   ├── form-group (email)
│           │   ├── form-group (role)
│           │   ├── form-group (password)
│           │   ├── form-group (confirm password)
│           │   ├── checkbox-label
│           │   └── signup-btn
│           └── login-link
```

## Key CSS Classes

```css
/* Page and Layout */
.login-page, .signup-page
.login-left, .signup-left
.login-right, .signup-right
.login-illustration, .signup-illustration

/* Form Container */
.login-form-container, .signup-form-container
.login-form, .signup-form
.form-group

/* Input Elements */
.input-wrapper
.input-icon
.form-input

/* Interactive Elements */
.login-btn, .signup-btn
.checkbox-label
.login-link, .signup-link
.login-link-text, .signup-link-text

/* States */
.error-message
:focus-within (for input-wrapper)
:hover (for buttons)
:disabled (for buttons)
```

---

This implementation follows React best practices with:

- Functional components with hooks
- Proper state management
- Error handling and validation
- Loading states
- Responsive design
- Accessibility considerations
- Clean, maintainable code structure
