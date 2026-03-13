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

const PRODUCTS_HELP = [
  {
    id: "gene",
    name: "Gen-E AI",
    color: "#7c3aed",
    icon: "🤖",
    desc: "Career intelligence, resume analysis & job matching",
    faqs: [
      { q: "How do I upload my resume to Gen-E AI?", a: "Navigate to the Gen-E platform and click 'Analyse Resume'. You can upload a PDF or paste the text directly. The AI will score your resume and suggest improvements within seconds." },
      { q: "What is ATS and why does it matter?", a: "ATS (Applicant Tracking System) is software used by most companies to filter resumes before a human reads them. Gen-E ensures your resume passes ATS filters by checking keywords, formatting, and structure." },
      { q: "How accurate is the job matching?", a: "Job matching uses your resume content, skills, and career goals to surface relevant roles. Results improve as you update your profile and complete your skill assessments." },
    ],
  },
  {
    id: "hyperx",
    name: "HyperX",
    color: PINK,
    icon: "📚",
    desc: "Professional skills & workplace learning platform",
    faqs: [
      { q: "How do I enroll in a course?", a: "Visit the HyperX platform, browse the course catalogue, and click 'Enroll'. Once enrolled, your progress is saved automatically and you can continue from any device." },
      { q: "Are the courses self-paced?", a: "Yes. All HyperX courses are fully self-paced — you can learn on your schedule. Live sessions and group cohorts are available for premium plans." },
      { q: "Do I get a certificate after completing a course?", a: "Yes, all HyperX courses include a completion certificate once you finish all lessons and pass the assessments. Certificates can be added directly to your LinkedIn profile." },
    ],
  },
  {
    id: "digihub",
    name: "DigiHub",
    color: "#0284c7",
    icon: "📱",
    desc: "Digital marketing agency & career community",
    faqs: [
      { q: "How do I join the DigiHub community?", a: "Head to the DigiHub platform and click 'Join Community'. You'll be asked to verify your profile before accessing the member network and job board." },
      { q: "How does DigiHub handle brand projects?", a: "We start with a discovery call to understand your brand goals and audience. From there, we build a strategy, set timelines, and provide you regular updates throughout the project." },
      { q: "Can DigiHub help with internship or entry-level placements?", a: "Yes — this is core to DigiHub. Our community of brands and founders actively lists entry-level openings for trained Nugens graduates. Apply directly through the community board." },
    ],
  },
  {
    id: "wedding",
    name: "The Wedding Unit",
    color: "#d97706",
    icon: "📸",
    desc: "Wedding photography & full-service production",
    faqs: [
      { q: "How do I book The Wedding Unit for my event?", a: "Email us at contact@nugens.in with your event date, location, and the services you're looking for. We'll get back to you within 24 hours with availability and package details." },
      { q: "What's included in a wedding photography package?", a: "Packages vary by coverage type. Our standard package includes full-day photography coverage, edited images delivered within 3 weeks, and an online gallery. Full production packages include videography, decor, and coordination." },
      { q: "Do you travel for destination events?", a: "Yes. The Wedding Unit covers events across India. Travel and accommodation costs for out-of-city bookings are discussed at the time of booking." },
    ],
  },
];

const GENERAL_FAQS = [
  { q: "How do I create a Nugens account?", a: "Visit nugens.in and click 'Get Started'. You can sign up with your email address. One account gives you access to all Nugens products depending on your subscription." },
  { q: "What is the difference between the individual and business plan?", a: "Individual plans are for students, job seekers, and professionals looking to grow their careers. Business plans are for companies that want to use DigiHub's agency services, HyperX for team training, or manage brand content through Units." },
  { q: "How do I cancel or change my subscription?", a: "Go to your account settings and select 'Manage Subscription'. You can change plans, pause, or cancel at any time. Changes take effect at the end of your current billing cycle." },
  { q: "Is my data private?", a: "Yes. Nugens does not sell or share your personal data with third parties. Your resume, career data, and personal information are encrypted and used only to improve your experience on our platform." },
];

