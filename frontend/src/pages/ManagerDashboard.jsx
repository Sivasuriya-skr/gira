import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ticketAPI, userAPI } from "../services/api";
import "./ManagerDashboard.css";

const ManagerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [assignDialog, setAssignDialog] = useState(null);
  const [assigningId, setAssigningId] = useState(null);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // ── Fetch all tickets + providers ─────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setApiError("");
    try {
      const [ticketRes, providerRes] = await Promise.all([
        ticketAPI.getAll(),
        userAPI.getProviders(),
      ]);
      setTickets(ticketRes.data || []);
      setProviders(providerRes.data || []);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Assign provider ───────────────────────────────────────────
  const assignTicket = async (ticketId, providerId) => {
    setAssigningId(ticketId);
    try {
      const res = await ticketAPI.assign(ticketId, providerId);
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? res.data : t)));
      setAssignDialog(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setAssigningId(null);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────
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
    pending: tickets.filter((t) => t.status === "pending").length,
    inProgress: tickets.filter((t) => t.status === "in-progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
  };

  return (
    <div className="manager-dashboard">
      {/* Top Navbar */}
      <nav className="dash-navbar">
        <div className="dash-nav-brand">
          <span className="dash-nav-title">gira</span>
        </div>
        <div className="dash-nav-right">
          <span className="dash-nav-badge">Manager</span>
          <div className="dash-nav-user" onClick={handleLogout}>
            👤 {user?.name || "Manager"} &nbsp;·&nbsp; Sign out
          </div>
        </div>
      </nav>

      <div className="dashboard-container">
        {/* Header with Stats */}
        <div className="dashboard-header fade-in-up">
          <div className="dash-title-block">
            <h1>Manager Dashboard</h1>
            <p>Oversee all tickets and assignments</p>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total</div>
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

        {/* All Tickets */}
        <div className="all-tickets-section fade-in-up">
          <h3>All Tickets</h3>

          {apiError && (
            <div className="api-error-banner">⚠️ {apiError} <button onClick={fetchData}>Retry</button></div>
          )}

          {loading ? (
            <div className="loading-state"><div className="loading-spinner" />Loading tickets…</div>
          ) : tickets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>No tickets in the system yet</p>
            </div>
          ) : (
            <div className="tickets-table-wrapper">
              <table className="tickets-table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Title</th>
                    <th>Worker</th>
                    <th>Service Provider</th>
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
                      <td className="provider-col">
                        {ticket.provider ? (
                          <span className="provider-assigned">{ticket.provider.name}</span>
                        ) : (
                          <span className="provider-unassigned">Unassigned</span>
                        )}
                      </td>
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
                          {ticket.status !== "closed" && ticket.status !== "resolved" && (
                            <button
                              className="btn btn-sm btn-assign"
                              onClick={() => setAssignDialog(ticket.id)}
                            >
                              {ticket.provider ? "Reassign" : "Assign"}
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-view"
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Performance Metrics */}
        <div className="performance-metrics fade-in-up">
          <h3>Performance Metrics</h3>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Avg Resolution Time</div>
              <div className="metric-value">2.8h</div>
              <div className="metric-trend">↓ 12% improvement this week</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Customer Satisfaction</div>
              <div className="metric-value">92%</div>
              <div className="metric-trend">↑ 5% improvement this week</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">First Response Time</div>
              <div className="metric-value">45m</div>
              <div className="metric-trend">↓ 8% improvement this week</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Open Tickets</div>
              <div className="metric-value">{stats.pending + stats.inProgress}</div>
              <div className="metric-trend">↑ Live data</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Assign Dialog ── */}
      {assignDialog && (
        <div className="modal-backdrop">
          <div className="assign-modal">
            <div className="modal-header">
              <h5>Assign Ticket {tickets.find((t) => t.id === assignDialog)?.ticketNumber}</h5>
              <button className="btn-close" onClick={() => setAssignDialog(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>Select a service provider to assign this ticket:</p>
              {providers.length === 0 ? (
                <p style={{ color: "var(--text-muted)" }}>No providers available.</p>
              ) : (
                <div className="provider-list">
                  {providers.map((provider) => (
                    <button
                      key={provider.id}
                      className="provider-option"
                      disabled={assigningId === assignDialog}
                      onClick={() => assignTicket(assignDialog, provider.id)}
                    >
                      {assigningId === assignDialog ? "Assigning…" : provider.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Detail Modal ── */}
      {selectedTicket && (
        <div className="modal-backdrop">
          <div className="detail-modal">
            <div className="modal-header">
              <h5>{selectedTicket.title}</h5>
              <button className="btn-close" onClick={() => setSelectedTicket(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row"><strong>Ticket ID</strong><span>{selectedTicket.ticketNumber}</span></div>
              <div className="detail-row"><strong>Description</strong><span>{selectedTicket.description || "—"}</span></div>
              <div className="detail-row"><strong>Worker</strong><span>{selectedTicket.worker?.name || "—"}</span></div>
              <div className="detail-row"><strong>Service Provider</strong><span>{selectedTicket.provider?.name || "Unassigned"}</span></div>
              <div className="detail-row">
                <strong>Priority</strong>
                <span className={`badge ${getPriorityBadge(selectedTicket.priority)}`}>
                  {selectedTicket.priority ? selectedTicket.priority.charAt(0).toUpperCase() + selectedTicket.priority.slice(1) : "—"}
                </span>
              </div>
              <div className="detail-row">
                <strong>Status</strong>
                <span className={`badge ${getStatusBadge(selectedTicket.status)}`}>
                  {getStatusLabel(selectedTicket.status)}
                </span>
              </div>
              <div className="detail-row"><strong>Created</strong><span>{fmtDate(selectedTicket.createdAt)}</span></div>
              <div className="detail-row"><strong>Updated</strong><span>{fmtDate(selectedTicket.updatedAt)}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
