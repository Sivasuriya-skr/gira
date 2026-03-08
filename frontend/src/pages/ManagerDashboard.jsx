import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ticketAPI, userAPI } from "../services/api";
import "./ManagerDashboard.css";

/*  static timeline data  */
const TIMELINE = [
  { icon: "", bg: "md-tl-purple", title: "TKT-0004 assigned to Sathi", time: "8 Mar 09:12 AM", badge: "md-badge-assigned", label: "Assigned" },
  { icon: "", bg: "md-tl-green",  title: "TKT-0001 resolved by Sathi",  time: "8 Mar 10:30 AM", badge: "md-badge-resolved", label: "Resolved" },
  { icon: "", bg: "md-tl-red",   title: "TKT-0005 critical – unassigned", time: "8 Mar 11:05 AM", badge: "md-badge-urgent", label: "Urgent" },
  { icon: "", bg: "md-tl-blue",  title: "3 new tickets raised today",  time: "8 Mar 02:15 PM", badge: "md-badge-open", label: "New" },
];
const BAR_DATA = [3, 6, 2, 8, 5, 9, 4];
const BAR_DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const TODAY_IDX = 6;

/*  count-up hook  */
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

const ManagerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  /*  data state  */
  const [tickets, setTickets]       = useState([]);
  const [providers, setProviders]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [apiError, setApiError]     = useState("");
  const [assignDialog, setAssignDialog] = useState(null); // ticketId
  const [assigningId, setAssigningId]   = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusFilter, setStatusFilter]     = useState("all");
  const [deletingId, setDeletingId]         = useState(null);

  /*  ui state  */
  const [darkMode, setDarkMode]   = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  /*  dark mode  */
  useEffect(() => {
    document.body.classList.toggle("md-dark", darkMode);
    return () => document.body.classList.remove("md-dark");
  }, [darkMode]);

  /*  close dropdowns on outside click  */
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

  /*  fetch all tickets + providers  */
  const fetchData = useCallback(async () => {
    setLoading(true); setApiError("");
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

  useEffect(() => { fetchData(); }, [fetchData]);

  /*  assign provider  */
  const assignTicket = async (ticketId, providerId) => {
    setAssigningId(ticketId);
    try {
      const res = await ticketAPI.assign(ticketId, providerId);
      setTickets(prev => prev.map(t => t.id === ticketId ? res.data : t));
      setAssignDialog(null);
    } catch (err) { alert(err.message); }
    finally { setAssigningId(null); }
  };

  /*  delete ticket  */
  const deleteTicket = async (ticketId) => {
    if (!window.confirm(`Delete ticket #${ticketId}?`)) return;
    setDeletingId(ticketId);
    try {
      await ticketAPI.delete(ticketId);
      setTickets(prev => prev.filter(t => t.id !== ticketId));
    } catch (err) { alert(err.message); }
    finally { setDeletingId(null); }
  };

  /*  helpers  */
  const getStatusBadge  = (s) => ({ pending:"md-badge-open", "in-progress":"md-badge-inprog", resolved:"md-badge-resolved", closed:"md-badge-closed" }[s] || "md-badge-closed");
  const getStatusLabel  = (s) => ({ pending:"Pending", "in-progress":"In Progress", resolved:"Resolved", closed:"Closed" }[s] || s);
  const getPriDot       = (p) => ({ high:"#EF4444", medium:"#F97316", low:"#22C55E" })[(p||"").toLowerCase()] || "#CBD5E1";
  const getPriLabel     = (p) => p ? p.charAt(0).toUpperCase() + p.slice(1) : "—";
  const fmtDate         = (iso) => iso ? new Date(iso).toLocaleDateString("en-IN",{day:"2-digit",month:"short"}) : "—";
  const initials        = (name) => (name||"M").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);

  /*  stats  */
  const stats = {
    total:      tickets.length,
    pending:    tickets.filter(t => t.status === "pending").length,
    inProgress: tickets.filter(t => t.status === "in-progress").length,
    resolved:   tickets.filter(t => t.status === "resolved").length,
  };
  const animTotal      = useCountUp(stats.total);
  const animPending    = useCountUp(stats.pending);
  const animInProgress = useCountUp(stats.inProgress);
  const animResolved   = useCountUp(stats.resolved);
  const animProviders  = useCountUp(providers.length);

  /*  filtered tickets  */
  const filteredTickets = statusFilter === "all"
    ? tickets
    : tickets.filter(t => t.status === statusFilter);

  /*  bar chart heights  */
  const maxBar = Math.max(...BAR_DATA);
  const barHeights = BAR_DATA.map(v => Math.max(8, Math.round((v / maxBar) * 72)));

  /*  provider workload  */
  const maxProvLoad = Math.max(...providers.map(p =>
    tickets.filter(t => t.provider?.id === p.id && t.status === "in-progress").length
  ), 1);

  return (
    <div className="md-root">
      {/* Blobs */}
      <div className="md-blob md-blob-1" aria-hidden />
      <div className="md-blob md-blob-2" aria-hidden />
      <div className="md-blob md-blob-3" aria-hidden />
      <div className="md-noise" aria-hidden />

      {/*  SIDEBAR  */}
      <aside className="md-sidebar">
        <div className="md-sb-top">
          <div className="md-logo">gira<span className="md-logo-dot" /></div>
          <div className="md-role-badge"> Manager</div>
        </div>

        <nav className="md-sb-nav">
          <span className="md-nav-label">Main</span>
          <a className="md-nav-item md-nav-active"><span className="md-nav-icon"></span> Overview</a>
          <a className="md-nav-item"><span className="md-nav-icon"></span> All Tickets <span className="md-nav-badge">{stats.total||0}</span></a>
          <a className="md-nav-item"><span className="md-nav-icon"></span> Assign Tickets <span className="md-nav-badge md-badge-purple-nav">{stats.pending||0}</span></a>

          <span className="md-nav-label">Team</span>
          <a className="md-nav-item"><span className="md-nav-icon"></span> Providers</a>
          <a className="md-nav-item"><span className="md-nav-icon"></span> Workers</a>

          <span className="md-nav-label">Insights</span>
          <a className="md-nav-item"><span className="md-nav-icon"></span> Reports</a>
          <a className="md-nav-item"><span className="md-nav-icon"></span> Settings</a>
        </nav>

        <div className="md-sb-bottom">
          <div className="md-user-card" onClick={handleLogout} title="Logout">
            <div className="md-avatar">{initials(user?.name)}</div>
            <div className="md-user-info">
              <div className="md-user-name">{user?.name || "Manager"}</div>
              <div className="md-user-role">Team Lead</div>
            </div>
            <button className="md-logout-btn" aria-label="Logout"></button>
          </div>
        </div>
      </aside>

      {/*  MAIN  */}
      <div className="md-main">

        {/*  Topbar  */}
        <header className="md-topbar">
          <div className="md-tb-greeting">
            <div className="md-greeting-main">{getGreeting()}, {user?.name?.split(" ")[0] || "Manager"} </div>
            <div className="md-greeting-sub">Here's your team's ticket operations overview.</div>
          </div>

          <div className="md-search-bar">
            <span className="md-search-icon"></span>
            <input type="text" placeholder="Search tickets, workers, providers" />
          </div>

          <div className="md-tb-actions">
            <button
              className={`md-dark-toggle ${darkMode ? "md-dark-on" : ""}`}
              onClick={() => setDarkMode(d => !d)}
              title="Toggle dark mode"
            >
              <div className="md-toggle-knob" />
            </button>

            <div className="md-notif-wrap" ref={notifRef}>
              <button className="md-notif-btn" onClick={() => setNotifOpen(o => !o)} title="Notifications">
                <span className="md-notif-dot" />
              </button>
              <div className={`md-notif-panel ${notifOpen ? "md-notif-open" : ""}`}>
                <div className="md-notif-header">
                  <span className="md-notif-title">Notifications</span>
                  <span className="md-notif-mark" onClick={() => setNotifOpen(false)}>Mark all read</span>
                </div>
                <div className="md-notif-item">
                  <div className="md-ni-icon md-ni-purple"></div>
                  <div className="md-ni-text"><div className="md-ni-msg">5 new tickets need assignment</div><div className="md-ni-time">10 min ago</div></div>
                  <div className="md-ni-unread" />
                </div>
                <div className="md-notif-item">
                  <div className="md-ni-icon md-ni-green"></div>
                  <div className="md-ni-text"><div className="md-ni-msg">Provider Sathi resolved TKT-0001</div><div className="md-ni-time">1 hour ago</div></div>
                  <div className="md-ni-unread" />
                </div>
                <div className="md-notif-item">
                  <div className="md-ni-icon md-ni-red"></div>
                  <div className="md-ni-text"><div className="md-ni-msg">TKT-0005 critical – no provider</div><div className="md-ni-time">2 hours ago</div></div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/*  Scrollable Content  */}
        <div className="md-content">

          {/* Page title */}
          <div className="md-page-title-row md-anim" style={{ animationDelay:"0.05s" }}>
            <h1 className="md-page-title">Manager <span>Dashboard</span></h1>
            <button className="md-assign-cta" onClick={() => setAssignDialog(-1)}>
               Assign Provider
            </button>
          </div>

          {/*  STAT CARDS  */}
          <div className="md-stats-grid">
            {[
              { bar:"md-bar-blue",   icon:"", bg:"md-soft-blue",   num:animTotal,      col:"var(--md-blue-dark)", label:"Total Tickets",     delta:" 18% this week", dc:"delta-g" },
              { bar:"md-bar-orange", icon:"", bg:"md-soft-orange", num:animPending,    col:"var(--md-orange)",    label:"Pending",           delta:" 3 from yesterday", dc:"delta-r" },
              { bar:"md-bar-blue",   icon:"", bg:"md-soft-blue",   num:animInProgress, col:"var(--md-blue)",      label:"In Progress",       delta:" 2 new today", dc:"delta-g" },
              { bar:"md-bar-green",  icon:"", bg:"md-soft-green",  num:animResolved,   col:"var(--md-green)",     label:"Resolved",          delta:" 5 this week", dc:"delta-g" },
              { bar:"md-bar-purple", icon:"", bg:"md-soft-purple", num:animProviders,  col:"var(--md-purple)",    label:"Active Providers",  delta:"All available", dc:"delta-g" },
            ].map((c, i) => (
              <div className="md-stat-card md-anim" key={c.label} style={{ animationDelay:`${0.1+i*0.04}s` }}>
                <div className={`md-card-bar ${c.bar}`} />
                <div className={`md-card-emoji ${c.bg}`}>{c.icon}</div>
                <div className="md-card-num" style={{ color:c.col }}>{c.num}</div>
                <div className="md-card-label">{c.label}</div>
                <div className={`md-card-delta ${c.dc}`}>{c.delta}</div>
              </div>
            ))}
          </div>

          {/*  MIDDLE ROW  */}
          <div className="md-mid-row">

            {/* Provider Performance */}
            <div className="md-card md-anim" style={{ animationDelay:"0.28s" }}>
              <div className="md-card-eyebrow">Provider Performance</div>
              {providers.length === 0 ? (
                <div className="md-empty-providers">No providers found. <button className="md-retry-link" onClick={fetchData}>Refresh</button></div>
              ) : (
                <div className="md-prov-list">
                  {providers.map((prov) => {
                    const active = tickets.filter(t => t.provider?.id === prov.id && t.status === "in-progress").length;
                    const pct = Math.round((active / maxProvLoad) * 100);
                    const provInitials = initials(prov.name);
                    return (
                      <div className="md-prov-row" key={prov.id}>
                        <div className="md-prov-avatar">{provInitials}</div>
                        <div className="md-prov-info">
                          <div className="md-prov-name">{prov.name}</div>
                          <div className="md-prov-sub">{active} active ticket{active!==1?"s":""}</div>
                        </div>
                        <div className="md-prov-bar-wrap">
                          <div className="md-prov-bar-bg">
                            <div className="md-prov-bar-fill" style={{ width:`${Math.max(5,pct)}%` }} />
                          </div>
                        </div>
                        <div className="md-prov-count">{active}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="md-card md-anim" style={{ animationDelay:"0.32s" }}>
              <div className="md-card-title">Recent Activity</div>
              {TIMELINE.map((ev, idx) => (
                <div className="md-tl-item" key={idx}>
                  <div className="md-tl-left">
                    <div className={`md-tl-dot ${ev.bg}`}>{ev.icon}</div>
                    {idx < TIMELINE.length - 1 && <div className="md-tl-line" />}
                  </div>
                  <div className="md-tl-right">
                    <div className="md-tl-title">{ev.title}</div>
                    <div className="md-tl-time">{ev.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/*  ALL TICKETS TABLE  */}
          <div className="md-table-card md-anim" style={{ animationDelay:"0.36s" }}>
            <div className="md-table-header">
              <div className="md-table-title">All Tickets</div>
              <div className="md-filters">
                {["all","pending","in-progress","resolved","closed"].map(f => (
                  <button
                    key={f}
                    className={`md-filter-btn ${statusFilter===f?"md-filter-active":""}`}
                    onClick={() => setStatusFilter(f)}
                  >
                    {f==="all"?"All":f==="in-progress"?"In Progress":f.charAt(0).toUpperCase()+f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {apiError && (
              <div className="md-alert-error"> {apiError} <button onClick={fetchData}>Retry</button></div>
            )}

            {loading ? (
              <div className="md-loading"><div className="md-spinner" /> Loading tickets</div>
            ) : filteredTickets.length === 0 ? (
              <div className="md-empty"><div className="md-empty-icon"></div><p>No tickets found</p></div>
            ) : (
              <table className="md-table">
                <thead>
                  <tr>
                    <th>Ticket ID</th><th>Title</th><th>Priority</th><th>Status</th>
                    <th>Worker</th><th>Provider</th><th>Created</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map(ticket => (
                    <tr key={ticket.id}>
                      <td><span className="md-tkt-id">{ticket.ticketNumber || `TKT-${String(ticket.id).padStart(4,"0")}`}</span></td>
                      <td className="md-title-col" onClick={() => setSelectedTicket(ticket)} style={{ cursor:"pointer" }}>{ticket.title}</td>
                      <td>
                        <span className="md-pri-dot">
                          <span className="md-dot" style={{ background:getPriDot(ticket.priority) }} />
                          {getPriLabel(ticket.priority)}
                        </span>
                      </td>
                      <td><span className={`md-badge ${getStatusBadge(ticket.status)}`}>{getStatusLabel(ticket.status)}</span></td>
                      <td>{ticket.worker?.name || "—"}</td>
                      <td>
                        {ticket.provider
                          ? <span className="md-provider-assigned">{ticket.provider.name}</span>
                          : <span className="md-provider-none">Unassigned</span>}
                      </td>
                      <td>{fmtDate(ticket.createdAt)}</td>
                      <td>
                        <div className="md-action-btns">
                          {ticket.status !== "closed" && ticket.status !== "resolved" && (
                            <button className="md-act-btn md-act-assign" onClick={() => setAssignDialog(ticket.id)}>
                              {ticket.provider ? "Reassign" : "Assign"}
                            </button>
                          )}
                          <button
                            className="md-act-btn md-act-delete"
                            disabled={deletingId === ticket.id}
                            onClick={() => deleteTicket(ticket.id)}
                          >
                            {deletingId === ticket.id ? "" : ""}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/*  CHARTS ROW  */}
          <div className="md-charts-row">
            {/* Bar Chart */}
            <div className="md-chart-card md-anim" style={{ animationDelay:"0.40s" }}>
              <div className="md-chart-title">Tickets This Week</div>
              <div className="md-bar-chart">
                {BAR_DATA.map((val, i) => (
                  <div className="md-bar-item" key={i}>
                    <div
                      className={`md-bar ${i===TODAY_IDX?"md-bar-hl":""}`}
                      style={{ height:barHeights[i]+"px", animationDelay:`${i*0.07}s` }}
                    />
                    <div className={`md-bar-label ${i===TODAY_IDX?"md-bar-hl-lbl":""}`}>{BAR_DAYS[i]}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status donut */}
            <div className="md-chart-card md-anim" style={{ animationDelay:"0.44s" }}>
              <div className="md-chart-title">Status Distribution</div>
              <div className="md-donut-wrap">
                <div className="md-donut-svg-wrap">
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="44" fill="none" stroke="#F97316" strokeWidth="20" strokeDasharray="83.2 276.5" strokeDashoffset="0" transform="rotate(-90 60 60)"/>
                    <circle cx="60" cy="60" r="44" fill="none" stroke="#1D63FF" strokeWidth="20" strokeDasharray="110.6 276.5" strokeDashoffset="-83.2" transform="rotate(-90 60 60)"/>
                    <circle cx="60" cy="60" r="44" fill="none" stroke="#22C55E" strokeWidth="20" strokeDasharray="55.3 276.5" strokeDashoffset="-193.8" transform="rotate(-90 60 60)"/>
                    <circle cx="60" cy="60" r="44" fill="none" stroke="#8B5CF6" strokeWidth="20" strokeDasharray="27.6 276.5" strokeDashoffset="-249.1" transform="rotate(-90 60 60)"/>
                  </svg>
                  <div className="md-donut-center">
                    <span className="md-donut-num">{stats.total}</span>
                    <span className="md-donut-sub">total</span>
                  </div>
                </div>
                <div className="md-legend">
                  {[["#F97316","Pending","30%"],["#1D63FF","In Progress","40%"],["#22C55E","Resolved","20%"],["#8B5CF6","Closed","10%"]].map(([col,name,pct])=>(
                    <div className="md-leg-item" key={name}><div className="md-leg-dot" style={{background:col}}/><span className="md-leg-name">{name}</span><span className="md-leg-pct">{pct}</span></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Priority donut */}
            <div className="md-chart-card md-anim" style={{ animationDelay:"0.48s" }}>
              <div className="md-chart-title">Priority Breakdown</div>
              <div className="md-donut-wrap">
                <div className="md-donut-svg-wrap">
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="44" fill="none" stroke="#EF4444" strokeWidth="20" strokeDasharray="110.6 276.5" strokeDashoffset="0" transform="rotate(-90 60 60)"/>
                    <circle cx="60" cy="60" r="44" fill="none" stroke="#F97316" strokeWidth="20" strokeDasharray="83.0 276.5" strokeDashoffset="-110.6" transform="rotate(-90 60 60)"/>
                    <circle cx="60" cy="60" r="44" fill="none" stroke="#22C55E" strokeWidth="20" strokeDasharray="55.3 276.5" strokeDashoffset="-193.6" transform="rotate(-90 60 60)"/>
                  </svg>
                  <div className="md-donut-center">
                    <span className="md-donut-num">{stats.total}</span>
                    <span className="md-donut-sub">tickets</span>
                  </div>
                </div>
                <div className="md-legend">
                  {[["#EF4444","High","40%"],["#F97316","Medium","30%"],["#22C55E","Low","20%"]].map(([col,name,pct])=>(
                    <div className="md-leg-item" key={name}><div className="md-leg-dot" style={{background:col}}/><span className="md-leg-name">{name}</span><span className="md-leg-pct">{pct}</span></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>{/* /content */}
      </div>{/* /main */}

      {/*  ASSIGN MODAL  */}
      {assignDialog !== null && (
        <div className="md-modal-overlay" onClick={() => setAssignDialog(null)}>
          <div className="md-modal" onClick={e => e.stopPropagation()}>
            <div className="md-modal-title">Assign Provider</div>
            <div className="md-modal-sub">
              {assignDialog > 0
                ? `Assigning: ${tickets.find(t=>t.id===assignDialog)?.ticketNumber || "Ticket"}`
                : "Select a ticket and provider below"}
            </div>
            {providers.length === 0 ? (
              <p style={{color:"var(--md-muted)",fontSize:"13px"}}>No providers available.</p>
            ) : (
              <div className="md-prov-options">
                {providers.map(prov => (
                  <button
                    key={prov.id}
                    className="md-prov-opt"
                    disabled={assigningId === assignDialog}
                    onClick={() => assignDialog > 0 && assignTicket(assignDialog, prov.id)}
                  >
                    <div className="md-prov-opt-avatar">{initials(prov.name)}</div>
                    <span>{assigningId === assignDialog ? "Assigning" : prov.name}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="md-modal-actions">
              <button className="md-btn-cancel" onClick={() => setAssignDialog(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/*  DETAIL MODAL  */}
      {selectedTicket && (
        <div className="md-modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="md-modal" onClick={e => e.stopPropagation()}>
            <div className="md-modal-title">{selectedTicket.title}</div>
            <div className="md-modal-sub">{selectedTicket.ticketNumber}</div>
            <div className="md-detail-rows">
              {[
                ["Description", selectedTicket.description || "—"],
                ["Worker",      selectedTicket.worker?.name || "—"],
                ["Provider",    selectedTicket.provider?.name || "Unassigned"],
                ["Priority",    getPriLabel(selectedTicket.priority)],
                ["Status",      getStatusLabel(selectedTicket.status)],
                ["Created",     fmtDate(selectedTicket.createdAt)],
                ["Updated",     fmtDate(selectedTicket.updatedAt)],
              ].map(([k,v]) => (
                <div className="md-detail-row" key={k}>
                  <strong>{k}</strong><span>{v}</span>
                </div>
              ))}
            </div>
            <div className="md-modal-actions">
              <button className="md-btn-cancel" onClick={() => setSelectedTicket(null)}>Close</button>
              {selectedTicket.status !== "closed" && selectedTicket.status !== "resolved" && (
                <button className="md-btn-primary" onClick={() => { setAssignDialog(selectedTicket.id); setSelectedTicket(null); }}>
                   Assign Provider
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
