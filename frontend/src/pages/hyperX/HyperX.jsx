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

const MODULES = [
  {
    cat: "Professional Mindset",
    color: "#7c3aed",
    items: [
      "How to think like a professional, not a student",
      "Understanding workplace culture & unwritten rules",
      "Office politics — how to navigate without losing",
      "Time management & prioritisation at work",
    ]
  },
  {
    cat: "Communication & English",
    color: "#0284c7",
    items: [
      "Spoken English for workplace scenarios",
      "Email writing, meetings, and professional tone",
      "Stakeholder communication & report writing",
      "Handling feedback, conflict & difficult conversations",
    ]
  },
  {
    cat: "Career Strategy",
    color: PINK,
    items: [
      "How to research and target the right companies",
      "Salary negotiation — what to say, when to say it",
      "Building a personal brand on LinkedIn",
      "From fresher to mid-level: what really changes",
    ]
  },
  {
    cat: "Interview Mastery",
    color: "#059669",
    items: [
      "How to prepare for any interview, any role",
      "HR interview tactics — what they're really asking",
      "Technical interviews: how to think out loud",
      "Body language, confidence, and self-presentation",
    ]
  },
  {
    cat: "Work Skills That Get You Promoted",
    color: "#d97706",
    items: [
      "How to manage up, down, and sideways",
      "Project ownership — how to lead without a title",
      "Performance reviews: how to present yourself",
      "Building trust with teams quickly",
    ]
  },
  {
    cat: "Real-World Tools & Workflows",
    color: "#6b7280",
    items: [
      "How real projects run (Agile, deadlines, reviews)",
      "Tools used in actual workplaces — not just basics",
      "Working with cross-functional teams",
      "Learning on the job: how professionals actually grow",
    ]
  },
];

const CONTRAST = [
  { them: "Teaches you theory and concepts", us: "We teach how real work actually gets done" },
  { them: "Generic certifications no one reads", us: "Actual skills interviewers ask about" },
  { them: "Stops at technical knowledge", us: "Covers office culture, politics, and growth" },
  { them: "You figure out salary & career alone", us: "We teach negotiation and career strategy" },
  { them: "English as a course, not communication", us: "English as a workplace survival skill" },
];

