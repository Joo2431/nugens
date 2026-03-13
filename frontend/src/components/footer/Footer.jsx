import React from "react";
import { Link } from "react-router-dom";

const PINK = "#E50063";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: "#0a0a0a", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .footer-link {
          color: #999;
          text-decoration: none;
          font-size: 13.5px;
          transition: color 0.15s;
          line-height: 2;
          display: block;
        }
        .footer-link:hover { color: #fff; }
        .footer-col-title {
          font-family: 'Syne', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #555;
          margin-bottom: 16px;
        }
        .partner-badge {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border: 1px solid #1e1e1e;
          border-radius: 10px;
          background: #111;
          margin-bottom: 8px;
          transition: border-color 0.15s;
          cursor: default;
        }
        .partner-badge:hover { border-color: #333; }
        .partner-dot {
          width: 8px; height: 8px; border-radius: 50%;
          flex-shrink: 0;
        }
        .partner-label {
          font-size: 12px; color: #888; font-weight: 400;
        }
        .social-btn {
          width: 36px; height: 36px;
          border: 1px solid #222;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          color: #666; font-size: 12px; font-weight: 600;
          text-decoration: none;
          transition: all 0.15s;
          font-family: 'Syne', sans-serif;
        }
        .social-btn:hover {
          border-color: ${PINK};
          color: ${PINK};
          background: rgba(229,0,99,0.06);
        }
        .bottom-link {
          color: #555; font-size: 12px; text-decoration: none; transition: color 0.15s;
        }
        .bottom-link:hover { color: #999; }
        .security-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 12px;
          border: 1px solid #1e1e1e;
          border-radius: 20px;
          background: #111;
          font-size: 11px; color: #555;
        }
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
          .footer-brand { grid-column: span 2; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
          .footer-brand { grid-column: span 1; }
        }
      `}</style>

      {/* TOP DIVIDER */}
      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #E50063 40%, #FF8ABF 60%, transparent)" }} />

      {/* MAIN FOOTER BODY */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "52px 24px 40px" }}>
        <div className="footer-grid" style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr 1fr 1.2fr",
          gap: "40px 32px",
          alignItems: "start"
        }}>

          {/* ── BRAND COLUMN ── */}
          <div className="footer-brand">
            {/* Logo wordmark */}
            <div style={{ marginBottom: 16 }}>
              <span style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800, fontSize: 22,
                fontStyle: "italic",
                background: `linear-gradient(90deg, ${PINK}, #FF8ABF)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.03em"
              }}>NUGENS</span>
            </div>

            <p style={{ fontSize: 13, color: "#666", lineHeight: 1.7, maxWidth: 240, marginBottom: 20 }}>
              Exceptional visuals and AI-powered growth solutions — helping brands scale with clarity and speed.
            </p>

            {/* Partner badges */}
            <div style={{ marginBottom: 20 }}>
              {[
                { label: "Photography Partner", color: "#ec4899" },
                { label: "AI Learning Partner",   color: "#8b5cf6" },
                { label: "Digital Growth Partner",color: "#f59e0b" },
              ].map(p => (
                <div className="partner-badge" key={p.label}>
                  <div className="partner-dot" style={{ background: p.color }} />
                  <span className="partner-label">{p.label}</span>
                </div>
              ))}
            </div>

            {/* Social icons */}
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { label: "f",  href: "#" },
                { label: "𝕏",  href: "#" },
                { label: "in", href: "#" },
                { label: "IG", href: "#" },
              ].map(s => (
                <a key={s.label} href={s.href} className="social-btn"
                  target="_blank" rel="noreferrer">{s.label}</a>
              ))}
            </div>
          </div>

          {/* ── PRODUCTS COLUMN ── */}
          <div>
            <div className="footer-col-title">Products</div>
            {[
              { label: "HyperX – Learning Platform",    to: "/hyperx",  internal: true },
              { label: "Gen-E AI – Career Assistant",   to: "/gene",    internal: true },
              { label: "DigiHub – Digital Marketing",   to: "/digihub", internal: true },
              { label: "The Wedding Unit – Photography",to: "https://theweddingunit.in.net", internal: false },
            ].map(item =>
              item.internal
                ? <Link key={item.label} to={item.to} className="footer-link">{item.label}</Link>
                : <a key={item.label} href={item.to} className="footer-link" target="_blank" rel="noreferrer">{item.label}</a>
            )}
          </div>

          {/* ── COMPANY COLUMN ── */}
          <div>
            <div className="footer-col-title">Company</div>
            {[
              { label: "About Us",   to: "/about"    },
              { label: "Blog",       to: "/blog"     },
              { label: "Events",     to: "/events"   },
              { label: "Customers",  to: "/customers"},
              { label: "Contact Us", to: "/contact"  },
            ].map(item => (
              <Link key={item.label} to={item.to} className="footer-link">{item.label}</Link>
            ))}
          </div>

          {/* ── CONNECT COLUMN ── */}
          <div>
            <div className="footer-col-title">Connect Us</div>
            <a href="mailto:contact@nugens.in" className="footer-link" style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontSize: 14 }}>✉</span> contact@nugens.in
            </a>

            <div className="footer-col-title" style={{ marginTop: 24 }}>Careers</div>
            <a href="mailto:careers@nugens.in" className="footer-link" style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontSize: 14 }}>✉</span> careers@nugens.in
            </a>

            {/* Security badge — text based, no broken image */}
            <div style={{ marginTop: 24 }}>
              <div className="security-badge">
                <span style={{ fontSize: 14 }}>🔒</span>
                <span>SSL Secured</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div style={{ borderTop: "1px solid #161616" }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          padding: "16px 24px",
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap", gap: 10
        }}>
          <p style={{ fontSize: 12, color: "#444" }}>
            Copyright © Nugens {year}. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {["CSR Policy", "Terms of Use", "Privacy Policy", "Cookie Policy"].map(lbl => (
              <a key={lbl} href="#" className="bottom-link">{lbl}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}