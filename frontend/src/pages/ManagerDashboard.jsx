import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ticketAPI, userAPI } from "../services/api";
import Icon8 from "../components/Icon8";
import AssignTicketModal from "../components/AssignTicketModal";
import GmailModal from "../components/GmailModal";
import "./ManagerDashboard.css";

const ManagerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // --- DATA STATE ---
  const [activeTab, setActiveTab] = useState("tickets"); // "providers" | "workers" | "tickets"
  const [data, setData] = useState([]);
  const [tickets, setTickets] = useState([]); // All tickets for management
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);

  // --- FILTER & SEARCH STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "All",
    location: "",
    rating: 0,
    dateRange: null
  });
  const [savedPresets, setSavedPresets] = useState([]);

  // --- UI STATE ---
  const [darkMode, setDarkMode] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // --- MODAL & DROPDOWN STATE ---
  const [detailModal, setDetailModal] = useState(null); // Detailed object
  const [messageModal, setMessageModal] = useState(null); // { recipients: [] }
  const [assignModal, setAssignModal] = useState(null); // { recipientId: string }
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [gmailModalOpen, setGmailModalOpen] = useState(false);
  const profileRef = useRef(null);

  // --- HELPDESK SETTINGS STATE ---
  const [hdSettings, setHdSettings] = useState({
    autoRefresh: true,
    refreshInterval: 30,
    defaultPriority: "Medium",
    newTicketSound: true,
    slaAlerts: true,
    defaultView: "All Tickets",
    signature: "Best regards, \nManager Team",
    assigneeNotifications: true
  });

  // --- ALERTS & ACTIVITY STATE ---
  const [alerts, setAlerts] = useState([]);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [allProviders, setAllProviders] = useState([]);
  const [allTickets, setAllTickets] = useState([]);

  const announceChange = (message, priority = "polite") => {
    // Hidden aria-live region could be used here
    console.log(`[Announce ${priority}]: ${message}`);
  };

  // --- FUNCTION 1: LOAD DATA ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    setApiError("");
    try {
      // Fetch core data for sidebar stats/panel regardless of tab
      const [ticketsRes, providersRes] = await Promise.all([
        ticketAPI.getAll(),
        userAPI.getProviders()
      ]);
      
      const ticketsArr = ticketsRes.data || [];
      const providersArr = providersRes.data || [];
      setAllTickets(ticketsArr);
      setAllProviders(providersArr);
      setLastRefreshed(new Date());

      let items = [];
      if (activeTab === "tickets") {
        items = ticketsArr;
      } else if (activeTab === "providers") {
        items = providersArr;
      } else {
        const res = await userAPI.getAll();
        items = (res.data || []).filter(u => u.role === 'worker');
      }

      // Map data and provide safe fallbacks
      const processedData = items.map(item => ({
        ...item,
        status: item.status || "Active",
        rating: item.rating || "N/A",
        lastActive: item.lastActive || "Never",
        location: item.location || "Not Set"
      }));

      setData(processedData);
      announceChange("Data loaded successfully");
    } catch (err) {
      setApiError(err.message || "Failed to load data");
      announceChange("Error loading data", "assertive");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- DARK MODE PERSISTENCE ---
  useEffect(() => {
    document.documentElement.classList.toggle("md-dark", darkMode);
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

  // --- AUTO REFRESH (Quick Actions Requirement: Every 2 mins) ---
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Auto-refreshing sidebar and dashboard data...");
      fetchData();
    }, 120000); // 2 minutes
    return () => clearInterval(interval);
  }, [fetchData]);

  // --- FUNCTION 4: SORT TABLE ---
  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  // --- FUNCTION 2 & 3: SEARCH & FILTER ---
  const filteredData = useMemo(() => {
    return sortedData.filter(item => {
      const matchesSearch =
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filters.status === "All" || item.status === filters.status;
      const matchesLocation = !filters.location || item.location?.toLowerCase().includes(filters.location.toLowerCase());

      return matchesSearch && matchesStatus && matchesLocation;
    });
  }, [sortedData, searchQuery, filters]);

  // --- FUNCTION 5: PAGINATE TABLE ---
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // --- FUNCTION 6 & 7: ROW SELECTION ---
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

  // --- FUNCTION 9: CHANGE STATUS ---
  const changeStatus = async (id, newStatus) => {
    if (window.confirm(`Change status to ${newStatus}?`)) {
      announceChange(`Updating status to ${newStatus}...`);
      setData(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
      setActivities([{
        id: Date.now(),
        type: "status",
        name: data.find(i => i.id === id)?.name || "User",
        action: `Status changed to '${newStatus}'`,
        time: "Just now"
      }, ...activities]);
      announceChange("Status updated successfully");
    }
  };

  // --- FUNCTION 12: DISMISS ALERT ---
  const dismissAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    setNotifCount(c => Math.max(0, c - 1));
    announceChange("Alert dismissed");
  };

  // --- HANDLERS ---
  const handleLogout = async () => {
    await logout();
    navigate("/login");
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

  const handleExport = () => {
    announceChange("Exporting data...");
    alert("Data exported as CSV (Simulation)");
  };

  return (
    <div className={`dashboard-root ${darkMode ? "md-dark" : ""}`}>
      {/* SECTION 1: TOP HEADER */}
      <header className="top-header" role="banner">
        <div className="header-left">
          <div className="branding">
            <Icon8 name="administrative-tools" size={32} color={darkMode ? "6366f1" : "4f46e5"} alt="gira Logo" />
            <span className="logo-font">gira</span>
          </div>

        </div>

        <div className="header-center">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-box"
              placeholder="Search by name, email, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search dashboard"
              role="searchbox"
            />
          </div>
          <div className="inline-filters">
            <select
              className="filter-pill"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              aria-label="Filter by status"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
        </div>

        <div className="header-right">
          <button className="icon-btn" onClick={() => setDarkMode(!darkMode)} aria-label="Toggle Dark Mode">
            {darkMode ? "☀️" : "🌙"}
          </button>
          <button className="icon-btn" aria-label="Notifications" onClick={() => setNotifOpen(!notifOpen)}>
            🔔
            {notifCount > 0 && <span className="badge">{notifCount}</span>}
          </button>

          <div className="profile-wrapper" ref={profileRef}>
            <button
              className={`profile-trigger ${profileMenuOpen ? 'active' : ''}`}
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              aria-label="Profile Menu"
            >
              <span className="profile-icon">👤</span>
              <span className="profile-name">Manager</span>
              <span className="dropdown-arrow">▼</span>
            </button>

            {profileMenuOpen && (
              <div className="profile-dropdown-menu">
                <div className="dropdown-header">
                  <strong>Manage Profile</strong>
                  <p>{user?.email || "manager@gira.com"}</p>
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={() => { setDetailModal({ name: "My Profile" }); setProfileMenuOpen(false); }}>
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
          <div className="table-tabs" role="tablist">
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className={`tab-btn ${activeTab === "tickets" ? "active" : ""}`}
                onClick={() => { setActiveTab("tickets"); setCurrentPage(1); }}
                role="tab"
                aria-selected={activeTab === "tickets"}
              >
                Tickets
              </button>
              <button
                className={`tab-btn ${activeTab === "providers" ? "active" : ""}`}
                onClick={() => { setActiveTab("providers"); setCurrentPage(1); }}
                role="tab"
                aria-selected={activeTab === "providers"}
              >
                Providers
              </button>
              <button
                className={`tab-btn ${activeTab === "workers" ? "active" : ""}`}
                onClick={() => { setActiveTab("workers"); setCurrentPage(1); }}
                role="tab"
                aria-selected={activeTab === "workers"}
              >
                Workers
              </button>
            </div>
            {selectedItems.length > 0 && (
              <div className="filter-pill active" style={{ marginLeft: 'auto', alignSelf: 'center', fontSize: '0.75rem', animation: 'fadeIn 0.3s ease' }}>
                {selectedItems.length} Selected
                <button onClick={() => setSelectedItems([])} style={{ background: 'none', border: 'none', color: 'white', marginLeft: '8px', cursor: 'pointer' }}>✕</button>
              </div>
            )}
          </div>

          <div className="data-table-card">
            <div className="table-wrapper">
              <table role="grid">
                <thead>
                  <tr role="row">
                    <th style={{ width: '40px' }}>
                      <input type="checkbox" checked={selectedItems.length === paginatedData.length && paginatedData.length > 0} onChange={toggleSelectAll} aria-label="Select all" />
                    </th>
                    {activeTab === 'tickets' ? (
                      <>
                        <th onClick={() => setSortConfig({ key: "ticketNumber", direction: sortConfig.direction === "asc" ? "desc" : "asc" })} style={{ cursor: 'pointer' }}>
                          Ticket ID {sortConfig.key === "ticketNumber" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                        </th>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Provider</th>
                      </>
                    ) : (
                      <>
                        <th onClick={() => setSortConfig({ key: "name", direction: sortConfig.direction === "asc" ? "desc" : "asc" })} style={{ cursor: 'pointer' }}>
                          Name {sortConfig.key === "name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                        </th>
                        <th>Status</th>
                        <th>Rating</th>
                        <th>Last Active</th>
                      </>
                    )}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>Loading...</td></tr>
                  ) : paginatedData.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>No results found</td></tr>
                  ) : activeTab === 'tickets' ? (
                    paginatedData.map(item => (
                      <tr key={item.id} role="row" style={{ cursor: 'pointer' }} onClick={() => setDetailModal(item)}>
                        <td onClick={e => e.stopPropagation()}>
                          <input type="checkbox" checked={selectedItems.includes(item.id)} onChange={() => toggleRowSelection(item.id)} />
                        </td>
                        <td style={{ fontWeight: '700', color: 'var(--md-primary)' }}>{item.ticketNumber || `TKT-${item.id}`}</td>
                        <td>
                          <div style={{ fontWeight: '600' }}>{item.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--md-text-muted)' }}>Worker: {item.worker?.name}</div>
                        </td>
                        <td>
                          <span className={`status-badge status-${item.status.toLowerCase().replace(" ", "")}`}>
                            {item.status}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: '600', color: item.priority === 'urgent' ? 'var(--md-accent-red)' : 'inherit' }}>
                            {item.priority}
                          </span>
                        </td>
                        <td>{item.provider?.name || <span style={{ fontStyle: 'italic', opacity: 0.6 }}>Unassigned</span>}</td>
                        <td onClick={e => e.stopPropagation()}>
                          <div className="action-btns">
                            <button className="icon-btn" onClick={() => setDetailModal(item)} title="View Detail">👁️</button>
                            <button className="icon-btn" onClick={() => setAssignModal({ ticketId: item.id, title: item.title })} title="Assign">👤</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    paginatedData.map(item => (
                      <tr key={item.id} role="row" style={{ cursor: 'pointer' }} onClick={() => setDetailModal(item)}>
                        <td onClick={e => e.stopPropagation()}>
                          <input type="checkbox" checked={selectedItems.includes(item.id)} onChange={() => toggleRowSelection(item.id)} />
                        </td>
                        <td>
                          <div style={{ fontWeight: '600' }}>{item.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--md-text-muted)' }}>{item.email}</div>
                        </td>
                        <td>
                          <span className={`status-badge status-${item.status.toLowerCase().replace(" ", "")}`}>
                            {item.status}
                          </span>
                        </td>
                        <td>{item.rating} ★</td>
                        <td>{item.lastActive}</td>
                        <td onClick={e => e.stopPropagation()}>
                          <div className="action-btns">
                            <button className="icon-btn" onClick={() => setDetailModal(item)} title="View Detail">👁️</button>
                            <button className="icon-btn" onClick={() => { setDetailModal(item); setGmailModalOpen(true); }} title="Mail User">📧</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--md-border)' }}>
              <div className="stat-label">Page {currentPage} of {totalPages || 1}</div>
              <div className="action-btns">
                <button className="secondary-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)}>Prev</button>
                <button className="secondary-btn" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(c => c + 1)}>Next</button>
              </div>
            </div>
          </div>
        </div>

        <div className="content-right">
          {/* PANEL 1: STATUS OVERVIEW */}
          <section className="info-panel" aria-labelledby="stats-title">
            <h3 id="stats-title" className="panel-title">Quick Stats</h3>
            <div className="quick-stats-grid">
              <div className="stat-box" onClick={() => setFilters({ ...filters, status: "All" })}>
                <div className="stat-val">{data.length}</div>
                <div className="stat-label">Total</div>
              </div>
              <div className="stat-box" onClick={() => setFilters({ ...filters, status: "Active" })}>
                <div className="stat-val" style={{ color: 'var(--md-accent-green)' }}>{data.filter(i => i.status === "Active").length}</div>
                <div className="stat-label">Active</div>
              </div>
              <div className="stat-box" onClick={() => setFilters({ ...filters, status: "Inactive" })}>
                <div className="stat-val" style={{ color: 'var(--md-accent-red)' }}>{data.filter(i => i.status === "Inactive").length}</div>
                <div className="stat-label">Inactive</div>
              </div>
              <div className="stat-box" onClick={() => setFilters({ ...filters, status: "On Leave" })}>
                <div className="stat-val" style={{ color: 'var(--md-accent-amber)' }}>{data.filter(i => i.status === "On Leave").length}</div>
                <div className="stat-label">On Leave</div>
              </div>
            </div>
          </section>

          {/* PANEL 2: ACTIVE ALERTS */}
          <section className="info-panel" aria-labelledby="alerts-title">
            <h3 id="alerts-title" className="panel-title">
              Alerts
              <span className="badge" style={{ position: 'static', border: 'none' }}>{alerts.length}</span>
            </h3>
            <div className="alerts-list">
              {alerts.length === 0 ? (
                <div className="stat-label" style={{ textAlign: 'center' }}>No active alerts</div>
              ) : alerts.map(alert => (
                <div key={alert.id} className="alert-card">
                  <div className="alert-info">
                    <div className="alert-msg">{alert.msg}</div>
                    <div className="alert-time">{alert.name} • {alert.time}</div>
                  </div>
                  <button className="icon-btn" onClick={() => dismissAlert(alert.id)} aria-label="Dismiss alert">✕</button>
                </div>
              ))}
            </div>
          </section>

          {/* PANEL 3: QUICK ACTIONS PANEL (REPLACES ACTIVITY LOG) */}
          <QuickActionsPanel 
            tickets={allTickets}
            providers={allProviders}
            onUpdate={fetchData}
            setDetailModal={setDetailModal}
            selectedItems={selectedItems}
            lastRefreshed={lastRefreshed}
          />
        </div>
      </main>

      {/* SECTION 3: BOTTOM ACTION BAR */}
      <footer className="bottom-action-bar">
        <div className="stat-label" style={{ borderRight: '1px solid var(--md-border)', paddingRight: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem' }}>🎯</span>
          <strong>{selectedItems.length}</strong> selected
        </div>
        <div className="action-btns">
          <button className="primary-btn" onClick={() => setAssignModal({})} aria-label="Assign Shift/Job">
            <span>📅</span> Assign Shift
          </button>
          <button className="primary-btn" onClick={() => setMessageModal({ recipients: selectedItems.length > 0 ? selectedItems.map(id => data.find(i => i.id === id)?.name) : [] })} aria-label="Send Message">
            <span>💬</span> Send Message
          </button>
          <button className="secondary-btn" onClick={() => alert("Reports view opened (Simulation)")} aria-label="View Reports">
            <span>📊</span> View Reports
          </button>
          <button className="secondary-btn" onClick={handleExport} aria-label="Export Data">
            <span>📥</span> Export Data
          </button>
          <button className="secondary-btn" onClick={() => setSettingsOpen(true)} title="Dashboard Settings" aria-label="Settings">
            <span>⚙️</span>
          </button>
        </div>
      </footer>

      {/* MODALS */}
      {detailModal && (
        <DetailModal
          item={detailModal}
          onClose={() => setDetailModal(null)}
          setMessageModal={setMessageModal}
          setAssignModal={setAssignModal}
          changeStatus={changeStatus}
          setGmailModalOpen={setGmailModalOpen}
          announceChange={announceChange}
        />
      )}

      {messageModal && (
        <MessageModal
          recipients={messageModal.recipients.length > 0 ? messageModal.recipients : ["Select Recipients..."]}
          onClose={() => setMessageModal(null)}
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

      {assignModal && assignModal.ticketId ? (
        <AssignTicketModal
          ticketId={assignModal.ticketId}
          ticketTitle={assignModal.title}
          managerName={user?.name}
          onClose={() => setAssignModal(null)}
          onAssignSuccess={(updatedTicket) => {
            fetchData(); // Refresh the list
            setAssignModal(null);
            setActivities([{
              id: Date.now(),
              action: `Ticket ${updatedTicket.ticketNumber} assigned to ${updatedTicket.provider?.name}`,
              time: "Just now",
              name: "System"
            }, ...activities]);
          }}
        />
      ) : assignModal && (
        <AssignShiftModal
          onClose={() => setAssignModal(null)}
          onConfirm={(data) => {
            alert('Shift Assigned!');
            setAssignModal(null);
          }}
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

// --- QUICK ACTIONS PANEL COMPONENT ---

const QuickActionsPanel = ({ tickets, providers, onUpdate, setDetailModal, selectedItems, lastRefreshed }) => {
  const [panelFilters, setPanelFilters] = useState({
    onlyHighPriority: false,
    onlySLAAtRisk: false
  });

  // Calculate Waiting Time
  const getWaitingTime = (createdAt) => {
    const mins = Math.floor((new Date() - new Date(createdAt)) / 60000);
    if (mins < 60) return `${mins} mins`;
    const hrs = Math.floor(mins / 60);
    return `${hrs} hrs ${mins % 60}m`;
  };

  const isCriticalWait = (createdAt) => {
    return (new Date() - new Date(createdAt)) > 2 * 60 * 60 * 1000;
  };

  // Section 1 logic
  let pendingTickets = tickets.filter(t => t.status.toLowerCase() === 'pending' || t.status.toLowerCase() === 'in_progress');
  if (panelFilters.onlyHighPriority) pendingTickets = pendingTickets.filter(t => t.priority.toLowerCase() === 'high' || t.priority.toLowerCase() === 'urgent');
  
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  pendingTickets.sort((a, b) => priorityOrder[a.priority.toLowerCase()] - priorityOrder[b.priority.toLowerCase()]);

  // Section 2 logic (Team Workload)
  const teamWorkload = providers.map(p => {
    const count = tickets.filter(t => t.provider?.id === p.id && t.status !== 'resolved' && t.status !== 'closed').length;
    const capacity = Math.min(100, (count / 5) * 100);
    return { ...p, count, capacity };
  });

  // Section 3 logic (SLA Warnings)
  const slaWarningTickets = tickets.filter(t => {
    if (!t.expectedResolutionDate || t.status === 'resolved' || t.status === 'closed') return false;
    const timeLeft = new Date(t.expectedResolutionDate) - new Date();
    return timeLeft > 0 && timeLeft < 60 * 60 * 1000; // < 1 hour
  });

  const handleAction = (label, fn) => {
    if (window.confirm(`Are you sure you want to ${label}?`)) {
      fn();
    }
  };

  const escalateTicket = async (id) => {
    // Escalate sets priority to urgent and logs activity
    try {
      await ticketAPI.update(id, { priority: 'URGENT' });
      onUpdate();
    } catch(e) { alert(e.message); }
  };

  return (
    <section className="info-panel qa-panel" style={{ maxHeight: '600px', display: 'flex', flexDirection: 'column' }}>
      <h3 className="panel-title">⚡ Quick Actions</h3>
      
      <div className="qa-scroll-area" style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
        
        {/* SECTION 1: PENDING */}
        <div className="qa-section">
          <div className="qa-section-header">PENDING TICKETS</div>
          {pendingTickets.slice(0, 5).map(t => (
            <div key={t.id} className="qa-item-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--md-primary)', fontSize: '0.8rem' }}>#{t.ticketNumber || t.id}</span>
                <span className={`status-badge`} style={{ 
                  background: t.priority === 'urgent' ? 'var(--md-accent-red)' : (t.priority === 'high' ? 'var(--md-accent-amber)' : 'var(--md-border)'),
                  color: t.priority === 'urgent' || t.priority === 'high' ? 'white' : 'var(--md-text-main)',
                  fontSize: '0.65rem'
                }}>{t.priority}</span>
              </div>
              <div className="qa-item-title">{t.title}</div>
              <div className="qa-item-meta">
                <span style={{ color: isCriticalWait(t.createdAt) ? 'var(--md-accent-red)' : 'inherit', fontWeight: isCriticalWait(t.createdAt) ? 'Bold' : 'normal' }}>
                  ⏳ {getWaitingTime(t.createdAt)}
                </span>
                <span>👤 {t.provider?.name || 'Unassigned'}</span>
              </div>
              <div className="qa-item-actions">
                <button onClick={() => setDetailModal(t)}>View</button>
                <button onClick={() => handleAction('escalate this ticket', () => escalateTicket(t.id))}>Escalate</button>
              </div>
            </div>
          ))}
        </div>

        {/* SECTION 2: WORKLOAD */}
        <div className="qa-section">
          <div className="qa-section-header">TEAM WORKLOAD</div>
          {teamWorkload.map(p => (
            <div key={p.id} className="workload-row">
              <div className="workload-info">
                <span>{p.name}</span>
                <span className="stat-label">{p.count} tickets ({p.capacity}%)</span>
              </div>
              <div className="workload-bar-bg">
                <div className="workload-bar-fill" style={{ 
                  width: `${p.capacity}%`, 
                  background: p.capacity > 80 ? 'var(--md-accent-red)' : (p.capacity > 50 ? 'var(--md-accent-amber)' : 'var(--md-accent-green)') 
                }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* SECTION 3: SLA */}
        {slaWarningTickets.length > 0 && (
          <div className="qa-section">
            <div className="qa-section-header sla-header">🚨 SLA WARNINGS</div>
            {slaWarningTickets.map(t => (
              <div key={t.id} className="sla-warning-card">
                <div style={{ fontWeight: 'bold' }}>#{t.ticketNumber} - {t.worker?.name}</div>
                <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                  Breach in: <span style={{ color: 'var(--md-accent-red)', fontWeight: 'bold' }}>
                    {Math.round((new Date(t.expectedResolutionDate) - new Date()) / 60000)} mins
                  </span>
                </div>
                <div className="qa-item-actions" style={{ marginTop: '8px' }}>
                  <button className="warn-btn">Add 2h</button>
                  <button className="resolve-btn" onClick={() => handleAction('resolve this ticket', () => ticketAPI.update(t.id, { status: 'RESOLVED' }).then(onUpdate))}>Resolve</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SECTION 4: ONE-CLICK ACTIONS */}
        <div className="qa-section">
          <div className="qa-section-header">ONE-CLICK ACTIONS</div>
          <div className="bulk-actions-grid">
            <button className="bulk-btn" onClick={() => handleAction('escalate selected tickets', () => {
              Promise.all(selectedItems.map(id => ticketAPI.update(id, { priority: 'URGENT' }))).then(onUpdate);
            })}>Escalate All</button>
            <button className={`bulk-btn ${panelFilters.onlyHighPriority ? 'active' : ''}`} onClick={() => setPanelFilters(p => ({ ...p, onlyHighPriority: !p.onlyHighPriority }))}>High Priority Only</button>
            <button className="bulk-btn" onClick={onUpdate}>🔄 Refresh Now</button>
          </div>
        </div>

      </div>
      
      <div className="qa-footer">
        Last updated: {lastRefreshed.toLocaleTimeString()}
      </div>
    </section>
  );
};

const AssignShiftModal = ({ onClose, onConfirm }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      <h2 className="panel-title">Assign Shift</h2>
      <p className="stat-label">Create a new shift assignment for the selected or specific provider.</p>
      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input type="text" className="search-box" placeholder="Search Shift..." />
        <input type="date" className="search-box" />
        <button className="primary-btn" onClick={() => onConfirm()}>Confirm Assignment</button>
      </div>
    </div>
  </div>
);


const DetailModal = ({ item, onClose, setMessageModal, setAssignModal, changeStatus, setGmailModalOpen, announceChange }) => {
  const [activeDetailTab, setActiveDetailTab] = useState("Overview");
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!item || item.name === "My Profile" || !item.id) return;
      setLoadingActivities(true);
      try {
        const res = await ticketAPI.getActivity(item.id);
        setActivities(res.data || []);
      } catch (err) {
        console.error("Failed to fetch activity:", err);
      } finally {
        setLoadingActivities(false);
      }
    };
    fetchActivities();
  }, [item]);

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="detail-title">
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="status-badge status-active" style={{ padding: '0.5rem', borderRadius: '12px' }}>
              <Icon8 name="user" size={32} />
            </div>
            <div>
              <h2 id="detail-title" className="panel-title" style={{ marginBottom: 0 }}>{item.name}</h2>
              <p className="stat-label">{item.status} • {item.location}</p>
            </div>
          </div>
          <button onClick={onClose} className="icon-btn" aria-label="Close">✕</button>
        </div>

        <div className="table-tabs" style={{ marginTop: '2rem' }}>
          {["Overview", "Performance", "Documents", "Activity"].map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeDetailTab === tab ? "active" : ""}`}
              onClick={() => setActiveDetailTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ marginTop: '1.5rem', minHeight: '300px' }}>
          {activeDetailTab === "Overview" && (
            <div className="quick-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div className="stat-box">
                <div className="stat-label">Email Address</div>
                <div style={{ fontWeight: '600', marginTop: '4px' }}>{item.email}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Phone Number</div>
                <div style={{ fontWeight: '600', marginTop: '4px' }}>+1 555-0123</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Last Active</div>
                <div style={{ fontWeight: '600', marginTop: '4px' }}>{item.lastActive}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Rating</div>
                <div style={{ fontWeight: '600', marginTop: '4px', color: 'var(--md-accent-amber)' }}>{item.rating} ★</div>
              </div>
            </div>
          )}
          {activeDetailTab === "Performance" && (
            <div style={{ padding: '1rem' }}>
              <h4 className="stat-label">Rating History</h4>
              <div style={{ display: 'flex', gap: '8px', marginTop: '1rem', alignItems: 'flex-end', height: '100px' }}>
                {[4, 5, 3, 5, 4, 4, 5].map((r, i) => (
                  <div key={i} style={{ flex: 1, background: 'var(--md-primary)', height: `${r * 20}%`, borderRadius: '4px' }}></div>
                ))}
              </div>
              <p style={{ marginTop: '1rem', fontSize: '0.85rem' }}>Average completion rate: <strong>98%</strong></p>
            </div>
          )}
          {activeDetailTab === "Documents" && (
            <div className="alerts-list" style={{ padding: '1rem' }}>
              {["Criminal Record Check", "ID Verification", "Training Certificate"].map(doc => (
                <div key={doc} className="alert-card" style={{ borderLeftColor: 'var(--md-accent-green)', background: 'rgba(16, 185, 129, 0.05)' }}>
                  <div className="alert-info">
                    <div className="alert-msg">{doc}</div>
                    <div className="alert-time">Verified on Jan 12, 2024</div>
                  </div>
                  <span style={{ color: 'var(--md-accent-green)', fontWeight: '700', fontSize: '12px' }}>VALID</span>
                </div>
              ))}
            </div>
          )}
          {activeDetailTab === "Activity" && (
            <div className="timeline" style={{ padding: '1rem' }}>
              {loadingActivities ? (
                <p className="stat-label">Loading activity log...</p>
              ) : activities.length === 0 ? (
                <p className="stat-label">No activity recorded for this ticket.</p>
              ) : (
                activities.map(act => (
                  <div key={act.id} className="timeline-item">
                    <div className="timeline-dot" style={{ background: act.action === 'FORWARDED' ? 'var(--md-accent-amber)' : 'var(--md-primary)' }}></div>
                    <div className="timeline-content">
                      <div className="timeline-time">{new Date(act.createdAt).toLocaleString()}</div>
                      <div style={{ fontWeight: '600', color: 'var(--md-text-main)' }}>{act.action.replace('_', ' ')}</div>
                      <div className="stat-label" style={{ marginBottom: '4px' }}>By: {act.userName} ({act.userRole})</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--md-text-muted)', fontStyle: 'italic' }}>{act.details}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="modal-actions" style={{ marginTop: '2rem', borderTop: '1px solid var(--md-border)', paddingTop: '1.5rem' }}>
          <button className="primary-btn" onClick={() => setGmailModalOpen(true)}>
            <span>📧</span> Send Gmail
          </button>
          <button className="primary-btn" onClick={() => setMessageModal({ recipients: [item.name] })}>
            <span>✉️</span> Message
          </button>
          <button className="secondary-btn" onClick={() => setAssignModal({ recipientId: item.id })}>
            <span>➕</span> Assign Task
          </button>
          <button className="secondary-btn" style={{ borderColor: 'var(--md-accent-red)', color: 'var(--md-accent-red)' }} onClick={() => changeStatus(item.id, item.status === "Active" ? "Inactive" : "Active")}>
            <span>🔄</span> Toggle Status
          </button>
          <button className="secondary-btn" style={{ marginLeft: 'auto' }} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

const MessageModal = ({ recipients, onClose }) => (
  <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      <h2 className="panel-title">Send Message</h2>
      <div style={{ margin: '1rem 0' }}>
        <label className="stat-label">Recipients</label>
        <div className="inline-filters" style={{ flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
          {recipients.map(r => <span key={r} className="filter-pill active" style={{ fontSize: '12px' }}>{r}</span>)}
        </div>
      </div>
      <textarea
        className="search-box"
        placeholder="Type your message..."
        style={{ height: '120px', resize: 'none', background: 'var(--md-bg)' }}
      />
      <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
        <button className="primary-btn" onClick={() => { alert('Message Sent!'); onClose(); }}>Send Message</button>
        <button className="secondary-btn" onClick={onClose}>Cancel</button>
      </div>
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
      <div className="settings-panel">
        <div className="info-row">
          <span className="info-label">Display Name</span>
          <span className="info-value">{user?.name || "Manager User"}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Email Address</span>
          <span className="info-value">{user?.email || "manager@gira.helpdesk"}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Role</span>
          <span className="info-value">Systems Administrator</span>
        </div>
        <div className="info-row">
          <span className="info-label">Joined</span>
          <span className="info-value">January 2024</span>
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
    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px', width: '90%' }}>
      <div className="modal-header">
        <h2 className="panel-title">⚙️ Helpdesk Settings</h2>
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
            <select className="search-box" value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} style={{ width: '120px' }}>
              <option value={10}>10 Items</option>
              <option value={20}>20 Items</option>
              <option value={50}>50 Items</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="settings-title">Helpdesk Automation</h3>
          <div className="setting-row">
            <div className="setting-label-box">
              <strong>Auto-Refresh Tickets</strong>
              <p>Keep dashboard updated automatically</p>
            </div>
            <input type="checkbox" checked={hdSettings.autoRefresh} onChange={e => setHdSettings({ ...hdSettings, autoRefresh: e.target.checked })} />
          </div>
          {hdSettings.autoRefresh && (
            <div className="setting-row">
              <label>Refresh Interval (Seconds)</label>
              <input type="number" className="search-box" style={{ width: '100px' }} value={hdSettings.refreshInterval} onChange={e => setHdSettings({ ...hdSettings, refreshInterval: Number(e.target.value) })} />
            </div>
          )}
          <div className="setting-row">
            <label>Default Ticket Priority</label>
            <select className="search-box" style={{ width: '150px' }} value={hdSettings.defaultPriority} onChange={e => setHdSettings({ ...hdSettings, defaultPriority: e.target.value })}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Urgent</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="settings-title">Notifications & SLA</h3>
          <div className="setting-row">
            <label>New Ticket Sound Alert</label>
            <input type="checkbox" checked={hdSettings.newTicketSound} onChange={e => setHdSettings({ ...hdSettings, newTicketSound: e.target.checked })} />
          </div>
          <div className="setting-row">
            <div className="setting-label-box">
              <strong>SLA Breach Warnings</strong>
              <p>Notify before tickets exceed SLA limits</p>
            </div>
            <input type="checkbox" checked={hdSettings.slaAlerts} onChange={e => setHdSettings({ ...hdSettings, slaAlerts: e.target.checked })} />
          </div>
        </div>

        <div className="settings-section">
          <h3 className="settings-title">Email Signature</h3>
          <textarea
            className="search-box"
            style={{ height: '80px', width: '100%', marginTop: '0.5rem' }}
            value={hdSettings.signature}
            onChange={e => setHdSettings({ ...hdSettings, signature: e.target.value })}
            placeholder="Your email signature..."
          />
        </div>
      </div>

      <div className="modal-actions" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--md-border)', paddingTop: '1.5rem' }}>
        <button className="secondary-btn" onClick={() => setSettingsOpen(false)}>Cancel</button>
        <button className="primary-btn" onClick={() => { announceChange("Settings Saved"); setSettingsOpen(false); }}>Save Changes</button>
      </div>
    </div>
  </div>
);

export default ManagerDashboard;
