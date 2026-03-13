import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const PINK = "#e8185d";
const B = "#f0f0f0";

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

function Reveal({ children, delay = 0, style = {} }) {
  const [ref, v] = useInView();
  return (
    <div ref={ref} style={{
      opacity: v ? 1 : 0,
      transform: v ? "none" : "translateY(18px)",
      transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      ...style
    }}>{children}</div>
  );
}

const PRODUCTS = [
  {
    id: "gene",
    name: "Gen-E AI",
    tag: "Career Intelligence",
    color: "#7c3aed",
    tagline: "The starting point",
    desc: "Most people don't know what career they should pursue or why they're not getting hired. Gen-E AI analyses your resume, identifies skill gaps, matches you to relevant roles, and builds a clear roadmap — so you start with clarity instead of confusion.",
    does: ["Resume analysis & ATS optimisation", "Relevant job matching to your background", "Skill gap identification & growth roadmap", "Career change guidance & fresher paths", "3-month focused action plans"],
    link: "/gene"
  },
  {
    id: "hyperx",
    name: "HyperX",
    tag: "Learning Platform",
    color: PINK,
    tagline: "The builder",
    desc: "Once you know what you need to learn, HyperX teaches you what no YouTube video covers: professional environment reality. Work culture, office politics, salary negotiation, English communication, interview mastery, and how to grow inside an organisation.",
    does: ["Professional workflow & work culture", "Office politics navigation & mindset", "Salary negotiation strategies", "English fluency for the workplace", "Interview prep for any role, any industry"],
    link: "/hyperx"
  },
  {
    id: "digihub",
    name: "DigiHub",
    tag: "Agency + Community",
    color: "#0284c7",
    tagline: "The connector",
    desc: "DigiHub is both a marketing agency for brands and a community that connects trained talent to real opportunities. Founders, professionals, and brands in our network create entry-level openings — so graduates don't just train, they get placed.",
    does: ["Brand marketing & digital growth", "Community of brands, founders & professionals", "Career placements through real connections", "Entry-level roles to build experience", "A bridge from training to employment"],
    link: "/digihub"
  },
  {
    id: "wedding",
    name: "The Wedding Unit",
    tag: "Production Studio",
    color: "#d97706",
    tagline: "The foundation",
    desc: "The Wedding Unit is our photography and full-service wedding production studio. It also serves as the production backbone for HyperX's video learning content and DigiHub's content creation — providing the gear, team, and studio that makes everything visual across Nugens.",
    does: ["Wedding photography & videography", "End-to-end event production & decor", "In-house production for HyperX courses", "Content studio for DigiHub's brands", "Podcast, reel, and video production"],
    link: null, href: "https://theweddingunit.in"
  },
];

