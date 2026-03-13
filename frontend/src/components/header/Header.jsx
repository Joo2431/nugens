import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

const PINK = "#e8185d";
const B = "#f0f0f0";

const PRODUCTS = [
  { to: "/hyperx",  label: "HyperX",           sub: "Professional learning platform",   dot: PINK },
  { to: "/gene",    label: "Gen-E AI",          sub: "AI career intelligence",           dot: "#7c3aed" },
  { to: "/digihub", label: "DigiHub",           sub: "Marketing agency & community",     dot: "#0284c7" },
  { href: "https://theweddingunit.in.net", label: "The Wedding Unit", sub: "Photography & production studio", dot: "#d97706" },
];

const COMPANY = [
  { to: "/about",   label: "About Nugens" },
  { to: "/careers", label: "Careers" },
  { to: "/blog",    label: "Blog & Insights" },
];

function useOutsideClick(ref, cb) {
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) cb(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, cb]);
}

function DropdownMenu({ label, children, isOpen, onToggle }) {
  const ref = useRef(null);
  useOutsideClick(ref, () => isOpen && onToggle(false));
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => onToggle(!isOpen)} className="hdr-nav-btn">
        {label}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none"
          style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.18s", color: "#9ca3af" }}>
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {isOpen && (
        <div className="hdr-dropdown">
          {children}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const [openMenu,       setOpenMenu]       = useState(null);
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const location = useLocation();

  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
    setMobileExpanded(null);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* ── ALL CSS IN ONE CONSOLIDATED BLOCK ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes hdr-slideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        @keyframes hdr-fadeOverlay {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .hdr-nav-btn {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 13.5px; font-weight: 500; color: #374151;
          background: none; border: none; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding: 4px 2px; transition: color 0.13s; white-space: nowrap;
        }
        .hdr-nav-btn:hover { color: #0a0a0a; }

        .hdr-dropdown {
          position: absolute; top: calc(100% + 10px); left: 0;
          background: #fff; border: 1px solid ${B}; border-radius: 10px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.09); padding: 8px;
          min-width: 240px; z-index: 100; animation: dropIn 0.16s ease;
        }

        .hdr-product-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 7px;
          text-decoration: none; transition: background 0.12s;
        }
        .hdr-product-item:hover { background: #fafafa; }

        .hdr-company-item {
          display: block; padding: 8px 12px; border-radius: 7px;
          font-size: 13.5px; font-weight: 500; color: #374151;
          text-decoration: none; transition: background 0.12s, color 0.12s;
          font-family: 'Plus Jakarta Sans', sans-serif; white-space: nowrap;
        }
        .hdr-company-item:hover { background: #fafafa; color: #0a0a0a; }

        .hdr-navlink {
          font-size: 13.5px; font-weight: 500; color: #374151;
          text-decoration: none; padding: 4px 2px;
          transition: color 0.13s; font-family: 'Plus Jakarta Sans', sans-serif;
          white-space: nowrap;
        }
        .hdr-navlink:hover, .hdr-navlink.active { color: #0a0a0a; }

        .hdr-cta-btn {
          padding: 8px 18px; border-radius: 8px; background: #0a0a0a;
          color: #fff; font-size: 13px; font-weight: 600;
          text-decoration: none; letter-spacing: -0.01em;
          transition: background 0.14s; white-space: nowrap;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .hdr-cta-btn:hover { background: #222; }

        .hdr-try-btn {
          padding: 7px 12px; border-radius: 7px; background: ${PINK};
          color: #fff; font-size: 12px; font-weight: 600;
          text-decoration: none; white-space: nowrap;
          box-shadow: 0 2px 8px rgba(232,24,93,0.22);
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        /* Desktop nav: HIDDEN on mobile by default */
        .hdr-desktop-nav {
          display: none;
          align-items: center;
          gap: 24px;
        }

        /* Mobile right: SHOWN on mobile by default */
        .hdr-mobile-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* At 960px+: flip which is shown */
        @media (min-width: 960px) {
          .hdr-desktop-nav  { display: flex !important; }
          .hdr-mobile-right { display: none !important; }
        }

        /* Mobile drawer links */
        .mob-nav-link {
          display: block; padding: 13px 0;
          font-size: 16px; font-weight: 600; color: #0a0a0a;
          text-decoration: none; border-bottom: 1px solid ${B};
          font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.01em;
        }
        .mob-section-link {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 12px; border-radius: 8px;
          font-size: 14px; font-weight: 500; color: #374151;
          text-decoration: none; transition: background 0.12s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .mob-section-link:hover { background: #f9f9f9; }

        .hdr-drawer {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: min(320px, 88vw); z-index: 400;
          background: #fff; overflow-y: auto;
          box-shadow: -8px 0 40px rgba(0,0,0,0.12);
          animation: hdr-slideIn 0.22s ease;
          display: flex; flex-direction: column;
        }
        .hdr-overlay {
          position: fixed; inset: 0; z-index: 300;
          background: rgba(0,0,0,0.35);
          animation: hdr-fadeOverlay 0.2s ease;
        }
      `}</style>

      {/* ── HEADER BAR ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 200,
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${B}`,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          padding: "0 20px", height: 62,
          display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 12,
        }}>

          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
            <img src="/logo.jpg" alt="Nugens" style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }} />
            <span style={{ fontWeight: 800, fontSize: 17, color: "#0a0a0a", letterSpacing: "-0.025em" }}>Nugens</span>
          </Link>

          {/* ── DESKTOP NAV ── */}
          <nav className="hdr-desktop-nav">
            <DropdownMenu label="Products" isOpen={openMenu === "products"} onToggle={(v) => setOpenMenu(v ? "products" : null)}>
              {PRODUCTS.map(p => (
                p.href
                  ? <a key={p.label} href={p.href} target="_blank" rel="noreferrer" className="hdr-product-item">
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.dot, flexShrink: 0 }} />
                      <span>
                        <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: "#0a0a0a", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{p.label}</span>
                        <span style={{ display: "block", fontSize: 11.5, color: "#9ca3af", marginTop: 1, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{p.sub}</span>
                      </span>
                    </a>
                  : <Link key={p.label} to={p.to} className="hdr-product-item">
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.dot, flexShrink: 0 }} />
                      <span>
                        <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: "#0a0a0a", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{p.label}</span>
                        <span style={{ display: "block", fontSize: 11.5, color: "#9ca3af", marginTop: 1, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{p.sub}</span>
                      </span>
                    </Link>
              ))}
            </DropdownMenu>

            <DropdownMenu label="Company" isOpen={openMenu === "company"} onToggle={(v) => setOpenMenu(v ? "company" : null)}>
              {COMPANY.map(c => <Link key={c.label} to={c.to} className="hdr-company-item">{c.label}</Link>)}
            </DropdownMenu>

            <NavLink to="/support" className={({ isActive }) => `hdr-navlink${isActive ? " active" : ""}`}>Support</NavLink>

            <NavLink to="/gen-e" className={({ isActive }) => `hdr-navlink${isActive ? " active" : ""}`}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7c3aed", display: "inline-block", flexShrink: 0 }} />
                Gen-E AI
              </span>
            </NavLink>

            <Link to="/contact" className="hdr-cta-btn">Get in touch</Link>
          </nav>

          {/* ── MOBILE RIGHT ── */}
          <div className="hdr-mobile-right">
            <Link to="/gen-e" className="hdr-try-btn">Try Gen-E</Link>
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              style={{
                width: 38, height: 38, borderRadius: 8,
                background: "#fff", border: `1px solid ${B}`,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 5, cursor: "pointer", flexShrink: 0,
              }}
            >
              <span style={{ width: 18, height: 1.5, background: "#374151", borderRadius: 2 }} />
              <span style={{ width: 14, height: 1.5, background: "#374151", borderRadius: 2 }} />
              <span style={{ width: 18, height: 1.5, background: "#374151", borderRadius: 2 }} />
            </button>
          </div>
        </div>
      </header>

      {/* ── MOBILE DRAWER ── */}
      {mobileOpen && (
        <>
          <div className="hdr-overlay" onClick={() => setMobileOpen(false)} />

          <div className="hdr-drawer">
            {/* Drawer header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: `1px solid ${B}`, flexShrink: 0 }}>
              <Link to="/" onClick={() => setMobileOpen(false)} style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
                <img src="/logo.jpg" alt="Nugens" style={{ width: 32, height: 32, borderRadius: 7, objectFit: "cover" }} />
                <span style={{ fontWeight: 800, fontSize: 16, color: "#0a0a0a", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Nugens</span>
              </Link>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu"
                style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${B}`, background: "#fafafa", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="#6b7280" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Drawer body */}
            <div style={{ padding: "16px 20px", flex: 1, overflowY: "auto" }}>

              {/* Products accordion */}
              <div style={{ borderBottom: `1px solid ${B}` }}>
                <button onClick={() => setMobileExpanded(mobileExpanded === "products" ? null : "products")}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 0", background: "none", border: "none", cursor: "pointer", fontSize: 16, fontWeight: 600, color: "#0a0a0a", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  Products
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none"
                    style={{ transform: mobileExpanded === "products" ? "rotate(180deg)" : "none", transition: "transform 0.18s", color: "#9ca3af", flexShrink: 0 }}>
                    <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {mobileExpanded === "products" && (
                  <div style={{ paddingBottom: 12 }}>
                    {PRODUCTS.map(p => (
                      p.href
                        ? <a key={p.label} href={p.href} target="_blank" rel="noreferrer" className="mob-section-link">
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.dot, flexShrink: 0 }} />
                            <span>
                              <span style={{ display: "block", fontWeight: 600, color: "#0a0a0a" }}>{p.label}</span>
                              <span style={{ display: "block", fontSize: 11.5, color: "#9ca3af", marginTop: 1 }}>{p.sub}</span>
                            </span>
                          </a>
                        : <Link key={p.label} to={p.to} className="mob-section-link">
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.dot, flexShrink: 0 }} />
                            <span>
                              <span style={{ display: "block", fontWeight: 600, color: "#0a0a0a" }}>{p.label}</span>
                              <span style={{ display: "block", fontSize: 11.5, color: "#9ca3af", marginTop: 1 }}>{p.sub}</span>
                            </span>
                          </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Company accordion */}
              <div style={{ borderBottom: `1px solid ${B}` }}>
                <button onClick={() => setMobileExpanded(mobileExpanded === "company" ? null : "company")}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 0", background: "none", border: "none", cursor: "pointer", fontSize: 16, fontWeight: 600, color: "#0a0a0a", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  Company
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none"
                    style={{ transform: mobileExpanded === "company" ? "rotate(180deg)" : "none", transition: "transform 0.18s", color: "#9ca3af", flexShrink: 0 }}>
                    <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {mobileExpanded === "company" && (
                  <div style={{ paddingBottom: 12 }}>
                    {COMPANY.map(c => (
                      <Link key={c.label} to={c.to} className="mob-section-link">
                        <span style={{ fontWeight: 600, color: "#0a0a0a" }}>{c.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link to="/support" className="mob-nav-link">Support</Link>
              <Link to="/blog"    className="mob-nav-link">Blog</Link>
              <Link to="/careers" className="mob-nav-link">Careers</Link>
            </div>

            {/* Drawer footer */}
            <div style={{ padding: "16px 20px", borderTop: `1px solid ${B}`, display: "flex", flexDirection: "column", gap: 9, flexShrink: 0 }}>
              <Link to="/gen-e" style={{ display: "block", textAlign: "center", padding: "13px", borderRadius: 9, background: "#7c3aed", color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none", fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: "0 2px 12px rgba(124,58,237,0.25)" }}>
                Launch Gen-E AI →
              </Link>
              <Link to="/contact" style={{ display: "block", textAlign: "center", padding: "13px", borderRadius: 9, background: "#0a0a0a", color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                Get in touch
              </Link>
              <Link to="/digihub" style={{ display: "block", textAlign: "center", padding: "12px", borderRadius: 9, background: "#fff", color: "#374151", fontSize: 13.5, fontWeight: 500, textDecoration: "none", border: `1px solid ${B}`, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                Join the community
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}