export default function HyperX() {
  const [on, setOn] = useState(false);
  const [activeModule, setActiveModule] = useState(0);
  useEffect(() => { setTimeout(() => setOn(true), 50); }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; }

        .hx-chip {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 12px; border-radius: 6px; border: 1px solid ${B};
          font-size: 11.5px; font-weight: 500; color: #6b7280; background: #fff;
        }
        .hx-chip-pink { background: #fef2f5; border-color: #fcc8d6; color: ${PINK}; }

        .hx-btn-dark {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 11px 24px; border-radius: 8px; background: #0a0a0a;
          color: #fff; font-size: 13.5px; font-weight: 600; border: none;
          text-decoration: none; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
          transition: background 0.14s, transform 0.12s; letter-spacing: -0.01em;
        }
        .hx-btn-dark:hover { background: #222; transform: translateY(-1px); }

        .hx-btn-pink {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 11px 24px; border-radius: 8px; background: ${PINK};
          color: #fff; font-size: 13.5px; font-weight: 600; border: none;
          text-decoration: none; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
          transition: opacity 0.14s, transform 0.12s; letter-spacing: -0.01em;
          box-shadow: 0 2px 10px rgba(232,24,93,0.25);
        }
        .hx-btn-pink:hover { opacity: 0.88; transform: translateY(-1px); }

        .hx-btn-ghost {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 11px 24px; border-radius: 8px; background: #fff;
          color: #374151; font-size: 13.5px; font-weight: 500;
          border: 1px solid ${B}; text-decoration: none; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: border-color 0.14s, color 0.14s, transform 0.12s;
        }
        .hx-btn-ghost:hover { border-color: #9ca3af; color: #0a0a0a; transform: translateY(-1px); }

        .mod-tab {
          padding: 9px 16px; border-radius: 7px; font-size: 12.5px; font-weight: 500;
          color: #6b7280; background: transparent; border: 1px solid transparent;
          cursor: pointer; transition: all 0.13s; font-family: 'Plus Jakarta Sans', sans-serif;
          text-align: left;
        }
        .mod-tab.on { background: #fff; border-color: ${B}; color: #0a0a0a; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
        .mod-tab:hover:not(.on) { color: #0a0a0a; background: #f9f9f9; }

        .contrast-row {
          display: grid; grid-template-columns: 1fr 1fr; gap: 0;
          border-bottom: 1px solid ${B};
        }
        .contrast-row:last-child { border-bottom: none; }
        .contrast-cell {
          padding: 14px 18px; font-size: 13.5px; line-height: 1.55;
        }

        .eco-card {
          padding: 22px; border-radius: 10px; border: 1px solid ${B};
          background: #fff; transition: border-color 0.18s, box-shadow 0.18s;
        }
        .eco-card:hover { border-color: #fcc8d6; box-shadow: 0 2px 18px rgba(232,24,93,0.06); }

        @media (max-width: 740px) {
          .hx-two { grid-template-columns: 1fr !important; }
          .contrast-row { grid-template-columns: 1fr !important; }
          .contrast-cell:first-child { border-bottom: 1px solid ${B}; }
          .mod-panel { grid-template-columns: 1fr !important; }
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
        <div style={{ position: "absolute", top: -80, left: -60, width: 380, height: 380,
          borderRadius: "50%", background: "#7c3aed", filter: "blur(120px)", opacity: 0.04, pointerEvents: "none" }} />

        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 }}>
          <div style={{ opacity: on ? 1 : 0, transform: on ? "none" : "translateY(10px)", transition: "all 0.4s ease 0.04s", marginBottom: 22 }}>
            <span className="hx-chip hx-chip-pink">Learning Platform · Professional Experience Studies</span>
          </div>

          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800,
            lineHeight: 1.15, letterSpacing: "-0.035em", color: "#0a0a0a",
            marginBottom: 20,
            opacity: on ? 1 : 0, transform: on ? "none" : "translateY(14px)",
            transition: "all 0.46s ease 0.14s"
          }}>
            What YouTube can't teach you—<br />
            <span style={{ color: PINK }}>we call it HyperX</span>
          </h1>

          <p style={{
            fontSize: 16, color: "#6b7280", lineHeight: 1.72,
            maxWidth: 520, margin: "0 auto 32px", fontWeight: 400,
            opacity: on ? 1 : 0, transform: on ? "none" : "translateY(10px)",
            transition: "all 0.46s ease 0.24s"
          }}>
            Most people already know the basics from YouTube and college. What they don't know is how to survive and grow inside a real workplace. That's what we teach.
          </p>

          <div style={{
            display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap",
            opacity: on ? 1 : 0, transform: on ? "none" : "translateY(8px)",
            transition: "all 0.46s ease 0.34s", marginBottom: 48
          }}>
            <Link to="/contact" className="hx-btn-pink">Enroll in HyperX →</Link>
            <Link to="/gene" className="hx-btn-ghost">Pair with Gen-E AI</Link>
          </div>

          {/* stats strip */}
          <div style={{
            display: "flex", justifyContent: "center", flexWrap: "wrap",
            borderTop: `1px solid ${B}`, borderBottom: `1px solid ${B}`, padding: "18px 0",
            opacity: on ? 1 : 0, transition: "opacity 0.46s ease 0.44s"
          }}>
            {[["500+", "Students trained"], ["12+", "Professional modules"], ["6", "Career tracks"], ["80%", "Placement readiness"]].map(([n, l], i, arr) => (
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

      {/* ── THE REAL PROBLEM ── */}
      <section style={{ padding: "72px 24px", background: "#fafafa", borderBottom: `1px solid ${B}` }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <Reveal>
            <span className="hx-chip" style={{ marginBottom: 12 }}>The gap no one talks about</span>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700,
              fontSize: "clamp(20px,2.8vw,28px)", letterSpacing: "-0.03em",
              color: "#0a0a0a", marginTop: 10, marginBottom: 14, maxWidth: 560
            }}>
              Most freshers graduate knowing theory.<br />Zero of them know how work actually works.
            </h2>
            <p style={{ fontSize: 14.5, color: "#6b7280", lineHeight: 1.72, maxWidth: 560, marginBottom: 40 }}>
              Nobody teaches you how to handle a difficult manager. Or how to negotiate your first salary. Or how to survive your first performance review. Or what "office politics" really means — and how to navigate it without burning bridges. That's the experience gap. HyperX closes it.
            </p>
          </Reveal>

          {/* contrast table */}
          <Reveal delay={80}>
            <div style={{ border: `1px solid ${B}`, borderRadius: 12, overflow: "hidden" }}>
              {/* header */}
              <div className="contrast-row" style={{ background: "#0a0a0a" }}>
                <div className="contrast-cell" style={{ color: "#9ca3af", fontWeight: 600, fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  What other e-learning platforms give you
                </div>
                <div className="contrast-cell" style={{ color: PINK, fontWeight: 600, fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", borderLeft: "1px solid #1f1f1f" }}>
                  What HyperX gives you
                </div>
              </div>
              {CONTRAST.map((row, i) => (
                <div key={i} className="contrast-row" style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <div className="contrast-cell" style={{ color: "#9ca3af", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: "#d1d5db", fontSize: 14 }}>✕</span> {row.them}
                  </div>
                  <div className="contrast-cell" style={{ color: "#0a0a0a", fontWeight: 500, display: "flex", alignItems: "center", gap: 10, borderLeft: `1px solid ${B}` }}>
                    <span style={{ color: "#059669", fontSize: 14 }}>✓</span> {row.us}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CURRICULUM ── */}
      <section style={{ padding: "72px 24px", background: "#fff", borderBottom: `1px solid ${B}` }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <Reveal style={{ marginBottom: 36 }}>
            <span className="hx-chip" style={{ marginBottom: 10 }}>Curriculum</span>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700,
              fontSize: "clamp(20px,2.8vw,28px)", letterSpacing: "-0.03em",
              color: "#0a0a0a", marginTop: 10
            }}>
              Experience as a subject
            </h2>
            <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.7, maxWidth: 420, marginTop: 8 }}>
              Six modules that cover everything a workplace actually demands from you — from day one to promotion.
            </p>
          </Reveal>

          <div className="mod-panel" style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 0, border: `1px solid ${B}`, borderRadius: 12, overflow: "hidden" }}>
            {/* sidebar */}
            <div style={{ padding: "16px 12px", background: "#fafafa", borderRight: `1px solid ${B}` }}>
              {MODULES.map((m, i) => (
                <button key={m.cat} className={`mod-tab ${activeModule === i ? "on" : ""}`}
                  onClick={() => setActiveModule(i)}
                  style={{ display: "block", width: "100%", marginBottom: 4 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: activeModule === i ? m.color : "#d1d5db", flexShrink: 0, transition: "background 0.15s" }} />
                    {m.cat}
                  </span>
                </button>
              ))}
            </div>

            {/* content */}
            <div style={{ padding: "32px 32px 36px", background: "#fff" }}>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: MODULES[activeModule].color }}>
                Module {activeModule + 1} of {MODULES.length}
              </span>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 22, letterSpacing: "-0.025em", color: "#0a0a0a", marginTop: 10, marginBottom: 20 }}>
                {MODULES[activeModule].cat}
              </h3>
              {MODULES[activeModule].items.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "11px 0", borderBottom: i < MODULES[activeModule].items.length - 1 ? `1px solid #f7f7f7` : "none" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                    background: `${MODULES[activeModule].color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="8" height="7" viewBox="0 0 9 8" fill="none">
                      <path d="M1.5 4L3.5 6L7.5 1.5" stroke={MODULES[activeModule].color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: 14, color: "#374151", lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "72px 24px", background: "#fafafa", borderBottom: `1px solid ${B}` }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <Reveal style={{ marginBottom: 40 }}>
            <span className="hx-chip" style={{ marginBottom: 10 }}>Process</span>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700,
              fontSize: "clamp(20px,2.8vw,28px)", letterSpacing: "-0.03em",
              color: "#0a0a0a", marginTop: 10
            }}>
              How HyperX works
            </h2>
          </Reveal>

          <div className="hx-two" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            {[
              { n: "01", t: "Assess your starting point", d: "We understand where you are — skills, background, goals — and map your personal path." },
              { n: "02", t: "Learn professional reality", d: "Video lessons, live sessions, and real scenario exercises across all 6 modules." },
              { n: "03", t: "Practice with real pressure", d: "Role-play workplace situations, mock interviews, and salary negotiation drills." },
              { n: "04", t: "Enter the DigiHub network", d: "Connect with brands, founders, and placed professionals who can get you in the door." },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 60}>
                <div className="eco-card" style={{ height: "100%" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#d1d5db", marginBottom: 16 }}>{s.n}</div>
                  <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 14, color: "#0a0a0a", marginBottom: 8, letterSpacing: "-0.01em", lineHeight: 1.4 }}>{s.t}</h4>
                  <p style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.65 }}>{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── ECOSYSTEM CONNECTION ── */}
      <section style={{ padding: "72px 24px", background: "#fff", borderBottom: `1px solid ${B}` }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <Reveal style={{ marginBottom: 36 }}>
            <span className="hx-chip" style={{ marginBottom: 10 }}>Nugens Ecosystem</span>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700,
              fontSize: "clamp(20px,2.8vw,28px)", letterSpacing: "-0.03em",
              color: "#0a0a0a", marginTop: 10
            }}>
              HyperX is one part of a bigger system
            </h2>
            <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.7, maxWidth: 440, marginTop: 8 }}>
              We don't just train you and send you off. HyperX connects into Gen-E AI and DigiHub — so every step has a next step.
            </p>
          </Reveal>

          <div className="hx-two" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {[
              {
                label: "Gen-E AI tells you what to learn",
                color: "#7c3aed",
                desc: "Start with Gen-E — it analyses your resume, finds your skill gaps, and tells you exactly which HyperX modules you need most.",
                link: "/gene", cta: "Try Gen-E AI"
              },
              {
                label: "HyperX teaches you how to be it",
                color: PINK,
                desc: "You're here. This is where the experience training happens — professional skills, communication, and workplace readiness.",
                link: null, cta: "You are here"
              },
              {
                label: "DigiHub places you in the real world",
                color: "#0284c7",
                desc: "After training, DigiHub's community of brands and founders helps you land your first real job — even at entry-level — to start building your career.",
                link: "/digihub", cta: "Explore DigiHub"
              },
            ].map((c, i) => (
              <Reveal key={c.label} delay={i * 70}>
                <div style={{ padding: "26px", borderRadius: 10, border: `1px solid ${B}`, background: i === 1 ? "#0a0a0a" : "#fff", height: "100%" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.color, marginBottom: 18 }} />
                  <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: "-0.01em", lineHeight: 1.4, marginBottom: 10, color: i === 1 ? "#fff" : "#0a0a0a" }}>{c.label}</h4>
                  <p style={{ fontSize: 13, lineHeight: 1.65, color: i === 1 ? "#9ca3af" : "#6b7280", marginBottom: 20 }}>{c.desc}</p>
                  {c.link
                    ? <Link to={c.link} style={{ fontSize: 12.5, fontWeight: 600, color: c.color, textDecoration: "none" }}>{c.cta} →</Link>
                    : <span style={{ fontSize: 12.5, fontWeight: 600, color: c.color }}>◎ {c.cta}</span>
                  }
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "80px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 580, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <span className="hx-chip hx-chip-pink" style={{ marginBottom: 18 }}>Start now</span>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700,
              fontSize: "clamp(20px,3vw,32px)", letterSpacing: "-0.03em",
              color: "#0a0a0a", marginTop: 14, marginBottom: 14, lineHeight: 1.25
            }}>
              Stop learning basics.<br />Start learning how to work.
            </h2>
            <p style={{ fontSize: 14.5, color: "#9ca3af", lineHeight: 1.72, maxWidth: 380, margin: "0 auto 28px" }}>
              Enroll in HyperX and get the professional foundation that years of experience used to be the only way to build.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
              <Link to="/contact" className="hx-btn-pink">Enroll in HyperX →</Link>
              <Link to="/gene" className="hx-btn-ghost">Start with Gen-E first</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}