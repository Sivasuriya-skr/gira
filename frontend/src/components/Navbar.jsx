import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "manager":
        return "badge-danger";
      case "worker":
        return "badge-success";
      case "provider":
        return "badge badge-primary";
      default:
        return "badge-secondary";
    }
  };

  const getRoleDisplay = (role) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark sticky-top"
      style={{
        background: "var(--card-bg)",
        borderBottom: "1px solid var(--border-color)",
      }}
    >
      <div className="container-fluid">
        <a
          className="navbar-brand gradient-text fw-bold"
          href="/"
          style={{
            fontSize: "1.5rem",
            letterSpacing: "1px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span className="navbar-wordmark logo-font">gira</span>
        </a>


        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{ borderColor: "var(--border-color)" }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center gap-3">
            {user && (
              <>
                <li className="nav-item">
                  <span className="nav-text">
                    Welcome, <strong>{user.name}</strong>
                  </span>
                </li>
                <li className="nav-item">
                  <span className={`badge ${getRoleColor(user.role)}`}>
                    {getRoleDisplay(user.role)}
                  </span>
                </li>
                <li className="nav-item">
                  <button
                    onClick={handleLogout}
                    className="btn btn-danger btn-sm"
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
