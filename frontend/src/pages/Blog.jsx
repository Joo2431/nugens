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
      transform: v ? "none" : "translateY(16px)",
      transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      ...style
    }}>{children}</div>
  );
}

const CATEGORIES = ["All", "AI & Careers", "Digital Marketing", "Creative", "Education", "Workplace"];

const BLOGS = [
  {
    id: "ai-career",
    title: "How AI is Transforming Career Opportunities in 2025",
    excerpt: "Artificial Intelligence is reshaping how people learn, prepare, and get hired. Here's what it means for the future of careers.",
    category: "AI & Careers",
    date: "Jan 2025",
    readTime: "5 min read",
    featured: true,
  },
  {
    id: "digital-presence",
    title: "Why Digital Presence is No Longer Optional for Brands",
    excerpt: "From startups to enterprises, a strong digital footprint decides who wins attention and trust in today's market.",
    category: "Digital Marketing",
    date: "Dec 2024",
    readTime: "4 min read",
    featured: false,
  },
  {
    id: "visual-storytelling",
    title: "The Power of Visual Storytelling in Brand Building",
    excerpt: "Photography, video, and design are no longer aesthetics — they are strategy. Here's why every brand needs a visual identity.",
    category: "Creative",
    date: "Dec 2024",
    readTime: "6 min read",
    featured: false,
  },
  {
    id: "skill-gap",
    title: "Bridging the Skill Gap: Learning Beyond Degrees",
    excerpt: "Why practical learning and mentorship matter more than traditional education alone — and how to fill the gaps fast.",
    category: "Education",
    date: "Nov 2024",
    readTime: "5 min read",
    featured: false,
  },
  {
    id: "salary-negotiation",
    title: "The Salary Negotiation Playbook No One Taught You",
    excerpt: "Most professionals leave money on the table because they don't know how to negotiate. These tactics change that.",
    category: "Workplace",
    date: "Nov 2024",
    readTime: "7 min read",
    featured: false,
  },
  {
    id: "resume-ats",
    title: "Why Your Resume Gets Rejected Before a Human Reads It",
    excerpt: "ATS filters eliminate 75% of applications before they reach a recruiter. Here's how to make sure yours gets through.",
    category: "AI & Careers",
    date: "Oct 2024",
    readTime: "4 min read",
    featured: false,
  },
];

const CAT_COLORS = {
  "AI & Careers":      { bg: "#f5f0ff", color: "#7c3aed", border: "#ddd6fe" },
  "Digital Marketing": { bg: "#eff6ff", color: "#0284c7", border: "#bfdbfe" },
  "Creative":          { bg: "#fff7ed", color: "#d97706", border: "#fed7aa" },
  "Education":         { bg: "#ecfdf5", color: "#16a34a", border: "#bbf7d0" },
  "Workplace":         { bg: "#fef2f5", color: PINK,      border: "#fcc8d6" },
};

