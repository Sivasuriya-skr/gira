import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import "./WelcomePage.css";

/* ─────────────────────────────────────────────
   SCROLL REVEAL HOOK (native IntersectionObserver)
   Adds 'is-visible' class when element enters viewport
   ───────────────────────────────────────────── */
function useScrollReveal(options = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px", ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

/* Wrapper component for scroll-reveal items */
function Reveal({ children, className = "", delay = 0, direction = "up", style = {} }) {
  const [ref, visible] = useScrollReveal();
  const dirMap = { up: "reveal-up", right: "reveal-right", left: "reveal-left", "zoom": "reveal-zoom", "flip": "reveal-flip" };
  const dirClass = dirMap[direction] || "reveal-up";
  return (
    <div
      ref={ref}
      className={`scroll-reveal ${dirClass}${visible ? " is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   DATA
   ───────────────────────────────────────────── */
const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
];

const STATS = [
  { num: "10,000+", label: "Tickets Resolved" },
  { num: "98%",     label: "Satisfaction Rate" },
  { num: "3 min",   label: "Avg Response Time" },
  { num: "500+",    label: "Teams Using Gira" },
];

const FEATURES = [
  {
    num: "01",
    name: "Intelligent Ticket Routing",
    desc: "AI-powered assignment engine automatically routes every ticket to the right agent based on expertise, workload, and priority — zero manual triage.",
  },
  {
    num: "02",
    name: "Real-Time Collaboration",
    desc: "Internal notes, @mentions, and live presence indicators let your team work on tickets together without ever stepping on each other.",
  },
  {
    num: "03",
    name: "Omnichannel Inbox",
    desc: "Email, chat, Slack, WhatsApp — every support channel lands in one clean inbox. Context travels with every conversation.",
  },
  {
    num: "04",
    name: "SLA Management & Alerts",
    desc: "Define custom SLA policies. Get proactive alerts before deadlines slip. Dashboard visibility across every tier of your team.",
  },
  {
    num: "05",
    name: "Automated Workflows",
    desc: "Build no-code automation rules that handle repetitive tasks — auto-tagging, escalation, canned responses — so agents focus on humans.",
  },
  {
    num: "06",
    name: "Analytics & Reporting",
    desc: "Granular reports on CSAT, first-reply time, resolution rates, and agent performance. Export, schedule, and share with leadership.",
  },
];

const TESTIMONIALS = [
  {
    quote: "Gira cut our average resolution time by 40% in the first month. Our team finally has a tool that gets out of the way.",
    name: "Priya Sharma",
    role: "Head of Support · Nexova Labs",
    initials: "PS",
  },
  {
    quote: "The SLA management alone is worth every rupee. We used to miss deadlines weekly — now it's zero misses, three months running.",
    name: "James Okoro",
    role: "VP Customer Success · Finstack",
    initials: "JO",
  },
  {
    quote: "Clean, fast, and human. Gira is the first helpdesk tool my agents actually enjoy using.",
    name: "Sara Lin",
    role: "Support Manager · Driftwave",
    initials: "SL",
  },
];

const LOGOS = [
  "NEXOVA", "FINSTACK", "DRIFTWAVE", "KUBEX", "AXONIFY", "LUMIO",
];

const MARQUEE_TEXT = [
  "RESOLVE FASTER", "SCALE SMARTER", "SUPPORT BETTER", "GIRA HELPDESK",
  "RESOLVE FASTER", "SCALE SMARTER", "SUPPORT BETTER", "GIRA HELPDESK",
];

/* ─────────────────────────────────────────────
   NAVBAR
   ───────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const scrollTo = (e, href) => {
    e.preventDefault();
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <nav className={`gira-nav${scrolled ? " scrolled" : ""}`}>
        <div className="container">
          <div className="nav-inner">
            {/* Logo */}
            <a href="#" className="nav-logo logo-font" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              gira
            </a>


            {/* Desktop Links */}
            <ul className="nav-links">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} onClick={(e) => scrollTo(e, href)}>{label}</a>
                </li>
              ))}
            </ul>

            {/* Desktop CTA */}
            <Link to="/login" className="nav-cta">Get Started →</Link>

            {/* Burger */}
            <div
              className="nav-burger"
              role="button"
              aria-label="Open menu"
              tabIndex={0}
              onClick={() => setMobileOpen(true)}
              onKeyDown={(e) => e.key === "Enter" && setMobileOpen(true)}
            >
              <span /><span /><span />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu${mobileOpen ? " open" : ""}`}>
        <button className="mobile-close" aria-label="Close menu" onClick={() => setMobileOpen(false)}>✕</button>
        {NAV_LINKS.map(({ label, href }) => (
          <a key={label} href={href} onClick={(e) => scrollTo(e, href)}>{label}</a>
        ))}
        <Link to="/login" className="btn-purple" style={{ fontSize: 16 }} onClick={() => setMobileOpen(false)}>
          Get Started →
        </Link>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   HERO
   ───────────────────────────────────────────── */
function HeroSection() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 18,
    mass: 0.6,
  });

  const card1Y = useTransform(smoothProgress, [0, 0.33], [0, -140]);
  const card1Opacity = useTransform(smoothProgress, [0, 0.33], [1, 0]);
  const card1Rotate = useTransform(smoothProgress, [0, 0.33], [0, -1]);

  const card2Y = useTransform(smoothProgress, [0.16, 0.45], [140, 0]);
  const card2Opacity = useTransform(smoothProgress, [0.18, 0.42], [0, 1]);
  const card2Scale = useTransform(smoothProgress, [0.18, 0.42], [0.95, 1]);

  const card3Y = useTransform(smoothProgress, [0.48, 0.75], [200, 0]);
  const card3Opacity = useTransform(smoothProgress, [0.5, 0.72], [0, 1]);
  const card3Scale = useTransform(smoothProgress, [0.5, 0.72], [0.94, 1]);

  return (
    <section className="hero-section" id="hero" ref={sectionRef}>
      <div className="hero-gradient" />
      <div className="hero-noise" />

      <div className="hero-shell">
        <div className="hero-grid">
          <div className="hero-left">
            <span className="hero-eyebrow">
              Enterprise intelligence, human touch
            </span>

            <h1 className="hero-headline">
              Support that feels <span className="headline-outline">HUMAN.</span>
            </h1>

            <h2 className="hero-subline">
              Scales like software.
            </h2>

            <p className="hero-copy">
              Gira is the helpdesk platform built for teams who refuse to trade quality for speed.
              Resolve smarter, collaborate faster, and delight every customer.
            </p>

            <div className="hero-cta">
              <Link to="/signup" className="btn-primary">
                Start free trial
              </Link>
              <a
                href="#features"
                className="btn-ghost"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                See platform
              </a>
            </div>

            <div className="hero-proof">
              <div className="pill live">Live</div>
              <span>Operational · 99.99% uptime</span>
              <span className="dot-sep" />
              <span>98% CSAT last 30d</span>
              <span className="dot-sep" />
              <span>120 active conversations</span>
            </div>
          </div>

          <div className="hero-right">
            <div className="card-stack">
              <motion.div
                className="glass-card card-one"
                style={{ y: card1Y, opacity: card1Opacity, rotate: card1Rotate }}
              >
                <div className="card-top">
                  <div>
                    <div className="card-label"><span className="logo-font">gira</span> Workspace</div>

                    <div className="card-subtle">Live queue</div>
                  </div>
                  <div className="pill">Queue · realtime</div>
                </div>

                <div className="ticket-rows">
                  {[
                    { status: "open", text: "Login issue · unable to access dashboard", time: "2m" },
                    { status: "warn", text: "Bulk import stalled at 65%", time: "9m" },
                    { status: "closed", text: "API key regeneration request", time: "14m" },
                    { status: "open", text: "Email notifications not arriving", time: "21m" },
                    { status: "warn", text: "SSO config · Azure AD", time: "34m" },
                  ].map((t, i) => (
                    <div className="ticket-row" key={i}>
                      <span className={`status-dot ${t.status}`} />
                      <span className="ticket-text">{t.text}</span>
                      <span className="ticket-time">{t.time}</span>
                    </div>
                  ))}
                </div>

                <div className="card-footer">
                  <div className="pulse-dot" />
                  <span>Live triage with AI assist</span>
                </div>
              </motion.div>

              <motion.div
                className="glass-card card-two"
                style={{ y: card2Y, opacity: card2Opacity, scale: card2Scale }}
              >
                <div className="card-top">
                  <div>
                    <div className="card-label">Team Performance</div>
                    <div className="card-subtle">Precision metrics</div>
                  </div>
                  <div className="pill ghost">SLA · 99.4%</div>
                </div>

                <div className="metric-grid">
                  {[
                    { label: "CSAT", value: "98%", accent: "purple" },
                    { label: "Avg reply", value: "2.8m", accent: "blue" },
                    { label: "Backlog", value: "18", accent: "amber" },
                  ].map((m) => (
                    <div className="metric-card" key={m.label}>
                      <div className="metric-label">{m.label}</div>
                      <div className={`metric-value ${m.accent}`}>{m.value}</div>
                      <div className="metric-progress">
                        <span className={`metric-bar ${m.accent}`} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="legend-row">
                  <div className="legend-item">
                    <span className="legend-dot green" />
                    On track
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot amber" />
                    Watchlist
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot red" />
                    Breach risk
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="glass-card card-three"
                style={{ y: card3Y, opacity: card3Opacity, scale: card3Scale }}
              >
                <div className="card-top">
                  <div>
                    <div className="card-label">AI Automation</div>
                    <div className="card-subtle">Precision workflows</div>
                  </div>
                  <div className="pill">Bot · ON</div>
                </div>

                <div className="automation-rows">
                  {[
                    { title: "Intent detection", desc: "Routes by urgency + owner", state: "active" },
                    { title: "Suggested replies", desc: "Tone-safe, multilingual", state: "active" },
                    { title: "Auto-tag & SLA", desc: "Policy-based escalations", state: "active" },
                    { title: "Handoff guardrails", desc: "No dead ends for customers", state: "guard" },
                  ].map((item) => (
                    <div className="automation-row" key={item.title}>
                      <div>
                        <div className="automation-title">{item.title}</div>
                        <div className="automation-desc">{item.desc}</div>
                      </div>
                      <span className={`pill ${item.state === "guard" ? "ghost" : ""}`}>
                        {item.state === "guard" ? "Guarded" : "Active"}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="bot-footer">
                  <div className="bot-avatar">λ</div>
                  <div>
                    <div className="card-subtle">AI Agent</div>
                    <div className="bot-status">
                      Handles handoffs in <span className="accent-purple">0.8s</span> with human-grade tone.
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   LOGOS SECTION
   ───────────────────────────────────────────── */
function LogosSection() {
  return (
    <div className="logos-section">
      <div className="container">
        <Reveal><p className="logos-label">Trusted by forward-thinking teams worldwide</p></Reveal>
        <div className="logos-row">
          {LOGOS.map((logo, i) => (
            <Reveal key={logo} delay={i * 60}>
              <div className="logo-item">{logo}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MARQUEE STRIP
   ───────────────────────────────────────────── */
function MarqueeStrip() {
  return (
    <div className="marquee-wrapper" aria-hidden="true">
      <div className="marquee-track">
        {MARQUEE_TEXT.map((txt, i) => (
          <span key={i}>· {txt}</span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STATS SECTION
   ───────────────────────────────────────────── */
function StatsSection() {
  return (
    <section className="stats-section">
      <div className="container">
        <div className="row g-0">
          {STATS.map((s, i) => (
            <div key={s.num} className="col-6 col-md-3 stat-col text-center">
              <Reveal direction="zoom" delay={i * 100}>
                <span className="stat-number">{s.num}</span>
                <span className="stat-label">{s.label}</span>
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FEATURES SECTION
   ───────────────────────────────────────────── */
function FeaturesSection() {
  return (
    <section className="features-section" id="features">
      <div className="container">
        <div className="row g-5">

          {/* Sticky heading col */}
          <div className="col-lg-4 features-heading-col">
            <Reveal direction="right">
              <h2 className="features-heading">
                Everything<br />your team<br />needs.
              </h2>
              <p className="features-heading-sub">
                Six core pillars that power world-class support operations —
                from solo teams to enterprise.
              </p>
              <div style={{ marginTop: 40, height: 1, background: "#222", maxWidth: 120 }} />
              <p style={{ marginTop: 24, fontFamily: "'Mulish', sans-serif", fontWeight: 300, fontSize: 13, color: "#444" }}>
                Every feature ships on day one.<br />No paywalls. No add-ons.
              </p>
            </Reveal>
          </div>

          {/* Feature list col */}
          <div className="col-lg-8">
            {FEATURES.map((f, i) => (
              <Reveal key={f.num} delay={i * 80}>
                <div className="feature-item">
                  <div className="feature-num">{f.num}</div>
                  <div className="feature-content">
                    <div className="feature-name">{f.name}</div>
                    <p className="feature-desc">{f.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   PRICING SECTION
   ───────────────────────────────────────────── */
const PLANS = [
  {
    name: "Launch",
    price: "₹1",
    cadence: "agent / month",
    tagline: "Everything to get moving fast.",
    features: [
      "Shared inbox & SLAs",
      "Macros and tagging",
      "CSAT surveys",
      "Email & chat channels",
      "Basic automation rules",
    ],
    cta: "Start free",
    accent: "purple",
  },
  {
    name: "Scale",
    price: "₹10",
    cadence: "agent / month",
    tagline: "Built for growing teams that need control.",
    features: [
      "Advanced routing (skills, load)",
      "Custom roles & approvals",
      "Workflow builder",
      "Analytics & scheduled reports",
      "Priority support",
    ],
    cta: "Talk to sales",
    accent: "blue",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "per org",
    tagline: "Security, scale, and white-glove rollout.",
    features: [
      "SAML/SSO & SCIM",
      "Data residency options",
      "Dedicated CSM",
      "Onboarding & migration",
      "99.99% uptime SLA",
    ],
    cta: "Book a demo",
    accent: "green",
  },
];

function PricingSection() {
  return (
    <section className="pricing-section" id="pricing">
      <div className="container">
        <Reveal direction="up">
          <div className="pricing-header">
            <p className="eyebrow">Pricing</p>
            <h2>Choose a plan that scales with you.</h2>
            <p className="pricing-sub">
              Simple, transparent pricing. Upgrade only when your team is ready.
            </p>
          </div>
        </Reveal>

        <div className="pricing-grid">
          {PLANS.map((plan, idx) => (
            <Reveal key={plan.name} delay={idx * 80}>
              <div className={`pricing-card ${plan.popular ? "popular" : ""}`}>
                {plan.popular && <div className="pill popular-pill">Most popular</div>}
                <div className="pricing-top">
                  <div className="pricing-name">{plan.name}</div>
                  <div className="pricing-price">
                    <span className="price">{plan.price}</span>
                    <span className="cadence">/{plan.cadence}</span>
                  </div>
                  <div className="pricing-tagline">{plan.tagline}</div>
                </div>
                <ul className="pricing-features">
                  {plan.features.map((f) => (
                    <li key={f}>
                      <span className={`check ${plan.accent}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <a className={`pricing-cta ${plan.accent}`} href="#hero" onClick={(e)=>{e.preventDefault(); document.querySelector("#hero")?.scrollIntoView({behavior:"smooth"});}}>
                  {plan.cta}
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   ABOUT SECTION
   ───────────────────────────────────────────── */
function AboutSection() {
  return (
    <section className="about-section" id="about">
      <div className="container">
        <div className="about-grid">
          <Reveal direction="right">
            <div className="about-copy">
              <p className="eyebrow">About Gira</p>
              <h2>Enterprise support with a human heartbeat.</h2>
              <p className="about-sub">
                Gira blends precision automation with empathetic workflows. From intent-aware routing to
                AI-assisted replies, every touchpoint is designed to feel personal—no matter how fast you scale.
              </p>
              <div className="about-pills">
                <span className="pill ghost">Founded 2026</span>
                <span className="pill ghost">Remote-first</span>
                <span className="pill ghost">Security-first</span>
              </div>
              <div className="about-metrics">
                <div>
                  <div className="about-num">99.99%</div>
                  <div className="about-label">Uptime commitment</div>
                </div>
                <div>
                  <div className="about-num">45+</div>
                  <div className="about-label">Integrations</div>
                </div>
                <div>
                  <div className="about-num">24/7</div>
                  <div className="about-label">Global support</div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="about-panel">
              <div className="about-panel-header">
                <span>Security & Compliance</span>
                <span className="pill ghost">Audit-ready</span>
              </div>
              <ul className="about-list">
                {[
                  "SOC 2 controls in place; pen-tested quarterly",
                  "SAML SSO, SCIM, RBAC, and audit trails",
                  "Data residency options (US/EU) with backups",
                  "PII redaction and secret vaulting for tickets",
                ].map((item) => (
                  <li key={item}>
                    <span className="about-dot" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="about-footer">
                Built for teams that need reliability without sacrificing empathy.
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   TESTIMONIALS
   ───────────────────────────────────────────── */
function TestimonialsSection() {
  return (
    <section className="testimonials-section">
      <div className="container">
        <Reveal><span className="testimonial-label">What teams are saying</span></Reveal>
        <div className="row g-0">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="col-lg-4 testimonial-card pe-lg-5">
              <Reveal delay={i * 120}>
                <p className="testimonial-quote">"{t.quote}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{t.initials}</div>
                  <div>
                    <div className="author-info-name">{t.name}</div>
                    <div className="author-info-role">{t.role}</div>
                  </div>
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FOOTER CTA
   ───────────────────────────────────────────── */
function FooterCTA() {
  return (
    <section className="footer-cta-section">
      <div className="container">
        <Reveal>
          <h2 className="footer-cta-heading">
            Ready to transform<br />
            your <span>support?</span>
          </h2>
        </Reveal>

        <Reveal delay={120}>
          <p className="footer-cta-sub">
            Join 500+ teams already using Gira to resolve faster,
            scale smarter, and support better.
          </p>
        </Reveal>

        <Reveal delay={240} style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
          <Link to="/signup" className="btn-purple" style={{ padding: "18px 44px", fontSize: 16 }}>
            Get Started Free →
          </Link>
          <Link to="/login" style={{
            fontFamily: "'Mulish', sans-serif",
            fontWeight: 400,
            fontSize: 15,
            color: "#555",
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            transition: "color 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.color = "#7c3aed"}
            onMouseLeave={e => e.currentTarget.style.color = "#555"}
          >
            Already have an account? Sign in
          </Link>
        </Reveal>

        {/* Footer bar */}
        <div className="footer-bar">
          <span className="footer-logo logo-font">gira</span>

          <span className="footer-copy">© 2026 Gira. All rights reserved.</span>
          <div className="footer-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Status</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   PAGE ROOT
   ───────────────────────────────────────────── */
export default function WelcomePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="gira-landing">
      <Navbar />
      <HeroSection />
      <LogosSection />
      <MarqueeStrip />
      <StatsSection />
      <FeaturesSection />
      <PricingSection />
      <AboutSection />
      <TestimonialsSection />
      <FooterCTA />
    </div>
  );
}
