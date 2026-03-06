import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./PlayoffsPage.css";

/* ── Mock data: each "playoff" = one main ticket + associated rebound items ── */
const PLAYOFFS_DATA = [
    {
        id: 1,
        category: "HIGH PRIORITY",
        prompt: "Design a Ticket Resolution Workflow for Enterprise Clients",
        tag: "WEEKLY CHALLENGE",
        mainShot: {
            title: "Enterprise Workflow System",
            subtitle: "Design a streamlined ticket creation and routing system",
            gradient: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
            accentColor: "#FFCE32",
            icon: "🎯",
            author: "GIRA System",
            role: "Manager",
            likes: 48,
            views: "5.2k",
            reboundCount: 6,
        },
        rebounds: [
            { id: "r1", title: "Flowchart UI", bg: "#1a1a2e", icon: "📊", accentColor: "#FFCE32" },
            { id: "r2", title: "Priority Matrix", bg: "#0d1b2a", icon: "⚡", accentColor: "#00ffb3" },
            { id: "r3", title: "Dark Mode Board", bg: "#111", icon: "🌑", accentColor: "#ff6b6b" },
            { id: "r4", title: "Mobile View", bg: "#1a1635", icon: "📱", accentColor: "#7c3aed" },
        ],
    },
    {
        id: 2,
        category: "IN PROGRESS",
        prompt: "Build a Real-Time Notification Center for Service Workers",
        tag: "MONTHLY WARM-UP",
        mainShot: {
            title: "Live Notification Hub",
            subtitle: "Push alerts, escalations, and SLA breach warnings in real-time",
            gradient: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
            accentColor: "#00ffb3",
            icon: "🔔",
            author: "Agensip UI UX",
            role: "Provider",
            likes: 72,
            views: "9.1k",
            reboundCount: 9,
        },
        rebounds: [
            { id: "r5", title: "Alert Panel", bg: "#0f2027", icon: "📡", accentColor: "#00ffb3" },
            { id: "r6", title: "Toast System", bg: "#203a43", icon: "🍞", accentColor: "#fbbf24" },
            { id: "r7", title: "SLA Countdown", bg: "#1a2f3a", icon: "⏰", accentColor: "#f97316" },
            { id: "r8", title: "Mobile Alerts", bg: "#162430", icon: "📲", accentColor: "#60a5fa" },
        ],
    },
    {
        id: 3,
        category: "RESOLVED",
        prompt: "Create a Provider Performance Dashboard with Analytics",
        tag: "WEEKLY WARM-UP",
        mainShot: {
            title: "Analytics Command Center",
            subtitle: "Track resolution rates, response times, and satisfaction scores",
            gradient: "linear-gradient(135deg, #0d0d0d 0%, #1a0a2e 50%, #2d1b69 100%)",
            accentColor: "#a855f7",
            icon: "📈",
            author: "Arounda Studio",
            role: "Manager",
            likes: 94,
            views: "12.4k",
            reboundCount: 13,
        },
        rebounds: [
            { id: "r9", title: "Bar Chart UI", bg: "#1a0a2e", icon: "📊", accentColor: "#a855f7" },
            { id: "r10", title: "Pie Dashboard", bg: "#0d0d1a", icon: "🥧", accentColor: "#ec4899" },
            { id: "r11", title: "KPI Cards", bg: "#150f2a", icon: "🃏", accentColor: "#22d3ee" },
            { id: "r12", title: "Heatmap View", bg: "#0a1020", icon: "🔥", accentColor: "#f59e0b" },
        ],
    },
    {
        id: 4,
        category: "PENDING",
        prompt: "Design a Worker Profile & Skill Management Interface",
        tag: "CHALLENGE",
        mainShot: {
            title: "Worker Skill Matrix",
            subtitle: "Competency tracking, certifications, and assignment matching",
            gradient: "linear-gradient(135deg, #1a0a00 0%, #2d1500 50%, #3d2000 100%)",
            accentColor: "#f97316",
            icon: "👷",
            author: "AgensipUI",
            role: "Worker",
            likes: 31,
            views: "3.8k",
            reboundCount: 4,
        },
        rebounds: [
            { id: "r13", title: "Profile Card", bg: "#2d1500", icon: "👤", accentColor: "#f97316" },
            { id: "r14", title: "Skill Radar", bg: "#1f1000", icon: "🕷️", accentColor: "#fbbf24" },
            { id: "r15", title: "Badge Wall", bg: "#3a1a00", icon: "🏅", accentColor: "#34d399" },
            { id: "r16", title: "Timeline View", bg: "#251200", icon: "📅", accentColor: "#60a5fa" },
        ],
    },
];

const ROLE_COLORS = {
    Manager: "var(--primary)",
    Provider: "#00ffb3",
    Worker: "#f97316",
};

