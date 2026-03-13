import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/* ── hooks ── */
function useInView(t = 0.1) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: t });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, [t]);
  return [ref, v];
}

function useCounter(target, dur = 1400, go = false) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!go) return;
    let t0 = null;
    const tick = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / dur, 1);
      setN(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [go, target, dur]);
  return n;
}

function Reveal({ children, delay = 0, style = {} }) {
  const [ref, v] = useInView();
  return (
    <div ref={ref} style={{
      opacity: v ? 1 : 0,
      transform: v ? "none" : "translateY(16px)",
      transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      ...style
    }}>{children}</div>
  );
}

const PINK = "#e8185d";
const B = "#f0f0f0";

const PRODUCTS = [
  { id: "hyperx",  title: "HyperX",           tag: "Learning Platform",   desc: "Professional experience as a subject. We teach what no YouTube or college covers: workplace culture, salary negotiation, interview mastery, and how to actually survive and grow at work.", features: ["Professional work culture & politics", "Salary negotiation strategies", "English fluency for the workplace", "Interview prep for any role"], color: PINK,      to: "/hyperx"  },
  { id: "gene",    title: "Gen-E AI",          tag: "Career Intelligence", desc: "Your AI career starting point. Resume analysis, job matching, skill gap detection, and a personalised 3-month action plan — built for freshers, career changers, and anyone stuck.", features: ["Resume analysis & ATS optimisation", "Relevant job matching to your profile", "Career path for freshers & changers", "3-month skill growth roadmap"],    color: "#7c3aed", to: "/gene"    },
  { id: "digi",    title: "DigiHub",           tag: "Agency + Community",  desc: "A digital marketing agency for brands and a community that connects trained talent to real opportunities. Brands, founders, and professionals help place career-ready graduates.", features: ["Brand strategy & performance marketing", "Social media, SEO & web development", "Community of founders & professionals", "Entry-level placements for trained talent"],       color: "#0284c7", to: "/digihub" },
  { id: "wedding", title: "The Wedding Unit",  tag: "Production Studio",   desc: "Premium wedding photography and full-service production. Also serves as the in-house production studio for HyperX's learning content and DigiHub's brand content creation.", features: ["Wedding photography & videography", "End-to-end event production & decor", "Video production for HyperX courses", "Content studio for DigiHub brands"],   color: "#d97706", href: "https://theweddingunit.in" },
];

const TICKER = ["Career Clarity", "Resume Intelligence", "Skill Growth", "Job Placement", "Professional Training", "Interview Mastery", "Brand Strategy", "Digital Marketing", "Workplace Skills", "Career Ecosystem"];

/* ── Floating hero side cards ── */
function FloatCard({ style, children }) {
  return (
    <div style={{
      position: "absolute",
      background: "#fff",
      border: `1px solid ${B}`,
      borderRadius: 12,
      padding: "12px 14px",
      boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
      backdropFilter: "blur(8px)",
      ...style
    }}>
      {children}
    </div>
  );
}