function AccordionItem({ question, answer, color }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderBottom: `1px solid ${B}`,
      overflow: "hidden",
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", display: "flex", alignItems: "flex-start",
          justifyContent: "space-between", gap: 16,
          padding: "16px 0", background: "none", border: "none",
          cursor: "pointer", textAlign: "left",
        }}
      >
        <span style={{
          fontSize: 14.5, fontWeight: 600, color: "#0a0a0a",
          lineHeight: 1.45, fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>{question}</span>
        <span style={{
          width: 22, height: 22, borderRadius: "50%",
          background: open ? `${color}18` : "#f3f4f6",
          border: `1px solid ${open ? color + "40" : B}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, marginTop: 2,
          transition: "all 0.18s"
        }}>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none"
            style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.18s", color: open ? color : "#9ca3af" }}>
            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>
      {open && (
        <div style={{
          padding: "0 0 18px",
          fontSize: 14, color: "#6b7280", lineHeight: 1.75,
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>{answer}</div>
      )}
    </div>
  );
}

export default function Support() {
  const [on, setOn] = useState(false);
  const [activeProduct, setActiveProduct] = useState("gene");
  useEffect(() => { setTimeout(() => setOn(true), 50); }, []);

  const active = PRODUCTS_HELP.find(p => p.id === activeProduct);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; }

        .sp-chip {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 12px; border-radius: 6px; border: 1px solid ${B};
          font-size: 11.5px; font-weight: 500; color: #6b7280; background: #fff;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .sp-chip-pink { background: #fef2f5; border-color: #fcc8d6; color: ${PINK}; }

        .prod-tab {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 16px; border-radius: 8px; font-size: 13px; font-weight: 500;
          color: #6b7280; background: transparent; border: 1px solid transparent;
          cursor: pointer; transition: all 0.13s; width: 100%; text-align: left;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .prod-tab.on { background: #fff; border-color: ${B}; color: #0a0a0a; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
        .prod-tab:hover:not(.on) { background: #f9f9f9; color: #0a0a0a; }

        .contact-card {
          padding: 22px; border-radius: 12px; border: 1.5px solid ${B}; background: #fff;
          transition: border-color 0.2s, box-shadow 0.2s; text-decoration: none; display: block;
        }
        .contact-card:hover { border-color: #fcc8d6; box-shadow: 0 4px 24px rgba(232,24,93,0.06); }

        @media (max-width: 760px) {
          .sp-layout { grid-template-columns: 1fr !important; }
          .prod-tabs { flex-direction: row !important; flex-wrap: wrap; }
          .prod-tab { width: auto !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section style={{
        padding: "84px 24px 60px", background: "#fff",
        borderBottom: `1px solid ${B}`, position: "relative", overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `radial-gradient(circle, #d4d4d8 1px, transparent 1px)`,
          backgroundSize: "28px 28px", opacity: 0.35
        }} />
        <div style={{
          position: "absolute", bottom: -100, left: "38%", width: 400, height: 400,
          borderRadius: "50%", background: PINK, filter: "blur(160px)", opacity: 0.04, pointerEvents: "none"
        }} />

        <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 }}>
          <div style={{ opacity: on ? 1 : 0, transform: on ? "none" : "translateY(8px)", transition: "all 0.4s ease 0.05s", marginBottom: 22 }}>
            <span className="sp-chip sp-chip-pink">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: PINK, animation: "pulse 2s ease-in-out infinite" }} />
              We respond within 24 hours
            </span>
          </div>
          <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }`}</style>

          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800,
            lineHeight: 1.15, letterSpacing: "-0.035em", color: "#0a0a0a",
            marginBottom: 16,
            opacity: on ? 1 : 0, transform: on ? "none" : "translateY(14px)",
            transition: "all 0.46s ease 0.14s"
          }}>
            How can we<br />
            <span style={{ color: PINK }}>help you today?</span>
          </h1>

          <p style={{
            fontSize: 15.5, color: "#6b7280", lineHeight: 1.72,
            maxWidth: 420, margin: "0 auto",
            opacity: on ? 1 : 0, transform: on ? "none" : "translateY(10px)",
            transition: "all 0.46s ease 0.24s"
          }}>
            Find answers to common questions, get product-specific help, or contact our team directly.
          </p>
        </div>
      </section>

      {/* ── QUICK CONTACT CARDS ── */}
      <section style={{ padding: "48px 24px", background: "#fafafa", borderBottom: `1px solid ${B}` }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {[
              { icon: "✉", title: "Email us", desc: "contact@nugens.in", href: "mailto:contact@nugens.in", cta: "Send email" },
              { icon: "💼", title: "Career help", desc: "careers@nugens.in", href: "mailto:careers@nugens.in", cta: "Career enquiries" },
              { icon: "💬", title: "Live chat", desc: "Mon–Sat · 10 AM – 7 PM IST", href: "/contact", cta: "Start chat", internal: true },
              { icon: "📋", title: "Contact form", desc: "Detailed enquiries", href: "/contact", cta: "Open form", internal: true },
            ].map((c, i) => (
              <Reveal key={c.title} delay={i * 55}>
                {c.internal
                  ? <Link to={c.href} className="contact-card">
                      <div style={{ fontSize: 22, marginBottom: 10 }}>{c.icon}</div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0a0a0a", marginBottom: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{c.title}</div>
                      <div style={{ fontSize: 12.5, color: "#9ca3af", marginBottom: 14, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{c.desc}</div>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: PINK, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{c.cta} →</span>
                    </Link>
                  : <a href={c.href} className="contact-card">
                      <div style={{ fontSize: 22, marginBottom: 10 }}>{c.icon}</div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0a0a0a", marginBottom: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{c.title}</div>
                      <div style={{ fontSize: 12.5, color: "#9ca3af", marginBottom: 14, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{c.desc}</div>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: PINK, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{c.cta} →</span>
                    </a>
                }
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCT FAQ ── */}
      <section style={{ padding: "60px 24px", background: "#fff", borderBottom: `1px solid ${B}` }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <Reveal style={{ marginBottom: 36 }}>
            <span className="sp-chip" style={{ marginBottom: 10 }}>Product help</span>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700,
              fontSize: "clamp(20px, 2.8vw, 26px)", letterSpacing: "-0.03em",
              color: "#0a0a0a", marginTop: 8
            }}>Common questions by product</h2>
          </Reveal>

          <div className="sp-layout" style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 24, alignItems: "start" }}>
            {/* Product tabs */}
            <div className="prod-tabs" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {PRODUCTS_HELP.map(p => (
                <button
                  key={p.id}
                  className={`prod-tab ${activeProduct === p.id ? "on" : ""}`}
                  onClick={() => setActiveProduct(p.id)}
                >
                  <span>{p.icon}</span>
                  {p.name}
                </button>
              ))}
            </div>

            {/* FAQ panel */}
            {active && (
              <div style={{ background: "#fff", border: `1px solid ${B}`, borderRadius: 12, padding: "28px 28px 12px", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%", background: active.color, flexShrink: 0
                  }} />
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: active.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {active.name}
                  </span>
                </div>
                <p style={{ fontSize: 13.5, color: "#9ca3af", marginBottom: 24, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {active.desc}
                </p>

                {active.faqs.map((faq, i) => (
                  <AccordionItem key={i} question={faq.q} answer={faq.a} color={active.color} />
                ))}

                <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${B}` }}>
                  <p style={{ fontSize: 13, color: "#9ca3af", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Can't find your answer?{" "}
                    <Link to="/contact" style={{ color: PINK, fontWeight: 600, textDecoration: "none" }}>Contact us directly →</Link>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── GENERAL FAQ ── */}
      <section style={{ padding: "60px 24px", background: "#fafafa", borderBottom: `1px solid ${B}` }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Reveal style={{ marginBottom: 32 }}>
            <span className="sp-chip" style={{ marginBottom: 10 }}>General FAQ</span>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700,
              fontSize: "clamp(20px, 2.8vw, 26px)", letterSpacing: "-0.03em",
              color: "#0a0a0a", marginTop: 8
            }}>Account & billing</h2>
          </Reveal>

          <Reveal delay={60}>
            <div style={{ background: "#fff", border: `1px solid ${B}`, borderRadius: 12, padding: "12px 28px" }}>
              {GENERAL_FAQS.map((faq, i) => (
                <AccordionItem key={i} question={faq.q} answer={faq.a} color={PINK} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── STILL NEED HELP ── */}
      <section style={{ padding: "72px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 580, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <span className="sp-chip sp-chip-pink" style={{ marginBottom: 18 }}>Still need help?</span>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700,
              fontSize: "clamp(20px, 3vw, 28px)", letterSpacing: "-0.03em",
              color: "#0a0a0a", marginTop: 14, marginBottom: 14, lineHeight: 1.25
            }}>
              Our team is here<br />for you, always.
            </h2>
            <p style={{ fontSize: 14.5, color: "#9ca3af", lineHeight: 1.72, maxWidth: 360, margin: "0 auto 28px" }}>
              We respond to every message — usually within a few hours during business days.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
              <Link to="/contact" style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "11px 24px", borderRadius: 8, background: PINK,
                color: "#fff", fontSize: 13.5, fontWeight: 600,
                textDecoration: "none", letterSpacing: "-0.01em",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                boxShadow: "0 2px 10px rgba(232,24,93,0.25)"
              }}>Send us a message →</Link>
              <a href="mailto:contact@nugens.in" style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "11px 24px", borderRadius: 8, background: "#fff",
                color: "#374151", fontSize: 13.5, fontWeight: 500,
                border: `1px solid ${B}`, textDecoration: "none", letterSpacing: "-0.01em",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                transition: "border-color 0.14s"
              }}>contact@nugens.in</a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