/* ── Rebound Mini Card ── */
function ReboundCard({ rebound, index }) {
    return (
        <div
            className="rebound-card fade-in-up"
            style={{ animationDelay: `${0.15 + index * 0.08}s` }}
        >
            <div
                className="rebound-thumbnail"
                style={{ background: rebound.bg }}
            >
                <span className="rebound-icon">{rebound.icon}</span>
                <div
                    className="rebound-accent-line"
                    style={{ background: rebound.accentColor }}
                />
                <div className="rebound-hover-overlay">
                    <button className="rebound-action-btn">❤</button>
                    <button className="rebound-action-btn">＋</button>
                </div>
            </div>
            <p className="rebound-title">{rebound.title}</p>
        </div>
    );
}

/* ── Main Shot Card ── */
function MainShotCard({ shot, reboundCount, category }) {
    const [liked, setLiked] = useState(false);
    return (
        <div className="main-shot-card fade-in-up">
            <div
                className="main-shot-thumbnail"
                style={{ background: shot.gradient }}
            >
                {/* Rebound badge */}
                <div className="rebounds-badge">
                    <span className="rebounds-icon">↩</span>
                    <span>{reboundCount}</span>
                </div>
                {/* Category tag */}
                <div
                    className="shot-category-tag"
                    style={{ background: shot.accentColor, color: "#000" }}
                >
                    {category}
                </div>
                {/* Center icon */}
                <div className="main-shot-icon">{shot.icon}</div>
                {/* Decorative lines */}
                <div className="shot-deco-lines">
                    <div className="deco-line" style={{ background: shot.accentColor, opacity: 0.3 }} />
                    <div className="deco-line deco-line-2" style={{ background: shot.accentColor, opacity: 0.15 }} />
                </div>
                <div className="main-shot-hover-overlay">
                    <button className="main-shot-action like-btn" onClick={() => setLiked(!liked)}>
                        {liked ? "❤️" : "♡"} Like
                    </button>
                    <button className="main-shot-action save-btn">＋ Save</button>
                </div>
            </div>
            <div className="main-shot-meta">
                <div className="meta-left">
                    <div
                        className="author-avatar"
                        style={{ background: shot.accentColor }}
                    >
                        {shot.author.charAt(0)}
                    </div>
                    <span className="author-name">{shot.author}</span>
                    <span
                        className="role-badge"
                        style={{ background: ROLE_COLORS[shot.role], color: "#000" }}
                    >
                        {shot.role.toUpperCase()}
                    </span>
                </div>
                <div className="meta-right">
                    <span className="stat">♡ {liked ? shot.likes + 1 : shot.likes}</span>
                    <span className="stat">👁 {shot.views}</span>
                </div>
            </div>
        </div>
    );
}

