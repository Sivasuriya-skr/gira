import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ticketAPI } from "../services/api";
import "./ProviderDashboard.css";

const ProviderDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // ── Fetch assigned tickets ─────────────────────────────────────
  const fetchTickets = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setApiError("");
    try {
      const res = await ticketAPI.getByProvider(user.id);
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

  // ── Update ticket status ───────────────────────────────────────
  const updateTicketStatus = async (ticketId, newStatus) => {
    setUpdatingId(ticketId);
    try {
      const res = await ticketAPI.updateStatus(ticketId, newStatus);
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? res.data : t))
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────
  const getStatusBadge = (status) => {
    const badges = { pending: "badge-warning", "in-progress": "badge-info", resolved: "badge-success", closed: "badge-secondary" };
    return badges[status] || "badge-secondary";
  };
  const getPriorityBadge = (priority) => {
    const badges = { low: "badge-success", medium: "badge-warning", high: "badge-danger" };
    return badges[priority] || "badge-secondary";
  };
  const getStatusLabel = (status) => {
    const labels = { pending: "Pending", "in-progress": "In Progress", resolved: "Resolved", closed: "Closed" };
    return labels[status] || status;
  };
  const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const stats = {
    total: tickets.length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    inProgress: tickets.filter((t) => t.status === "in-progress").length,
  };

  return (
    <div className="provider-dashboard">
      {/* Top Navbar */}
      <nav className="dash-navbar">
        <div className="dash-nav-brand">
          <span className="dash-nav-title">gira</span>
        </div>
        <div className="dash-nav-right">
          <span className="dash-nav-badge">Provider</span>
          <div className="dash-nav-user" onClick={handleLogout}>
            👤 {user?.name || "Provider"} &nbsp;·&nbsp; Sign out
          </div>
        </div>
      </nav>

      <div className="dashboard-container">
        {/* Header with Stats */}
        <div className="dashboard-header fade-in-up">
          <div className="dash-title-block">
            <h1>Service Provider Dashboard</h1>
            <p>Manage your assigned tickets efficiently</p>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Assigned</div>
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

        {/* Quick Stats Cards */}
        <div className="quick-stats fade-in-up">
          <div className="quick-stat-card">
            <div className="stat-content">
              <h4>Average Resolution Time</h4>
              <p className="stat-value">2.5h</p>
            </div>
            <div className="stat-icon">⏱️</div>
          </div>
          <div className="quick-stat-card">
            <div className="stat-content">
              <h4>Customer Satisfaction</h4>
              <p className="stat-value">95%</p>
            </div>
            <div className="stat-icon">⭐</div>
          </div>
          <div className="quick-stat-card">
            <div className="stat-content">
              <h4>This Month</h4>
              <p className="stat-value">{stats.resolved} Resolved</p>
            </div>
            <div className="stat-icon">📈</div>
          </div>
        </div>

        {/* Assigned Tickets */}
        <div className="tickets-section fade-in-up">
          <h3>Assigned Tickets</h3>

          {apiError && (
            <div className="api-error-banner">⚠️ {apiError} <button onClick={fetchTickets}>Retry</button></div>
          )}

          {loading ? (
            <div className="loading-state"><div className="loading-spinner" />Loading tickets…</div>
          ) : tickets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✓</div>
              <p>No tickets assigned yet!</p>
            </div>
          ) : (
            <div className="tickets-table-wrapper">
              <table className="tickets-table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Title</th>
                    <th>Worker</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td className="ticket-id-col">
                        <span className="id-badge">{ticket.ticketNumber}</span>
                      </td>
                      <td className="title-col">{ticket.title}</td>
                      <td className="worker-col">{ticket.worker?.name || "—"}</td>
                      <td className="priority-col">
                        <span className={`badge ${getPriorityBadge(ticket.priority)}`}>
                          {ticket.priority ? ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1) : "—"}
                        </span>
                      </td>
                      <td className="status-col">
                        <span className={`badge ${getStatusBadge(ticket.status)}`}>
                          {getStatusLabel(ticket.status)}
                        </span>
                      </td>
                      <td className="date-col">{fmtDate(ticket.createdAt)}</td>
                      <td className="action-col">
                        <div className="action-buttons">
                          {ticket.status !== "resolved" && ticket.status !== "closed" && (
                            <>
                              {ticket.status === "pending" && (
                                <button
                                  className="btn btn-sm btn-update"
                                  disabled={updatingId === ticket.id}
                                  onClick={() => updateTicketStatus(ticket.id, "in-progress")}
                                >
                                  {updatingId === ticket.id ? "…" : "Start"}
                                </button>
                              )}
                              {ticket.status === "in-progress" && (
                                <button
                                  className="btn btn-sm btn-update"
                                  disabled={updatingId === ticket.id}
                                  onClick={() => updateTicketStatus(ticket.id, "resolved")}
                                >
                                  {updatingId === ticket.id ? "…" : "Resolve"}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
