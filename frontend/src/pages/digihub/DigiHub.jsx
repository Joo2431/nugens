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

const AGENCY_SERVICES = [
  { title: "Brand Identity & Strategy", desc: "Positioning, messaging, visual identity, and brand architecture built for growth." },
  { title: "Content Creation", desc: "Photos, videos, reels, podcasts, and brand stories — produced in-house with The Wedding Unit's gear." },
  { title: "Performance Marketing", desc: "Meta, Google, and funnel-based paid campaigns designed to convert, not just reach." },
  { title: "Social Media Management", desc: "Content calendars, community management, analytics, and platform-specific strategies." },
  { title: "Website & SEO", desc: "Fast, professional websites with SEO architecture that attracts the right audience." },
  { title: "AI Automation", desc: "Workflows, chatbots, and process automation that let your team focus on what matters." },
];

const COMMUNITY_ROLES = [
  { icon: "◎", role: "Brands & Founders", desc: "Companies in our community post real opportunities for freshers to join at entry-level — gaining experience while growing the brand." },
  { icon: "⬡", role: "Working Professionals", desc: "People already placed in companies share referrals and guidance, helping HyperX graduates get foot-in-door opportunities." },
  { icon: "◈", role: "Career-Ready Graduates", desc: "People who completed Gen-E + HyperX enter the DigiHub community ready to contribute from day one." },
  { icon: "◇", role: "Mentors & Industry Experts", desc: "Senior professionals who review profiles and make direct introductions based on skill fit." },
];