/* ── Playoff Row ── */
function PlayoffRow({ playoff }) {
    const scrollRef = useRef(null);

    const scrollLeft = () => {
        scrollRef.current?.scrollBy({ left: -260, behavior: "smooth" });
    };
    const scrollRight = () => {
        scrollRef.current?.scrollBy({ left: 260, behavior: "smooth" });
    };

    return (
        <div className="playoff-row fade-in-up">
            {/* Prompt label */}
            <div className="playoff-prompt">
                <span className="prompt-tag">{playoff.tag}</span>
                <span className="prompt-label">PROMPT:</span>
                <p className="prompt-text">{playoff.prompt}</p>
            </div>

            <div className="playoff-content">
                {/* Main Shot */}
                <div className="main-shot-wrapper">
                    <MainShotCard
                        shot={playoff.mainShot}
                        reboundCount={playoff.mainShot.reboundCount}
                        category={playoff.category}
                    />
                </div>

                {/* Rebounds section */}
                <div className="rebounds-section">
                    <div className="rebounds-count-header">
                        <span className="rebounds-arrow">↩</span>
                        <span className="rebounds-count">{playoff.mainShot.reboundCount}</span>
                    </div>
                    <div className="rebounds-scroll-container">
                        <button className="scroll-arrow scroll-left" onClick={scrollLeft}>‹</button>
                        <div className="rebounds-grid" ref={scrollRef}>
                            {playoff.rebounds.map((rebound, i) => (
                                <ReboundCard key={rebound.id} rebound={rebound} index={i} />
                            ))}
                        </div>
                        <button className="scroll-arrow scroll-right" onClick={scrollRight}>›</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Hero Section ── */
function PlayoffsHero() {
    return (
        <div className="playoffs-hero fade-in-up">
            <div className="hero-content">
                <div className="hero-badge">🏆 Community Challenges</div>
                <h1 className="hero-title">Playoffs</h1>
                <p className="hero-description">
                    Playoffs are tickets with rebounds from multiple team members. Join a playoff
                    by browsing active challenges below and posting your own solution shot.
                </p>
                <div className="hero-actions">
                    <button className="btn btn-primary hero-btn">Start a Playoff</button>
                    <button className="btn btn-secondary hero-btn">Browse All</button>
                </div>
            </div>
            <div className="hero-illustration">
                <div className="hero-3d-scene">
                    <div className="scene-card scene-card-1">
                        <span>📊</span>
                        <div className="card-bar" style={{ width: "80%", background: "#FFCE32" }} />
                        <div className="card-bar" style={{ width: "60%", background: "rgba(212,255,0,0.4)" }} />
                        <div className="card-bar" style={{ width: "90%", background: "rgba(212,255,0,0.2)" }} />
                    </div>
                    <div className="scene-card scene-card-2">
                        <span>🎯</span>
                        <div className="card-dot-grid">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <div key={i} className="dot" style={{ background: i % 3 === 0 ? "#FFCE32" : "#333" }} />
                            ))}
                        </div>
                    </div>
                    <div className="scene-card scene-card-3">
                        <span>⚡</span>
                        <div className="progress-ring">
                            <svg viewBox="0 0 60 60" width="60" height="60">
                                <circle cx="30" cy="30" r="24" fill="none" stroke="#333" strokeWidth="4" />
                                <circle
                                    cx="30" cy="30" r="24" fill="none"
                                    stroke="#FFCE32" strokeWidth="4"
                                    strokeDasharray={`${0.72 * 2 * Math.PI * 24} ${2 * Math.PI * 24}`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 30 30)"
                                />
                            </svg>
                        </div>
                    </div>
                    <div className="scene-floating-dots">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className={`floating-dot dot-${i}`} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Main Playoffs Page ── */
const PlayoffsPage = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [activeFilter, setActiveFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [scrolled, setScrolled] = useState(false);

    const filters = ["All", "High Priority", "In Progress", "Pending", "Resolved"];

    useEffect(() => {
        const handleScroll = () => {
            const container = document.querySelector(".playoffs-page");
            if (container) setScrolled(container.scrollTop > 60);
        };
        const el = document.querySelector(".playoffs-page");
        el?.addEventListener("scroll", handleScroll);
        return () => el?.removeEventListener("scroll", handleScroll);
    }, []);

    const filteredPlayoffs = PLAYOFFS_DATA.filter((p) => {
        const matchesFilter =
            activeFilter === "All" ||
            p.category.toLowerCase().includes(activeFilter.toLowerCase()) ||
            p.mainShot.role.toLowerCase().includes(activeFilter.toLowerCase());
        const matchesSearch =
            searchQuery === "" ||
            p.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.mainShot.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <div className="playoffs-page">
            {/* ── Sticky Navbar ── */}
            <nav className={`playoffs-nav ${scrolled ? "nav-scrolled" : ""}`}>
                <div className="nav-brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
                    <span className="nav-logo-text">gira</span>
                </div>

                <div className="nav-search-wrap">
                    <div className="nav-search-bar">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search tickets, prompts, team members..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        <div className="search-category">Tickets ▾</div>
                        <button className="search-btn">Search</button>
                    </div>
                </div>

                <div className="nav-links">
                    <a className="nav-link" onClick={() => navigate("/")}>Explore ▾</a>
                    {user?.role === "manager" && (
                        <a className="nav-link" onClick={() => navigate("/manager-dashboard")}>Dashboard ▾</a>
                    )}
                    {user?.role === "worker" && (
                        <a className="nav-link" onClick={() => navigate("/worker-dashboard")}>My Tickets ▾</a>
                    )}
                    {user?.role === "provider" && (
                        <a className="nav-link" onClick={() => navigate("/provider-dashboard")}>Assigned ▾</a>
                    )}
                    <a className="nav-link">Community ▾</a>
                </div>

                <div className="nav-actions">
                    {user ? (
                        <>
                            <span className="nav-user-name">👤 {user.name}</span>
                            <button className="btn-login" onClick={handleLogout}>Sign out</button>
                        </>
                    ) : (
                        <>
                            <a className="nav-signup" onClick={() => navigate("/signup")}>Sign up</a>
                            <button className="btn-login" onClick={() => navigate("/login")}>Log in</button>
                        </>
                    )}
                </div>
            </nav>

            <div className="playoffs-content">
                {/* ── Hero ── */}
                <PlayoffsHero />

                {/* ── Filter Bar ── */}
                <div className="filter-bar fade-in-up">
                    <div className="filter-tabs">
                        {filters.map((f) => (
                            <button
                                key={f}
                                className={`filter-tab ${activeFilter === f ? "filter-tab-active" : ""}`}
                                onClick={() => setActiveFilter(f)}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <div className="filter-right">
                        <span className="results-count">{filteredPlayoffs.length} playoffs</span>
                        <select className="sort-select">
                            <option>Latest</option>
                            <option>Most Rebounds</option>
                            <option>Most Liked</option>
                        </select>
                    </div>
                </div>

                {/* ── Playoff Rows ── */}
                <div className="playoffs-list">
                    {filteredPlayoffs.length > 0 ? (
                        filteredPlayoffs.map((playoff) => (
                            <PlayoffRow key={playoff.id} playoff={playoff} />
                        ))
                    ) : (
                        <div className="empty-playoffs">
                            <div className="empty-icon">🏀</div>
                            <h3>No playoffs found</h3>
                            <p>Try adjusting your filters or search query</p>
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <footer className="playoffs-footer">
                    <div className="footer-brand">
                        <span>gira</span>
                    </div>
                    <p className="footer-text">© 2026 GIRA · Service Management Platform</p>
                    <div className="footer-links">
                        <a href="#">About</a>
                        <a href="#">Privacy</a>
                        <a href="#">Terms</a>
                        <a href="#">Contact</a>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default PlayoffsPage;