export default function Home() {
  const [on, setOn] = useState(false);
  const [active, setActive] = useState(0);
  useEffect(() => { setTimeout(() => setOn(true), 50); }, []);
  const P = PRODUCTS[active];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #fff; color: #0a0a0a; -webkit-font-smoothing: antialiased; }

        @keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        .tr { animation: ticker 32s linear infinite; display: flex; white-space: nowrap; }

        @keyframes floatA {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-7px); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(6px); }
        }
        @keyframes floatC {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-5px); }
        }
        .float-a { animation: floatA 4.5s ease-in-out infinite; }
        .float-b { animation: floatB 5.2s ease-in-out infinite; }
        .float-c { animation: floatC 3.9s ease-in-out infinite; }

        .chip {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 12px; border-radius: 6px; border: 1px solid ${B};
          font-size: 11.5px; font-weight: 500; color: #6b7280;
          background: #fff; letter-spacing: 0.01em;
        }
        .chip-pink { background: #fef2f5; border-color: #fcc8d6; color: ${PINK}; }

        .pill-tab {
          padding: 6px 16px; border-radius: 6px; font-size: 13px; font-weight: 500;
          color: #6b7280; background: transparent; border: 1px solid transparent;
          cursor: pointer; transition: all 0.13s; white-space: nowrap;
        }
        .pill-tab.on { background: #fff; border-color: ${B}; color: #0a0a0a; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
        .pill-tab:hover:not(.on) { color: #0a0a0a; }

        .btn-dark {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 22px; border-radius: 8px; background: #0a0a0a;
          color: #fff; font-size: 13.5px; font-weight: 600; border: none;
          text-decoration: none; cursor: pointer; transition: background 0.14s, transform 0.12s;
          letter-spacing: -0.01em;
        }
        .btn-dark:hover { background: #222; transform: translateY(-1px); }

        .btn-pink {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 22px; border-radius: 8px; background: ${PINK};
          color: #fff; font-size: 13.5px; font-weight: 600; border: none;
          text-decoration: none; cursor: pointer; transition: opacity 0.14s, transform 0.12s;
          letter-spacing: -0.01em; box-shadow: 0 2px 10px rgba(232,24,93,0.25);
        }
        .btn-pink:hover { opacity: 0.88; transform: translateY(-1px); }

        .btn-ghost {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 22px; border-radius: 8px; background: #fff;
          color: #374151; font-size: 13.5px; font-weight: 500;
          border: 1px solid ${B}; text-decoration: none; cursor: pointer;
          transition: border-color 0.14s, color 0.14s, transform 0.12s; letter-spacing: -0.01em;
        }
        .btn-ghost:hover { border-color: #9ca3af; color: #0a0a0a; transform: translateY(-1px); }

        .feat-row {
          display: flex; align-items: center; gap: 9px;
          padding: 9px 0; border-bottom: 1px solid #f7f7f7; font-size: 13px; color: #4b5563;
        }
        .feat-row:last-child { border-bottom: none; }

        .svc {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 7px 14px; border-radius: 7px; border: 1px solid ${B};
          font-size: 12.5px; color: #4b5563; background: #fff; cursor: default;
          transition: all 0.13s;
        }
        .svc:hover { border-color: #fcc8d6; background: #fef2f5; color: ${PINK}; }

        .wcard {
          padding: 22px; border-radius: 10px; border: 1px solid ${B};
          background: #fff; transition: box-shadow 0.18s, border-color 0.18s;
        }
        .wcard:hover { border-color: #fcc8d6; box-shadow: 0 2px 18px rgba(232,24,93,0.06); }

        .tcard { padding: 22px; border-radius: 10px; border: 1px solid ${B}; background: #fff; }

        .step { display: flex; gap: 16px; padding: 15px 0; border-bottom: 1px solid #f7f7f7; }
        .step:last-child { border-bottom: none; }

        /* hide float cards on small screens */
        .hero-float { display: block; }
        @media (max-width: 1100px) { .hero-float { display: none; } }

        @media (max-width: 740px) {
          .two-col { grid-template-columns: 1fr !important; }
          .stats-4  { grid-template-columns: repeat(2, 1fr) !important; }
          .prod-panel { grid-template-columns: 1fr !important; }
          .prod-right { border-left: none !important; border-top: 1px solid ${B}; padding-left: 0 !important; padding-top: 24px !important; }
        }
      `}</style>

      {/* ══════════════════════════════
          HERO
      ══════════════════════════════ */}
      <section style={{
        padding: "88px 24px 72px", background: "#fff",
        borderBottom: `1px solid ${B}`, position: "relative", overflow: "hidden"
      }}>
        {/* grid bg */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `linear-gradient(${B} 1px,transparent 1px),linear-gradient(90deg,${B} 1px,transparent 1px)`,
          backgroundSize: "52px 52px", opacity: 0.45
        }} />
        <div style={{ position: "absolute", top: -100, right: -60, width: 420, height: 420,
          borderRadius: "50%", background: PINK, filter: "blur(130px)", opacity: 0.055, pointerEvents: "none" }} />

        {/* ── LEFT FLOATING CARDS ── */}
        <div className="hero-float" style={{ opacity: on ? 1 : 0, transition: "opacity 0.7s ease 0.6s" }}>

          {/* Resume Score */}
          <FloatCard style={{ left: "3%", top: "12%", width: 168 }}>
            <div className="float-a">
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 9 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: "#fef2f5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>📄</div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Resume Score</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#0a0a0a", letterSpacing: "-0.04em", lineHeight: 1, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>94<span style={{ fontSize: 13, fontWeight: 500, color: "#9ca3af" }}>/100</span></div>
              <div style={{ marginTop: 8, height: 4, borderRadius: 99, background: "#f3f4f6", overflow: "hidden" }}>
                <div style={{ width: "94%", height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${PINK}, #f472b6)` }} />
              </div>
              <div style={{ marginTop: 6, fontSize: 10.5, color: "#16a34a", fontWeight: 500, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>✓ ATS Optimised</div>
            </div>
          </FloatCard>

          {/* Job Match */}
          <FloatCard style={{ left: "2%", top: "52%", width: 160 }}>
            <div className="float-b">
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🎯</div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Job Match</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {[["UI Designer", "92%", "#7c3aed"], ["Product Lead", "87%", PINK], ["UX Researcher", "78%", "#0284c7"]].map(([role, pct, col]) => (
                  <div key={role} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 10.5, color: "#374151", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{role}</span>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: col, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{pct}</span>
                  </div>
                ))}
              </div>
            </div>
          </FloatCard>

          {/* Skill Growth */}
          <FloatCard style={{ left: "6%", top: "78%", width: 148 }}>
            <div className="float-c">
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: "#fef9c3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>📈</div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Skill Growth</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#0a0a0a", letterSpacing: "-0.03em", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>+34%</div>
              <div style={{ fontSize: 10.5, color: "#9ca3af", marginTop: 2, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>This month</div>
              <div style={{ display: "flex", gap: 2, marginTop: 7, alignItems: "flex-end" }}>
                {[30, 45, 38, 55, 48, 65, 72].map((h, i) => (
                  <div key={i} style={{ flex: 1, height: h * 0.4, borderRadius: 3, background: i === 6 ? PINK : "#f3f4f6" }} />
                ))}
              </div>
            </div>
          </FloatCard>

        </div>

        {/* ── RIGHT FLOATING CARDS ── */}
        <div className="hero-float" style={{ opacity: on ? 1 : 0, transition: "opacity 0.7s ease 0.7s" }}>

          {/* Placement Rate */}
          <FloatCard style={{ right: "3%", top: "10%", width: 164 }}>
            <div className="float-b">
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🏆</div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Placement Rate</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#0a0a0a", letterSpacing: "-0.04em", lineHeight: 1, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>87<span style={{ fontSize: 13, fontWeight: 500, color: "#9ca3af" }}>%</span></div>
              <div style={{ marginTop: 8, display: "flex", gap: 3, flexWrap: "wrap" }}>
                {["Hired ✓", "Promoted ✓", "Raised ✓"].map(t => (
                  <span key={t} style={{ fontSize: 9.5, fontWeight: 600, padding: "2px 6px", borderRadius: 4, background: "#ecfdf5", color: "#16a34a", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{t}</span>
                ))}
              </div>
            </div>
          </FloatCard>

          {/* Community card */}
          <FloatCard style={{ right: "2%", top: "48%", width: 168 }}>
            <div className="float-a">
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🤝</div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Community</span>
              </div>
              {/* avatar stack */}
              <div style={{ display: "flex", alignItems: "center", marginBottom: 7 }}>
                {["#e8185d", "#7c3aed", "#0284c7", "#d97706", "#16a34a"].map((c, i) => (
                  <div key={i} style={{
                    width: 24, height: 24, borderRadius: "50%", background: c,
                    border: "2px solid #fff", marginLeft: i === 0 ? 0 : -7,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, color: "#fff", fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif"
                  }}>{["A","P","K","R","S"][i]}</div>
                ))}
                <span style={{ marginLeft: 8, fontSize: 10.5, color: "#6b7280", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>+200</span>
              </div>
              <div style={{ fontSize: 11, color: "#9ca3af", lineHeight: 1.5, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Founders & professionals<br/>helping place talent</div>
            </div>
          </FloatCard>

          {/* Brand Growth */}
          <FloatCard style={{ right: "5%", top: "78%", width: 152 }}>
            <div className="float-c">
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🚀</div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Brand Growth</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#0a0a0a", letterSpacing: "-0.03em", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>2× <span style={{ fontSize: 11, fontWeight: 500, color: "#9ca3af" }}>leads</span></div>
              <div style={{ fontSize: 10.5, color: "#9ca3af", marginTop: 2, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>In 90 days avg.</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 7 }}>
                <div style={{ flex: 1, height: 3, borderRadius: 99, background: "#f3f4f6" }}>
                  <div style={{ width: "72%", height: "100%", borderRadius: 99, background: "#d97706" }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#d97706", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>72%</span>
              </div>
            </div>
          </FloatCard>

        </div>

        {/* ── HERO CONTENT (centred) ── */}
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 }}>

          {/* badge */}
          <div style={{ opacity: on ? 1 : 0, transform: on ? "none" : "translateY(10px)", transition: "all 0.4s ease 0.04s", marginBottom: 22 }}>
            <span className="chip chip-pink">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: PINK, flexShrink: 0 }} />
              Career Development Ecosystem
            </span>
          </div>

          {/* headline */}
          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "clamp(26px, 3.8vw, 44px)",
            fontWeight: 800, lineHeight: 1.17,
            letterSpacing: "-0.035em", color: "#0a0a0a",
            marginBottom: 16,
            opacity: on ? 1 : 0, transform: on ? "none" : "translateY(14px)",
            transition: "all 0.46s ease 0.14s"
          }}>
            Clarity, skills & real connections—<br />
            <span style={{ color: PINK }}>for careers that mean something</span>
          </h1>

          <p style={{
            fontSize: 15.5, color: "#6b7280", lineHeight: 1.72,
            maxWidth: 460, margin: "0 auto 30px", fontWeight: 400,
            opacity: on ? 1 : 0, transform: on ? "none" : "translateY(10px)",
            transition: "all 0.46s ease 0.24s"
          }}>
            Career intelligence, professional skills training, digital marketing, and a community that actually places people — all connected under one ecosystem.
          </p>

          <div style={{
            display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginBottom: 44,
            opacity: on ? 1 : 0, transform: on ? "none" : "translateY(8px)",
            transition: "all 0.46s ease 0.34s"
          }}>
            <Link to="/gene"   className="btn-pink">Start with Gen-E AI →</Link>
            <Link to="/about"  className="btn-ghost">How it works</Link>
          </div>

          {/* social proof strip */}
          <div style={{
            display: "flex", justifyContent: "center", gap: 0, flexWrap: "wrap",
            borderTop: `1px solid ${B}`, borderBottom: `1px solid ${B}`, padding: "18px 0",
            opacity: on ? 1 : 0, transition: "opacity 0.46s ease 0.44s"
          }}>
            {[["160+", "Projects delivered"], ["200+", "Happy clients"], ["4.9 ★", "Average rating"], ["30+", "Brands scaled"]].map(([n, l], i, arr) => (
              <div key={l} style={{
                padding: "0 28px", textAlign: "center",
                borderRight: i < arr.length - 1 ? `1px solid ${B}` : "none"
              }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#0a0a0a", letterSpacing: "-0.025em" }}>{n}</div>
                <div style={{ fontSize: 11.5, color: "#9ca3af", marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ticker ── */}
      <div style={{ background: "#fafafa", borderBottom: `1px solid ${B}`, padding: "12px 0", overflow: "hidden" }}>
        <div className="tr">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} style={{ padding: "0 24px", fontSize: 12, color: "#c0c0c0", fontWeight: 500,
              display: "inline-flex", alignItems: "center", gap: 9 }}>
              <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#d1d5db", display: "inline-block" }} />
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════
          SERVICES
      ══════════════════════════════ */}
      <section style={{ padding: "72px 24px", background: "#fff", borderBottom: `1px solid ${B}` }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <Reveal style={{ marginBottom: 36 }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <span className="chip" style={{ marginBottom: 10 }}>Services</span>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700,
                  fontSize: "clamp(20px,2.8vw,28px)", letterSpacing: "-0.03em", marginTop: 8 }}>
                  Everything your career and brand needs
                </h2>
              </div>
              <p style={{ fontSize: 14, color: "#9ca3af", maxWidth: 300, lineHeight: 1.65 }}>
                One ecosystem covering career AI, professional learning, digital marketing, and production — so everything works together.
              </p>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {[["🤖","Career AI (Gen-E)"],["📝","Resume Builder"],["🎯","Job Matching"],
                ["🎤","Interview Prep"],["💼","Professional Skills"],["🗣️","English for Work"],
                ["💡","Salary Negotiation"],["📊","Skill Gap Analysis"],["🌐","Web Design"],
                ["📸","Photography"],["📹","Content Creation"],["📱","Social Media"],
                ["🔍","SEO & Performance"],["🤝","Career Placements"]
              ].map(([ic, lb]) => (
                <div key={lb} className="svc"><span>{ic}</span>{lb}</div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════
          PRODUCTS
      ══════════════════════════════ */}
      <section style={{ padding: "72px 24px", background: "#fafafa", borderBottom: `1px solid ${B}` }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <Reveal style={{ marginBottom: 32 }}>
            <span className="chip" style={{ marginBottom: 10 }}>Products</span>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700,
                fontSize: "clamp(20px,2.8vw,28px)", letterSpacing: "-0.03em" }}>
                Four products. One mission.
              </h2>
              <div style={{ display: "flex", gap: 4, background: "#eee", padding: 3, borderRadius: 8 }}>
                {PRODUCTS.map((p, i) => (
                  <button key={p.id} className={`pill-tab ${active === i ? "on" : ""}`} onClick={() => setActive(i)}>{p.title}</button>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={60}>
            <div className="prod-panel" style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0,
              background: "#fff", border: `1px solid ${B}`, borderRadius: 12, overflow: "hidden"
            }}>
              {/* left */}
              <div style={{ padding: "32px 32px 36px" }}>
                <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600,
                  letterSpacing: "0.07em", textTransform: "uppercase", color: P.color, marginBottom: 14 }}>{P.tag}</span>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700,
                  fontSize: "clamp(20px,2.5vw,26px)", letterSpacing: "-0.025em", marginBottom: 12 }}>{P.title}</h3>
                <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.72, marginBottom: 28, maxWidth: 340 }}>{P.desc}</p>
                {P.to
                  ? <Link to={P.to} className="btn-dark">Explore {P.title} →</Link>
                  : <a href={P.href} target="_blank" rel="noreferrer" className="btn-dark">Visit site →</a>}
              </div>

              {/* right */}
              <div className="prod-right" style={{ padding: "32px 32px 36px", borderLeft: `1px solid ${B}`, background: "#fafafa" }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em",
                  textTransform: "uppercase", color: "#9ca3af", marginBottom: 16 }}>What's included</div>
                {P.features.map(f => (
                  <div key={f} className="feat-row">
                    <div style={{ width: 17, height: 17, borderRadius: "50%", flexShrink: 0,
                      background: `${P.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="8" height="7" viewBox="0 0 9 8" fill="none">
                        <path d="M1.5 4L3.5 6L7.5 1.5" stroke={P.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    {f}
                  </div>
                ))}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 22 }}>
                  {[["50+", "Active clients"], ["4.9★", "Client rating"]].map(([v, l]) => (
                    <div key={l} style={{ padding: "12px 14px", background: "#fff",
                      borderRadius: 8, border: `1px solid ${B}` }}>
                      <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.025em",
                        color: "#0a0a0a", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{v}</div>
                      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════
          HOW WE WORK
      ══════════════════════════════ */}
      <section style={{ padding: "72px 24px", background: "#fff", borderBottom: `1px solid ${B}` }}>
        <div className="two-col" style={{ maxWidth: 1060, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px 72px", alignItems: "start" }}>
          <Reveal>
            <span className="chip" style={{ marginBottom: 10 }}>Process</span>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700,
              fontSize: "clamp(20px,2.8vw,28px)", letterSpacing: "-0.03em", marginTop: 10, marginBottom: 10 }}>
              From first call to<br />measurable results
            </h2>
            <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.7, maxWidth: 300, marginBottom: 28 }}>
              A repeatable process so you always know what's happening and what comes next.
            </p>
            <Link to="/contact" className="btn-pink">Book a discovery call →</Link>
          </Reveal>
          <Reveal delay={100}>
            {[
              { n: "01", t: "Discovery call",   d: "We align on goals, audience, and your definition of success." },
              { n: "02", t: "Strategy & scope", d: "Clear plan with timelines, owners, and deliverables." },
              { n: "03", t: "Build & execute",  d: "We ship with quality gates at every milestone." },
              { n: "04", t: "Review & scale",   d: "Analyse results together and compound what's working." },
            ].map(s => (
              <div key={s.n} className="step">
                <div style={{ fontSize: 11, fontWeight: 700, color: "#d1d5db", width: 20, flexShrink: 0, paddingTop: 2 }}>{s.n}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#0a0a0a", marginBottom: 3 }}>{s.t}</div>
                  <div style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.6 }}>{s.d}</div>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════
          WHY NUGENS
      ══════════════════════════════ */}
      <section style={{ padding: "72px 24px", background: "#fafafa", borderBottom: `1px solid ${B}` }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <Reveal style={{ marginBottom: 36 }}>
            <span className="chip" style={{ marginBottom: 10 }}>Why Nugens</span>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700,
              fontSize: "clamp(20px,2.8vw,28px)", letterSpacing: "-0.03em", marginTop: 10 }}>
              Built as a system,<br />not a collection of tools
            </h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(226px,1fr))", gap: 12 }}>
            {[
              { icon: "◎", t: "Clarity before action",    d: "Gen-E starts every journey with honest analysis — not hype. You know where you are, then you move." },
              { icon: "⬡", t: "Experience as curriculum", d: "HyperX teaches what real workplaces demand — skills that no degree or basic course covers." },
              { icon: "◈", t: "Community opens doors",    d: "DigiHub's network of founders, brands, and professionals creates real placement opportunities, not promises." },
              { icon: "◇", t: "Everything is connected",  d: "Gen-E feeds HyperX. HyperX prepares for DigiHub. The Wedding Unit powers production. One system, not four tools." },
            ].map((c, i) => (
              <Reveal key={c.t} delay={i * 60}>
                <div className="wcard">
                  <div style={{ fontSize: 18, color: PINK, marginBottom: 14, fontWeight: 300, lineHeight: 1 }}>{c.icon}</div>
                  <h4 style={{ fontSize: 13.5, fontWeight: 600, color: "#0a0a0a", marginBottom: 7, letterSpacing: "-0.01em" }}>{c.t}</h4>
                  <p style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.65 }}>{c.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          STATS
      ══════════════════════════════ */}
      <section style={{ padding: "72px 24px", background: "#fff", borderBottom: `1px solid ${B}` }}>
        <div className="two-col" style={{ maxWidth: 1060, margin: "0 auto", display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "40px 80px", alignItems: "center" }}>
          <Reveal>
            <span className="chip" style={{ marginBottom: 10 }}>Track record</span>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700,
              fontSize: "clamp(20px,2.8vw,28px)", letterSpacing: "-0.03em", marginTop: 10, marginBottom: 12 }}>
              Trusted by 30+ brands<br />and growing careers across India
            </h2>
            <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.7, maxWidth: 320 }}>
              From early-stage startups to established companies — brands choose Nugens for consistent, measurable growth.
            </p>
          </Reveal>

          <Reveal delay={80}>
            <div className="stats-4" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0,
              border: `1px solid ${B}`, borderRadius: 10, overflow: "hidden" }}>
              {[
                { v: 160, s: "+", l: "Projects delivered", sub: "Since 2021" },
                { v: 30,  s: "+", l: "Brands scaled",      sub: "Active clients" },
                { v: 200, s: "+", l: "Happy clients",       sub: "Across India" },
                { v: 4,   s: "",  l: "Products launched",   sub: "& growing" },
              ].map((item, i) => (
                <Reveal key={item.l} delay={i * 60}>
                  <div style={{
                    padding: "24px 22px",
                    borderRight: i % 2 === 0 ? `1px solid ${B}` : "none",
                    borderBottom: i < 2 ? `1px solid ${B}` : "none",
                    background: "#fff"
                  }}>
                    {(() => {
                      const [ref, v] = [useRef(null), useState(false)];
                      const n = useCounter(item.v, 1400, v[0]);
                      useEffect(() => {
                        const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) v[1](true); }, { threshold: 0.3 });
                        if (ref.current) o.observe(ref.current);
                        return () => o.disconnect();
                      }, []);
                      return (
                        <div ref={ref}>
                          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.04em", color: "#0a0a0a", lineHeight: 1 }}>{n}{item.s}</div>
                          <div style={{ fontSize: 12.5, fontWeight: 500, color: "#374151", marginTop: 4 }}>{item.l}</div>
                          <div style={{ fontSize: 11.5, color: "#9ca3af", marginTop: 2 }}>{item.sub}</div>
                        </div>
                      );
                    })()}
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════
          TESTIMONIALS
      ══════════════════════════════ */}
      <section style={{ padding: "72px 24px", background: "#fafafa", borderBottom: `1px solid ${B}` }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <Reveal style={{ marginBottom: 32 }}>
            <span className="chip" style={{ marginBottom: 10 }}>Testimonials</span>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700,
              fontSize: "clamp(20px,2.8vw,28px)", letterSpacing: "-0.03em", marginTop: 10 }}>What clients say</h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: 12 }}>
            {[
              { name: "Arjun Mehta",  role: "Founder, StartupCo",  quote: "Nugens transformed our brand presence. Fast delivery, exceptional quality, and a strategy that actually moved the needle." },
              { name: "Priya Sharma", role: "Product Manager",      quote: "Gen-E AI gave me a real edge — the resume analysis and mock interviews helped me land my dream role in 3 weeks." },
              { name: "Karthik R.",   role: "Marketing Director",   quote: "DigiHub doubled our qualified leads in 90 days. The team is sharp, responsive, and genuinely invested in your growth." },
            ].map((t, i) => (
              <Reveal key={t.name} delay={i * 60}>
                <div className="tcard">
                  <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
                    {[...Array(5)].map((_, k) => <span key={k} style={{ color: "#f59e0b", fontSize: 12 }}>★</span>)}
                  </div>
                  <p style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.72, marginBottom: 18 }}>"{t.quote}"</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 14, borderTop: `1px solid #f7f7f7` }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f3f4f6",
                      border: `1px solid ${B}`, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 600, color: "#6b7280" }}>
                      {t.name.split(" ").map(w => w[0]).join("")}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0a0a0a" }}>{t.name}</div>
                      <div style={{ fontSize: 11.5, color: "#9ca3af" }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          CTA
      ══════════════════════════════ */}
      <section style={{ padding: "80px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 580, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <span className="chip chip-pink" style={{ marginBottom: 18 }}>Get started</span>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700,
              fontSize: "clamp(20px,3vw,32px)", letterSpacing: "-0.03em",
              color: "#0a0a0a", marginTop: 14, marginBottom: 14, lineHeight: 1.25
            }}>
              Ready to find your career path<br />or grow your brand with AI?
            </h2>
            <p style={{ fontSize: 14.5, color: "#9ca3af", lineHeight: 1.72, maxWidth: 380, margin: "0 auto 28px" }}>
              Start with Gen-E for career clarity, or book a call to discuss how Nugens can help your brand.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
              <Link to="/gene"    className="btn-pink">Try Gen-E AI →</Link>
              <Link to="/contact" className="btn-ghost">Talk to us</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
