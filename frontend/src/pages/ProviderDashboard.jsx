import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ticketAPI, userAPI } from "../services/api";
import Icon8 from "../components/Icon8";
import GmailModal from "../components/GmailModal";
import ForwardModal from "../components/ForwardModal";
import "./ProviderDashboard.css";

const ProviderDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // --- DATA STATE ---
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // --- UI STATE ---
  const [darkMode, setDarkMode] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [allNotifsOpen, setAllNotifsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [resolutionModalOpen, setResolutionModalOpen] = useState(false);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [gmailModalOpen, setGmailModalOpen] = useState(false);
  const [forwardModalOpen, setForwardModalOpen] = useState(false);
  const [resolutionDate, setResolutionDate] = useState("");
  const [completionSummary, setCompletionSummary] = useState("");

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // --- HELPDESK SETTINGS ---
  const [hdSettings, setHdSettings] = useState({
    autoRefresh: true,
    refreshInterval: 60,
    notificationSound: true,
    showSLA: true,
    autoSelectNew: true
  });

  // --- ACTIVITY & PERFORMANCE ---
  const [activities, setActivities] = useState([]);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const announceChange = (message, priority = "polite") => {
    console.log(`[Announce ${priority}]: ${message}`);
  };

  // --- LOAD DATA ---
  const fetchTickets = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setApiError("");
    try {
      const res = await ticketAPI.getByProvider(user.id);
      const ticketsArr = res.data || [];
      setTickets(ticketsArr);

      // Fetch activities for assigned tickets (Latest Updates)
      if (ticketsArr.length > 0) {
        // Just fetch for the last 5 tickets to avoid overload
        const activityPromises = ticketsArr.slice(0, 5).map(t => ticketAPI.getActivity(t.id));
        const activityResponses = await Promise.all(activityPromises);
        const allAct = activityResponses.flatMap(r => r.data || []);
        const sortedActivities = allAct.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
        setActivities(sortedActivities);

        // Generate dynamic notifications from recent activities/assignments
        const newNotifs = sortedActivities.slice(0, 5).map(act => ({
          id: act.id,
          ticketId: act.ticketId, // Crucial for linking
          title: act.action === 'ASSIGNED' ? "New Ticket Assigned" : (act.action === 'STATUS_UPDATE' ? "Status Changed" : "Activity on Ticket"),
          desc: act.details,
          time: new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unread: true,
          icon: act.action === 'ASSIGNED' ? "📌" : (act.action === 'STATUS_UPDATE' ? "⚡" : "💬")
        }));
        setNotifications(newNotifs);
        setNotifCount(newNotifs.length);
      }

      // Auto-select first ticket if none selected
      if (!selectedTicket && ticketsArr.length > 0) {
        setSelectedTicket(ticketsArr[0]);
      }
    } catch (err) {
      setApiError(err.message || "Failed to load assigned tickets");
    } finally {
      setLoading(false);
    }
  }, [user?.id, selectedTicket]);

  useEffect(() => {
    fetchTickets();
    setLastRefreshed(new Date());
  }, [fetchTickets]);

  // --- AUTO REFRESH (Quick Actions Requirement: Every 3 mins) ---
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Auto-refreshing provider workspace...");
      fetchTickets();
      setLastRefreshed(new Date());
    }, 180000); // 3 minutes
    return () => clearInterval(interval);
  }, [fetchTickets]);

  // --- DARK MODE ---
  useEffect(() => {
    document.documentElement.classList.toggle("md-dark", darkMode);
    return () => document.documentElement.classList.remove("md-dark");
  }, [darkMode]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSetResolutionDate = async () => {
    if (!selectedTicket || !resolutionDate) return;
    setUpdatingId(selectedTicket.id);
    try {
      const res = await ticketAPI.setResolutionDate(selectedTicket.id, resolutionDate);
      setSelectedTicket(res.data);
      setTickets(prev => prev.map(t => t.id === res.data.id ? res.data : t));
      setResolutionModalOpen(false);
      announceChange("Resolution date updated");
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMarkResolved = async () => {
    if (!selectedTicket) return;
    setSummaryModalOpen(true);
  };

  const submitResolution = async () => {
    setUpdatingId(selectedTicket.id);
    try {
      const res = await ticketAPI.complete(selectedTicket.id, completionSummary);
      setSelectedTicket(res.data);
      setTickets(prev => prev.map(t => t.id === res.data.id ? res.data : t));
      setSummaryModalOpen(false);
      setCompletionSummary("");
      announceChange("Ticket marked as resolved");
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // --- STATUS UPDATE ---
  const updateTicketStatus = async (ticketId, newStatus) => {
    setUpdatingId(ticketId);
    announceChange(`Updating ticket to ${newStatus}...`);
    try {
      const res = await ticketAPI.updateStatus(ticketId, newStatus);
      const updatedTicket = res.data;
      setTickets(prev => prev.map(t => t.id === ticketId ? updatedTicket : t));
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(updatedTicket);
      }
      setActivities([{
        id: Date.now(),
        type: "status",
        action: `Moved ${updatedTicket.ticketNumber || 'Ticket'} to ${newStatus}`,
        details: `Status manually updated by ${user?.name}`,
        time: "Just now",
        author: user?.name,
        icon: "⚡"
      }, ...activities]);
      announceChange("Status updated successfully");
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // --- FILTER & SEARCH ---
  const filteredQueue = useMemo(() => {
    return tickets.filter(t => {
      const matchesSearch = (t.title?.toLowerCase() + (t.ticketNumber || '')).includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      // Priority sorting: urgent > high > medium > low
      const weights = { urgent: 4, high: 3, medium: 2, low: 1 };
      return (weights[b.priority] || 0) - (weights[a.priority] || 0);
    });
  }, [tickets, searchQuery, statusFilter]);

  // --- HANDLERS ---
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleSendGmail = async ({ to, subject, body }) => {
    if (!selectedTicket) return;
    try {
      await ticketAPI.sendEmail(selectedTicket.id, { to, subject, body });
      announceChange("Email sent successfully!");
    } catch (err) {
      alert(err.message);
    }
  };

  const onConfirmForward = async (reason) => {
    if (!selectedTicket || !user) return;
    setUpdatingId(selectedTicket.id);
    try {
      await ticketAPI.forward(selectedTicket.id, { providerId: user.id, reason });
      setTickets(prev => prev.filter(t => t.id !== selectedTicket.id));
      setSelectedTicket(null);
      setForwardModalOpen(false);
      announceChange("Ticket forwarded to manager");
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // --- NOTIFICATION HANDLER ---
  const handleNotifClick = (notif) => {
    const targetTicket = tickets.find(t => t.id === notif.ticketId);
    if (targetTicket) {
      setSelectedTicket(targetTicket);
      showToast(`Selected Ticket #${targetTicket.ticketNumber || targetTicket.id}`, "info");
    }
    setNotifOpen(false);
  };

  // --- HELPERS ---
  const getStatusBadge = (s) => ({ pending: "status-offline", "in-progress": "status-leave", resolved: "status-active", closed: "status-offline" }[s] || "status-offline");
  const getStatusLabel = (s) => ({ pending: "New", "in-progress": "Working", resolved: "Resolved", closed: "Closed" }[s] || s);
  const getPriColor = (p) => ({ urgent: "var(--md-accent-red)", high: "var(--md-accent-red)", medium: "var(--md-accent-amber)", low: "var(--md-accent-green)" }[p] || "var(--md-text-muted)");

  return (
    <div className={`dashboard-root ${darkMode ? "md-dark" : ""}`}>
      {/* SECTION 1: TOP HEADER */}
      <header className="top-header">
        <div className="header-left">
          <div className="branding">
            <Icon8 name="service" size={32} color={darkMode ? "6366f1" : "4f46e5"} />
            <span className="logo-font">gira</span>
          </div>
          <div className="status-pill active" style={{ marginLeft: '1.5rem', background: 'var(--md-accent-green)', color: 'white', fontSize: '0.7rem' }}>
            ● ONLINE
          </div>
        </div>

        <div className="header-center">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-box"
              placeholder="Jump to ticket ID or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="header-right">
          <button className="icon-btn" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀️" : "🌙"}
          </button>
          
          <div className="notif-wrapper" ref={notifRef} style={{ position: 'relative' }}>
            <button className="icon-btn" onClick={() => { setNotifOpen(!notifOpen); setNotifCount(0); }}>
              🔔
              {notifCount > 0 && <span className="badge">{notifCount}</span>}
            </button>

            {notifOpen && (
              <div className="notification-dropdown">
                <div className="notif-header">
                  <strong>Notifications</strong>
                  <span className="stat-label" style={{ fontSize: '0.6rem' }}>{notifications.length} New</span>
                </div>
                <div className="notif-list">
                  {notifications.length === 0 ? (
                    <div className="notif-empty">No new notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={`notif-item ${n.unread ? 'unread' : ''}`} onClick={() => handleNotifClick(n)}>
                        <div className="notif-icon">{n.icon}</div>
                        <div className="notif-content">
                          <div className="notif-title">{n.title}</div>
                          <div className="notif-desc">{n.desc.substring(0, 60)}...</div>
                          <div className="notif-time">{n.time}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="dropdown-divider" />
                <button 
                  className="dropdown-item" 
                  style={{ justifyContent: 'center', fontSize: '0.75rem', color: 'var(--md-primary)', fontWeight: '700' }}
                  onClick={() => { setAllNotifsOpen(true); setNotifOpen(false); }}
                >
                  View All Notifications
                </button>
              </div>
            )}
          </div>

          <div className="profile-wrapper" ref={profileRef}>
            <button className={`profile-trigger ${profileMenuOpen ? 'active' : ''}`} onClick={() => setProfileMenuOpen(!profileMenuOpen)}>
              <span className="profile-icon">👤</span>
              <span className="profile-name">Solver</span>
              <span className="dropdown-arrow">▼</span>
            </button>

            {profileMenuOpen && (
              <div className="profile-dropdown-menu">
                <div className="dropdown-header">
                  <strong>{user?.name || "Provider"}</strong>
                  <p>Support Specialist</p>
                </div>
                <div className="dropdown-divider" />
                <button className="dropdown-item" onClick={() => setAccountModalOpen(true)}>
                  <span className="item-icon">👤</span> My Profile
                </button>
                <button className="dropdown-item" onClick={() => setSettingsOpen(true)}>
                  <span className="item-icon">⚙️</span> Preferences
                </button>
                <div className="dropdown-divider" />
                <button className="dropdown-item logout-item" onClick={handleLogout}>
                  <span className="item-icon">🚪</span> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* SECTION 2: MAIN CONTENT (SOLVER WORKSPACE) */}
      <main className="main-content" style={{ padding: '1rem', height: 'calc(100vh - 72px)', overflow: 'hidden' }}>

        {/* LEFT COLUMN: THE QUEUE */}
        <aside className="content-left" style={{ flex: '0 0 350px', background: 'var(--md-card-bg)', borderRadius: '20px', border: '1px solid var(--md-border)', overflowY: 'auto' }}>
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--md-border)', position: 'sticky', top: 0, background: 'var(--md-card-bg)', zIndex: 5 }}>
            <h3 className="panel-title" style={{ marginBottom: '1rem' }}>Ticket Queue</h3>
            <div className="inline-filters" style={{ overflowX: 'auto', paddingBottom: '5px' }}>
              {["all", "pending", "in-progress", "resolved"].map(f => (
                <button key={f} className={`filter-pill ${statusFilter === f ? 'active' : ''}`} onClick={() => setStatusFilter(f)}>
                  {getStatusLabel(f)}
                </button>
              ))}
            </div>
          </div>

          <div className="queue-list">
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Queue...</div>
            ) : filteredQueue.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--md-text-muted)' }}>No tickets in queue.</div>
            ) : filteredQueue.map(t => (
              <div
                key={t.id}
                className={`queue-item ${selectedTicket?.id === t.id ? 'active' : ''}`}
                onClick={() => setSelectedTicket(t)}
                style={{
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid var(--md-border)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: selectedTicket?.id === t.id ? 'var(--md-primary-glow)' : 'transparent',
                  borderLeft: `4px solid ${getPriColor(t.priority)}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--md-primary)' }}>{t.ticketNumber || `TKT-${t.id}`}</span>
                  <span className={`status-badge ${getStatusBadge(t.status)}`} style={{ fontSize: '0.6rem', padding: '1px 6px' }}>{getStatusLabel(t.status)}</span>
                </div>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--md-text-muted)', marginTop: '4px' }}>Worker: {t.worker?.name || 'Unknown'}</div>
              </div>
            ))}
          </div>
        </aside>

        {/* CENTER COLUMN: THE WORKSPACE */}
        <section className="content-center" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
          {selectedTicket ? (
            <>
              <div className="info-panel" style={{ flex: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className="stat-label">CASE #{selectedTicket.ticketNumber || selectedTicket.id}</span>
                    <h2 className="panel-title" style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>{selectedTicket.title}</h2>
                  </div>
                  <div className="action-btns">
                    {selectedTicket.status === "pending" && (
                      <button className="primary-btn" onClick={() => updateTicketStatus(selectedTicket.id, "in-progress")} disabled={updatingId === selectedTicket.id}>
                        {updatingId === selectedTicket.id ? "..." : "Start Resolution"}
                      </button>
                    )}
                    {selectedTicket.status === "in-progress" && (
                      <>
                        <button className="secondary-btn" onClick={() => setResolutionModalOpen(true)}>
                          📅 Set Resolution Time
                        </button>
                        <button className="primary-btn" style={{ background: 'var(--md-accent-green)' }} onClick={handleMarkResolved} disabled={updatingId === selectedTicket.id}>
                          {updatingId === selectedTicket.id ? "..." : "Mark Resolved"}
                        </button>
                      </>
                    )}
                    <button className="secondary-btn" onClick={() => setGmailModalOpen(true)}>📧 Open Mail</button>
                    <button className="secondary-btn" onClick={() => setForwardModalOpen(true)}>Forward</button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flex: 1, overflow: 'hidden' }}>
                {/* Description & Details */}
                <div className="info-panel" style={{ flex: 1, overflowY: 'auto' }}>
                  <h3 className="settings-title">Problem Description</h3>
                  <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', lineHeight: '1.6' }}>
                    {selectedTicket.description}
                  </div>

                  <h3 className="settings-title" style={{ marginTop: '2rem' }}>Ticket Metadata</h3>
                  <div className="quick-stats-grid">
                    <div className="stat-box">
                      <div className="stat-label">Raised By</div>
                      <div style={{ fontWeight: '700' }}>{selectedTicket.worker?.name}</div>
                      <div style={{ fontSize: '0.7rem' }}>{selectedTicket.worker?.email}</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-label">Priority</div>
                      <div style={{ fontWeight: '700', color: getPriColor(selectedTicket.priority) }}>{selectedTicket.priority?.toUpperCase()}</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-label">Department</div>
                      <div style={{ fontWeight: '700' }}>IT Support</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-label">SLA Status</div>
                      <div style={{ fontWeight: '700', color: 'var(--md-accent-green)' }}>Within Limit</div>
                    </div>
                    {selectedTicket.expectedResolutionDate && (
                      <div className="stat-box" style={{ borderColor: 'var(--md-primary)' }}>
                        <div className="stat-label">Expected Resolution</div>
                        <div style={{ fontWeight: '700', color: 'var(--md-primary)' }}>
                          {new Date(selectedTicket.expectedResolutionDate).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* CENTER-RIGHT: QUICK ACTIONS PANEL (REPLACES SIMPLE ACTIVITY FEED) */}
                <ProviderQuickActionsPanel
                  tickets={tickets}
                  activities={activities}
                  onUpdate={fetchTickets}
                  onSelectTicket={setSelectedTicket}
                  lastRefreshed={lastRefreshed}
                  selectedTicketId={selectedTicket.id}
                  user={user}
                  updateStatus={updateTicketStatus}
                  openExtModal={() => setResolutionModalOpen(true)}
                />
              </div>
            </>
          ) : (
            <div className="info-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', opacity: 0.2 }}>🔍</div>
              <h2 className="panel-title">Select a Ticket to Work</h2>
              <p className="stat-label">Pick any item from the queue to start the resolution process.</p>
            </div>
          )}
        </section>

        {/* RIGHT COLUMN: PERFORMANCE & TOOLS */}
        <aside className="content-right" style={{ flex: '0 0 300px', background: 'var(--md-card-bg)', borderRadius: '20px', border: '1px solid var(--md-border)', padding: '1.25rem', overflowY: 'auto' }}>
          <h3 className="panel-title">Your Performance</h3>
          <div className="quick-stats-grid" style={{ marginBottom: '2rem' }}>
            <div className="stat-box" style={{ gridColumn: 'span 2' }}>
              <div className="stat-val">12</div>
              <div className="stat-label">Resolved Today</div>
              <div style={{ height: '4px', background: 'var(--md-border)', borderRadius: '2px', marginTop: '8px' }}>
                <div style={{ height: '100%', width: '75%', background: 'var(--md-accent-green)', borderRadius: '2px' }} />
              </div>
            </div>
          </div>

          <h3 className="settings-title">Knowledge Base</h3>
          <div className="alerts-list">
            {["Network Troubleshooting Guide", "Known Issue: VPN Latency", "Support SLAs Policy"].map(item => (
              <div key={item} className="alert-card" style={{ cursor: 'pointer', padding: '0.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600' }}>{item}</div>
              </div>
            ))}
          </div>

          <h3 className="panel-title" style={{ marginTop: '2.5rem' }}>Preferences</h3>
          <div className="info-panel" style={{ padding: '1rem', background: 'rgba(0,0,0,0.01)', borderStyle: 'dashed' }}>
            <div className="setting-row" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Sound Alerts</span>
              <input type="checkbox" checked={hdSettings.notificationSound} onChange={e => setHdSettings({ ...hdSettings, notificationSound: e.target.checked })} />
            </div>
            <div className="setting-row" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Show SLA</span>
              <input type="checkbox" checked={hdSettings.showSLA} onChange={e => setHdSettings({ ...hdSettings, showSLA: e.target.checked })} />
            </div>
            <button className="secondary-btn" style={{ width: '100%', fontSize: '0.75rem' }} onClick={() => setSettingsOpen(true)}>
              ⚙️ Advanced Settings
            </button>
          </div>

          <div style={{ marginTop: '2rem', background: 'var(--md-primary-glow)', padding: '1rem', borderRadius: '16px', border: '1px dashed var(--md-primary)' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: '800' }}>Need Help?</h4>
            <p style={{ fontSize: '0.7rem', color: 'var(--md-text-muted)' }}>Contact the lead manager for technical escalations.</p>
            <button className="secondary-btn" style={{ width: '100%', marginTop: '0.75rem', fontSize: '0.7rem' }}>Contact Manager</button>
          </div>
        </aside>

      </main>

      {/* MODALS */}
      {settingsOpen && (
        <SettingsModal
          setSettingsOpen={setSettingsOpen}
          hdSettings={hdSettings}
          setHdSettings={setHdSettings}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          announceChange={announceChange}
        />
      )}

      {accountModalOpen && (
        <AccountModal
          user={user}
          setAccountModalOpen={setAccountModalOpen}
        />
      )}

      {resolutionModalOpen && (
        <div className="modal-overlay" onClick={() => setResolutionModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h2 className="panel-title">📅 Set Resolution Time</h2>
            <p className="stat-label" style={{ marginBottom: '1.5rem' }}>Estimate when this issue will be resolved.</p>
            <input
              type="datetime-local"
              className="search-box"
              style={{ paddingLeft: '1rem', marginBottom: '1.5rem' }}
              value={resolutionDate}
              onChange={e => setResolutionDate(e.target.value)}
            />
            <div className="modal-actions">
              <button className="primary-btn" onClick={handleSetResolutionDate} disabled={updatingId || !resolutionDate}>
                Save Date
              </button>
              <button className="secondary-btn" onClick={() => setResolutionModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {summaryModalOpen && (
        <div className="modal-overlay" onClick={() => setSummaryModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
            <h2 className="panel-title">✅ Resolve Ticket</h2>
            <p className="stat-label" style={{ marginBottom: '1.5rem' }}>Add a summary of the resolution (optional email will be sent to the worker).</p>
            <textarea
              className="search-box"
              style={{ height: '150px', resize: 'none', padding: '1rem', marginBottom: '1.5rem' }}
              placeholder="Explain how the issue was fixed..."
              value={completionSummary}
              onChange={e => setCompletionSummary(e.target.value)}
            />
            <div className="modal-actions">
              <button className="primary-btn" style={{ background: 'var(--md-accent-green)' }} onClick={submitResolution} disabled={updatingId}>
                {selectedTicket.status === 'resolved' ? 'Send Email Only' : 'Complete & Send Email'}
              </button>
              <button className="secondary-btn" onClick={() => setSummaryModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <GmailModal
        isOpen={gmailModalOpen}
        onClose={() => setGmailModalOpen(false)}
        ticket={selectedTicket}
        currentUser={user}
        onSend={handleSendGmail}
      />

      <ForwardModal
        isOpen={forwardModalOpen}
        onClose={() => setForwardModalOpen(false)}
        onConfirm={onConfirmForward}
      />

      {allNotifsOpen && (
        <NotifOverlay 
          notifs={notifications} 
          onClose={() => setAllNotifsOpen(false)} 
          onNavigate={(n) => { handleNotifClick(n); setAllNotifsOpen(false); }}
        />
      )}
    </div>
  );
};

// --- PROVIDER QUICK ACTIONS PANEL COMPONENT ---

const ProviderQuickActionsPanel = ({ tickets, activities, onUpdate, onSelectTicket, lastRefreshed, selectedTicketId, user, updateStatus, openExtModal }) => {
  const [panelFilter, setPanelFilter] = useState("all");
  const [toast, setToast] = useState(null);
  const [timeValue, setTimeValue] = useState("");

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getWaitingTime = (updatedAt) => {
    if (!updatedAt) return "N/A";
    const mins = Math.floor((new Date() - new Date(updatedAt)) / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m ago`;
  };

  const isStale = (updatedAt) => {
    if (!updatedAt) return false;
    return (new Date() - new Date(updatedAt)) > 60 * 60 * 1000; // 1 hour
  };

  // Section 1 logic
  const assignedTickets = tickets.filter(t => ['pending', 'in-progress', 'on-hold'].includes(t.status.toLowerCase()));
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  const sortedAssigned = [...assignedTickets].sort((a, b) => priorityOrder[a.priority.toLowerCase()] - priorityOrder[b.priority.toLowerCase()]);

  // Section 2 logic (Overview)
  const completedToday = tickets.filter(t => t.status.toLowerCase() === 'resolved' && new Date(t.updatedAt).toDateString() === new Date().toDateString()).length;
  const workload = Math.min(100, (assignedTickets.length / 8) * 100);

  // Section 3 logic (Blockers)
  const blockers = tickets.filter(t => t.priority === 'urgent' && t.status === 'in-progress');

  const handleQuickAction = async (action, ticketId) => {
    if (action === 'Next Ticket') {
      const next = tickets.find(t => t.status === 'pending');
      if (next) {
        onSelectTicket(next);
        await updateStatus(next.id, 'in-progress');
        showToast("Started your next ticket!", "success");
      } else {
        showToast("No pending tickets available.", "warn");
      }
      return;
    }

    if (action === 'Log Time') {
      if (!selectedTicketId) {
        showToast("Please select a ticket first.", "warn");
        return;
      }
      if (!timeValue) {
        showToast("Enter time first.", "warn");
        return;
      }
      showToast(`Logged ${timeValue} to ticket.`, "success");
      setTimeValue("");
      return;
    }

    if (action === 'Request Ext') {
      if (selectedTicketId) {
        openExtModal();
      } else {
        showToast("Please select a ticket first.", "warn");
      }
      return;
    }

    // Replace Confirm for other actions
    if (action === 'Mark Complete' && ticketId) {
      await updateStatus(ticketId, 'resolved');
      showToast("Ticket marked as resolved!", "success");
    } else if (action === 'Add Note') {
      showToast("Note logic triggered (Mock).", "info");
    } else if (action === 'Escalate') {
      showToast("Manager notified for escalation.", "warn");
    } else if (action === 'Resolve Blocker') {
      showToast("Blocker resolved locally.", "success");
    }

    onUpdate();
  };

  const isNew = (createdAt) => {
    if (!createdAt) return false;
    return (new Date() - new Date(createdAt)) < 5 * 60 * 1000; // 5 minutes
  };

  return (
    <div className="info-panel qa-panel" style={{ width: '350px', maxHeight: '100%', display: 'flex', flexDirection: 'column', float: 'right', position: 'relative' }}>
      <h3 className="panel-title">⚡ Solver Toolbox</h3>

      {toast && (
        <div className={`qa-toast ${toast.type}`} style={{
          position: 'absolute',
          top: '3.5rem',
          left: '1rem',
          right: '1rem',
          padding: '0.6rem',
          borderRadius: '8px',
          fontSize: '0.75rem',
          fontWeight: '700',
          zIndex: 10,
          background: toast.type === 'success' ? 'var(--md-accent-green)' : (toast.type === 'warn' ? 'var(--md-accent-red)' : 'var(--md-primary)'),
          color: 'white',
          textAlign: 'center',
          boxShadow: 'var(--md-shadow-md)',
          animation: 'slideInDown 0.3s ease-out'
        }}>
          {toast.message}
        </div>
      )}

      <div className="qa-scroll-area" style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>

        {/* SECTION 2: WORKLOAD OVERVIEW (Up top for context) */}
        <div className="qa-section">
          <div className="qa-section-header">WORKLOAD STATUS</div>
          <div className="quick-stats-grid" style={{ marginBottom: '1rem' }}>
            <div className="stat-box">
              <div className="stat-val" style={{ fontSize: '1.2rem' }}>{assignedTickets.length}</div>
              <div className="stat-label">Assigned</div>
            </div>
            <div className="stat-box">
              <div className="stat-val" style={{ fontSize: '1.2rem', color: 'var(--md-accent-green)' }}>{completedToday}</div>
              <div className="stat-label">Done Today</div>
            </div>
          </div>
          <div className="workload-info">
            <span style={{ fontSize: '0.75rem' }}>Capacity used: {Math.round(workload)}%</span>
            <span style={{ fontSize: '0.75rem', color: workload > 80 ? 'var(--md-accent-red)' : 'var(--md-accent-green)' }}>
              {workload > 80 ? '⚠️ Critical' : '✅ Stable'}
            </span>
          </div>
          <div className="workload-bar-bg" style={{ marginTop: '8px' }}>
            <div className="workload-bar-fill" style={{
              width: `${workload}%`,
              background: workload > 80 ? 'var(--md-accent-red)' : (workload > 50 ? 'var(--md-accent-amber)' : 'var(--md-accent-green)')
            }}></div>
          </div>
        </div>

        {/* SECTION 1: MY ASSIGNED TICKETS */}
        <div className="qa-section">
          <div className="qa-section-header">IMMEDIATE ATTENTION</div>
          {sortedAssigned.slice(0, 3).map(t => (
            <div key={t.id} className={`qa-item-card ${selectedTicketId === t.id ? 'active-border' : ''}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <span style={{ fontWeight: '800', color: 'var(--md-primary)', fontSize: '0.75rem' }}>#{t.ticketNumber}</span>
                  {isNew(t.createdAt) && <span style={{ background: 'var(--md-primary)', color: 'white', fontSize: '8px', padding: '1px 4px', borderRadius: '4px', fontWeight: 'bold' }}>NEW</span>}
                </div>
                <span className="status-badge" style={{ fontSize: '10px', background: t.priority === 'urgent' ? 'var(--md-accent-red)' : 'var(--md-border)', color: t.priority === 'urgent' ? 'white' : 'inherit' }}>
                  {t.priority?.toUpperCase()}
                </span>
              </div>
              <div className="qa-item-title">{t.title}</div>
              <div className="qa-item-meta">
                <span style={{ color: isStale(t.updatedAt) ? 'var(--md-accent-red)' : 'inherit' }}>
                  🕒 {getWaitingTime(t.updatedAt)}
                </span>
                <span>👤 {t.worker?.name}</span>
              </div>
              <div className="qa-item-actions">
                <button onClick={() => onSelectTicket(t)}>View</button>
                <button onClick={() => handleQuickAction('Add Note', t.id)}>Note</button>
                <button className="primary-btn-mini" onClick={() => handleQuickAction('Mark Complete', t.id)}>Done</button>
              </div>
            </div>
          ))}
        </div>

        {/* SECTION 3: ESCALATION & BLOCKERS */}
        {blockers.length > 0 && (
          <div className="qa-section">
            <div className="qa-section-header sla-header">🚨 ESCALATION & BLOCKERS</div>
            {blockers.map(t => (
              <div key={t.id} className="sla-warning-card" style={{ padding: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>#{t.ticketNumber} - {t.priority?.toUpperCase()}</div>
                <div style={{ fontSize: '0.7rem', margin: '4px 0', color: 'var(--md-text-muted)' }}>
                  Status: <span style={{ color: 'var(--md-accent-red)' }}>Needs Attention</span>
                </div>
                <div className="qa-item-actions" style={{ marginTop: '8px' }}>
                  <button className="warn-btn" style={{ fontSize: '0.6rem' }} onClick={() => handleQuickAction('Escalate', t.id)}>🚩 Escalate</button>
                  <button className="resolve-btn" style={{ fontSize: '0.6rem', border: '1px solid #bbf7d0' }} onClick={() => handleQuickAction('Resolve Blocker', t.id)}>Fix Blocker</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SECTION 4: QUICK NOTES & UPDATES */}
        <div className="qa-section">
          <div className="qa-section-header">LATEST UPDATES</div>
          {activities.length === 0 ? (
            <div style={{ fontSize: '0.7rem', color: 'var(--md-text-muted)', textAlign: 'center' }}>No recent activities.</div>
          ) : activities.slice(0, 3).map(act => (
            <div key={act.id} className="note-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: '700', fontSize: '0.75rem' }}>{act.userName || 'System'}</span>
                <span className="stat-label" style={{ textTransform: 'none' }}>{new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div style={{ fontSize: '0.75rem', lineHeight: '1.4', fontStyle: 'italic', color: 'var(--md-text-main)' }}>
                {act.action}: "{act.details && act.details.length > 50 ? act.details.substring(0, 50) + '...' : act.details}"
              </div>
              <button className="text-link-btn" onClick={() => handleQuickAction('Reply to Manager', act.id)}>Reply to Manager</button>
            </div>
          ))}
        </div>

        {/* SECTION 5: ONE-CLICK ACTIONS */}
        <div className="qa-section">
          <div className="qa-section-header">FAST ACTIONS</div>
          <div className="bulk-actions-grid">
            <button className="bulk-btn" onClick={() => handleQuickAction('Next Ticket', null)}>Start Next</button>
            <div className="inline-log-group" style={{ display: 'flex', gap: '4px' }}>
              <input 
                type="text" 
                placeholder="e.g. 45m" 
                className="bulk-btn" 
                style={{ flex: 1, paddingLeft: '8px', cursor: 'text' }}
                value={timeValue}
                onChange={e => setTimeValue(e.target.value)}
              />
              <button className="bulk-btn" style={{ background: 'var(--md-primary)', color: 'white', border: 'none' }} onClick={() => handleQuickAction('Log Time', null)}>Log</button>
            </div>
            <button className="bulk-btn" style={{ color: 'var(--md-accent-red)' }} onClick={() => handleQuickAction('Request Ext', null)}>Request Ext.</button>
            <button className="bulk-btn" onClick={onUpdate}>🔄 Sync</button>
          </div>
        </div>

      </div>

      <div className="qa-footer">
        Dashboard Synced: {lastRefreshed.toLocaleTimeString()}
      </div>
    </div>
  );
};

const SettingsModal = ({ setSettingsOpen, hdSettings, setHdSettings, darkMode, setDarkMode, announceChange }) => (
  <div className="modal-overlay" onClick={() => setSettingsOpen(false)}>
    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
      <h2 className="panel-title">Solver Preferences</h2>

      <div className="settings-grid-scroll">
        <div className="settings-section">
          <h3 className="settings-title">Automation & Alerts</h3>
          <div className="setting-row">
            <div className="setting-label-box">
              <strong>Auto-Refresh Control</strong>
              <p>Update assigned tickets every minute</p>
            </div>
            <input type="checkbox" checked={hdSettings.autoRefresh} onChange={e => setHdSettings({ ...hdSettings, autoRefresh: e.target.checked })} />
          </div>
          {hdSettings.autoRefresh && (
            <div className="setting-row">
              <label>Refresh Rate (Seconds)</label>
              <input type="number" className="search-box" style={{ width: '100px', paddingLeft: '0.5rem' }} value={hdSettings.refreshInterval} onChange={e => setHdSettings({ ...hdSettings, refreshInterval: Number(e.target.value) })} />
            </div>
          )}
          <div className="setting-row">
            <div className="setting-label-box">
              <strong>New Assignment Sounds</strong>
              <p>Play sound when manager assigns a ticket</p>
            </div>
            <input type="checkbox" checked={hdSettings.notificationSound} onChange={e => setHdSettings({ ...hdSettings, notificationSound: e.target.checked })} />
          </div>
        </div>

        <div className="settings-section">
          <h3 className="settings-title">Workspace UI</h3>
          <div className="setting-row">
            <label>Dashboard Theme</label>
            <div className="inline-filters">
              <button className={`filter-pill ${!darkMode ? 'active' : ''}`} onClick={() => setDarkMode(false)}>Light</button>
              <button className={`filter-pill ${darkMode ? 'active' : ''}`} onClick={() => setDarkMode(true)}>Dark</button>
            </div>
          </div>
          <div className="setting-row">
            <label>SLA Visualization</label>
            <input type="checkbox" checked={hdSettings.showSLA} onChange={e => setHdSettings({ ...hdSettings, showSLA: e.target.checked })} />
          </div>
          <div className="setting-row">
            <label>Auto-select First Ticket</label>
            <input type="checkbox" checked={hdSettings.autoSelectNew} onChange={e => setHdSettings({ ...hdSettings, autoSelectNew: e.target.checked })} />
          </div>
        </div>
      </div>

      <div className="modal-actions" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--md-border)', paddingTop: '1.5rem' }}>
        <button className="secondary-btn" onClick={() => setSettingsOpen(false)}>Cancel</button>
        <button className="primary-btn" onClick={() => { announceChange("Preferences Saved"); setSettingsOpen(false); }}>Save Changes</button>
      </div>
    </div>
  </div>
);

const AccountModal = ({ user, setAccountModalOpen }) => (
  <div className="modal-overlay" onClick={() => setAccountModalOpen(false)}>
    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
      <h2 className="panel-title">Your Account</h2>
      <div className="info-row">
        <span className="info-label">Name</span>
        <span className="info-value">{user?.name}</span>
      </div>
      <div className="info-row">
        <span className="info-label">ID</span>
        <span className="info-value">{user?.id}</span>
      </div>
      <div className="modal-actions">
        <button className="primary-btn" onClick={() => setAccountModalOpen(false)}>Close</button>
      </div>
    </div>
  </div>
);

const NotifOverlay = ({ notifs, onClose, onNavigate }) => (
  <div className="modal-overlay" onClick={onClose} style={{ backdropFilter: 'blur(8px)' }}>
    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="panel-title">All Notifications</h2>
        <button className="secondary-btn" onClick={onClose}>Close</button>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
        {notifs.length === 0 ? (
          <div className="notif-empty">No notifications history found.</div>
        ) : (
          notifs.map(n => (
            <div key={n.id} className="notif-item" style={{ borderRadius: '12px', marginBottom: '0.5rem', background: 'rgba(0,0,0,0.02)' }} onClick={() => onNavigate(n)}>
              <div className="notif-icon">{n.icon}</div>
              <div className="notif-content">
                <div className="notif-title" style={{ fontSize: '1rem' }}>{n.title}</div>
                <div className="notif-desc">{n.desc}</div>
                <div className="notif-time" style={{ fontWeight: 'bold', color: 'var(--md-primary)' }}>{n.time}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

export default ProviderDashboard;
