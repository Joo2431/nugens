import React, { useEffect, useRef, useState } from "react";

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
      transform: v ? "none" : "translateY(16px)",
      transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      ...style
    }}>{children}</div>
  );
}

const jobs = [
  {
    id: 1,
    title: "Website Developer",
    type: "Full Time / Freelance",
    team: "Engineering",
    teamColor: "#0284c7",
    description: "Build, maintain, and optimize websites for our clients using modern frameworks and CMS platforms.",
    responsibilities: [
      "Develop websites using Shopify, WordPress, HTML, CSS, JS, React",
      "Maintain Git repositories",
      "Ensure responsive & SEO-friendly builds",
      "Collaborate with designers & marketers",
    ],
    skills: ["HTML", "CSS", "JavaScript", "React", "Git", "Shopify / WordPress"],
  },
  {
    id: 2,
    title: "Graphic Designer",
    type: "Full Time / Freelance",
    team: "Creative",
    teamColor: "#d97706",
    description: "Create visually compelling designs for brands, ads, and digital platforms.",
    responsibilities: [
      "Design social media creatives",
      "Brand identity & marketing assets",
      "Collaborate with marketing team",
    ],
    skills: ["Photoshop", "Canva", "Illustrator (optional)"],
  },
  {
    id: 3,
    title: "Video Editor",
    type: "Full Time / Freelance",
    team: "Creative",
    teamColor: "#d97706",
    description: "Edit high-quality videos for brands, ads, weddings, and social media.",
    responsibilities: [
      "Edit reels & long-form videos",
      "Add motion graphics & transitions",
      "Optimize videos for social platforms",
    ],
    skills: ["Premiere Pro", "After Effects", "CapCut"],
  },
  {
    id: 4,
    title: "Content Creation Associate",
    type: "Full Time",
    team: "Marketing",
    teamColor: PINK,
    description: "Manage content strategy and social media presence for Nugens and client brands.",
    responsibilities: [
      "Create ad & organic content",
      "Manage social media accounts",
      "Plan content calendars & strategies",
    ],
    skills: ["Content Writing", "Social Media", "Strategy"],
  },
  {
    id: 5,
    title: "Office Administration Associate",
    type: "Full Time",
    team: "Operations",
    teamColor: "#6b7280",
    description: "Handle basic office operations and internal coordination.",
    responsibilities: [
      "Basic office administration",
      "Client coordination",
      "Documentation & reports",
    ],
    skills: ["English Communication", "Computer Knowledge", "MS Office"],
  },
];