export default function About() {
  const [on, setOn] = useState(false);
  const [active, setActive] = useState(0);
  useEffect(() => { setTimeout(() => setOn(true), 50); }, []);

  const P = PRODUCTS[active];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; }

        .ab-chip {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 12px; border-radius: 6px; border: 1px solid ${B};
          font-size: 11.5px; font-weight: 500; color: #6b7280; background: #fff;
        }
        .ab-chip-pink { background: #fef2f5; border-color: #fcc8d6; color: ${PINK}; }

        .ab-btn-pink {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 11px 24px; border-radius: 8px; background: ${PINK};
          color: #fff; font-size: 13.5px; font-weight: 600; border: none;
          text-decoration: none; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
          transition: opacity 0.14s, transform 0.12s; letter-spacing: -0.01em;
          box-shadow: 0 2px 10px rgba(232,24,93,0.25);
        }
        .ab-btn-pink:hover { opacity: 0.88; transform: translateY(-1px); }

        .ab-btn-ghost {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 11px 24px; border-radius: 8px; background: #fff;
          color: #374151; font-size: 13.5px; font-weight: 500;
          border: 1px solid ${B}; text-decoration: none; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: border-color 0.14s, color 0.14s, transform 0.12s;
        }
        .ab-btn-ghost:hover { border-color: #9ca3af; color: #0a0a0a; transform: translateY(-1px); }

        .prod-tab {
          padding: 8px 16px; border-radius: 7px; font-size: 13px; font-weight: 500;
          color: #6b7280; background: transparent; border: 1px solid transparent;
          cursor: pointer; transition: all 0.13s; font-family: 'Plus Jakarta Sans', sans-serif;
          white-space: nowrap;
        }
        .prod-tab.on { background: #fff; border-color: ${B}; color: #0a0a0a; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
        .prod-tab:hover:not(.on) { color: #0a0a0a; }

        .val-card {
          padding: 22px; border-radius: 10px; border: 1px solid ${B}; background: #fff;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .val-card:hover { border-color: #fcc8d6; box-shadow: 0 2px 18px rgba(232,24,93,0.06); }

        .feat-row {
          display: flex; align-items: center; gap: 9px;
          padding: 9px 0; border-bottom: 1px solid #f7f7f7; font-size: 13px; color: #4b5563;
        }
        .feat-row:last-child { border-bottom: none; }

        .flow-arrow {
          display: flex; align-items: center; justify-content: center;
          color: #d1d5db; font-size: 20px; padding: 4px 0;
        }

        @media (max-width: 740px) {
          .ab-two { grid-template-columns: 1fr !important; }
          .ab-four { grid-template-columns: 1fr 1fr !important; }
          .prod-panel { grid-template-columns: 1fr !important; }
          .prod-right { border-left: none !important; border-top: 1px solid ${B}; padding-left: 0 !important; padding-top: 24px !important; }
          .flow-row { flex-direction: column !important; }
          .flow-arrow { transform: rotate(90deg); }
        }
      `}</style>

      {/* ── HERO ── */}
      <section style={{
        padding: "88px 24px 72px", background: "#fff",
        borderBottom: `1px solid ${B}`, position: "relative", overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `linear-gradient(${B} 1px,transparent 1px),linear-gradient(90deg,${B} 1px,transparent 1px)`,
          backgroundSize: "52px 52px", opacity: 0.4
        }} />
        <div style={{ position: "absolute", top: -100, right: -60, width: 420, height: 420,
          borderRadius: "50%", background: PINK, filter: "blur(130px)", opacity: 0.055, pointerEvents: "none" }} />

        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 }}>
          <div style={{ opacity: on ? 1 : 0, transform: on ? "none" : "translateY(10px)", transition: "all 0.4s ease 0.04s", marginBottom: 22 }}>
            <span className="ab-chip ab-chip-pink">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: PINK, flexShrink: 0 }} />
              Career Development Ecosystem
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800,
            lineHeight: 1.15, letterSpacing: "-0.035em", color: "#0a0a0a",
            marginBottom: 20,
            opacity: on ? 1 : 0, transform: on ? "none" : "translateY(14px)",
            transition: "all 0.46s ease 0.14s"
          }}>
            We didn't build four products.<br />
            <span style={{ color: PINK }}>We built one system.</span>
          </h1>

          <p style={{
            fontSize: 16, color: "#6b7280", lineHeight: 1.72,
            maxWidth: 520, margin: "0 auto 32px", fontWeight: 400,
            opacity: on ? 1 : 0, transform: on ? "none" : "translateY(10px)",
            transition: "all 0.46s ease 0.24s"
          }}>
            Nugens is a career development ecosystem built on a simple belief: knowing what to do, learning how to do it, and finding people who'll give you a chance — these three things have to work together.
          </p>
        </div>
      </section>

      {/* ── THE BIG PICTURE ── */}
      <section style={{ padding: "72px 24px", background: "#fafafa", borderBottom: `1px solid ${B}` }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <Reveal style={{ marginBottom: 44 }}>
            <span className="ab-chip" style={{ marginBottom: 10 }}>The ecosystem</span>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700,
              fontSize: "clamp(20px,2.8vw,28px)", letterSpacing: "-0.03em",
              color: "#0a0a0a", marginTop: 10
            }}>
              Four products. All connected. All dependent.
            </h2>
            <p style={{ fontSize: 14.5, color: "#6b7280", lineHeight: 1.72, maxWidth: 560, marginTop: 10 }}>
              Each product in Nugens feeds the next. They're not standalone tools — they're a sequence. You start at Gen-E, build at HyperX, connect at DigiHub, and the Wedding Unit powers the production infrastructure behind all of it.
            </p>
          </Reveal>

          {/* flow diagram */}
          <Reveal delay={80}>
            <div className="flow-row" style={{ display: "flex", alignItems: "stretch", gap: 0, border: `1px solid ${B}`, borderRadius: 12, overflow: "hidden" }}>
              {PRODUCTS.map((p, i) => (
                <React.Fragment key={p.id}>
                  <div style={{ flex: 1, padding: "28px 22px", background: i % 2 === 0 ? "#fff" : "#fafafa", minWidth: 0 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, marginBottom: 14 }} />
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: p.color, marginBottom: 6 }}>{p.tagline}</div>
                    <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15, color: "#0a0a0a", marginBottom: 6, letterSpacing: "-0.015em" }}>{p.name}</h3>
                    <p style={{ fontSize: 12.5, color: "#9ca3af", lineHeight: 1.6 }}>{p.tag}</p>
                  </div>
                  {i < PRODUCTS.length - 1 && (
                    <div className="flow-arrow" style={{ borderLeft: `1px solid ${B}`, borderRight: `1px solid ${B}`, padding: "0 10px", background: "#fff", color: "#e0e0e0", fontSize: 16, display: "flex", alignItems: "center" }}>→</div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── PRODUCT DEEP DIVE ── */}
      <section style={{ padding: "72px 24px", background: "#fff", borderBottom: `1px solid ${B}` }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <Reveal style={{ marginBottom: 32 }}>
            <span className="ab-chip" style={{ marginBottom: 10 }}>Products</span>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "clamp(20px,2.8vw,28px)", letterSpacing: "-0.03em" }}>
                Inside each product
              </h2>
              <div style={{ display: "flex", gap: 4, background: "#f0f0f0", padding: 3, borderRadius: 8 }}>
                {PRODUCTS.map((p, i) => (
                  <button key={p.id} className={`prod-tab ${active === i ? "on" : ""}`} onClick={() => setActive(i)}>{p.name}</button>
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
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: P.color, marginBottom: 8, display: "block" }}>{P.tagline}</span>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "clamp(20px,2.5vw,26px)", letterSpacing: "-0.025em", marginBottom: 12, marginTop: 2 }}>{P.name}</h3>
                <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.72, marginBottom: 28, maxWidth: 360 }}>{P.desc}</p>
                {P.link
                  ? <Link to={P.link} style={{
                      display: "inline-flex", alignItems: "center", gap: 7,
                      padding: "10px 20px", borderRadius: 8, background: "#0a0a0a",
                      color: "#fff", fontSize: 13.5, fontWeight: 600, textDecoration: "none",
                      fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.01em"
                    }}>Explore {P.name} →</Link>
                  : <a href={P.href} target="_blank" rel="noreferrer" style={{
                      display: "inline-flex", alignItems: "center", gap: 7,
                      padding: "10px 20px", borderRadius: 8, background: "#0a0a0a",
                      color: "#fff", fontSize: 13.5, fontWeight: 600, textDecoration: "none",
                      fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.01em"
                    }}>Visit site →</a>
                }
              </div>

              {/* right */}
              <div className="prod-right" style={{ padding: "32px 32px 36px", borderLeft: `1px solid ${B}`, background: "#fafafa" }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 16 }}>What it does</div>
                {P.does.map(f => (
                  <div key={f} className="feat-row">
                    <div style={{ width: 17, height: 17, borderRadius: "50%", flexShrink: 0,
                      background: `${P.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="8" height="7" viewBox="0 0 9 8" fill="none">
                        <path d="M1.5 4L3.5 6L7.5 1.5" stroke={P.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── MISSION + VISION ── */}
      <section style={{ padding: "72px 24px", background: "#fafafa", borderBottom: `1px solid ${B}` }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <div className="ab-two" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              {
                label: "Mission",
                text: "To close the gap between where people are and where they want to go — by giving them clarity on direction, skills that actually matter in the workplace, and a community that turns training into opportunity.",
              },
              {
                label: "Vision",
                text: "A future where no talented person misses their potential because they lacked access — to the right guidance, the right skills, or the right connections. One ecosystem. Infinite possibilities.",
              }
            ].map((m, i) => (
              <Reveal key={m.label} delay={i * 80}>
                <div className="val-card" style={{ padding: "32px 28px" }}>
                  <span className="ab-chip ab-chip-pink" style={{ marginBottom: 16 }}>{m.label}</span>
                  <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.75, marginTop: 14 }}>{m.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section style={{ padding: "72px 24px", background: "#fff", borderBottom: `1px solid ${B}` }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <Reveal style={{ marginBottom: 36 }}>
            <span className="ab-chip" style={{ marginBottom: 10 }}>What we stand for</span>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "clamp(20px,2.8vw,28px)", letterSpacing: "-0.03em", color: "#0a0a0a", marginTop: 10 }}>
              Built different by design
            </h2>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(226px,1fr))", gap: 12 }}>
            {[
              { icon: "◎", t: "Clarity over confusion", d: "We believe every person deserves a clear career path — not generic advice, but specific direction based on who they are." },
              { icon: "⬡", t: "Experience as education", d: "Real learning happens when you understand how the world works, not just what textbooks say." },
              { icon: "◈", t: "Connected, not siloed", d: "Our products depend on each other because career growth is never just one thing — it's a sequence." },
              { icon: "◇", t: "Access for everyone", d: "Talent doesn't care about geography. We build tools that make opportunity reach people, not the other way." },
            ].map((c, i) => (
              <Reveal key={c.t} delay={i * 60}>
                <div className="val-card">
                  <div style={{ fontSize: 18, color: PINK, marginBottom: 14, fontWeight: 300, lineHeight: 1 }}>{c.icon}</div>
                  <h4 style={{ fontSize: 13.5, fontWeight: 600, color: "#0a0a0a", marginBottom: 7, letterSpacing: "-0.01em" }}>{c.t}</h4>
                  <p style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.65 }}>{c.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: "72px 24px", background: "#0a0a0a", borderBottom: `1px solid #1f1f1f` }}>
        <div className="ab-four" style={{ maxWidth: 1060, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0 }}>
          {[
            { v: "160+", l: "Projects delivered", s: "Since 2021" },
            { v: "30+",  l: "Brands working with us", s: "Active clients" },
            { v: "200+", l: "Happy clients", s: "Across India" },
            { v: "4",    l: "Products in the ecosystem", s: "& growing" },
          ].map((item, i) => (
            <Reveal key={item.l} delay={i * 60}>
              <div style={{ padding: "32px 28px", borderRight: i < 3 ? "1px solid #1f1f1f" : "none", textAlign: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.04em", color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{item.v}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#6b7280", marginTop: 6 }}>{item.l}</div>
                <div style={{ fontSize: 11.5, color: "#374151", marginTop: 3 }}>{item.s}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "80px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 580, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <span className="ab-chip ab-chip-pink" style={{ marginBottom: 18 }}>Start here</span>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700,
              fontSize: "clamp(20px,3vw,32px)", letterSpacing: "-0.03em",
              color: "#0a0a0a", marginTop: 14, marginBottom: 14, lineHeight: 1.25
            }}>
              Every career journey starts<br />with one conversation.
            </h2>
            <p style={{ fontSize: 14.5, color: "#9ca3af", lineHeight: 1.72, maxWidth: 380, margin: "0 auto 28px" }}>
              Talk to Gen-E AI, explore HyperX, connect through DigiHub — or reach out to us directly.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
              <Link to="/gene" className="ab-btn-pink">Start with Gen-E →</Link>
              <Link to="/contact" className="ab-btn-ghost">Talk to us</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