export default function DigiHub() {
  const [on, setOn] = useState(false);
  const [view, setView] = useState("agency"); // "agency" | "community"
  useEffect(() => { setTimeout(() => setOn(true), 50); }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; }

        .dh-chip {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 12px; border-radius: 6px; border: 1px solid ${B};
          font-size: 11.5px; font-weight: 500; color: #6b7280; background: #fff;
        }
        .dh-chip-pink { background: #fef2f5; border-color: #fcc8d6; color: ${PINK}; }

        .dh-btn-pink {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 11px 24px; border-radius: 8px; background: ${PINK};
          color: #fff; font-size: 13.5px; font-weight: 600; border: none;
          text-decoration: none; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
          transition: opacity 0.14s, transform 0.12s; letter-spacing: -0.01em;
          box-shadow: 0 2px 10px rgba(232,24,93,0.25);
        }
        .dh-btn-pink:hover { opacity: 0.88; transform: translateY(-1px); }

        .dh-btn-ghost {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 11px 24px; border-radius: 8px; background: #fff;
          color: #374151; font-size: 13.5px; font-weight: 500;
          border: 1px solid ${B}; text-decoration: none; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: border-color 0.14s, color 0.14s, transform 0.12s;
        }
        .dh-btn-ghost:hover { border-color: #9ca3af; color: #0a0a0a; transform: translateY(-1px); }

        .dh-btn-dark {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 11px 24px; border-radius: 8px; background: #0a0a0a;
          color: #fff; font-size: 13.5px; font-weight: 600; border: none;
          text-decoration: none; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
          transition: background 0.14s, transform 0.12s; letter-spacing: -0.01em;
        }
        .dh-btn-dark:hover { background: #222; transform: translateY(-1px); }

        .view-toggle {
          display: inline-flex; padding: 3px; background: #f0f0f0; border-radius: 8px; gap: 2px;
        }
        .vtab {
          padding: 7px 20px; border-radius: 6px; font-size: 13px; font-weight: 500;
          cursor: pointer; border: none; font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.13s; color: #6b7280; background: transparent;
        }
        .vtab.on { background: #fff; color: #0a0a0a; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }

        .svc-card {
          padding: 22px; border-radius: 10px; border: 1px solid ${B}; background: #fff;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .svc-card:hover { border-color: #fcc8d6; box-shadow: 0 2px 18px rgba(232,24,93,0.06); }

        .com-card {
          padding: 26px; border-radius: 10px; border: 1px solid ${B}; background: #fff;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .com-card:hover { border-color: #fcc8d6; box-shadow: 0 2px 18px rgba(232,24,93,0.06); }

        @media (max-width: 740px) {
          .dh-two { grid-template-columns: 1fr !important; }
          .dh-three { grid-template-columns: 1fr !important; }
          .dh-four { grid-template-columns: 1fr 1fr !important; }
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
        <div style={{ position: "absolute", top: -80, right: -60, width: 380, height: 380,
          borderRadius: "50%", background: "#0284c7", filter: "blur(120px)", opacity: 0.04, pointerEvents: "none" }} />

        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 }}>
          <div style={{ opacity: on ? 1 : 0, transform: on ? "none" : "translateY(10px)", transition: "all 0.4s ease 0.04s", marginBottom: 22 }}>
            <span className="dh-chip dh-chip-pink">Marketing Agency · Career Community</span>
          </div>

          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800,
            lineHeight: 1.15, letterSpacing: "-0.035em", color: "#0a0a0a",
            marginBottom: 20,
            opacity: on ? 1 : 0, transform: on ? "none" : "translateY(14px)",
            transition: "all 0.46s ease 0.14s"
          }}>
            Where brands grow<br />
            <span style={{ color: PINK }}>and careers begin</span>
          </h1>

          <p style={{
            fontSize: 16, color: "#6b7280", lineHeight: 1.72,
            maxWidth: 540, margin: "0 auto 12px", fontWeight: 400,
            opacity: on ? 1 : 0, transform: on ? "none" : "translateY(10px)",
            transition: "all 0.46s ease 0.24s"
          }}>
            DigiHub is two things in one: a full-service digital marketing agency for brands that need real growth — and a community that bridges the gap between trained talent and the companies that need them.
          </p>

          {/* toggle */}
          <div style={{
            display: "flex", justifyContent: "center", marginBottom: 28, marginTop: 22,
            opacity: on ? 1 : 0, transition: "opacity 0.46s ease 0.3s"
          }}>
            <div className="view-toggle">
              <button className={`vtab ${view === "agency" ? "on" : ""}`} onClick={() => setView("agency")}>For Brands</button>
              <button className={`vtab ${view === "community" ? "on" : ""}`} onClick={() => setView("community")}>For Job Seekers</button>
            </div>
          </div>

          <div style={{
            display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap",
            opacity: on ? 1 : 0, transform: on ? "none" : "translateY(8px)",
            transition: "all 0.46s ease 0.34s", marginBottom: 44
          }}>
            {view === "agency"
              ? <><Link to="/contact" className="dh-btn-pink">Book a strategy call →</Link><Link to="/portfolio" className="dh-btn-ghost">View our work</Link></>
              : <><Link to="/contact" className="dh-btn-pink">Join the community →</Link><Link to="/gene" className="dh-btn-ghost">Start with Gen-E first</Link></>
            }
          </div>

          {/* stats strip */}
          <div style={{
            display: "flex", justifyContent: "center", flexWrap: "wrap",
            borderTop: `1px solid ${B}`, borderBottom: `1px solid ${B}`, padding: "18px 0",
            opacity: on ? 1 : 0, transition: "opacity 0.46s ease 0.44s"
          }}>
            {[["30+", "Brand clients"], ["200+", "Community members"], ["6", "Service streams"], ["4.9★", "Client satisfaction"]].map(([n, l], i, arr) => (
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

      {/* ── AGENCY SERVICES ── */}
      {view === "agency" && (
        <>
          <section style={{ padding: "72px 24px", background: "#fafafa", borderBottom: `1px solid ${B}` }}>
            <div style={{ maxWidth: 1060, margin: "0 auto" }}>
              <Reveal style={{ marginBottom: 36 }}>
                <span className="dh-chip" style={{ marginBottom: 10 }}>Agency Services</span>
                <h2 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700,
                  fontSize: "clamp(20px,2.8vw,28px)", letterSpacing: "-0.03em",
                  color: "#0a0a0a", marginTop: 10
                }}>
                  Everything your brand needs to grow
                </h2>
                <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.7, maxWidth: 420, marginTop: 8 }}>
                  From first impression to repeat customers — we handle the full digital journey.
                </p>
              </Reveal>

              <div className="dh-three" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                {AGENCY_SERVICES.map((s, i) => (
                  <Reveal key={s.title} delay={i * 50}>
                    <div className="svc-card">
                      <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 14, color: "#0a0a0a", marginBottom: 8, letterSpacing: "-0.01em" }}>{s.title}</h4>
                      <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.65 }}>{s.desc}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* process */}
          <section style={{ padding: "72px 24px", background: "#fff", borderBottom: `1px solid ${B}` }}>
            <div style={{ maxWidth: 1060, margin: "0 auto" }}>
              <Reveal style={{ marginBottom: 40 }}>
                <span className="dh-chip" style={{ marginBottom: 10 }}>How we work</span>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "clamp(20px,2.8vw,28px)", letterSpacing: "-0.03em", color: "#0a0a0a", marginTop: 10 }}>
                  Strategy first. Results second.
                </h2>
              </Reveal>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 0, border: `1px solid ${B}`, borderRadius: 12, overflow: "hidden" }}>
                {[
                  { n: "01", t: "Discover & Audit", d: "We study your brand, audience, competitors, and current presence before recommending a single thing." },
                  { n: "02", t: "Build & Launch", d: "Creative assets, campaigns, and content — built by a team that treats your brand like their own." },
                  { n: "03", t: "Measure & Scale", d: "Every campaign tracked against real KPIs. We double down on what works and cut what doesn't." },
                ].map((s, i) => (
                  <Reveal key={s.n} delay={i * 70}>
                    <div style={{
                      padding: "28px 24px",
                      borderRight: i < 2 ? `1px solid ${B}` : "none",
                      background: i === 1 ? "#fafafa" : "#fff"
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#d1d5db", marginBottom: 14 }}>{s.n}</div>
                      <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 15, color: "#0a0a0a", marginBottom: 8, letterSpacing: "-0.01em" }}>{s.t}</h4>
                      <p style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.65 }}>{s.d}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── COMMUNITY VIEW ── */}
      {view === "community" && (
        <>
          <section style={{ padding: "72px 24px", background: "#fafafa", borderBottom: `1px solid ${B}` }}>
            <div style={{ maxWidth: 1060, margin: "0 auto" }}>
              <Reveal style={{ marginBottom: 36 }}>
                <span className="dh-chip" style={{ marginBottom: 10 }}>Career Community</span>
                <h2 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700,
                  fontSize: "clamp(20px,2.8vw,28px)", letterSpacing: "-0.03em",
                  color: "#0a0a0a", marginTop: 10
                }}>
                  Not a job board. A community that places people.
                </h2>
                <p style={{ fontSize: 14.5, color: "#6b7280", lineHeight: 1.72, maxWidth: 540, marginTop: 10 }}>
                  DigiHub brings together brands who need talent, professionals who give referrals, and graduates who are ready to work — all in one network built for real placements at entry-level with growth potential.
                </p>
              </Reveal>

              <div className="dh-two" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
                {COMMUNITY_ROLES.map((c, i) => (
                  <Reveal key={c.role} delay={i * 60}>
                    <div className="com-card">
                      <div style={{ fontSize: 18, color: PINK, marginBottom: 14, fontWeight: 300, lineHeight: 1 }}>{c.icon}</div>
                      <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 14, color: "#0a0a0a", marginBottom: 8, letterSpacing: "-0.01em" }}>{c.role}</h4>
                      <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.65 }}>{c.desc}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* how placements work */}
          <section style={{ padding: "72px 24px", background: "#fff", borderBottom: `1px solid ${B}` }}>
            <div style={{ maxWidth: 1060, margin: "0 auto" }}>
              <div className="dh-two" style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "40px 80px", alignItems: "start" }}>
                <Reveal>
                  <span className="dh-chip" style={{ marginBottom: 10 }}>Placement path</span>
                  <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "clamp(20px,2.8vw,28px)", letterSpacing: "-0.03em", color: "#0a0a0a", marginTop: 10, marginBottom: 14 }}>
                    From trained to employed
                  </h2>
                  <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.7, maxWidth: 340, marginBottom: 28 }}>
                    We don't promise placement. We build the conditions where placement naturally happens — through skills, community, and real connections.
                  </p>
                  <Link to="/contact" className="dh-btn-pink">Join the community →</Link>
                </Reveal>
                <Reveal delay={100}>
                  {[
                    { n: "01", t: "Complete Gen-E + HyperX", d: "Understand your career path and build real professional skills." },
                    { n: "02", t: "Enter DigiHub network", d: "Your profile is shared with brands, founders, and professionals in our community." },
                    { n: "03", t: "Get an entry-level role", d: "Start at a relevant company — even at minimal salary — to get real experience in your field." },
                    { n: "04", t: "Grow into your dream job", d: "That first experience unlocks better roles, better companies, and better pay." },
                  ].map(s => (
                    <div key={s.n} style={{ display: "flex", gap: 16, padding: "15px 0", borderBottom: `1px solid #f7f7f7` }}>
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
        </>
      )}

      {/* ── ECOSYSTEM ── */}
      <section style={{ padding: "72px 24px", background: "#fafafa", borderBottom: `1px solid ${B}` }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <Reveal style={{ marginBottom: 36 }}>
            <span className="dh-chip" style={{ marginBottom: 10 }}>Nugens Ecosystem</span>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "clamp(20px,2.8vw,28px)", letterSpacing: "-0.03em", color: "#0a0a0a", marginTop: 10 }}>
              DigiHub is where the ecosystem completes
            </h2>
          </Reveal>

          <div className="dh-three" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {[
              { label: "Gen-E identifies the path", color: "#7c3aed", desc: "Gen-E analyses your resume and career goals — pointing you to the right learning and growth direction.", link: "/gene", cta: "Explore Gen-E" },
              { label: "HyperX builds the skills", color: PINK, desc: "HyperX trains you in professional skills and workplace readiness that no basic course covers.", link: "/hyperx", cta: "Explore HyperX" },
              { label: "DigiHub opens the door", color: "#0284c7", desc: "DigiHub connects trained talent with the brands and professionals who can give them their first real opportunity.", link: null, cta: "◎ You are here" },
            ].map((c, i) => (
              <Reveal key={c.label} delay={i * 70}>
                <div style={{ padding: "26px", borderRadius: 10, border: `1px solid ${B}`, background: i === 2 ? "#0a0a0a" : "#fff" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.color, marginBottom: 18 }} />
                  <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: "-0.01em", lineHeight: 1.4, marginBottom: 10, color: i === 2 ? "#fff" : "#0a0a0a" }}>{c.label}</h4>
                  <p style={{ fontSize: 13, lineHeight: 1.65, color: i === 2 ? "#9ca3af" : "#6b7280", marginBottom: 20 }}>{c.desc}</p>
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
            <span className="dh-chip dh-chip-pink" style={{ marginBottom: 18 }}>Get started</span>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700,
              fontSize: "clamp(20px,3vw,32px)", letterSpacing: "-0.03em",
              color: "#0a0a0a", marginTop: 14, marginBottom: 14, lineHeight: 1.25
            }}>
              {view === "agency"
                ? "Ready to scale your brand's digital presence?"
                : "Ready to turn your skills into your first real job?"}
            </h2>
            <p style={{ fontSize: 14.5, color: "#9ca3af", lineHeight: 1.72, maxWidth: 380, margin: "0 auto 28px" }}>
              {view === "agency"
                ? "Book a strategy call and we'll map exactly how DigiHub can grow your brand."
                : "Join the DigiHub community and get connected to brands and professionals who'll help you start your career."}
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
              <Link to="/contact" className="dh-btn-pink">{view === "agency" ? "Book a strategy call →" : "Join DigiHub →"}</Link>
              <button className="dh-btn-ghost" onClick={() => setView(view === "agency" ? "community" : "agency")}>
                {view === "agency" ? "See community" : "See agency services"}
              </button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}