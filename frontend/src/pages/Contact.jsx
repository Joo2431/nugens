import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const PINK = "#e8185d";
const BORDER = "#e4e4e7";

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

function Reveal({ children, delay = 0 }) {
  const [ref, v] = useInView();
  return (
    <div ref={ref} style={{
      opacity: v ? 1 : 0,
      transform: v ? "none" : "translateY(16px)",
      transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
    }}>{children}</div>
  );
}

const REASONS = [
  { dot: "#7c3aed", label: "Gen-E AI",         desc: "Career path, resume help, or product questions" },
  { dot: PINK,      label: "HyperX",            desc: "Enrollment, modules, or mentorship" },
  { dot: "#0284c7", label: "DigiHub — Brands",  desc: "Marketing, strategy, or agency services" },
  { dot: "#0284c7", label: "DigiHub — Careers", desc: "Join the community or find a placement" },
  { dot: "#d97706", label: "The Wedding Unit",  desc: "Bookings, packages, or event enquiries" },
  { dot: "#6b7280", label: "General",           desc: "Partnerships, press, or anything else" },
];

const INITIAL = { name: "", email: "", phone: "", reason: "", message: "" };

export default function Contact() {
  const [on, setOn] = useState(false);
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");

  useEffect(() => { setTimeout(() => setOn(true), 60); }, []);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = "Name is required";
    if (!form.email.trim())   e.email   = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.reason)         e.reason  = "Please select a reason";
    if (!form.message.trim()) e.message = "Tell us a bit more";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStatus("sending");
    try {
      await new Promise(r => setTimeout(r, 1400));
      setStatus("success");
      setForm(INITIAL);
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; }

        .ct-badge {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 5px 14px; border-radius: 100px;
          border: 1px solid #fcc8d6; background: #fff8fa;
          font-size: 12px; font-weight: 500; color: ${PINK};
          font-family: 'DM Sans', sans-serif; letter-spacing: 0.01em;
        }
        .ct-badge-dot {
          width: 6px; height: 6px; border-radius: 50%; background: ${PINK};
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }

        .ct-label {
          display: block; font-size: 13px; font-weight: 500; color: #3f3f46;
          margin-bottom: 6px; font-family: 'DM Sans', sans-serif;
        }
        .ct-req { color: ${PINK}; margin-left: 2px; }
        .ct-opt { color: #a1a1aa; font-weight: 400; font-size: 12px; }

        .ct-field {
          width: 100%; padding: 10px 14px;
          border-radius: 8px; border: 1.5px solid ${BORDER};
          background: #fff; outline: none;
          font-size: 14px; color: #18181b; font-family: 'DM Sans', sans-serif;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .ct-field::placeholder { color: #d4d4d8; }
        .ct-field:focus { border-color: #18181b; box-shadow: 0 0 0 3px rgba(24,24,27,0.07); }
        .ct-field.err { border-color: #f43f5e; box-shadow: 0 0 0 3px rgba(244,63,94,0.09); }

        .ct-select {
          width: 100%; padding: 10px 38px 10px 14px;
          border-radius: 8px; border: 1.5px solid ${BORDER};
          background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23a1a1aa' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 14px center;
          background-size: 10px; outline: none; cursor: pointer;
          font-size: 14px; color: #18181b; font-family: 'DM Sans', sans-serif;
          -webkit-appearance: none; appearance: none;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .ct-select:focus { border-color: #18181b; box-shadow: 0 0 0 3px rgba(24,24,27,0.07); }
        .ct-select.err { border-color: #f43f5e; }

        .ct-textarea {
          width: 100%; padding: 10px 14px;
          border-radius: 8px; border: 1.5px solid ${BORDER};
          background: #fff; outline: none; resize: vertical;
          font-size: 14px; color: #18181b; font-family: 'DM Sans', sans-serif;
          min-height: 128px; line-height: 1.65;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .ct-textarea::placeholder { color: #d4d4d8; }
        .ct-textarea:focus { border-color: #18181b; box-shadow: 0 0 0 3px rgba(24,24,27,0.07); }
        .ct-textarea.err { border-color: #f43f5e; }

        .ct-err { font-size: 12px; color: #f43f5e; margin-top: 4px; font-family: 'DM Sans', sans-serif; }

        .ct-submit {
          width: 100%; padding: 12px 20px;
          border-radius: 9px; background: #18181b;
          color: #fff; font-size: 14px; font-weight: 600;
          border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif; letter-spacing: -0.01em;
          transition: background 0.15s, transform 0.12s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .ct-submit:hover:not(:disabled) { background: #323232; transform: translateY(-1px); }
        .ct-submit:disabled { opacity: 0.55; cursor: not-allowed; }

        .ct-card {
          padding: 22px; border-radius: 12px;
          border: 1.5px solid ${BORDER}; background: #fff;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .ct-card:hover { border-color: #fcc8d6; box-shadow: 0 4px 24px rgba(232,24,93,0.06); }
        .ct-card-title {
          font-size: 10.5px; font-weight: 600; letter-spacing: 0.07em;
          text-transform: uppercase; color: #a1a1aa; margin-bottom: 16px;
          font-family: 'DM Sans', sans-serif;
        }

        @keyframes scaleIn { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 760px) {
          .ct-layout { grid-template-columns: 1fr !important; }
          .ct-row { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section style={{
        padding: "84px 24px 60px", background: "#fff",
        borderBottom: `1.5px solid ${BORDER}`,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `radial-gradient(circle, #d4d4d8 1px, transparent 1px)`,
          backgroundSize: "28px 28px", opacity: 0.35,
        }} />
        <div style={{
          position: "absolute", bottom: -120, left: "38%",
          width: 420, height: 420, borderRadius: "50%",
          background: PINK, filter: "blur(160px)", opacity: 0.04, pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 }}>
          <div style={{
            opacity: on ? 1 : 0, transform: on ? "none" : "translateY(8px)",
            transition: "all 0.4s ease 0.05s", marginBottom: 22,
          }}>
            <span className="ct-badge">
              <span className="ct-badge-dot" />
              We respond within 24 hours
            </span>
          </div>

          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 400,
            lineHeight: 1.12, letterSpacing: "-0.02em", color: "#18181b",
            marginBottom: 18,
            opacity: on ? 1 : 0, transform: on ? "none" : "translateY(14px)",
            transition: "all 0.48s ease 0.15s",
          }}>
            Let's talk
          </h1>

          <p style={{
            fontSize: 15.5, color: "#71717a", lineHeight: 1.75,
            maxWidth: 400, margin: "0 auto",
            fontFamily: "'DM Sans', sans-serif", fontWeight: 400,
            opacity: on ? 1 : 0, transform: on ? "none" : "translateY(10px)",
            transition: "all 0.48s ease 0.25s",
          }}>
            Whether you're a student looking for career direction, a brand that needs growth, or someone who just wants to know more — we're here.
          </p>
        </div>
      </section>

      {/* ── MAIN LAYOUT ── */}
      <section style={{ padding: "56px 24px 80px", background: "#fafafa" }}>
        <div className="ct-layout" style={{
          maxWidth: 1040, margin: "0 auto",
          display: "grid", gridTemplateColumns: "1fr 370px",
          gap: 28, alignItems: "start",
        }}>

          {/* ── FORM CARD ── */}
          <div style={{
            background: "#fff", borderRadius: 14,
            border: `1.5px solid ${BORDER}`, overflow: "hidden",
          }}>
            <div style={{ padding: "26px 30px 22px", borderBottom: `1.5px solid ${BORDER}` }}>
              <h2 style={{
                fontFamily: "'DM Serif Display', serif",
                fontWeight: 400, fontSize: 22, color: "#18181b",
                letterSpacing: "-0.02em", marginBottom: 4,
              }}>Send us a message</h2>
              <p style={{ fontSize: 13.5, color: "#a1a1aa", fontFamily: "'DM Sans', sans-serif" }}>
                Fill in the form and we'll get back to you within one business day.
              </p>
            </div>

            {status === "success" ? (
              <div style={{ padding: "60px 30px", textAlign: "center", animation: "scaleIn 0.3s ease" }}>
                <div style={{
                  width: 54, height: 54, borderRadius: "50%",
                  background: "#f0fdf4", border: "1.5px solid #86efac",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px",
                }}>
                  <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                    <path d="M2 8l5.5 5.5L18 2" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 style={{
                  fontFamily: "'DM Serif Display', serif", fontWeight: 400,
                  fontSize: 22, color: "#18181b", marginBottom: 10,
                }}>Message sent!</h3>
                <p style={{ fontSize: 14, color: "#71717a", lineHeight: 1.65, maxWidth: 280, margin: "0 auto 24px", fontFamily: "'DM Sans', sans-serif" }}>
                  Thanks for reaching out. We'll reply to <strong style={{ color: "#3f3f46" }}>your email</strong> within 24 hours.
                </p>
                <button onClick={() => setStatus("idle")} style={{
                  padding: "9px 22px", borderRadius: 8, background: "#18181b",
                  color: "#fff", fontSize: 13.5, fontWeight: 500,
                  border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                }}>Send another →</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate style={{ padding: "26px 30px 30px" }}>

                <div className="ct-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div>
                    <label className="ct-label" htmlFor="ct-name">Full name<span className="ct-req">*</span></label>
                    <input
                      id="ct-name"
                      className={`ct-field${errors.name ? " err" : ""}`}
                      placeholder="Your name"
                      value={form.name}
                      onChange={e => set("name", e.target.value)}
                    />
                    {errors.name && <p className="ct-err">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="ct-label" htmlFor="ct-email">Email address<span className="ct-req">*</span></label>
                    <input
                      id="ct-email"
                      type="email"
                      className={`ct-field${errors.email ? " err" : ""}`}
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={e => set("email", e.target.value)}
                    />
                    {errors.email && <p className="ct-err">{errors.email}</p>}
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label className="ct-label" htmlFor="ct-phone">
                    Phone number <span className="ct-opt">(optional)</span>
                  </label>
                  <input
                    id="ct-phone"
                    type="tel"
                    className="ct-field"
                    placeholder="+91 00000 00000"
                    value={form.phone}
                    onChange={e => set("phone", e.target.value)}
                  />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label className="ct-label" htmlFor="ct-reason">What's this about?<span className="ct-req">*</span></label>
                  <select
                    id="ct-reason"
                    className={`ct-select${errors.reason ? " err" : ""}`}
                    value={form.reason}
                    onChange={e => set("reason", e.target.value)}
                  >
                    <option value="" disabled>Select a topic…</option>
                    <option value="gene">Gen-E AI — career help or product questions</option>
                    <option value="hyperx">HyperX — enrollment or learning platform</option>
                    <option value="digihub-brand">DigiHub — marketing & agency services</option>
                    <option value="digihub-career">DigiHub — join the career community</option>
                    <option value="wedding">The Wedding Unit — bookings & packages</option>
                    <option value="partnership">Partnership or collaboration</option>
                    <option value="general">General enquiry</option>
                  </select>
                  {errors.reason && <p className="ct-err">{errors.reason}</p>}
                </div>

                <div style={{ marginBottom: 22 }}>
                  <label className="ct-label" htmlFor="ct-message">Your message<span className="ct-req">*</span></label>
                  <textarea
                    id="ct-message"
                    className={`ct-textarea${errors.message ? " err" : ""}`}
                    placeholder="Tell us what you need — the more detail the better, so we can give you a useful reply."
                    value={form.message}
                    onChange={e => set("message", e.target.value)}
                  />
                  {errors.message && <p className="ct-err">{errors.message}</p>}
                </div>

                {status === "error" && (
                  <div style={{
                    marginBottom: 16, padding: "12px 16px", borderRadius: 8,
                    background: "#fff1f2", border: "1.5px solid #fecdd3",
                    fontSize: 13.5, color: "#be123c",
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                    Something went wrong. Please email us at{" "}
                    <a href="mailto:contact@nugens.in" style={{ color: "#be123c", fontWeight: 600 }}>contact@nugens.in</a>
                  </div>
                )}

                <button type="submit" className="ct-submit" disabled={status === "sending"}>
                  {status === "sending" ? (
                    <>
                      <svg width="15" height="15" viewBox="0 0 16 16" fill="none"
                        style={{ animation: "spin 0.7s linear infinite" }}>
                        <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
                        <path d="M14 8a6 6 0 00-6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Sending…
                    </>
                  ) : "Send message →"}
                </button>

                <p style={{
                  fontSize: 12, color: "#c4c4c8", textAlign: "center",
                  marginTop: 14, fontFamily: "'DM Sans', sans-serif",
                }}>
                  By submitting you agree to our{" "}
                  <a href="#" style={{ color: "#a1a1aa", textDecoration: "underline" }}>privacy policy</a>.
                  We never share your data.
                </p>
              </form>
            )}
          </div>

          {/* ── SIDEBAR ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            <Reveal>
              <div className="ct-card">
                <div className="ct-card-title">Direct contact</div>
                {[
                  { icon: "✉", label: "General", value: "contact@nugens.in", href: "mailto:contact@nugens.in" },
                  { icon: "✉", label: "Careers", value: "careers@nugens.in",  href: "mailto:careers@nugens.in" },
                ].map(c => (
                  <a key={c.label} href={c.href} style={{
                    display: "flex", alignItems: "flex-start", gap: 12,
                    padding: "10px 0", borderBottom: `1px solid #f4f4f5`,
                    textDecoration: "none",
                  }}>
                    <span style={{ fontSize: 14, color: "#c4c4c8", marginTop: 1 }}>{c.icon}</span>
                    <span>
                      <span style={{ display: "block", fontSize: 11.5, fontWeight: 500, color: "#a1a1aa", marginBottom: 2, fontFamily: "'DM Sans', sans-serif" }}>{c.label}</span>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: PINK, fontFamily: "'DM Sans', sans-serif" }}>{c.value}</span>
                    </span>
                  </a>
                ))}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0" }}>
                  <span style={{ fontSize: 14, color: "#c4c4c8", marginTop: 1 }}>⏰</span>
                  <span>
                    <span style={{ display: "block", fontSize: 11.5, fontWeight: 500, color: "#a1a1aa", marginBottom: 2, fontFamily: "'DM Sans', sans-serif" }}>Support hours</span>
                    <span style={{ fontSize: 13, color: "#3f3f46", fontFamily: "'DM Sans', sans-serif" }}>Mon – Sat · 10 AM – 7 PM IST</span>
                  </span>
                </div>
              </div>
            </Reveal>

            <Reveal delay={70}>
              <div className="ct-card">
                <div className="ct-card-title">Contact reasons</div>
                {REASONS.map(r => (
                  <div key={r.label} style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    padding: "9px 0", borderBottom: `1px solid #f4f4f5`,
                  }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: r.dot, flexShrink: 0, marginTop: 5 }} />
                    <span>
                      <span style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#18181b", fontFamily: "'DM Sans', sans-serif" }}>{r.label}</span>
                      <span style={{ display: "block", fontSize: 11.5, color: "#a1a1aa", marginTop: 1, fontFamily: "'DM Sans', sans-serif" }}>{r.desc}</span>
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={140}>
              <div style={{
                padding: "22px", borderRadius: 12,
                border: `1.5px solid ${BORDER}`, background: "#18181b",
              }}>
                <div style={{
                  fontSize: 10.5, fontWeight: 600, letterSpacing: "0.07em",
                  textTransform: "uppercase", color: "#52525b", marginBottom: 14,
                  fontFamily: "'DM Sans', sans-serif",
                }}>Quick access</div>
                {[
                  { to: "/GenEChat", label: "Launch Gen-E AI",        color: "#7c3aed" },
                  { to: "/hyperx",   label: "Enroll in HyperX",       color: PINK },
                  { to: "/digihub",  label: "Join DigiHub community", color: "#0284c7" },
                ].map(l => (
                  <Link key={l.label} to={l.to} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 0", borderBottom: "1px solid #27272a", textDecoration: "none",
                  }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: l.color }} />
                      <span style={{ fontSize: 13, fontWeight: 400, color: "#e4e4e7", fontFamily: "'DM Sans', sans-serif" }}>{l.label}</span>
                    </span>
                    <span style={{ fontSize: 13, color: "#52525b" }}>→</span>
                  </Link>
                ))}
                <div style={{ height: 4 }} />
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}