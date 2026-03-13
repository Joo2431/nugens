import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const PINK = "#e8185d";
const PURPLE = "#7c3aed";
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

const FEATURES = [
  { title: "Resume Analysis & ATS Scoring", desc: "Upload your resume and Gen-E breaks down exactly what's working, what's missing, and what's hurting your ATS score — with specific fixes, not vague advice.", icon: "◈" },
  { title: "Relevant Job Matching", desc: "Based on your resume, experience, and skills, Gen-E finds roles that actually match who you are — not just jobs you might have applied to blindly.", icon: "⬡" },
  { title: "Career Path for Freshers", desc: "Just graduated with no idea where to start? Gen-E maps a realistic path based on your degree, skills, and interests — with clear first steps.", icon: "◎" },
  { title: "Career Change Guidance", desc: "Want to switch fields? Gen-E analyses your transferable skills, identifies what gaps you'll need to fill, and builds a realistic timeline for the transition.", icon: "◇" },
  { title: "Skill Growth Roadmap", desc: "A prioritised 3-month plan of exactly what to learn, in what order, to close the gap between where you are and where you want to be.", icon: "◉" },
  { title: "ATS-Friendly Resume Builder", desc: "Gen-E rewrites your resume using keywords and structures that actually pass Applicant Tracking Systems — so recruiters see your profile first.", icon: "▣" },
];

const WHO_FOR = [
  { segment: "Fresh graduates", prob: "Don't know which role to pursue or how to position their degree", solution: "Gen-E maps a career path based on your background and builds your first job-ready resume", color: PURPLE },
  { segment: "Career changers", prob: "Want to switch fields but don't know how to translate their experience", solution: "Gen-E identifies transferable skills, skill gaps, and a realistic transition roadmap", color: "#059669" },
  { segment: "Job seekers not getting responses", prob: "Applying to jobs but getting silence — it's usually the resume or the role fit", solution: "Gen-E diagnoses exactly why applications aren't working and fixes them", color: "#d97706" },
  { segment: "Professionals wanting to grow", prob: "Stuck at a level and not sure what skills to build for the next step", solution: "Gen-E analyses your current profile and maps the specific skills for your target role", color: PINK },
];

