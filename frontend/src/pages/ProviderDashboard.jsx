import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ticketAPI } from "../services/api";
import "./ProviderDashboard.css";

const BAR_DATA = [1, 2, 0, 3, 1, 2, 1];
const BAR_DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const TODAY_IDX = 6;

function useCountUp(target, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target === 0) { setVal(0); return; }
    let cur = 0;
    const step = Math.ceil(target / (duration / 30));
    const iv = setInterval(() => {
      cur = Math.min(cur + step, target);
      setVal(cur);
      if (cur >= target) clearInterval(iv);
    }, 30);
    return () => clearInterval(iv);
  }, [target, duration]);
  return val;
}

const ProviderDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [apiError, setApiError]     = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("in-progress");
  const [statusFilter, setStatusFilter] = useState("all");
  const [darkMode, setDarkMode]     = useState(false);
  const [notifOpen, setNotifOpen]   = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    document.body.classList.toggle("pd-dark", darkMode);
    return () => document.body.classList.remove("pd-dark");
  }, [darkMode]);

  useEffect(() => {
    const h = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  };

  const handleLogout = async () => { await logout(); navigate("/login"); };

  const fetchTickets = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true); setApiError("");
    try {
      const res = await ticketAPI.getByProvider(user.id);
      setTickets(res.data || []);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const updateTicketStatus = async (ticketId, newStatus) => {
    setUpdatingId(ticketId);
    try {
      const res = await ticketAPI.updateStatus(ticketId, newStatus);
      setTickets(prev => prev.map(t => t.id === ticketId ? res.data : t));
      setStatusModal(null);
    } catch (err) { alert(err.message); }
    finally { setUpdatingId(null); }
  };

  const getStatusBadge = (s) => ({ pending:"pd-badge-open", "in-progress":"pd-badge-inprog", resolved:"pd-badge-resolved", closed:"pd-badge-closed" }[s] || "pd-badge-closed");
  const getStatusLabel = (s) => ({ pending:"Pending", "in-progress":"In Progress", resolved:"Resolved", closed:"Closed" }[s] || s);
  const getPriDot      = (p) => ({ high:"#EF4444", medium:"#F97316", low:"#22C55E" })[(p||"").toLowerCase()] || "#CBD5E1";
  const getPriLabel    = (p) => p ? p.charAt(0).toUpperCase() + p.slice(1) : "—";
  const fmtDate        = (iso) => iso ? new Date(iso).toLocaleDateString("en-IN",{day:"2-digit",month:"short"}) : "—";
  const initials       = (name) => (name||"P").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);

  const stats = {
    total:      tickets.length,
    inProgress: tickets.filter(t => t.status === "in-progress").length,
    resolved:   tickets.filter(t => t.status === "resolved").length,
    pending:    tickets.filter(t => t.status === "pending").length,
  };

  const animTotal      = useCountUp(stats.total);
  const animInProgress = useCountUp(stats.inProgress);
  const animResolved   = useCountUp(stats.resolved);

  const highCount   = tickets.filter(t => (t.priority||"").toLowerCase() === "high").length;
  const medCount    = tickets.filter(t => (t.priority||"").toLowerCase() === "medium").length;
  const maxPri      = Math.max(highCount, medCount, 1);

  const filteredTickets = statusFilter === "all" ? tickets : tickets.filter(t => t.status === statusFilter);

  const maxBar = Math.max(...BAR_DATA);
  const barHeights = BAR_DATA.map(v => Math.max(8, Math.round((v / maxBar) * 72)));

  const getPriorityClass = (p) => ({ high:"pd-tc-high", medium:"pd-tc-medium", low:"pd-tc-low" })[(p||"").toLowerCase()] || "pd-tc-low";

  return (
    <div className="pd-root">
      <div className="pd-blob pd-blob-1" aria-hidden />
      <div className="pd-blob pd-blob-2" aria-hidden />
      <div className="pd-blob pd-blob-3" aria-hidden />
      <div className="pd-noise" aria-hidden />

      {/*  SIDEBAR  */}
      <aside className="pd-sidebar">
        <div className="pd-sb-top">
          <div className="pd-logo">gira<span className="pd-logo-dot" /></div>
          <div className="pd-role-badge"> Provider</div>
        </div>
        <nav className="pd-sb-nav">
          <span className="pd-nav-label">Main</span>
          <a className="pd-nav-item pd-nav-active"><span className="pd-nav-icon"></span> Dashboard</a>
          <a className="pd-nav-item"><span className="pd-nav-icon"></span> My Tickets <span className="pd-nav-badge">{stats.total||0}</span></a>
          <a className="pd-nav-item"><span className="pd-nav-icon"></span> In Progress <span className="pd-nav-badge pd-badge-yellow-nav">{stats.inProgress||0}</span></a>
          <span className="pd-nav-label">Work</span>
          <a className="pd-nav-item"><span className="pd-nav-icon"></span> Resolved</a>
          <a className="pd-nav-item"><span className="pd-nav-icon"></span> History</a>
          <span className="pd-nav-label">Other</span>
          <a className="pd-nav-item"><span className="pd-nav-icon"></span> Reports</a>
          <a className="pd-nav-item"><span className="pd-nav-icon"></span> Settings</a>
        </nav>
        <div className="pd-sb-bottom">
          <div className="pd-user-card" onClick={handleLogout} title="Logout">
            <div className="pd-avatar">{initials(user?.name)}</div>
            <div className="pd-user-info">
              <div className="pd-user-name">{user?.name || "Provider"}</div>
              <div className="pd-user-role">Support Provider</div>
            </div>
            <button className="pd-logout-btn" aria-label="Logout"></button>
          </div>
        </div>
      </aside>

      {/*  MAIN  */}
      <div className="pd-main">
        <header className="pd-topbar">
          <div className="pd-tb-greeting">
            <div className="pd-greeting-main">{getGreeting()}, {user?.name?.split(" ")[0] || "Provider"} </div>
            <div className="pd-greeting-sub">You have active tickets to resolve today.</div>
          </div>
          <div className="pd-search-bar">
            <span className="pd-search-icon"></span>
            <input type="text" placeholder="Search assigned tickets" />
          </div>
          <div className="pd-tb-actions">
            <button className={`pd-dark-toggle ${darkMode?"pd-dark-on":""}`} onClick={() => setDarkMode(d=>!d)} title="Toggle dark mode">
              <div className="pd-toggle-knob" />
            </button>
            <div className="pd-notif-wrap" ref={notifRef}>
              <button className="pd-notif-btn" onClick={() => setNotifOpen(o=>!o)} title="Notifications">
                <span className="pd-notif-dot" />
              </button>
              <div className={`pd-notif-panel ${notifOpen?"pd-notif-open":""}`}>
                <div className="pd-notif-header">
                  <span className="pd-notif-title">Notifications</span>
                  <span className="pd-notif-mark" onClick={() => setNotifOpen(false)}>Mark all read</span>
                </div>
                <div className="pd-notif-item">
                  <div className="pd-ni-icon pd-ni-teal"></div>
                  <div className="pd-ni-text"><div className="pd-ni-msg">New ticket assigned to you</div><div className="pd-ni-time">30 min ago</div></div>
                  <div className="pd-ni-unread" />
                </div>
                <div className="pd-notif-item">
                  <div className="pd-ni-icon pd-ni-orange"></div>
                  <div className="pd-ni-text"><div className="pd-ni-msg">Priority escalated to High</div><div className="pd-ni-time">2 hours ago</div></div>
                  <div className="pd-ni-unread" />
                </div>
                <div className="pd-notif-item">
                  <div className="pd-ni-icon pd-ni-green"></div>
                  <div className="pd-ni-text"><div className="pd-ni-msg">Manager confirmed resolution</div><div className="pd-ni-time">Yesterday</div></div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="pd-content">

          {/* Page title */}
          <div className="pd-page-title-row pd-anim" style={{ animationDelay:"0.05s" }}>
            <h1 className="pd-page-title">Provider <span>Dashboard</span></h1>
          </div>

          {/*  STAT CARDS  */}
          <div className="pd-stats-grid">
            {[
              { bar:"pd-bar-teal",   icon:"", bg:"pd-soft-teal",   num:animTotal,      col:"var(--pd-teal)",   label:"Assigned to Me", delta:" 2 new today",   dc:"delta-g" },
              { bar:"pd-bar-orange", icon:"", bg:"pd-soft-orange", num:animInProgress, col:"var(--pd-orange)", label:"In Progress",    delta:"3 due today",     dc:"delta-r" },
              { bar:"pd-bar-green",  icon:"", bg:"pd-soft-green",  num:animResolved,   col:"var(--pd-green)",  label:"Resolved",       delta:" 3 this week",   dc:"delta-g" },
              { bar:"pd-bar-blue",   icon:"", bg:"pd-soft-blue",   num:null,           col:"var(--pd-blue)",   label:"Avg Resolution", delta:" 12% faster",    dc:"delta-g", txt:"1.8h" },
            ].map((c, i) => (
              <div className="pd-stat-card pd-anim" key={c.label} style={{ animationDelay:`${0.1+i*0.05}s` }}>
                <div className={`pd-card-bar ${c.bar}`} />
                <div className={`pd-card-emoji ${c.bg}`}>{c.icon}</div>
                <div className="pd-card-num" style={{ color:c.col, fontSize:c.txt?"24px":undefined }}>{c.txt || c.num}</div>
                <div className="pd-card-label">{c.label}</div>
                <div className={`pd-card-delta ${c.dc}`}>{c.delta}</div>
              </div>
            ))}
          </div>

          {/*  MIDDLE ROW  */}
          <div className="pd-mid-row">
            {/* Workload */}
            <div className="pd-card pd-anim" style={{ animationDelay:"0.26s" }}>
              <div className="pd-card-eyebrow">My Workload Overview</div>
              <div className="pd-wl-wrap">
                {[
                  { label:" High Priority",    val:highCount,         max:maxPri,  col:"var(--pd-red)" },
                  { label:" Medium Priority",  val:medCount,          max:maxPri,  col:"var(--pd-orange)" },
                  { label:" In Progress",       val:stats.inProgress,  max:Math.max(stats.total,1), col:"var(--pd-teal)" },
                  { label:" Pending",           val:stats.pending,     max:Math.max(stats.total,1), col:"var(--pd-blue)" },
                  { label:" Resolved",          val:stats.resolved,    max:Math.max(stats.total,1), col:"var(--pd-green)" },
                ].map(row => (
                  <div className="pd-wl-row" key={row.label}>
                    <div className="pd-wl-top">
                      <span className="pd-wl-label">{row.label}</span>
                      <span className="pd-wl-val">{row.val}</span>
                    </div>
                    <div className="pd-wl-bar-bg">
                      <div className="pd-wl-bar-fill" style={{ width:`${Math.max(row.val>0?5:0, Math.round((row.val/row.max)*100))}%`, background:row.col }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance */}
            <div className="pd-card pd-anim" style={{ animationDelay:"0.30s" }}>
              <div className="pd-card-title">Performance</div>
              {[
                { icon:"", bg:"pd-soft-teal",   label:"Resolution Rate",    sub:"This month",      val:"92%",  col:"var(--pd-teal)" },
                { icon:"", bg:"pd-soft-orange",  label:"Avg First Response", sub:"Time to pick up", val:"18m",  col:"var(--pd-orange)" },
                { icon:"", bg:"pd-soft-blue",    label:"Tickets This Week",  sub:"Total assigned",  val:"8",    col:"var(--pd-blue)" },
              ].map(row => (
                <div className="pd-sum-row" key={row.label}>
                  <div className={`pd-sum-icon ${row.bg}`}>{row.icon}</div>
                  <div className="pd-sum-text">
                    <div className="pd-sum-label">{row.label}</div>
                    <div className="pd-sum-sub">{row.sub}</div>
                  </div>
                  <div className="pd-sum-val" style={{ color:row.col }}>{row.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/*  ASSIGNED TICKETS  */}
          <div className="pd-section-header pd-anim" style={{ animationDelay:"0.34s" }}>
            <div className="pd-section-title">My Assigned Tickets</div>
            <div className="pd-ticket-filters">
              {["all","in-progress","pending","resolved","closed"].map(f => (
                <button
                  key={f}
                  className={`pd-filter-btn ${statusFilter===f?"pd-filter-active":""}`}
                  onClick={() => setStatusFilter(f)}
                >
                  {f==="all"?"All":f==="in-progress"?"In Progress":f.charAt(0).toUpperCase()+f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {apiError && (
            <div className="pd-alert-error"> {apiError} <button onClick={fetchTickets}>Retry</button></div>
          )}

          {loading ? (
            <div className="pd-loading"><div className="pd-spinner" /> Loading tickets</div>
          ) : filteredTickets.length === 0 ? (
            <div className="pd-empty">
              <div className="pd-empty-icon"></div>
              <h3>No tickets here!</h3>
              <p>{statusFilter==="all" ? "No tickets have been assigned to you yet." : `No ${statusFilter} tickets.`}</p>
            </div>
          ) : (
            <div className="pd-tickets-grid pd-anim" style={{ animationDelay:"0.38s" }}>
              {filteredTickets.map((ticket, i) => (
                <div
                  className={`pd-ticket-card ${getPriorityClass(ticket.priority)} pd-anim`}
                  key={ticket.id}
                  style={{ animationDelay:`${0.38+i*0.06}s` }}
                  data-status={ticket.status}
                >
                  <div className="pd-tc-header">
                    <span className="pd-tkt-id">{ticket.ticketNumber || `TKT-${String(ticket.id).padStart(4,"0")}`}</span>
                    <span className={`pd-badge ${getStatusBadge(ticket.status)}`}>{getStatusLabel(ticket.status)}</span>
                  </div>
                  <div className="pd-tc-title">{ticket.title}</div>
                  <div className="pd-tc-desc">{ticket.description || "No description provided."}</div>
                  <div className="pd-tc-meta-top">
                    <span className={`pd-pri-chip pd-pri-${(ticket.priority||"low").toLowerCase()}`}>
                      {getPriLabel(ticket.priority)}
                    </span>
                    <span className="pd-tc-date-small">{fmtDate(ticket.createdAt)}</span>
                  </div>
                  <div className="pd-tc-actions">
                    {ticket.status === "pending" && (
                      <button
                        className="pd-tc-btn pd-tc-start"
                        disabled={updatingId === ticket.id}
                        onClick={() => updateTicketStatus(ticket.id, "in-progress")}
                      >
                        {updatingId === ticket.id ? "" : " Start Work"}
                      </button>
                    )}
                    {ticket.status === "in-progress" && (
                      <button
                        className="pd-tc-btn pd-tc-resolve"
                        disabled={updatingId === ticket.id}
                        onClick={() => updateTicketStatus(ticket.id, "resolved")}
                      >
                        {updatingId === ticket.id ? "" : " Resolve"}
                      </button>
                    )}
                    {ticket.status !== "closed" && ticket.status !== "resolved" && (
                      <button
                        className="pd-tc-btn pd-tc-status"
                        onClick={() => { setStatusModal(ticket); setSelectedStatus(ticket.status||"in-progress"); }}
                      >
                        Update Status
                      </button>
                    )}
                  </div>
                  <div className="pd-tc-footer">
                    <div className="pd-tc-worker">
                      <div className="pd-tc-w-avatar">{initials(ticket.worker?.name)}</div>
                      <span className="pd-tc-w-name">{ticket.worker?.name || "—"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/*  CHARTS ROW  */}
          <div className="pd-charts-row">
            <div className="pd-chart-card pd-anim" style={{ animationDelay:"0.50s" }}>
              <div className="pd-chart-title">Tickets Resolved This Week</div>
              <div className="pd-bar-chart">
                {BAR_DATA.map((val, i) => (
                  <div className="pd-bar-item" key={i}>
                    <div
                      className={`pd-bar ${i===TODAY_IDX?"pd-bar-today":""}`}
                      style={{ height:barHeights[i]+"px", animationDelay:`${i*0.07}s` }}
                    />
                    <div className={`pd-bar-label ${i===TODAY_IDX?"pd-today-lbl":""}`}>{BAR_DAYS[i]}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pd-chart-card pd-anim" style={{ animationDelay:"0.54s" }}>
              <div className="pd-chart-title">Ticket Type Breakdown</div>
              <div className="pd-donut-wrap">
                <div className="pd-donut-svg-wrap">
                  <svg width="140" height="140" viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r="52" fill="none" stroke="#0D9488" strokeWidth="22" strokeDasharray="130.7 326.7" strokeDashoffset="0" transform="rotate(-90 70 70)"/>
                    <circle cx="70" cy="70" r="52" fill="none" stroke="#F97316" strokeWidth="22" strokeDasharray="81.7 326.7" strokeDashoffset="-130.7" transform="rotate(-90 70 70)"/>
                    <circle cx="70" cy="70" r="52" fill="none" stroke="#1D63FF" strokeWidth="22" strokeDasharray="65.3 326.7" strokeDashoffset="-212.4" transform="rotate(-90 70 70)"/>
                    <circle cx="70" cy="70" r="52" fill="none" stroke="#FFCE32" strokeWidth="22" strokeDasharray="49.0 326.7" strokeDashoffset="-277.7" transform="rotate(-90 70 70)"/>
                  </svg>
                  <div className="pd-donut-center">
                    <span className="pd-donut-num">{stats.total||0}</span>
                    <span className="pd-donut-sub">tickets</span>
                  </div>
                </div>
                <div className="pd-legend">
                  {[["#0D9488","IT Issues","40%"],["#F97316","Hardware","25%"],["#1D63FF","Network","20%"],["#FFCE32","Other","15%"]].map(([col,name,pct])=>(
                    <div className="pd-leg-item" key={name}><div className="pd-leg-dot" style={{background:col}}/><span className="pd-leg-name">{name}</span><span className="pd-leg-pct">{pct}</span></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>{/* /content */}
      </div>{/* /main */}

      {/*  STATUS MODAL  */}
      {statusModal && (
        <div className="pd-modal-overlay" onClick={() => setStatusModal(null)}>
          <div className="pd-modal" onClick={e => e.stopPropagation()}>
            <div className="pd-modal-title">Update Ticket Status</div>
            <div className="pd-modal-sub">{statusModal.ticketNumber} — {statusModal.title}</div>
            <div className="pd-status-options">
              {[
                { val:"in-progress", icon:"", label:"In Progress" },
                { val:"resolved",    icon:"", label:"Resolved" },
                { val:"pending",     icon:"", label:"Pending" },
                { val:"closed",      icon:"", label:"Closed" },
              ].map(opt => (
                <div
                  key={opt.val}
                  className={`pd-status-opt ${selectedStatus===opt.val?"pd-status-selected":""}`}
                  onClick={() => setSelectedStatus(opt.val)}
                >
                  <div className="pd-status-opt-icon">{opt.icon}</div>
                  <div className="pd-status-opt-label">{opt.label}</div>
                </div>
              ))}
            </div>
            <div className="pd-modal-actions">
              <button className="pd-btn-cancel" onClick={() => setStatusModal(null)}>Cancel</button>
              <button
                className="pd-btn-primary"
                disabled={updatingId === statusModal.id}
                onClick={() => updateTicketStatus(statusModal.id, selectedStatus)}
              >
                {updatingId === statusModal.id ? "Updating" : "Update Status"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderDashboard;
