import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ticketAPI } from "../services/api";
import "./WorkerDashboard.css";

/* ── static demo data for timeline & charts ── */
const TIMELINE = [
  { icon: "🎫", bg: "tl-blue", title: "TKT-0004 Submitted", time: "27 Feb 09:12 AM", badge: "badge-open", label: "Open" },
  { icon: "👤", bg: "tl-yellow", title: "Assigned to Sathi", time: "27 Feb 10:30 AM", badge: "badge-assigned", label: "Assigned" },
  { icon: "⚡", bg: "tl-orange", title: "Work started by Sathi", time: "27 Feb 11:05 AM", badge: "badge-inprog", label: "In Progress" },
  { icon: "✅", bg: "tl-green", title: "TKT-0002 Resolved", time: "25 Feb 03:40 PM", badge: "badge-resolved", label: "Resolved" },
  { icon: "🔥", bg: "tl-red", title: "TKT-0005 Critical raised", time: "27 Feb 02:15 PM", badge: "badge-urgent", label: "Urgent" },
];
const BAR_DATA = [2, 4, 1, 3, 5, 2, 3];
const BAR_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TODAY_IDX = 4;

/* ── count-up hook ── */
function useCountUp(target, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target === 0) { setVal(0); return; }
    let current = 0;
    const step = Math.ceil(target / (duration / 30));
    const iv = setInterval(() => {
      current = Math.min(current + step, target);
      setVal(current);
      if (current >= target) clearInterval(iv);
    }, 30);
    return () => clearInterval(iv);
  }, [target, duration]);
  return val;
}

const WorkerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  /* ── existing state ── */
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [newTicket, setNewTicket] = useState({ title: "", description: "", priority: "medium" });
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  /* ── new UI state ── */
  const [darkMode, setDarkMode] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const notifRef = useRef(null);
  const fabRef = useRef(null);

  /* ── dark mode effect ── */
  useEffect(() => {
    document.body.classList.toggle("wd-dark", darkMode);
    return () => document.body.classList.remove("wd-dark");
  }, [darkMode]);

  /* ── close dropdowns on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (fabRef.current && !fabRef.current.contains(e.target)) setFabOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── time-aware greeting ── */
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleLogout = async () => { await logout(); navigate("/login"); };

  /* ── fetch tickets ── */
  const fetchTickets = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true); setApiError("");
    try {
      const res = await ticketAPI.getByWorker(user.id);
      setTickets(res.data || []);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  /* ── create ticket ── */
  const handleNewTicket = async (e) => {
    e.preventDefault(); setFormError("");
    if (!newTicket.title.trim() || !newTicket.description.trim()) {
      setFormError("Please fill in all fields"); return;
    }
    setSubmitting(true);
    try {
      await ticketAPI.create({ title: newTicket.title, description: newTicket.description, priority: newTicket.priority, workerId: user.id });
      setNewTicket({ title: "", description: "", priority: "medium" });
      setShowForm(false); fetchTickets();
    } catch (err) { setFormError(err.message); }
    finally { setSubmitting(false); }
  };

  /* ── helpers ── */
  const getStatusBadge = (s) => ({ pending: "badge-open", "in-progress": "badge-inprog", resolved: "badge-resolved", closed: "badge-closed" }[s] || "badge-closed");
  const getStatusLabel = (s) => ({ pending: "Open", "in-progress": "In Progress", resolved: "Resolved", closed: "Closed" }[s] || s);
  const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—";
  const getPriDot = (p) => ({ urgent: "#EF4444", high: "#F97316", medium: "#FFCE32", low: "#22C55E" })[(p || "").toLowerCase()] || "#CBD5E1";
  const getPriLabel = (p) => p ? p.charAt(0).toUpperCase() + p.slice(1) : "—";

  /* ── stats ── */
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === "pending").length,
    inProgress: tickets.filter(t => t.status === "in-progress").length,
    resolved: tickets.filter(t => t.status === "resolved").length,
  };

  /* ── animated stat numbers ── */
  const animTotal = useCountUp(stats.total);
  const animOpen = useCountUp(stats.open);
  const animInProgress = useCountUp(stats.inProgress);
  const animResolved = useCountUp(stats.resolved);

  /* ── journey step ── */
  const getJourneyStep = () => {
    if (tickets.some(t => t.status === "resolved" || t.status === "closed")) return 4;
    if (tickets.some(t => t.status === "in-progress")) return 3;
    if (tickets.some(t => t.provider)) return 2;
    if (tickets.length > 0) return 1;
    return 0;
  };
  const journeyStep = getJourneyStep();
  const JOURNEY_STEPS = ["Submitted", "Assigned", "In Progress", "Testing", "Resolved"];

  /* ── bar chart heights ── */
  const maxBar = Math.max(...BAR_DATA);
  const barHeights = BAR_DATA.map(v => Math.max(8, Math.round((v / maxBar) * 72)));

  /* ── user initials ── */
  const initials = (user?.name || "W").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="wd-root">
      {/* Blobs */}
      <div className="wd-blob wd-blob-1" aria-hidden />
      <div className="wd-blob wd-blob-2" aria-hidden />
      <div className="wd-blob wd-blob-3" aria-hidden />
      <div className="wd-noise" aria-hidden />

      {/* ═══════════ SIDEBAR ═══════════ */}
      <aside className="wd-sidebar">
        <div className="wd-sb-top">
          <div className="wd-logo">gira<span className="wd-logo-dot" /></div>
          <div className="wd-role-badge">👷 Worker</div>
        </div>

        <nav className="wd-sb-nav">
          <span className="wd-nav-label">Main</span>
          <a className="wd-nav-item wd-nav-active"><span className="wd-nav-icon">⊞</span> Dashboard</a>
          <a className="wd-nav-item" onClick={() => { setShowForm(false); }}><span className="wd-nav-icon">📄</span> My Tickets <span className="wd-nav-badge">{stats.total || 0}</span></a>
          <a className="wd-nav-item" onClick={() => { setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
            <span className="wd-nav-icon">➕</span> Create Ticket <span className="wd-nav-badge wd-badge-yellow">New</span>
          </a>

          <span className="wd-nav-label">Resources</span>
          <a className="wd-nav-item"><span className="wd-nav-icon">📖</span> Knowledge Base</a>
          <a className="wd-nav-item"><span className="wd-nav-icon">📊</span> Reports</a>
          <a className="wd-nav-item"><span className="wd-nav-icon">⚙️</span> Settings</a>
        </nav>

        <div className="wd-sb-bottom">
          <div className="wd-user-card" onClick={handleLogout} title="Logout">
            <div className="wd-avatar">{initials}</div>
            <div className="wd-user-info">
              <div className="wd-user-name">{user?.name || "Worker"}</div>
              <div className="wd-user-role">Field Worker</div>
            </div>
            <button className="wd-logout-btn" aria-label="Logout">↩</button>
          </div>
        </div>
      </aside>

      {/* ═══════════ MAIN ═══════════ */}
      <div className="wd-main">

        {/* ── Topbar ── */}
        <header className="wd-topbar">
          <div className="wd-tb-greeting">
            <div className="wd-greeting-main">{getGreeting()}, {user?.name?.split(" ")[0] || "there"} 👋</div>
            <div className="wd-greeting-sub">Here's what's happening with your tickets today.</div>
          </div>

          <div className="wd-search-bar">
            <span className="wd-search-icon">🔍</span>
            <input type="text" placeholder="Search tickets, issues…" />
          </div>

          <div className="wd-tb-actions">
            <button
              className={`wd-dark-toggle ${darkMode ? "wd-dark-on" : ""}`}
              onClick={() => setDarkMode(d => !d)}
              title="Toggle dark mode"
            >
              <div className="wd-toggle-knob" />
            </button>

            <div className="wd-notif-wrap" ref={notifRef}>
              <button className="wd-notif-btn" onClick={() => setNotifOpen(o => !o)} title="Notifications">
                🔔<span className="wd-notif-dot" />
              </button>

              {/* Notification panel */}
              <div className={`wd-notif-panel ${notifOpen ? "wd-notif-open" : ""}`}>
                <div className="wd-notif-header">
                  <span className="wd-notif-title">Notifications</span>
                  <span className="wd-notif-mark" onClick={() => setNotifOpen(false)}>Mark all read</span>
                </div>
                <div className="wd-notif-item">
                  <div className="wd-ni-icon wd-ni-blue">🎫</div>
                  <div className="wd-ni-text"><div className="wd-ni-msg">TKT-0004 has been assigned to Sathi</div><div className="wd-ni-time">2 min ago</div></div>
                  <div className="wd-ni-unread" />
                </div>
                <div className="wd-notif-item">
                  <div className="wd-ni-icon wd-ni-green">✅</div>
                  <div className="wd-ni-text"><div className="wd-ni-msg">TKT-0002 has been resolved</div><div className="wd-ni-time">1 hour ago</div></div>
                  <div className="wd-ni-unread" />
                </div>
                <div className="wd-notif-item">
                  <div className="wd-ni-icon wd-ni-yellow">⚡</div>
                  <div className="wd-ni-text"><div className="wd-ni-msg">TKT-0003 is now In Progress</div><div className="wd-ni-time">3 hours ago</div></div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ── Scrollable Content ── */}
        <div className="wd-content">

          {/* Page title row */}
          <div className="wd-page-title-row wd-anim" style={{ animationDelay: "0.05s" }}>
            <h1 className="wd-page-title">Worker <span>Dashboard</span></h1>
            <button className="wd-create-btn" onClick={() => { setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              <img src="https://img.icons8.com/?size=100&id=zO2btiwstwsf&format=png&color=0A1A4E" alt="Add ticket" className="wd-btn-icon" />
              Create Ticket
            </button>
          </div>

          {/* ── STAT CARDS ── */}
          <div className="wd-stats-grid">
            {[
              { bar: "wd-bar-blue", icon: "🎫", bg: "wd-soft-blue", num: animTotal, col: "var(--wd-blue-dark)", label: "Total Tickets", delta: "↑ 12% this week", dc: "delta-green" },
              { bar: "wd-bar-blue", icon: "📂", bg: "wd-soft-blue", num: animOpen, col: "var(--wd-blue)", label: "Open Tickets", delta: "↓ 2 from yesterday", dc: "delta-red" },
              { bar: "wd-bar-orange", icon: "⚡", bg: "wd-soft-orange", num: animInProgress, col: "var(--wd-orange)", label: "In Progress", delta: "↑ 1 new today", dc: "delta-green" },
              { bar: "wd-bar-green", icon: "✅", bg: "wd-soft-green", num: animResolved, col: "var(--wd-green)", label: "Resolved", delta: "↑ 3 this week", dc: "delta-green" },
            ].map((c, i) => (
              <div className="wd-stat-card wd-anim" key={c.label} style={{ animationDelay: `${0.1 + i * 0.05}s` }}>
                <div className={`wd-card-bar ${c.bar}`} />
                <div className={`wd-card-emoji ${c.bg}`}>{c.icon}</div>
                <div className="wd-card-num" style={{ color: c.col }}>{c.num}</div>
                <div className="wd-card-label">{c.label}</div>
                <div className={`wd-card-delta ${c.dc}`}>{c.delta}</div>
              </div>
            ))}
          </div>

          {/* ── MIDDLE ROW ── */}
          <div className="wd-mid-row">

            {/* Complaint Journey */}
            <div className="wd-card wd-anim" style={{ animationDelay: "0.30s" }}>
              <div className="wd-card-eyebrow">Your Complaint Journey</div>
              <div className="wd-journey-track">
                {JOURNEY_STEPS.map((name, idx) => {
                  const stepNum = idx + 1;
                  const isDone = journeyStep > stepNum;
                  const isActive = journeyStep === stepNum;
                  return (
                    <div className="wd-j-step" key={name}>
                      <div className={`wd-j-dot ${isDone ? "done" : isActive ? "active" : ""}`}>
                        {isDone ? "✓" : stepNum}
                      </div>
                      {idx < JOURNEY_STEPS.length - 1 && (
                        <div className={`wd-j-line ${journeyStep > stepNum ? "filled" : ""}`} />
                      )}
                      <div className={`wd-j-label ${isDone ? "done-lbl" : isActive ? "active-lbl" : ""}`}>{name}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Summary */}
            <div className="wd-card wd-anim" style={{ animationDelay: "0.35s" }}>
              <div className="wd-card-title">Quick Summary</div>
              <div className="wd-sum-row">
                <div className="wd-sum-icon wd-soft-orange">🔥</div>
                <div className="wd-sum-text"><div className="wd-sum-label">Urgent Tickets</div><div className="wd-sum-sub">Needs immediate attention</div></div>
                <div className="wd-sum-val" style={{ color: "var(--wd-orange)" }}>{tickets.filter(t => (t.priority || "").toLowerCase() === "urgent").length || 1}</div>
              </div>
              <div className="wd-sum-row">
                <div className="wd-sum-icon wd-soft-green">⚡</div>
                <div className="wd-sum-text"><div className="wd-sum-label">Avg Response</div><div className="wd-sum-sub">Time to first reply</div></div>
                <div className="wd-sum-val" style={{ color: "var(--wd-green)" }}>2m</div>
              </div>
              <div className="wd-sum-row">
                <div className="wd-sum-icon wd-soft-blue">👤</div>
                <div className="wd-sum-text"><div className="wd-sum-label">My Provider</div><div className="wd-sum-sub">Currently assigned</div></div>
                <div className="wd-sum-val" style={{ color: "var(--wd-blue)" }}>
                  {tickets.find(t => t.provider)?.provider?.name || "—"}
                </div>
              </div>
            </div>
          </div>

          {/* ── Create Ticket Form (preserved logic) ── */}
          {showForm && (
            <div className="wd-card wd-form-card wd-anim">
              <div className="wd-form-header">
                <div className="wd-card-title">Raise New Ticket</div>
                <button className="wd-form-cancel" onClick={() => { setShowForm(false); setFormError(""); }}>✕ Cancel</button>
              </div>
              {apiError && <div className="wd-alert-error">⚠️ {apiError} <button onClick={fetchTickets}>Retry</button></div>}
              <form onSubmit={handleNewTicket} className="wd-form">
                <div className="wd-form-eyebrow">New Complaint</div>
                {formError && <div className="wd-alert-error">{formError}</div>}
                <div className="wd-fg">
                  <label className="wd-flabel">Ticket Title</label>
                  <input className="wd-finput" type="text" placeholder="Brief title for the issue"
                    value={newTicket.title} onChange={e => setNewTicket({ ...newTicket, title: e.target.value })} required />
                </div>
                <div className="wd-fg">
                  <label className="wd-flabel">Description</label>
                  <textarea className="wd-finput" rows={4} placeholder="Describe the issue in detail"
                    value={newTicket.description} onChange={e => setNewTicket({ ...newTicket, description: e.target.value })} required />
                </div>
                <div className="wd-fg">
                  <label className="wd-flabel">Priority</label>
                  <div className="wd-pri-group">
                    {["low", "medium", "high"].map(p => (
                      <label key={p} className={`wd-pri-pill ${newTicket.priority === p ? "active" : ""}`}>
                        <input type="radio" name="priority" value={p} style={{ display: "none" }}
                          checked={newTicket.priority === p} onChange={e => setNewTicket({ ...newTicket, priority: e.target.value })} />
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
                <button type="submit" className="wd-submit-btn" disabled={submitting}>
                  {submitting ? "Creating…" : "Create Ticket"}
                </button>
              </form>
            </div>
          )}

          {/* ── BOTTOM ROW ── */}
          <div className="wd-bottom-row">

            {/* Ticket Table */}
            <div className="wd-table-card wd-anim" style={{ animationDelay: "0.40s" }}>
              <div className="wd-table-header">
                <div className="wd-table-title">My Tickets</div>
                <span className="wd-view-all">View all →</span>
              </div>

              {loading ? (
                <div className="wd-loading"><div className="wd-spinner" /> Loading tickets…</div>
              ) : tickets.length === 0 ? (
                <div className="wd-empty">
                  <div className="wd-empty-icon">📭</div>
                  <h3>No complaints yet — you're all good!</h3>
                  <p>When you raise a complaint, it will show up here.</p>
                </div>
              ) : (
                <table className="wd-table">
                  <thead>
                    <tr>
                      <th>Ticket ID</th><th>Title</th><th>Priority</th>
                      <th>Status</th><th>Provider</th><th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map(t => (
                      <tr key={t.id}>
                        <td><span className="wd-tkt-id">{t.ticketNumber || `TKT-${t.id}`}</span></td>
                        <td>{t.title}</td>
                        <td>
                          <span className="wd-pri-dot">
                            <span className="wd-dot" style={{ background: getPriDot(t.priority) }} />
                            {getPriLabel(t.priority)}
                          </span>
                        </td>
                        <td><span className={`wd-badge ${getStatusBadge(t.status)}`}>{getStatusLabel(t.status)}</span></td>
                        <td>{t.provider?.name || "—"}</td>
                        <td>{fmtDate(t.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Activity Timeline */}
            <div className="wd-timeline-card wd-anim" style={{ animationDelay: "0.45s" }}>
              <div className="wd-card-eyebrow">Recent Activity</div>
              {TIMELINE.map((ev, idx) => (
                <div className="wd-tl-item" key={idx}>
                  <div className="wd-tl-left">
                    <div className={`wd-tl-dot ${ev.bg}`}>{ev.icon}</div>
                    {idx < TIMELINE.length - 1 && <div className="wd-tl-line" />}
                  </div>
                  <div className="wd-tl-right">
                    <div className="wd-tl-title">{ev.title}</div>
                    <div className="wd-tl-time">{ev.time}</div>
                    <span className={`wd-badge ${ev.badge}`}>{ev.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── CHARTS ROW ── */}
          <div className="wd-charts-row">

            {/* Bar Chart */}
            <div className="wd-chart-card wd-anim" style={{ animationDelay: "0.50s" }}>
              <div className="wd-chart-title">Tickets per Day</div>
              <div className="wd-bar-chart">
                {BAR_DATA.map((val, i) => (
                  <div className="wd-bar-item" key={i}>
                    <div
                      className={`wd-bar ${i === TODAY_IDX ? "wd-bar-today" : ""}`}
                      style={{ height: barHeights[i] + "px", animationDelay: `${i * 0.07}s` }}
                    />
                    <div className={`wd-bar-label ${i === TODAY_IDX ? "wd-today-lbl" : ""}`}>{BAR_DAYS[i]}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Donut Chart */}
            <div className="wd-chart-card wd-anim" style={{ animationDelay: "0.55s" }}>
              <div className="wd-chart-title">Issue Category Distribution</div>
              <div className="wd-donut-wrap">
                <div className="wd-donut-svg-wrap">
                  <svg width="140" height="140" viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r="52" fill="none" stroke="#1D63FF" strokeWidth="22"
                      strokeDasharray="130.7 326.7" strokeDashoffset="0" transform="rotate(-90 70 70)" />
                    <circle cx="70" cy="70" r="52" fill="none" stroke="#FFCE32" strokeWidth="22"
                      strokeDasharray="81.7 326.7" strokeDashoffset="-130.7" transform="rotate(-90 70 70)" />
                    <circle cx="70" cy="70" r="52" fill="none" stroke="#F97316" strokeWidth="22"
                      strokeDasharray="65.3 326.7" strokeDashoffset="-212.4" transform="rotate(-90 70 70)" />
                    <circle cx="70" cy="70" r="52" fill="none" stroke="#22C55E" strokeWidth="22"
                      strokeDasharray="49.0 326.7" strokeDashoffset="-277.7" transform="rotate(-90 70 70)" />
                  </svg>
                  <div className="wd-donut-center">
                    <span className="wd-donut-num">{stats.total || 5}</span>
                    <span className="wd-donut-sub">tickets</span>
                  </div>
                </div>
                <div className="wd-legend">
                  {[["#1D63FF", "IT Issues", "40%"], ["#FFCE32", "Facility", "25%"], ["#F97316", "HR", "20%"], ["#22C55E", "Other", "15%"]].map(([col, name, pct]) => (
                    <div className="wd-leg-item" key={name}>
                      <div className="wd-leg-dot" style={{ background: col }} />
                      <span className="wd-leg-name">{name}</span>
                      <span className="wd-leg-pct">{pct}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>{/* /content */}
      </div>{/* /main */}

      {/* ═══════════ FAB ═══════════ */}
      <div ref={fabRef}>
        <div className={`wd-fab-menu ${fabOpen ? "wd-fab-open" : ""}`}>
          <div className="wd-fab-opt" onClick={() => { setShowForm(true); setFabOpen(false); }}>
            <img src="https://img.icons8.com/?size=100&id=zO2btiwstwsf&format=png&color=1D63FF" alt="ticket" className="wd-btn-icon" />
            Create Ticket
          </div>
          <div className="wd-fab-opt">⚠️ Report Incident</div>
          <div className="wd-fab-opt">🔑 Request Access</div>
        </div>
        <button className="wd-fab" onClick={() => setFabOpen(o => !o)} title="New Ticket">
          <img src="https://img.icons8.com/?size=100&id=zO2btiwstwsf&format=png&color=0A1A4E" alt="New Ticket" className="wd-fab-img" />
          <span className="wd-fab-text">New Ticket</span>
        </button>
      </div>
    </div>
  );
};

export default WorkerDashboard;
