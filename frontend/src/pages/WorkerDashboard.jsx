import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ticketAPI } from "../services/api";
import "./WorkerDashboard.css";

const WorkerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [newTicket, setNewTicket] = useState({ title: "", description: "", priority: "medium" });
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // ── Fetch tickets from backend ─────────────────────────────────
  const fetchTickets = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setApiError("");
    try {
      const res = await ticketAPI.getByWorker(user.id);
      setTickets(res.data || []);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // ── Create ticket ──────────────────────────────────────────────
  const handleNewTicket = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!newTicket.title.trim() || !newTicket.description.trim()) {
      setFormError("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      await ticketAPI.create({
        title: newTicket.title,
        description: newTicket.description,
        priority: newTicket.priority,
        workerId: user.id,
      });
      setNewTicket({ title: "", description: "", priority: "medium" });
      setShowForm(false);
      fetchTickets();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────
  const getStatusBadge = (status) => {
    const badges = { pending: "badge-warning", "in-progress": "badge-info", resolved: "badge-success", closed: "badge-secondary" };
    return badges[status] || "badge-secondary";
  };
  const getStatusLabel = (status) => {
    const labels = { pending: "Pending", "in-progress": "In Progress", resolved: "Resolved", closed: "Closed" };
    return labels[status] || status;
  };
  const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const stats = {
    total: tickets.length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    pending: tickets.filter((t) => t.status === "pending").length,
    inProgress: tickets.filter((t) => t.status === "in-progress").length,
  };

  return (
    <div className="worker-dashboard">
      {/* Top Navbar */}
      <nav className="dash-navbar">
        <div className="dash-nav-brand">
          <span className="dash-nav-title">gira</span>
        </div>
        <div className="dash-nav-right">
          <span className="dash-nav-badge">Worker</span>
          <div className="dash-nav-user" onClick={handleLogout}>
            👤 {user?.name || "Worker"} &nbsp;·&nbsp; Sign out
          </div>
        </div>
      </nav>

      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header fade-in-up">
          <div className="dash-title-block">
            <h1>Worker Dashboard</h1>
            <p>Welcome back, {user?.name}!</p>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Tickets</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" style={{ color: "var(--warning)" }}>{stats.pending}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" style={{ color: "var(--info)" }}>{stats.inProgress}</div>
              <div className="stat-label">In Progress</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" style={{ color: "var(--success)" }}>{stats.resolved}</div>
              <div className="stat-label">Resolved</div>
            </div>
          </div>
        </div>

        {/* Raise Ticket Section */}
        <div className="raise-ticket-section fade-in-up">
          <div className="section-header">
            <h3>Raise New Ticket</h3>
            <button className="btn btn-secondary" onClick={() => { setShowForm(!showForm); setFormError(""); }}>
              {showForm ? "Cancel" : "+ New Ticket"}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleNewTicket} className="ticket-form">
              {formError && <div className="form-error-alert">{formError}</div>}
              <div className="form-group">
                <label htmlFor="ticket-title" className="form-label">Ticket Title</label>
                <input
                  type="text"
                  className="form-control"
                  id="ticket-title"
                  placeholder="Brief title for the issue"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="ticket-desc" className="form-label">Description</label>
                <textarea
                  className="form-control"
                  id="ticket-desc"
                  rows="4"
                  placeholder="Describe the issue in detail"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="ticket-priority" className="form-label">Priority</label>
                <select
                  id="ticket-priority"
                  className="form-control"
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Creating…" : "Create Ticket"}
              </button>
            </form>
          )}
        </div>

        {/* View Tickets Section */}
        <div className="view-tickets-section fade-in-up">
          <h3>Your Tickets</h3>

          {apiError && <div className="api-error-banner">⚠️ {apiError} <button onClick={fetchTickets}>Retry</button></div>}

          {loading ? (
            <div className="loading-state"><div className="loading-spinner" />Loading tickets…</div>
          ) : tickets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>No tickets yet. Raise your first ticket!</p>
            </div>
          ) : (
            <div className="tickets-grid">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="ticket-card">
                  <div className="ticket-header">
                    <div>
                      <h4>{ticket.title}</h4>
                      <p className="ticket-id">{ticket.ticketNumber}</p>
                    </div>
                    <span className={`badge ${getStatusBadge(ticket.status)}`}>
                      {getStatusLabel(ticket.status)}
                    </span>
                  </div>
                  <p className="ticket-description">{ticket.description || "—"}</p>
                  <div className="ticket-footer">
                    <div className="ticket-meta">
                      <span className="meta-item"><strong>Created:</strong> {fmtDate(ticket.createdAt)}</span>
                      <span className="meta-item">
                        <strong>Provider:</strong>{" "}
                        {ticket.provider ? ticket.provider.name : <em>Unassigned</em>}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