export default function GenE() {
  const [on, setOn] = useState(false);
  useEffect(() => { setTimeout(() => setOn(true), 50); }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .ge-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 6px; border: 1px solid ${B}; font-size: 11.5px; font-weight: 500; color: #6b7280; background: #fff; }
        .ge-chip-purple { background: #f5f3ff; border-color: #c4b5fd; color: ${PURPLE}; }
        .ge-btn-purple { display: inline-flex; align-items: center; gap: 7px; padding: 11px 24px; border-radius: 8px; background: ${PURPLE}; color: #fff; font-size: 13.5px; font-weight: 600; border: none; text-decoration: none; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: opacity 0.14s, transform 0.12s; letter-spacing: -0.01em; box-shadow: 0 2px 10px rgba(124,58,237,0.25); }
        .ge-btn-purple:hover { opacity: 0.88; transform: translateY(-1px); }
        .ge-btn-ghost { display: inline-flex; align-items: center; gap: 7px; padding: 11px 24px; border-radius: 8px; background: #fff; color: #374151; font-size: 13.5px; font-weight: 500; border: 1px solid ${B}; text-decoration: none; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: border-color 0.14s, color 0.14s, transform 0.12s; }
        .ge-btn-ghost:hover { border-color: #9ca3af; color: #0a0a0a; transform: translateY(-1px); }
        .feat-card { padding: 24px; border-radius: 10px; border: 1px solid ${B}; background: #fff; transition: border-color 0.18s, box-shadow 0.18s; }
        .feat-card:hover { border-color: #c4b5fd; box-shadow: 0 2px 18px rgba(124,58,237,0.07); }
        .who-card { padding: 24px; border-radius: 10px; border: 1px solid ${B}; background: #fff; transition: border-color 0.18s; }
        .step-row { display: flex; gap: 16px; padding: 15px 0; border-bottom: 1px solid #f7f7f7; }
        .step-row:last-child { border-bottom: none; }
        @media (max-width: 740px) {
          .ge-two { grid-template-columns: 1fr !important; }
          .ge-three { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section style={{ padding: "88px 24px 72px", background: "#fff", borderBottom: `1px solid ${B}`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: `linear-gradient(${B} 1px,transparent 1px),linear-gradient(90deg,${B} 1px,transparent 1px)`, backgroundSize: "52px 52px", opacity: 0.4 }} />
        <div style={{ position: "absolute", top: -80, right: -60, width: 380, height: 380, borderRadius: "50%", background: PURPLE, filter: "blur(120px)", opacity: 0.05, pointerEvents: "none" }} />

        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 }}>
          <div style={{ opacity: on ? 1 : 0, transform: on ? "none" : "translateY(10px)", transition: "all 0.4s ease 0.04s", marginBottom: 22 }}>
            <span className="ge-chip ge-chip-purple">AI Career Intelligence · The Starting Point</span>
          </div>

          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.035em", color: "#0a0a0a", marginBottom: 20, opacity: on ? 1 : 0, transform: on ? "none" : "translateY(14px)", transition: "all 0.46s ease 0.14s" }}>
            Your career path,<br />
            <span style={{ color: PURPLE }}>built by AI. Owned by you.</span>
          </h1>

          <p style={{ fontSize: 16, color: "#6b7280", lineHeight: 1.72, maxWidth: 520, margin: "0 auto 32px", fontWeight: 400, opacity: on ? 1 : 0, transform: on ? "none" : "translateY(10px)", transition: "all 0.46s ease 0.24s" }}>
            Gen-E is the first step in the Nugens ecosystem — an AI career assistant that analyses where you are, identifies exactly where to go, and gives you a concrete plan to get there. Not generic advice. Your specific path.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", opacity: on ? 1 : 0, transform: on ? "none" : "translateY(8px)", transition: "all 0.46s ease 0.34s", marginBottom: 48 }}>
            {/* ✅ FIXED: was /gen-e */}
            <Link to="/gene/app" className="ge-btn-purple">Launch Gen-E AI →</Link>
            <Link to="/hyperx" className="ge-btn-ghost">Pair with HyperX</Link>
          </div>

          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", borderTop: `1px solid ${B}`, borderBottom: `1px solid ${B}`, padding: "18px 0", opacity: on ? 1 : 0, transition: "opacity 0.46s ease 0.44s" }}>
            {[["AI-powered", "Career analysis"], ["6 modules", "Career intelligence"], ["ATS-ready", "Resume optimisation"], ["Free", "To start"]].map(([n, l], i, arr) => (
              <div key={l} style={{ padding: "0 28px", textAlign: "center", borderRight: i < arr.length - 1 ? `1px solid ${B}` : "none" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#0a0a0a", letterSpacing: "-0.02em" }}>{n}</div>
                <div style={{ fontSize: 11.5, color: "#9ca3af", marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO IT'S FOR ── */}
      <section style={{ padding: "72px 24px", background: "#fafafa", borderBottom: `1px solid ${B}` }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <Reveal style={{ marginBottom: 36 }}>
            <span className="ge-chip" style={{ marginBottom: 10 }}>Who Gen-E helps</span>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "clamp(20px,2.8vw,28px)", letterSpacing: "-0.03em", color: "#0a0a0a", marginTop: 10 }}>One problem, four faces</h2>
            <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.7, maxWidth: 400, marginTop: 8 }}>Career confusion looks different for everyone. Gen-E is built to handle all of it.</p>
          </Reveal>
          <div className="ge-two" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
            {WHO_FOR.map((w, i) => (
              <Reveal key={w.segment} delay={i * 60}>
                <div className="who-card" style={{ borderLeft: `3px solid ${w.color}` }}>
                  <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: w.color, marginBottom: 10 }}>{w.segment}</div>
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "#9ca3af" }}>Problem: </span>
                    <span style={{ fontSize: 13.5, color: "#6b7280" }}>{w.prob}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "#9ca3af" }}>Gen-E: </span>
                    <span style={{ fontSize: 13.5, color: "#0a0a0a", fontWeight: 500 }}>{w.solution}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: "72px 24px", background: "#fff", borderBottom: `1px solid ${B}` }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <Reveal style={{ marginBottom: 36 }}>
            <span className="ge-chip" style={{ marginBottom: 10 }}>Capabilities</span>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "clamp(20px,2.8vw,28px)", letterSpacing: "-0.03em", color: "#0a0a0a", marginTop: 10 }}>What Gen-E actually does</h2>
          </Reveal>
          <div className="ge-three" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 50}>
                <div className="feat-card">
                  <div style={{ fontSize: 18, color: PURPLE, marginBottom: 14, fontWeight: 300, lineHeight: 1 }}>{f.icon}</div>
                  <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 14, color: "#0a0a0a", marginBottom: 8, letterSpacing: "-0.01em" }}>{f.title}</h4>
                  <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "72px 24px", background: "#fafafa", borderBottom: `1px solid ${B}` }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <div className="ge-two" style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "40px 80px", alignItems: "start" }}>
            <Reveal>
              <span className="ge-chip" style={{ marginBottom: 10 }}>How it works</span>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "clamp(20px,2.8vw,28px)", letterSpacing: "-0.03em", color: "#0a0a0a", marginTop: 10, marginBottom: 14 }}>Clarity in three steps</h2>
              <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.7, maxWidth: 300, marginBottom: 28 }}>One conversation with Gen-E can reshape your entire direction. Start anytime — no preparation needed.</p>
              {/* ✅ FIXED: was /gen-e */}
              <Link to="/gene/app" className="ge-btn-purple">Launch Gen-E →</Link>
            </Reveal>
            <Reveal delay={100}>
              {[
                { n: "01", t: "Tell Gen-E where you are", d: "Share your resume or describe your background, education, and career goals — in your own words." },
                { n: "02", t: "Get a structured analysis", d: "Gen-E analyses your profile, identifies gaps, and maps you to relevant career paths with honest scoring." },
                { n: "03", t: "Receive your personal roadmap", d: "A 3-month action plan with specific skills to build, roles to target, and what to fix in your resume." },
                { n: "04", t: "Continue with HyperX", d: "Take your roadmap into HyperX and start building the professional skills Gen-E identified you need." },
              ].map(s => (
                <div key={s.n} className="step-row">
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#d1d5db", width: 20, flexShrink: 0, paddingTop: 2 }}>{s.n}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#0a0a0a", marginBottom: 3 }}>{s.t}</div>
                    <div style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.6 }}>{s.d}</div>
                  </div>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── ECOSYSTEM ── */}
      <section style={{ padding: "72px 24px", background: "#fff", borderBottom: `1px solid ${B}` }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <Reveal style={{ marginBottom: 36 }}>
            <span className="ge-chip" style={{ marginBottom: 10 }}>Nugens Ecosystem</span>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "clamp(20px,2.8vw,28px)", letterSpacing: "-0.03em", color: "#0a0a0a", marginTop: 10 }}>Gen-E is just the beginning</h2>
          </Reveal>
          <div className="ge-three" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {[
              { label: "Gen-E AI", sublabel: "Start here", color: PURPLE, desc: "You're here. Get clarity on your path, fix your resume, and understand exactly what skills you need to build.", link: null, cta: "◎ You are here" },
              { label: "HyperX", sublabel: "Then learn", color: PINK, desc: "Take your Gen-E roadmap into HyperX — the learning platform that teaches professional skills no course covers.", link: "/hyperx", cta: "Explore HyperX" },
              { label: "DigiHub", sublabel: "Then connect", color: "#0284c7", desc: "After training, DigiHub's community connects you with brands and professionals who can give you your first real role.", link: "/digihub", cta: "Explore DigiHub" },
            ].map((c, i) => (
              <Reveal key={c.label} delay={i * 70}>
                <div style={{ padding: "26px", borderRadius: 10, border: `1px solid ${B}`, background: i === 0 ? "#0a0a0a" : "#fff" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.color, marginBottom: 18 }} />
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: c.color, marginBottom: 6 }}>{c.sublabel}</div>
                  <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em", marginBottom: 10, color: i === 0 ? "#fff" : "#0a0a0a" }}>{c.label}</h4>
                  <p style={{ fontSize: 13, lineHeight: 1.65, color: i === 0 ? "#9ca3af" : "#6b7280", marginBottom: 20 }}>{c.desc}</p>
                  {c.link
                    ? <Link to={c.link} style={{ fontSize: 12.5, fontWeight: 600, color: c.color, textDecoration: "none" }}>{c.cta} →</Link>
                    : <span style={{ fontSize: 12.5, fontWeight: 600, color: c.color }}>{c.cta}</span>
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
            <span className="ge-chip ge-chip-purple" style={{ marginBottom: 18 }}>Try it now</span>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "clamp(20px,3vw,32px)", letterSpacing: "-0.03em", color: "#0a0a0a", marginTop: 14, marginBottom: 14, lineHeight: 1.25 }}>
              One conversation can<br />change your direction.
            </h2>
            <p style={{ fontSize: 14.5, color: "#9ca3af", lineHeight: 1.72, maxWidth: 380, margin: "0 auto 28px" }}>
              Start with Gen-E — it's free, it's specific, and it'll show you a path you probably haven't seen before.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
              <Link to="/gene/app" className="ge-btn-purple">Launch Gen-E AI →</Link>
              <Link to="/about" className="ge-btn-ghost">Learn about Nugens</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}