export default function Blog() {
  const [on, setOn] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  useEffect(() => { setTimeout(() => setOn(true), 50); }, []);

  const filtered = activeCategory === "All"
    ? BLOGS
    : BLOGS.filter(b => b.category === activeCategory);

  const featured = BLOGS.find(b => b.featured);
  const rest = filtered.filter(b => !b.featured || activeCategory !== "All");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; }

        .blog-chip {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 12px; border-radius: 6px; border: 1px solid ${B};
          font-size: 11.5px; font-weight: 500; color: #6b7280; background: #fff;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .blog-chip-pink { background: #fef2f5; border-color: #fcc8d6; color: ${PINK}; }

        .cat-btn {
          padding: 6px 14px; border-radius: 6px; font-size: 12.5px; font-weight: 500;
          color: #6b7280; background: transparent; border: 1px solid transparent;
          cursor: pointer; transition: all 0.13s; white-space: nowrap;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .cat-btn.on { background: #fff; border-color: ${B}; color: #0a0a0a; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
        .cat-btn:hover:not(.on) { color: #0a0a0a; background: #f9f9f9; }

        .blog-card {
          background: #fff; border: 1px solid ${B}; border-radius: 12px;
          padding: 24px; text-decoration: none; display: block;
          transition: box-shadow 0.18s, border-color 0.18s, transform 0.15s;
        }
        .blog-card:hover { border-color: #fcc8d6; box-shadow: 0 4px 24px rgba(232,24,93,0.07); transform: translateY(-2px); }

        .featured-card {
          background: #fff; border: 1px solid ${B}; border-radius: 12px;
          text-decoration: none; display: grid; overflow: hidden;
          transition: box-shadow 0.18s, border-color 0.18s;
        }
        .featured-card:hover { border-color: #fcc8d6; box-shadow: 0 4px 32px rgba(232,24,93,0.08); }

        @media (min-width: 700px) {
          .featured-card { grid-template-columns: 1.2fr 1fr; }
        }

        @media (max-width: 700px) {
          .blog-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section style={{
        padding: "84px 24px 60px", background: "#fff",
        borderBottom: `1px solid ${B}`, position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `linear-gradient(${B} 1px,transparent 1px),linear-gradient(90deg,${B} 1px,transparent 1px)`,
          backgroundSize: "52px 52px", opacity: 0.4
        }} />
        <div style={{
          position: "absolute", top: -80, right: -40, width: 380, height: 380,
          borderRadius: "50%", background: PINK, filter: "blur(130px)", opacity: 0.05, pointerEvents: "none"
        }} />

        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 }}>
          <div style={{
            opacity: on ? 1 : 0, transform: on ? "none" : "translateY(8px)",
            transition: "all 0.4s ease 0.05s", marginBottom: 22
          }}>
            <span className="blog-chip blog-chip-pink">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: PINK, flexShrink: 0 }} />
              Nugens Insights
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
            Thoughts on careers,<br />
            <span style={{ color: PINK }}>brands & building</span>
          </h1>

          <p style={{
            fontSize: 15.5, color: "#6b7280", lineHeight: 1.72,
            maxWidth: 440, margin: "0 auto",
            opacity: on ? 1 : 0, transform: on ? "none" : "translateY(10px)",
            transition: "all 0.46s ease 0.24s"
          }}>
            Practical insights on technology, creativity, career growth, and digital marketing — from the people building it.
          </p>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section style={{ padding: "56px 24px 80px", background: "#fafafa" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>

          {/* Category filter */}
          <Reveal style={{ marginBottom: 36 }}>
            <div style={{
              display: "flex", gap: 4, flexWrap: "wrap",
              background: "#eee", padding: 4, borderRadius: 8, width: "fit-content"
            }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`cat-btn ${activeCategory === cat ? "on" : ""}`}
                  onClick={() => setActiveCategory(cat)}
                >{cat}</button>
              ))}
            </div>
          </Reveal>

          {/* Featured post — only in "All" view */}
          {activeCategory === "All" && featured && (
            <Reveal style={{ marginBottom: 24 }}>
              <Link to={`/blog/${featured.id}`} className="featured-card">
                {/* Visual placeholder */}
                <div style={{
                  background: `linear-gradient(135deg, #fef2f5 0%, #f5f0ff 100%)`,
                  minHeight: 220,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: 40,
                }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
                    <span className="blog-chip" style={{ background: CAT_COLORS[featured.category]?.bg, color: CAT_COLORS[featured.category]?.color, borderColor: CAT_COLORS[featured.category]?.border }}>
                      Featured
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: "32px 28px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <span style={{
                    display: "inline-block", fontSize: 11, fontWeight: 600,
                    letterSpacing: "0.06em", textTransform: "uppercase",
                    color: CAT_COLORS[featured.category]?.color, marginBottom: 12,
                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                  }}>{featured.category}</span>

                  <h2 style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700, fontSize: "clamp(18px, 2.2vw, 22px)",
                    letterSpacing: "-0.025em", color: "#0a0a0a",
                    lineHeight: 1.35, marginBottom: 12
                  }}>{featured.title}</h2>

                  <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, marginBottom: 22 }}>
                    {featured.excerpt}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", gap: 12 }}>
                      <span style={{ fontSize: 12, color: "#9ca3af" }}>{featured.date}</span>
                      <span style={{ fontSize: 12, color: "#d1d5db" }}>·</span>
                      <span style={{ fontSize: 12, color: "#9ca3af" }}>{featured.readTime}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: PINK }}>Read →</span>
                  </div>
                </div>
              </Link>
            </Reveal>
          )}

          {/* Blog grid */}
          <div className="blog-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16
          }}>
            {rest.map((blog, i) => {
              const catStyle = CAT_COLORS[blog.category] || { bg: "#f9fafb", color: "#6b7280", border: B };
              return (
                <Reveal key={blog.id} delay={i * 55}>
                  <Link to={`/blog/${blog.id}`} className="blog-card">
                    {/* Category chip */}
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "3px 10px", borderRadius: 5, marginBottom: 14,
                      fontSize: 11, fontWeight: 600,
                      background: catStyle.bg, color: catStyle.color, border: `1px solid ${catStyle.border}`,
                      fontFamily: "'Plus Jakarta Sans', sans-serif"
                    }}>{blog.category}</span>

                    <h3 style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 700, fontSize: 15.5,
                      letterSpacing: "-0.02em", color: "#0a0a0a",
                      lineHeight: 1.4, marginBottom: 10
                    }}>{blog.title}</h3>

                    <p style={{ fontSize: 13.5, color: "#6b7280", lineHeight: 1.7, marginBottom: 20 }}>
                      {blog.excerpt}
                    </p>

                    <div style={{
                      display: "flex", alignItems: "center",
                      justifyContent: "space-between",
                      paddingTop: 16, borderTop: `1px solid ${B}`
                    }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: "#9ca3af" }}>{blog.date}</span>
                        <span style={{ fontSize: 12, color: "#d1d5db" }}>·</span>
                        <span style={{ fontSize: 12, color: "#9ca3af" }}>{blog.readTime}</span>
                      </div>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: PINK }}>Read →</span>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
              <p style={{ fontSize: 14 }}>No posts in this category yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── NEWSLETTER / CTA ── */}
      <section style={{ padding: "72px 24px", background: "#fff", borderTop: `1px solid ${B}` }}>
        <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <span className="blog-chip blog-chip-pink" style={{ marginBottom: 18 }}>Stay updated</span>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700,
              fontSize: "clamp(20px, 2.8vw, 28px)", letterSpacing: "-0.03em",
              color: "#0a0a0a", marginTop: 14, marginBottom: 12, lineHeight: 1.25
            }}>
              New posts every week.<br />No noise, just value.
            </h2>
            <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.72, marginBottom: 28 }}>
              Follow Nugens on our socials or reach out directly — we love hearing from curious people.
            </p>
            <Link to="/contact" style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "11px 24px", borderRadius: 8, background: "#0a0a0a",
              color: "#fff", fontSize: 13.5, fontWeight: 600,
              textDecoration: "none", letterSpacing: "-0.01em",
              fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}>Get in touch →</Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
