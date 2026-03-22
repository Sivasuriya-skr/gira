import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ticketAPI, userAPI } from "../services/api";
import Icon8 from "../components/Icon8";
import GmailModal from "../components/GmailModal";
import "./WorkerDashboard.css";

const WorkerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // --- DATA STATE ---
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);

  // --- FILTER & SEARCH STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "All",
    priority: "All",
  });

  // --- UI STATE ---
  const [darkMode, setDarkMode] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(2);
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // --- MODAL & DROPDOWN STATE ---
  const [detailModal, setDetailModal] = useState(null); // Detailed object
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [gmailModalOpen, setGmailModalOpen] = useState(false);
  const profileRef = useRef(null);

  // --- CREATE TICKET STATE ---
  const [newTicket, setNewTicket] = useState({ title: "", description: "", priority: "medium" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // --- HELPDESK SETTINGS STATE ---
  const [hdSettings, setHdSettings] = useState({
    autoRefresh: true,
    refreshInterval: 30,
    newTicketSound: true,
    emailAlerts: true
  });

  // --- ALERTS & ACTIVITY STATE ---
  const [activities, setActivities] = useState([
    { id: 1, type: "ticket", action: "TKT-004 Assigned to Sathi", time: "2 min ago", icon: "🎫" },
    { id: 2, type: "status", action: "TKT-002 Resolved", time: "1 hour ago", icon: "✅" },
  ]);

  const announceChange = (message, priority = "polite") => {
    console.log(`[Announce ${priority}]: ${message}`);
  };

  // --- LOAD DATA ---
  const fetchTickets = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setApiError("");
    announceChange("Loading your tickets...");
    try {
      const res = await ticketAPI.getByWorker(user.id);
      setTickets(res.data || []);
      announceChange("Tickets loaded successfully");
    } catch (err) {
      setApiError(err.message || "Failed to load tickets");
      announceChange("Error loading tickets", "assertive");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // --- DARK MODE PERSISTENCE ---
  useEffect(() => {
    document.documentElement.classList.toggle("md-dark", darkMode);
    return () => document.documentElement.classList.remove("md-dark");
  }, [darkMode]);

  // --- CLICK OUTSIDE HANDLERS ---
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // --- AUTO REFRESH ---
  useEffect(() => {
    let interval;
    if (hdSettings.autoRefresh) {
      interval = setInterval(() => {
        fetchTickets();
      }, hdSettings.refreshInterval * 1000);
    }
    return () => clearInterval(interval);
  }, [hdSettings.autoRefresh, hdSettings.refreshInterval, fetchTickets]);

  // --- SORT TABLE ---
  const sortedData = useMemo(() => {
    let sortableItems = [...tickets];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [tickets, sortConfig]);

  // --- SEARCH & FILTER ---
  const filteredData = useMemo(() => {
    return sortedData.filter(item => {
      const matchesSearch =
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.ticketNumber || `TKT-${item.id}`).toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filters.status === "All" || item.status === filters.status;
      const matchesPriority = filters.priority === "All" || item.priority === filters.priority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [sortedData, searchQuery, filters]);

  // --- PAGINATE TABLE ---
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // --- ROW SELECTION ---
  const toggleRowSelection = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === paginatedData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedData.map(i => i.id));
    }
  };

  // --- CREATE TICKET HANDLER ---
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
        workerId: user.id
      });
      setNewTicket({ title: "", description: "", priority: "medium" });
      setCreateModalOpen(false);
      fetchTickets();
      setActivities([{
        id: Date.now(),
        type: "ticket",
        action: `Raised New Ticket: ${newTicket.title}`,
        time: "Just now",
        icon: "➕"
      }, ...activities]);
      announceChange("Ticket created successfully");
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // --- HANDLERS ---
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleExport = () => {
    announceChange("Exporting your ticket history...");
    alert("Ticket history exported as CSV (Simulation)");
  };

  const handleSendGmail = async ({ to, subject, body }) => {
    if (!detailModal) return;
    try {
      await ticketAPI.sendEmail(detailModal.id, { to, subject, body });
      announceChange("Email sent successfully!");
    } catch (err) {
      alert(err.message);
    }
  };

  // --- HELPERS ---
  const getStatusBadge = (s) => ({ pending: "status-offline", "in-progress": "status-leave", resolved: "status-active", closed: "status-offline" }[s] || "status-offline");
  const getStatusLabel = (s) => ({ pending: "Open", "in-progress": "In Progress", resolved: "Resolved", closed: "Closed" }[s] || s);
  const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—";

// --- JOURNEY STEP ---
  const getJourneyStep = () => {
    if (tickets.some(t => t.status === "resolved" || t.status === "closed")) return 4;
    if (tickets.some(t => t.status === "in-progress")) return 3;
    if (tickets.some(t => t.provider)) return 2;
    if (tickets.length > 0) return 1;
    return 0;
  };
  const journeyStep = getJourneyStep();
  const JOURNEY_STEPS = ["Submitted", "Assigned", "In Progress", "Testing", "Resolved"];

  return (
    <div className={`dashboard-root ${darkMode ? "md-dark" : ""}`}>
      {/* SECTION 1: TOP HEADER */}
      <header className="top-header">
        <div className="header-left">
          <div className="branding">
            <Icon8 name="engineering" size={32} color={darkMode ? "6366f1" : "4f46e5"} />
            <span className="logo-font">gira</span>
          </div>
        </div>

        <div className="header-center">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-box"
              placeholder="Search your tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search tickets"
            />
          </div>
          <div className="inline-filters">
            <select
              className="filter-pill"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="All">All Statuses</option>
              <option value="pending">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="header-right">
          <button className="icon-btn" onClick={() => setDarkMode(!darkMode)} title="Toggle Dark Mode">
            {darkMode ? "☀️" : "🌙"}
          </button>
          <button className="icon-btn" title="Notifications" onClick={() => setNotifOpen(!notifOpen)}>
            🔔
            {notifCount > 0 && <span className="badge">{notifCount}</span>}
          </button>
          
          <div className="profile-wrapper" ref={profileRef}>
            <button
              className={`profile-trigger ${profileMenuOpen ? 'active' : ''}`}
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            >
              <span className="profile-icon">👤</span>
              <span className="profile-name">Worker</span>
              <span className="dropdown-arrow">▼</span>
            </button>

            {profileMenuOpen && (
              <div className="profile-dropdown-menu">
                <div className="dropdown-header">
                  <strong>Manage Profile</strong>
                  <p>{user?.email || "worker@gira.com"}</p>
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={() => { setAccountModalOpen(true); setProfileMenuOpen(false); }}>
                  <span className="item-icon">👤</span> My Profile
                </button>
                <button className="dropdown-item" onClick={() => { setAccountModalOpen(true); setProfileMenuOpen(false); }}>
                  <span className="item-icon">💳</span> Account Details
                </button>
                <button className="dropdown-item" onClick={() => { setSettingsOpen(true); setProfileMenuOpen(false); }}>
                  <span className="item-icon">⚙️</span> Settings
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout-item" onClick={handleLogout}>
                  <span className="item-icon">🚪</span> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* SECTION 2: MAIN CONTENT */}
      <main className="main-content">
        <div className="content-left">
          <div className="table-tabs">
            <button className="tab-btn active">My Tickets</button>
            {selectedItems.length > 0 && (
              <div className="filter-pill active" style={{ marginLeft: 'auto', alignSelf: 'center', fontSize: '0.75rem' }}>
                {selectedItems.length} Selected
                <button onClick={() => setSelectedItems([])} style={{ background: 'none', border: 'none', color: 'white', marginLeft: '8px', cursor: 'pointer' }}>✕</button>
              </div>
            )}
          </div>

          <div className="data-table-card">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input type="checkbox" checked={selectedItems.length === paginatedData.length && paginatedData.length > 0} onChange={toggleSelectAll} />
                    </th>
                    <th onClick={() => setSortConfig({ key: "ticketNumber", direction: sortConfig.direction === "asc" ? "desc" : "asc" })} style={{ cursor: 'pointer' }}>
                      Ticket ID {sortConfig.key === "ticketNumber" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>Loading tickets...</td></tr>
                  ) : paginatedData.length === 0 ? (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>No tickets found</td></tr>
                  ) : paginatedData.map(item => (
                    <tr key={item.id} style={{ cursor: 'pointer' }} onClick={() => setDetailModal(item)}>
                      <td onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={selectedItems.includes(item.id)} onChange={() => toggleRowSelection(item.id)} />
                      </td>
                      <td style={{ fontWeight: '700', color: 'var(--md-primary)' }}>{item.ticketNumber || `TKT-${item.id}`}</td>
                      <td>
                        <div style={{ fontWeight: '600' }}>{item.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--md-text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</div>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusBadge(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </span>
                      </td>
                      <td>
                        <span style={{ 
                          color: item.priority === 'urgent' ? 'var(--md-accent-red)' : item.priority === 'high' ? 'var(--md-accent-amber)' : 'inherit',
                          fontWeight: '600'
                        }}>
                          {item.priority}
                        </span>
                      </td>
                      <td>{fmtDate(item.createdAt)}</td>
                         <td onClick={e => e.stopPropagation()}>
                          <div className="action-btns">
                            <button className="icon-btn" onClick={() => setDetailModal(item)} title="View Detail">👁️</button>
                            <button className="icon-btn" onClick={() => { setDetailModal(item); setGmailModalOpen(true); }} title="Mail Helpdesk">📧</button>
                          </div>
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--md-border)' }}>
              <div className="stat-label">Page {currentPage} of {totalPages || 1}</div>
              <div className="action-btns">
                <button className="secondary-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)}>Prev</button>
                <button className="secondary-btn" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(c => c + 1)}>Next</button>
              </div>
            </div>
          </div>

          {/* COMPLAINT JOURNEY (Ported from Worker) */}
          <section className="info-panel" style={{ marginTop: '1.5rem' }}>
            <h3 className="panel-title">Your Response Journey</h3>
            <div className="wd-journey-track" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', position: 'relative' }}>
              {JOURNEY_STEPS.map((name, idx) => {
                const stepNum = idx + 1;
                const isDone = journeyStep > stepNum;
                const isActive = journeyStep === stepNum;
                return (
                  <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, zIndex: 2 }}>
                    <div className={`timeline-dot ${isDone || isActive ? '' : 'inactive'}`} style={{ 
                      position: 'static', 
                      background: isDone ? 'var(--md-accent-green)' : isActive ? 'var(--md-primary)' : 'var(--md-border)',
                      width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                      border: 'none', transition: 'all 0.3s'
                    }}>
                      {isDone ? "✓" : stepNum}
                    </div>
                    <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 'bold', color: isActive ? 'var(--md-primary)' : 'var(--md-text-muted)' }}>{name}</div>
                  </div>
                );
              })}
              <div style={{ position: 'absolute', top: '15px', left: '10%', right: '10%', height: '2px', background: 'var(--md-border)', zIndex: 1 }} />
              <div style={{ position: 'absolute', top: '15px', left: '10%', width: `${Math.min(journeyStep - 1, 4) * 20}%`, height: '2px', background: 'var(--md-primary)', zIndex: 1, transition: 'width 0.5s ease' }} />
            </div>
          </section>
        </div>

        <div className="content-right">
          <section className="info-panel">
            <h3 className="panel-title">Quick Stats</h3>
            <div className="quick-stats-grid">
              <div className="stat-box">
                <div className="stat-val">{tickets.length}</div>
                <div className="stat-label">Total Tickets</div>
              </div>
              <div className="stat-box">
                <div className="stat-val" style={{ color: 'var(--md-accent-amber)' }}>{tickets.filter(t => t.status === "pending").length}</div>
                <div className="stat-label">Open</div>
              </div>
              <div className="stat-box">
                <div className="stat-val" style={{ color: 'var(--md-primary)' }}>{tickets.filter(t => t.status === "in-progress").length}</div>
                <div className="stat-label">In Progress</div>
              </div>
              <div className="stat-box">
                <div className="stat-val" style={{ color: 'var(--md-accent-green)' }}>{tickets.filter(t => t.status === "resolved").length}</div>
                <div className="stat-label">Resolved</div>
              </div>
            </div>
          </section>

          <section className="info-panel">
            <h3 className="panel-title">Recent Activity</h3>
            <div className="timeline">
              {activities.map(act => (
                <div key={act.id} className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <div className="timeline-time">{act.time}</div>
                    <div style={{ fontWeight: '600' }}>{act.icon} {act.action}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="info-panel">
            <h3 className="panel-title">Knowledge Base</h3>
            <div className="alerts-list">
              {["How to file a clear ticket", "Attaching screenshots", "Escalation paths"].map(item => (
                <div key={item} className="alert-card" style={{ cursor: 'pointer' }}>
                  <div className="alert-info">
                    <div className="alert-msg">{item}</div>
                  </div>
                  <span>→</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* SECTION 3: BOTTOM ACTION BAR */}
      <footer className="bottom-action-bar">
        <div className="stat-label" style={{ borderRight: '1px solid var(--md-border)', paddingRight: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem' }}>🎫</span>
          <strong>{selectedItems.length}</strong> selected
        </div>
        <div className="action-btns">
          <button className="primary-btn" onClick={() => setCreateModalOpen(true)}>
            <span>➕</span> Raise Ticket
          </button>
          <button className="secondary-btn" onClick={handleExport}>
            <span>📥</span> Export Data
          </button>
          <button className="secondary-btn" onClick={() => setSettingsOpen(true)} title="Settings">
            <span>⚙️</span>
          </button>
        </div>
      </footer>

      {/* MODALS */}
      {detailModal && (
        <DetailModal
          item={detailModal}
          onClose={() => setDetailModal(null)}
          getStatusBadge={getStatusBadge}
          getStatusLabel={getStatusLabel}
          fmtDate={fmtDate}
          setGmailModalOpen={setGmailModalOpen}
        />
      )}

      {createModalOpen && (
        <CreateTicketModal
          newTicket={newTicket}
          setNewTicket={setNewTicket}
          handleNewTicket={handleNewTicket}
          setCreateModalOpen={setCreateModalOpen}
          formError={formError}
          submitting={submitting}
        />
      )}

      {settingsOpen && (
        <SettingsModal
          setSettingsOpen={setSettingsOpen}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          hdSettings={hdSettings}
          setHdSettings={setHdSettings}
          announceChange={announceChange}
        />
      )}

      {accountModalOpen && (
        <AccountModal
          user={user}
          setAccountModalOpen={setAccountModalOpen}
        />
      )}

      <GmailModal
        isOpen={gmailModalOpen}
        onClose={() => setGmailModalOpen(false)}
        ticket={detailModal}
        currentUser={user}
        onSend={handleSendGmail}
      />
    </div>
  );
};

// --- MODAL COMPONENTS (Moved outside to prevent re-mounting) ---

const DetailModal = ({ item, onClose, getStatusBadge, getStatusLabel, fmtDate, setGmailModalOpen }) => (
  <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
      <div className="modal-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className={`status-badge ${getStatusBadge(item.status)}`} style={{ padding: '0.5rem', borderRadius: '12px' }}>
            <Icon8 name="ticket" size={32} />
          </div>
          <div>
            <h2 className="panel-title" style={{ marginBottom: 0 }}>{item.ticketNumber || `TKT-${item.id}`}</h2>
            <p className="stat-label">{getStatusLabel(item.status)} • Priority: {item.priority}</p>
          </div>
        </div>
        <button onClick={onClose} className="icon-btn">✕</button>
      </div>
      <div style={{ marginTop: '1.5rem', minHeight: '150px' }}>
        <h4 className="settings-title">Description</h4>
        <p style={{ color: 'var(--md-text-main)', lineHeight: '1.6' }}>{item.description}</p>
        
        <div className="quick-stats-grid" style={{ marginTop: '2rem' }}>
          <div className="stat-box">
            <div className="stat-label">Assigned Provider</div>
            <div style={{ fontWeight: '600' }}>{item.provider?.name || "Unassigned"}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Created At</div>
            <div style={{ fontWeight: '600' }}>{fmtDate(item.createdAt)}</div>
          </div>
        </div>
      </div>
       <div className="modal-actions" style={{ marginTop: '2rem', borderTop: '1px solid var(--md-border)', paddingTop: '1.5rem' }}>
        <button className="primary-btn" onClick={() => setGmailModalOpen(true)}>
          <span>📧</span> Mail Helpdesk
        </button>
        <button className="secondary-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  </div>
);

const CreateTicketModal = ({ newTicket, setNewTicket, handleNewTicket, setCreateModalOpen, formError, submitting }) => (
  <div className="modal-overlay" onClick={() => setCreateModalOpen(false)}>
    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
      <div className="modal-header">
        <h2 className="panel-title">➕ Raise New Ticket</h2>
        <button onClick={() => setCreateModalOpen(false)} className="icon-btn">✕</button>
      </div>
      <form onSubmit={handleNewTicket} style={{ marginTop: '1rem' }}>
        {formError && <div className="alert-card" style={{ marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'var(--md-accent-red)' }}>{formError}</div>}
        <div style={{ marginBottom: '1rem' }}>
          <label className="stat-label">Ticket Title</label>
          <input
            className="search-box"
            style={{ paddingLeft: '1rem' }}
            placeholder="e.g. Broken Laptop Screen"
            value={newTicket.title}
            onChange={e => setNewTicket({...newTicket, title: e.target.value})}
            required
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label className="stat-label">Description</label>
          <textarea
            className="search-box"
            style={{ height: '100px', resize: 'none', paddingLeft: '1rem', paddingTop: '0.75rem' }}
            placeholder="Describe the issue in detail..."
            value={newTicket.description}
            onChange={e => setNewTicket({...newTicket, description: e.target.value})}
            required
          />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="stat-label">Priority</label>
          <div className="inline-filters" style={{ marginTop: '0.5rem' }}>
            {["low", "medium", "high", "urgent"].map(p => (
              <button
                key={p}
                type="button"
                className={`filter-pill ${newTicket.priority === p ? 'active' : ''}`}
                onClick={() => setNewTicket({...newTicket, priority: p})}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="modal-actions">
          <button type="submit" className="primary-btn" disabled={submitting}>
            {submitting ? "Creating..." : "Create Ticket"}
          </button>
          <button type="button" className="secondary-btn" onClick={() => setCreateModalOpen(false)}>Cancel</button>
        </div>
      </form>
    </div>
  </div>
);

const AccountModal = ({ user, setAccountModalOpen }) => (
  <div className="modal-overlay" onClick={() => setAccountModalOpen(false)}>
    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
      <div className="modal-header">
        <h2 className="panel-title">👤 Account Details</h2>
        <button onClick={() => setAccountModalOpen(false)} className="icon-btn">✕</button>
      </div>
      <div className="settings-panel" style={{ marginTop: '1rem' }}>
        <div className="info-row">
          <span className="info-label">Display Name</span>
          <span className="info-value">{user?.name || "Worker User"}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Email Address</span>
          <span className="info-value">{user?.email || "worker@gira.com"}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Role</span>
          <span className="info-value">Field Worker</span>
        </div>
        <div className="info-row">
          <span className="info-label">Joined</span>
          <span className="info-value">Feb 2024</span>
        </div>
      </div>
      <div className="modal-actions" style={{ marginTop: '2rem' }}>
        <button className="primary-btn" onClick={() => setAccountModalOpen(false)}>Close</button>
      </div>
    </div>
  </div>
);

const SettingsModal = ({ setSettingsOpen, darkMode, setDarkMode, itemsPerPage, setItemsPerPage, hdSettings, setHdSettings, announceChange }) => (
  <div className="modal-overlay" onClick={() => setSettingsOpen(false)}>
    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
      <div className="modal-header">
        <h2 className="panel-title">⚙️ Dashboard Settings</h2>
        <button onClick={() => setSettingsOpen(false)} className="icon-btn">✕</button>
      </div>
      <div className="settings-grid-scroll">
        <div className="settings-section">
          <h3 className="settings-title">General Preferences</h3>
          <div className="setting-row">
            <label>Dashboard Theme</label>
            <div className="inline-filters">
              <button className={`filter-pill ${!darkMode ? 'active' : ''}`} onClick={() => setDarkMode(false)}>Light</button>
              <button className={`filter-pill ${darkMode ? 'active' : ''}`} onClick={() => setDarkMode(true)}>Dark</button>
            </div>
          </div>
          <div className="setting-row">
            <label>Items Per Page</label>
            <select className="search-box" value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} style={{ width: '120px', paddingLeft: '0.5rem' }}>
              <option value={10}>10 Items</option>
              <option value={20}>20 Items</option>
              <option value={50}>50 Items</option>
            </select>
          </div>
        </div>
        <div className="settings-section">
          <h3 className="settings-title">Notifications</h3>
          <div className="setting-row">
            <div className="setting-label-box">
              <strong>Auto-Refresh</strong>
              <p>Keep ticket status updated</p>
            </div>
            <input type="checkbox" checked={hdSettings.autoRefresh} onChange={e => setHdSettings({...hdSettings, autoRefresh: e.target.checked})} />
          </div>
        </div>
      </div>
      <div className="modal-actions" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--md-border)', paddingTop: '1.5rem' }}>
        <button className="secondary-btn" onClick={() => setSettingsOpen(false)}>Cancel</button>
        <button className="primary-btn" onClick={() => { announceChange("Settings Saved"); setSettingsOpen(false); }}>Save Changes</button>
      </div>
    </div>
  </div>
);

export default WorkerDashboard;
