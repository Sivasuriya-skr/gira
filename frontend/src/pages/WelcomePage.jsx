import React, { useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./WelcomePage.css";

const heroItems = ["badge", "h1", "sub", "ctas"];

const stats = [
  { label: "Teams", value: 10000 },
  { label: "Satisfaction", value: 98, suffix: "%" },
  { label: "Response", value: 2, suffix: " min" },
  { label: "Support", value: 24, suffix: "/7" },
];

const testimonials = [
  { initials: "AL", quote: "Cut our response time in half.", name: "Ava Lopez" },
  { initials: "KM", quote: "Agents love the new workflows.", name: "Kieran M." },
  { initials: "SS", quote: "Delightful UI, powerful routing.", name: "Sal S." },
  { initials: "JP", quote: "Happy customers, calmer team.", name: "Jules P." },
  { initials: "RT", quote: "Onboarded in a day—wow.", name: "Ria Tan" },
  { initials: "DB", quote: "Best helpdesk we’ve tried.", name: "Dane B." },
];

const steps = [
  { title: "Submit a Ticket", desc: "Workers raise issues from web, chat, or email." },
  { title: "AI Triages It", desc: "Smart routing, SLA detection, and summarization." },
  { title: "Resolved Fast", desc: "Collaborate in one thread, ship quicker updates." },
];

const bentoCards = [
  { id: "ai", title: "AI-Powered Ticketing", type: "hero" },
  { id: "two-min", title: "2 min Avg Response", type: "response" },
  { id: "csat", title: "98% Satisfaction", type: "csat" },
  { id: "chat", title: "Live Chat", type: "chat" },
  { id: "multi", title: "Multichannel", type: "multi" },
  { id: "cta", title: "Start Free — No credit card needed", type: "cta" },
];

export default function WelcomePage() {
  const navigate = useNavigate();
  const cardRefs = useRef([]);
  const sectionRefs = useRef([]);
  const statRef = useRef(null);
  const ringRef = useRef(null);
  const connectRef = useRef(null);
  const cursorRef = useRef(null);

  // custom cursor
  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    const move = (e) => {
      cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // scroll progress
  useEffect(() => {
    const bar = document.querySelector(".lp-scrollbar");
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      if (bar) bar.style.width = `${scrolled}%`;
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // entrance observer for cards and sections
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("lp-card-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.28 }
    );
    cardRefs.current.forEach((el) => el && obs.observe(el));
    sectionRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // hero stagger
  useEffect(() => {
    heroItems.forEach((id, idx) => {
      const el = document.querySelector(`[data-hero="${id}"]`);
      if (!el) return;
      el.style.animation = `fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards`;
      el.style.animationDelay = `${idx * 0.1 + 0.15}s`;
    });
  }, []);

  // stats count when visible
  useEffect(() => {
    const nums = document.querySelectorAll("[data-count]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = parseInt(entry.target.dataset.count, 10) || 0;
            const suffix = entry.target.dataset.suffix || "";
            let start;
            const duration = 1200;
            const step = (ts) => {
              if (!start) start = ts;
              const p = Math.min((ts - start) / duration, 1);
              const val = Math.floor(p * target);
              entry.target.textContent = target >= 1000 ? val.toLocaleString() + suffix : val + suffix;
              if (p < 1) requestAnimationFrame(step);
              else entry.target.textContent = target >= 1000 ? target.toLocaleString() + suffix : target + suffix;
            };
            requestAnimationFrame(step);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );
    nums.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  // ring animation on visible
  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const circle = ring.querySelector(".progress");
          if (circle) circle.style.strokeDashoffset = 314 - 314 * 0.78;
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(ring);
    return () => io.disconnect();
  }, []);

  // connector line
  useEffect(() => {
    const line = connectRef.current;
    if (!line) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          line.style.transform = "scaleX(1)";
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(line);
    return () => io.disconnect();
  }, []);

  // magnetic tilt removed for flatter hover lift
  useEffect(() => {}, []);

  // CTA particles
  useEffect(() => {
    const container = document.querySelector(".lp-particles");
    if (!container) return;
    for (let i = 0; i < 20; i++) {
      const dot = document.createElement("span");
      dot.style.left = `${Math.random() * 100}%`;
      dot.style.bottom = `${Math.random() * 120}px`;
      dot.style.animationDuration = `${12 + Math.random() * 8}s`;
      dot.style.animationDelay = `${-Math.random() * 5}s`;
      container.appendChild(dot);
    }
    return () => {
      container.innerHTML = "";
    };
  }, []);

  // marquee duplication for seamless loop
  const marqueeItems = useMemo(() => [...testimonials, ...testimonials], []);

  const handleRipple = (e) => {
    const btn = e.currentTarget;
    const ripple = document.createElement("span");
    ripple.className = "lp-ripple-circle";
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
  };

  return (
    <div className="lp-root">
      <div className="lp-scrollbar" />
      <div className="lp-blobs">
        <div className="lp-blob b1" />
        <div className="lp-blob b2" />
        <div className="lp-blob b3" />
        <div className="lp-blob b4" />
      </div>
      <div className="lp-noise" aria-hidden="true" />
      <div ref={cursorRef} className="lp-cursor" aria-hidden="true" />

      <nav className="lp-nav">
        <div className="lp-nav-left">
          gira <span className="lp-logo-dot" />
        </div>
        <div className="lp-nav-center">
          {["Features", "Pricing", "Docs", "About"].map((label) => (
            <a key={label} href={`#${label.toLowerCase()}`} className="lp-nav-link">
              {label}
            </a>
          ))}
        </div>
        <div className="lp-nav-right">
          <Link to="/login" className="lp-btn lp-btn-ghost">
            Log in
          </Link>
          <button className="lp-btn lp-btn-yellow lp-btn-ripple" onClick={(e) => { handleRipple(e); navigate("/signup"); }}>
            Get Started
          </button>
        </div>
      </nav>

      <div className="lp-page">
        <header className="lp-hero">
          <div className="lp-badge" data-hero="badge">
            <span className="lp-badge-dot" /> Now in Beta
          </div>
          <h1 data-hero="h1">
            <div>Support made</div>
            <div className="lp-hero-line-blue">smarter.</div>
            <div className="lp-hero-stroke">Reimagined.</div>
          </h1>
          <p className="lp-hero-sub" data-hero="sub">
            Join 10,000+ teams using Gira to resolve tickets faster, automate workflows, and keep customers genuinely happy.
          </p>
          <div className="lp-hero-ctas" data-hero="ctas">
            <button className="lp-btn lp-btn-yellow lp-btn-ripple" onClick={(e) => { handleRipple(e); navigate("/signup"); }}>
              Get Started Free →
            </button>
            <button className="lp-btn lp-btn-ghost" onClick={() => window.scrollTo({ top: document.body.scrollHeight / 3, behavior: "smooth" })}>
              Watch Demo ▶
            </button>
          </div>
        </header>

        <section className="lp-stats" ref={(el) => (statRef.current = el)}>
          {stats.map((s, i) => (
            <div className="lp-stat" key={s.label}>
              <div className="lp-stat-number" data-count={s.value} data-suffix={s.suffix || ""}>
                0
              </div>
              <p className="lp-stat-label">{s.label}</p>
            </div>
          ))}
        </section>

        <section id="features" className="lp-features">
          <div className="lp-features-header">
            <span className="lp-section-eyebrow">FEATURES</span>
            <h3 className="lp-section-title">Everything your support team needs</h3>
            <div className="lp-section-underline" />
          </div>
          <div className="lp-bento">
            {bentoCards.map((card, idx) => (
              <article
                key={card.id}
                ref={(el) => (cardRefs.current[idx] = el)}
                className={`lp-card card-${card.id}`}
                style={{ transitionDelay: `${idx * 0.12}s` }}
              >
                {card.type === "hero" && (
                  <>
                    <span className="lp-badge-ai">AI</span>
                    <h4>{card.title}</h4>
                    <p>Prioritize, route, and summarize tickets with context-aware AI.</p>
                    <div className="lp-ticket-list">
                      <div className="lp-ticket">
                        Ticket #4821 <span className="pill green">Resolved</span>
                      </div>
                      <div className="lp-ticket">
                        Ticket #4822 <span className="pill amber">In Progress</span>
                      </div>
                      <div className="lp-ticket">
                        Ticket #4823 <span className="pill blue">Assigned</span>
                      </div>
                    </div>
                  </>
                )}

                {card.type === "response" && (
                  <>
                    <h4>{card.title}</h4>
                    <div className="lp-number-giant" style={{ color: "#0A1A4E" }}>
                      2m
                    </div>
                    <div className="lp-ring" ref={(el) => (ringRef.current = el)}>
                      <svg width="120" height="120">
                        <circle className="track" cx="60" cy="60" r="50" strokeWidth="12" fill="none" />
                        <circle className="progress" cx="60" cy="60" r="50" strokeWidth="12" fill="none" />
                      </svg>
                    </div>
                  </>
                )}

                {card.type === "csat" && (
                  <>
                    <h4>{card.title}</h4>
                    <div className="lp-number-giant" data-count="98" data-suffix="%">
                      0%
                    </div>
                    <svg className="lp-trend" viewBox="0 0 120 40" preserveAspectRatio="none">
                      <path d="M5 30 L35 18 L55 22 L80 10 L115 6" stroke="#22C55E" strokeWidth="4" fill="none" strokeLinecap="round" />
                    </svg>
                  </>
                )}

                {card.type === "chat" && (
                  <div className="lp-livechat">
                    <h4>{card.title}</h4>
                    <div className="lp-bubble user">Hi! Need help with SLAs.</div>
                    <div className="lp-bubble agent">Sure — setting auto-escalation now.</div>
                    <div className="lp-typing">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                )}

                {card.type === "multi" && (
                  <>
                    <h4>{card.title}</h4>
                    <p>Email, chat, phone, and social — one thread, one SLA.</p>
                    <div className="lp-icon-grid">
                      {["📧 Email", "💬 Chat", "📞 Phone", "🌐 Social"].map((txt) => (
                        <div key={txt} className="lp-icon-pill">
                          {txt}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {card.type === "cta" && (
                  <div className="lp-cta-card">
                    <div className="lp-cta-text">
                      <h4>{card.title}</h4>
                      <p>No card required. Launch in minutes.</p>
                    </div>
                    <button className="lp-cta-btn" onClick={(e) => { handleRipple(e); navigate("/signup"); }}>
                      Get Started →
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        <section id="docs" className="lp-how">
          <h3 className="lp-section-title">How it works</h3>
          <div className="lp-steps">
            <div ref={connectRef} className="lp-connect" />
            {steps.map((step, idx) => (
              <div
                key={step.title}
                className="lp-step-card"
                ref={(el) => (sectionRefs.current[idx] = el)}
                style={{ transitionDelay: `${idx * 0.12}s` }}
              >
                <div className="lp-step-num">{idx + 1}</div>
                <h5>{step.title}</h5>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="lp-testimonials">
          <div className="lp-marquee">
            {marqueeItems.map((t, i) => (
              <div className="lp-quote" key={`${t.initials}-${i}`}>
                <div className="lp-avatar">{t.initials}</div>
                <div>
                  <p className="lp-quote-text">{t.quote}</p>
                  <div className="lp-quote-name">{t.name}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="about" className="lp-cta">
          <div className="lp-cta-blob" />
          <div className="lp-particles" aria-hidden="true" />
          <h3>Ready to transform your support?</h3>
          <p>Automate the busywork, empower agents, and give customers a support experience they’ll love.</p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button className="lp-btn lp-btn-yellow lp-btn-ripple" onClick={handleRipple}>
              Start Free
            </button>
            <button className="lp-btn lp-btn-ghost">Talk to sales</button>
          </div>
        </section>

        <footer className="lp-footer">
          <div className="lp-footer-top">
            <div>
              <div className="lp-footer-logo">
                gira <span className="lp-logo-dot" />
              </div>
              <p style={{ color: "var(--text-muted)" }}>Support made smarter for modern teams.</p>
            </div>
            <div>
              <h6>Product</h6>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#docs">Docs</a>
            </div>
            <div>
              <h6>Company</h6>
              <a href="#about">About</a>
              <a href="#careers">Careers</a>
              <a href="#blog">Blog</a>
            </div>
            <div>
              <h6>Legal</h6>
              <a href="#privacy">Privacy</a>
              <a href="#terms">Terms</a>
              <a href="#security">Security</a>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <span>© {new Date().getFullYear()} Gira. All rights reserved.</span>
            <div className="lp-socials">
              {["X", "in", "YT"].map((s) => (
                <a key={s} href="#" aria-label={s}>
                  {s}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