export default function Careers() {
  const [on, setOn] = useState(false);
  const [activeJob, setActiveJob] = useState(null);
  useEffect(() => { setTimeout(() => setOn(true), 50); }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; }

        .cr-chip {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 12px; border-radius: 6px; border: 1px solid ${B};
          font-size: 11.5px; font-weight: 500; color: #6b7280; background: #fff;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .cr-chip-pink { background: #fef2f5; border-color: #fcc8d6; color: ${PINK}; }

        .job-card {
          background: #fff; border: 1px solid ${B}; border-radius: 12px;
          overflow: hidden; transition: border-color 0.18s, box-shadow 0.18s;
        }
        .job-card:hover { border-color: #fcc8d6; box-shadow: 0 2px 18px rgba(232,24,93,0.06); }

        .toggle-btn {
          padding: 7px 16px; border-radius: 7px; background: transparent;
          border: 1px solid ${B}; font-size: 12.5px; font-weight: 600;
          color: #374151; cursor: pointer; transition: all 0.13s;
          font-family: 'Plus Jakarta Sans', sans-serif; flex-shrink: 0;
        }
        .toggle-btn.open { background: #fef2f5; border-color: #fcc8d6; color: ${PINK}; }
        .toggle-btn:hover:not(.open) { border-color: #9ca3af; }

        .skill-tag {
          padding: 4px 10px; border-radius: 5px;
          background: #f3f4f6; border: 1px solid ${B};
          font-size: 12px; color: #374151;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .apply-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 22px; border-radius: 8px; background: #0a0a0a;
          color: #fff; font-size: 13.5px; font-weight: 600;
          text-decoration: none; letter-spacing: -0.01em;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: background 0.14s;
        }
        .apply-btn:hover { background: #222; }

        .resp-item {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 8px 0; border-bottom: 1px solid #f7f7f7;
          font-size: 13.5px; color: #374151; line-height: 1.5;
        }
        .resp-item:last-child { border-bottom: none; }

        @media (max-width: 480px) {
          .job-header-row { flex-direction: column !important; align-items: flex-start !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section style={{
        padding: "84px 24px 60px", background: "#fff",
        borderBottom: `1px solid ${B}`, position: "relative", overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `linear-gradient(${B} 1px,transparent 1px),linear-gradient(90deg,${B} 1px,transparent 1px)`,
          backgroundSize: "52px 52px", opacity: 0.4
        }} />
        <div style={{
          position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)",
          width: 400, height: 400, borderRadius: "50%",
          background: PINK, filter: "blur(130px)", opacity: 0.05, pointerEvents: "none"
        }} />

        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 }}>
          <div style={{
            opacity: on ? 1 : 0, transform: on ? "none" : "translateY(8px)",
            transition: "all 0.4s ease 0.05s", marginBottom: 22
          }}>
            <span className="cr-chip cr-chip-pink">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: PINK, flexShrink: 0 }} />
              We're hiring
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800,
            lineHeight: 1.15, letterSpacing: "-0.035em", color: "#0a0a0a",
            marginBottom: 16,
            opacity: on ? 1 : 0, transform: on ? "none" : "translateY(14px)",
            transition: "all 0.46s ease 0.14s"
          }}>
            Careers at{" "}
            <span style={{ color: PINK }}>Nugens</span>
          </h1>

          <p style={{
            fontSize: 15.5, color: "#6b7280", lineHeight: 1.72,
            maxWidth: 460, margin: "0 auto",
            opacity: on ? 1 : 0, transform: on ? "none" : "translateY(10px)",
            transition: "all 0.46s ease 0.24s"
          }}>
            Join our creative & technology-driven team. Build products, brands, and careers with us.
          </p>
        </div>
      </section>

      {/* ── JOB CARDS ── */}
      <section style={{ padding: "60px 24px 80px", background: "#fafafa" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <Reveal style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <span className="cr-chip" style={{ marginBottom: 10 }}>Open roles</span>
                <h2 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700,
                  fontSize: "clamp(20px, 2.8vw, 26px)", letterSpacing: "-0.03em",
                  color: "#0a0a0a", marginTop: 8
                }}>{jobs.length} positions open</h2>
              </div>
              <p style={{ fontSize: 13.5, color: "#9ca3af", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Can't find a fit?{" "}
                <a href="mailto:careers@nugens.in" style={{ color: PINK, fontWeight: 600, textDecoration: "none" }}>
                  careers@nugens.in
                </a>
              </p>
            </div>
          </Reveal>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {jobs.map((job, i) => (
              <Reveal key={job.id} delay={i * 50}>
                <div className="job-card">
                  {/* Header */}
                  <div
                    className="job-header-row"
                    style={{
                      padding: "22px 24px",
                      display: "flex", alignItems: "center",
                      justifyContent: "space-between", gap: 12,
                      cursor: "pointer"
                    }}
                    onClick={() => setActiveJob(activeJob === job.id ? null : job.id)}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5, flexWrap: "wrap" }}>
                        <h3 style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: 16, fontWeight: 700, color: "#0a0a0a",
                          letterSpacing: "-0.015em"
                        }}>{job.title}</h3>
                        <span style={{
                          padding: "2px 9px", borderRadius: 4, fontSize: 11, fontWeight: 600,
                          background: `${job.teamColor}15`, color: job.teamColor,
                          border: `1px solid ${job.teamColor}30`,
                          fontFamily: "'Plus Jakarta Sans', sans-serif"
                        }}>{job.team}</span>
                      </div>
                      <p style={{ fontSize: 13, color: "#9ca3af", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {job.type}
                      </p>
                    </div>

                    <button
                      className={`toggle-btn ${activeJob === job.id ? "open" : ""}`}
                      onClick={e => { e.stopPropagation(); setActiveJob(activeJob === job.id ? null : job.id); }}
                    >
                      {activeJob === job.id ? "Hide" : "View"}
                    </button>
                  </div>

                  {/* Expanded */}
                  {activeJob === job.id && (
                    <div style={{ padding: "0 24px 28px", borderTop: `1px solid ${B}` }}>
                      <p style={{
                        fontSize: 14.5, color: "#4b5563", lineHeight: 1.7,
                        padding: "20px 0 16px",
                        fontFamily: "'Plus Jakarta Sans', sans-serif"
                      }}>{job.description}</p>

                      {/* Responsibilities */}
                      <div style={{ marginBottom: 20 }}>
                        <div style={{
                          fontSize: 11, fontWeight: 600, letterSpacing: "0.07em",
                          textTransform: "uppercase", color: "#9ca3af", marginBottom: 12,
                          fontFamily: "'Plus Jakarta Sans', sans-serif"
                        }}>Responsibilities</div>
                        {job.responsibilities.map((item, j) => (
                          <div key={j} className="resp-item">
                            <div style={{
                              width: 17, height: 17, borderRadius: "50%", flexShrink: 0,
                              background: `${job.teamColor}18`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              marginTop: 2
                            }}>
                              <svg width="8" height="7" viewBox="0 0 9 8" fill="none">
                                <path d="M1.5 4L3.5 6L7.5 1.5" stroke={job.teamColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            {item}
                          </div>
                        ))}
                      </div>

                      {/* Skills */}
                      <div style={{ marginBottom: 24 }}>
                        <div style={{
                          fontSize: 11, fontWeight: 600, letterSpacing: "0.07em",
                          textTransform: "uppercase", color: "#9ca3af", marginBottom: 10,
                          fontFamily: "'Plus Jakarta Sans', sans-serif"
                        }}>Skills & Tools</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                          {job.skills.map((skill, k) => (
                            <span key={k} className="skill-tag">{skill}</span>
                          ))}
                        </div>
                      </div>

                      <a
                        href={`mailto:careers@nugens.in?subject=Application for ${job.title}`}
                        className="apply-btn"
                      >
                        Apply Now →
                      </a>
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section style={{ padding: "64px 24px", background: "#0a0a0a" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700,
              fontSize: "clamp(20px, 3vw, 28px)", letterSpacing: "-0.03em",
              color: "#fff", marginBottom: 14, lineHeight: 1.25
            }}>Don't see your role listed?</h2>
            <p style={{ fontSize: 14.5, color: "#6b7280", lineHeight: 1.72, maxWidth: 360, margin: "0 auto 28px" }}>
              We're always open to passionate people. Send your portfolio or CV and tell us what you'd bring.
            </p>
            <a href="mailto:careers@nugens.in" style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "12px 26px", borderRadius: 8, background: PINK,
              color: "#fff", fontSize: 14, fontWeight: 600,
              textDecoration: "none", letterSpacing: "-0.01em",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              boxShadow: "0 2px 10px rgba(232,24,93,0.3)"
            }}>Email careers@nugens.in →</a>
          </Reveal>
        </div>
      </section>
    </>
  );
}