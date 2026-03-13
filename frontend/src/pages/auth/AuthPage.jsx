import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const PINK = "#e8185d";
const DARK = "#0a0a0a";
const B = "#f0f0f0";

export default function AuthPage() {
  const [params] = useSearchParams();
  const [tab, setTab] = useState(params.get("mode") === "register" ? "register" : "login");
  const [form, setForm] = useState({ email: "", password: "", full_name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register, isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate(user?.onboarded ? "/gene/app" : "/onboarding", { replace: true });
    }
  }, [isLoggedIn, user, navigate]);

  function setField(key, val) {
    setForm(f => ({ ...f, [key]: val }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (tab === "login") {
        await login(form.email, form.password);
      } else {
        if (form.password.length < 8) {
          setError("Password must be at least 8 characters");
          setLoading(false);
          return;
        }
        await register(form.email, form.password, form.full_name);
        navigate("/onboarding");
        return;
      }
      navigate("/gene/app");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; }

        .auth-page {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          background: #fafafa; padding: 24px;
          background-image: linear-gradient(${B} 1px, transparent 1px), linear-gradient(90deg, ${B} 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .auth-box {
          width: 100%; max-width: 420px; background: #fff;
          border: 1px solid ${B}; border-radius: 16px; padding: 36px;
          box-shadow: 0 4px 40px rgba(0,0,0,0.06);
        }
        .auth-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; }
        .auth-logo-dot { width: 32px; height: 32px; border-radius: 9px; background: ${PINK}; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12px; font-weight: 800; }
        .auth-logo-text { font-size: 15px; font-weight: 700; color: ${DARK}; letter-spacing: -0.02em; }
        
        .auth-tabs { display: flex; gap: 0; margin-bottom: 24px; border: 1px solid ${B}; border-radius: 8px; padding: 3px; }
        .auth-tab { flex: 1; padding: 8px; border: none; background: none; border-radius: 6px; font-size: 13px; font-weight: 600; color: #9ca3af; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.15s; }
        .auth-tab.active { background: ${DARK}; color: #fff; }
        
        .auth-title { font-size: 18px; font-weight: 800; color: ${DARK}; letter-spacing: -0.03em; margin-bottom: 4px; }
        .auth-sub { font-size: 13px; color: #9ca3af; margin-bottom: 24px; }
        
        .auth-field { margin-bottom: 14px; }
        .auth-label { font-size: 12px; font-weight: 600; color: #374151; display: block; margin-bottom: 6px; }
        .auth-input { width: 100%; padding: 11px 14px; border: 1px solid ${B}; border-radius: 8px; font-size: 13.5px; font-family: 'Plus Jakarta Sans', sans-serif; color: ${DARK}; outline: none; transition: border-color 0.15s; }
        .auth-input:focus { border-color: #9ca3af; }
        
        .auth-btn { width: 100%; padding: 12px; border-radius: 8px; background: ${DARK}; color: #fff; font-size: 14px; font-weight: 700; border: none; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: opacity 0.15s; margin-top: 8px; letter-spacing: -0.01em; }
        .auth-btn:hover { opacity: 0.85; }
        .auth-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        
        .auth-error { background: #fff1f4; border: 1px solid #fecdd3; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: ${PINK}; margin-bottom: 14px; }
        
        .auth-divider { display: flex; align-items: center; gap: 10px; margin: 20px 0; }
        .auth-divider-line { flex: 1; height: 1px; background: ${B}; }
        .auth-divider-text { font-size: 12px; color: #9ca3af; }
        
        .auth-footer { text-align: center; font-size: 12.5px; color: #9ca3af; margin-top: 20px; }
        .auth-footer a { color: ${PINK}; text-decoration: none; font-weight: 600; }

        .auth-benefits { margin-bottom: 20px; display: flex; flex-direction: column; gap: 7px; }
        .auth-benefit { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #374151; }
        .auth-benefit-dot { width: 6px; height: 6px; border-radius: 50%; background: ${PINK}; flex-shrink: 0; }
      `}</style>

      <div className="auth-page">
        <div className="auth-box">
          {/* Logo */}
          <div className="auth-logo">
            <div className="auth-logo-dot">N</div>
            <div className="auth-logo-text">NuGens · Gen-E AI</div>
          </div>

          {/* Tabs */}
          <div className="auth-tabs">
            <button className={`auth-tab${tab === "login" ? " active" : ""}`} onClick={() => { setTab("login"); setError(""); }}>Sign in</button>
            <button className={`auth-tab${tab === "register" ? " active" : ""}`} onClick={() => { setTab("register"); setError(""); }}>Create account</button>
          </div>

          {tab === "register" && (
            <div className="auth-benefits">
              {["AI career analysis, free to start", "Resume scoring & ATS optimization", "Personalized 12-week roadmap"].map(b => (
                <div key={b} className="auth-benefit"><div className="auth-benefit-dot" />{b}</div>
              ))}
            </div>
          )}

          <div className="auth-title">{tab === "login" ? "Welcome back" : "Start your career journey"}</div>
          <div className="auth-sub">{tab === "login" ? "Sign in to your Gen-E account" : "Free account · No credit card needed"}</div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {tab === "register" && (
              <div className="auth-field">
                <label className="auth-label">Full name</label>
                <input className="auth-input" type="text" placeholder="Arjun Sharma" value={form.full_name} onChange={e => setField("full_name", e.target.value)} required />
              </div>
            )}
            <div className="auth-field">
              <label className="auth-label">Email address</label>
              <input className="auth-input" type="email" placeholder="arjun@email.com" value={form.email} onChange={e => setField("email", e.target.value)} required />
            </div>
            <div className="auth-field">
              <label className="auth-label">Password {tab === "register" && <span style={{ color: "#9ca3af", fontWeight: 400 }}>(min 8 chars)</span>}</label>
              <input className="auth-input" type="password" placeholder="••••••••" value={form.password} onChange={e => setField("password", e.target.value)} required />
            </div>
            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? "Please wait..." : tab === "login" ? "Sign in →" : "Create account →"}
            </button>
          </form>

          <div className="auth-footer">
            {tab === "login"
              ? <>Don't have an account? <a href="#" onClick={e => { e.preventDefault(); setTab("register"); }}>Sign up free</a></>
              : <>Already have an account? <a href="#" onClick={e => { e.preventDefault(); setTab("login"); }}>Sign in</a></>
            }
            <br /><br />
            <Link to="/" style={{ color: "#9ca3af", textDecoration: "none" }}>← Back to NuGens</Link>
          </div>
        </div>
      </div>
    </>
  );
}
